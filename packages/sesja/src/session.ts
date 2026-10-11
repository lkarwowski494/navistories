import { checkpointsOf, routeOf, type Pakiet, type Point } from "@navistories/pakiet";
import {
  createEngine,
  PROFILES,
  step,
  type EngineEvent,
  type EngineInput,
  type EngineState,
  type MotionProfile,
} from "@navistories/trigger";
import { MS_PER_S } from "./constants";
import { LocationPermissionError, type Clock, type LocationSource, type StoryPlayer } from "./ports";

export type SessionPhase = "ready" | "starting" | "running" | "stopped" | "error";

/**
 * Co się dzieje teraz (dla ekranu jazdy):
 * - playing: gra historia;
 * - queued: historia czeka w kolejce (odstęp między historiami albo pauza);
 * - off-route: poza trasą;
 * - waiting: na trasie, czekamy na następny punkt;
 * - no-fix: jeszcze bez pozycji na trasie.
 */
export type SessionActivity = "playing" | "queued" | "off-route" | "waiting" | "no-fix";

export type SessionError = "location-permission" | "location";

export interface SessionView {
  readonly phase: SessionPhase;
  readonly error: SessionError | null;
  readonly activity: SessionActivity;
  /** Historia, która gra (albo jest zapauzowana). */
  readonly current: Point | null;
  readonly paused: boolean;
  readonly queued: number;
  readonly offRoute: boolean;
  /** Id zagranych historii w kolejności. */
  readonly played: readonly string[];
  /** Id pominiętych historii w kolejności. */
  readonly skipped: readonly string[];
}

export interface SessionOptions {
  readonly pakiet: Pakiet;
  /** Filtr motywów (samochód); bez filtra wszystkie punkty. */
  readonly themeFilter?: readonly string[];
  readonly location: LocationSource;
  readonly player: StoryPlayer;
  readonly clock: Clock;
  /** Domyślnie profil z trybu pakietu (car/walk). */
  readonly profile?: MotionProfile;
}

export interface Session {
  readonly view: SessionView;
  /** Zwraca funkcję wypisania. Słuchacz dostaje bieżący widok od razu. */
  subscribe(listener: (v: SessionView) => void): () => void;
  /** Surowe zdarzenia maszyny wyzwalania (diagnostyka, testy). */
  onEngineEvents(listener: (events: readonly EngineEvent[]) => void): () => void;
  /** Start na żądanie użytkownika (nigdy automatycznie). */
  start(): Promise<void>;
  stop(): void;
  pause(): void;
  resume(): void;
  /** Kończy bieżącą historię; następna z kolejki startuje po minimalnym odstępie. */
  next(): void;
}

/**
 * Adapter: próbki lokalizacji → step() → odtwarzacz. Cała logika decyzji jest
 * w @navistories/trigger; tu tylko przekazywanie zdarzeń i stan dla ekranu.
 */
export function createSession(opts: SessionOptions): Session {
  return new SessionImpl(opts);
}

class SessionImpl implements Session {
  private engine: EngineState;
  private readonly points: ReadonlyMap<string, Point>;
  private readonly listeners = new Set<(v: SessionView) => void>();
  private readonly eventListeners = new Set<(e: readonly EngineEvent[]) => void>();
  private tickTimer: unknown = null;
  private _view: SessionView;

  constructor(private readonly opts: SessionOptions) {
    const { pakiet } = opts;
    this.points = new Map(pakiet.points.map((p) => [p.id, p]));
    this.engine = createEngine({
      route: routeOf(pakiet),
      checkpoints: checkpointsOf(pakiet, opts.themeFilter),
      profile: opts.profile ?? PROFILES[pakiet.mode],
    });
    this._view = Object.freeze<SessionView>({
      phase: "ready",
      error: null,
      activity: "no-fix",
      current: null,
      paused: false,
      queued: 0,
      offRoute: false,
      played: [],
      skipped: [],
    });
  }

  get view(): SessionView {
    return this._view;
  }

  subscribe(listener: (v: SessionView) => void): () => void {
    this.listeners.add(listener);
    listener(this._view);
    return () => this.listeners.delete(listener);
  }

  onEngineEvents(listener: (events: readonly EngineEvent[]) => void): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  async start(): Promise<void> {
    if (this._view.phase !== "ready") return;
    this.update({ phase: "starting" });
    this.opts.player.setOnEnded((id) => this.onPlaybackEnded(id));
    try {
      await this.opts.location.start(
        (s) => this.feed({ type: "sample", sample: s }),
        () => this.update({ phase: "error", error: "location" }),
      );
      // W trakcie oczekiwania mogło przyjść stop() albo błąd: nie nadpisujemy ich.
      if (this.phaseNow() === "starting") this.update({ phase: "running" });
    } catch (e) {
      this.opts.player.setOnEnded(null);
      this.update({ phase: "error", error: e instanceof LocationPermissionError ? "location-permission" : "location" });
    }
  }

  stop(): void {
    if (this._view.phase === "stopped") return;
    this.opts.location.stop();
    this.opts.player.setOnEnded(null);
    this.opts.player.stop();
    this.clearTick();
    this.update({ phase: "stopped", current: null, paused: false });
  }

  pause(): void {
    if (!this.isRunning() || !this._view.current || this._view.paused) return;
    this.opts.player.pause();
    this.update({ paused: true });
  }

  resume(): void {
    if (!this.isRunning() || !this._view.paused) return;
    this.opts.player.resume();
    this.update({ paused: false });
  }

  next(): void {
    const id = this.engine.playing;
    if (!this.isRunning() || id === null) return;
    this.opts.player.stop();
    this.update({ paused: false });
    this.feed({ type: "playback-ended", t: this.opts.clock.now(), checkpointId: id });
  }

  private phaseNow(): SessionPhase {
    return this._view.phase;
  }

  private isRunning(): boolean {
    return this._view.phase === "running" || this._view.phase === "starting";
  }

  private onPlaybackEnded(id: string) {
    if (!this.isRunning()) return;
    this.feed({ type: "playback-ended", t: this.opts.clock.now(), checkpointId: id });
  }

  private feed(input: EngineInput) {
    if (!this.isRunning()) return;
    const r = step(this.engine, input);
    this.engine = r.state;
    let played = this._view.played;
    let skipped = this._view.skipped;
    let paused = this._view.paused;
    for (const e of r.events) {
      if (e.type === "play") {
        const p = this.points.get(e.checkpointId)!;
        this.opts.player.play({ pakietId: this.opts.pakiet.id, pointId: p.id, audio: p.audio });
        played = [...played, p.id];
        paused = false;
      } else if (e.type === "skipped") {
        skipped = [...skipped, e.checkpointId];
      }
    }
    if (r.events.length) for (const l of this.eventListeners) l(r.events);
    this.scheduleTick();
    this.update({ played, skipped, paused });
  }

  /** Gdy odtwarzacz wolny, a kolejka czeka na minimalny odstęp: obudź maszynę po odstępie. */
  private scheduleTick() {
    this.clearTick();
    const s = this.engine;
    if (s.playing !== null || s.queue.length === 0 || s.lastEndedT === null) return;
    const at = s.lastEndedT + s.profile.minGapBetweenStoriesS;
    const delayMs = Math.max(0, (at - this.opts.clock.now()) * MS_PER_S);
    this.tickTimer = this.opts.clock.setTimeout(() => {
      this.tickTimer = null;
      this.feed({ type: "tick", t: Math.max(at, this.opts.clock.now()) });
    }, delayMs);
  }

  private clearTick() {
    if (this.tickTimer !== null) this.opts.clock.clearTimeout(this.tickTimer);
    this.tickTimer = null;
  }

  private update(patch: Partial<SessionView>) {
    const s = this.engine;
    const base = { ...this._view, ...patch };
    const current = base.phase === "stopped" || s.playing === null ? null : (this.points.get(s.playing) ?? null);
    const offRoute = s.offRoute.offRoute;
    const activity: SessionActivity = offRoute
      ? "off-route"
      : current
        ? "playing"
        : s.queue.length > 0
          ? "queued"
          : s.progressM === null
            ? "no-fix"
            : "waiting";
    this._view = Object.freeze({ ...base, current, offRoute, activity, queued: s.queue.length });
    for (const l of this.listeners) l(this._view);
  }
}
