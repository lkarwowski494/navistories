import type { MotionProfile } from "./config";
import { filterSample, initialFilterState, type FilterState, type RejectReason } from "./filter";
import { haversineM } from "./geo";
import { leadDistanceM } from "./lead";
import { initialOffRouteState, updateOffRoute, type OffRouteState } from "./offroute";
import { projectOnRoute, type Projection, type Route } from "./route";
import type { Checkpoint, GpsSample } from "./types";

export type CheckpointStatus = "pending" | "queued" | "played" | "skipped";

/** Dlaczego historia nie została zagrana. */
export type SkipReason =
  /** Kilka punktów minięto naraz po przerwie (tunel, zjazd z trasy, reset pozycji); zagrano tylko jeden. */
  | "gap"
  /** Punkt został za daleko w tyle, zanim odtwarzacz się zwolnił. */
  | "stale"
  /** Punkt był przed miejscem, w którym zaczęliśmy śledzenie. */
  | "before-start";

export type EngineEvent =
  | { readonly type: "play"; readonly t: number; readonly checkpointId: string }
  | { readonly type: "queued"; readonly t: number; readonly checkpointId: string }
  | { readonly type: "ended"; readonly t: number; readonly checkpointId: string }
  | { readonly type: "skipped"; readonly t: number; readonly checkpointId: string; readonly reason: SkipReason }
  | { readonly type: "off-route"; readonly t: number }
  | { readonly type: "on-route"; readonly t: number }
  | { readonly type: "sample-rejected"; readonly t: number; readonly reason: RejectReason };

export type EngineInput =
  | { readonly type: "sample"; readonly sample: GpsSample }
  /** Odtwarzacz skończył historię. */
  | { readonly type: "playback-ended"; readonly t: number; readonly checkpointId: string }
  /** Upływ czasu bez nowej próbki (pozwala wystartować historię z kolejki). */
  | { readonly type: "tick"; readonly t: number };

/** Stan maszyny wyzwalania: zwykłe dane (da się zapisać jako JSON, poza `route`, którą można odtworzyć). */
export interface EngineState {
  readonly route: Route;
  readonly profile: MotionProfile;
  /** Posortowane rosnąco po postępie. */
  readonly checkpoints: readonly Checkpoint[];
  readonly status: Readonly<Record<string, CheckpointStatus>>;
  /** Indeks pierwszego checkpointu, którego jeszcze nie minięto. */
  readonly nextIndex: number;
  readonly filter: FilterState;
  readonly offRoute: OffRouteState;
  /** Bieżący postęp (ostatni wiarygodny rzut na trasę) [m]; null przed pierwszą pozycją. */
  readonly progressM: number | null;
  /** Czas próbki, która ustaliła progressM. */
  readonly progressT: number | null;
  /** Najdalszy osiągnięty postęp [m]; tylko on wyzwala historie (jazda wstecz nic nie wyzwala). */
  readonly maxProgressM: number | null;
  readonly queue: readonly string[];
  readonly playing: string | null;
  readonly lastEndedT: number | null;
}

export interface EngineConfig {
  readonly route: Route;
  readonly checkpoints: readonly Checkpoint[];
  readonly profile: MotionProfile;
}

export function createEngine({ route, checkpoints, profile }: EngineConfig): EngineState {
  const status: Record<string, CheckpointStatus> = {};
  for (const c of checkpoints) {
    if (c.id in status) throw new Error(`Powtórzone id checkpointu: ${c.id}`);
    status[c.id] = "pending";
  }
  const sorted = checkpoints.map((c, i) => ({ c, i })).sort((a, b) => a.c.progressM - b.c.progressM || a.i - b.i);
  return {
    route,
    profile,
    checkpoints: sorted.map((x) => x.c),
    status,
    nextIndex: 0,
    filter: initialFilterState(),
    offRoute: initialOffRouteState(),
    progressM: null,
    progressT: null,
    maxProgressM: null,
    queue: [],
    playing: null,
    lastEndedT: null,
  };
}

/** Jeden krok maszyny stanów. Funkcja czysta: nie zmienia `state`. */
export function step(state: EngineState, input: EngineInput): { state: EngineState; events: EngineEvent[] } {
  const m = new Mutable(state);
  switch (input.type) {
    case "sample":
      onSample(m, input.sample);
      tryStart(m, input.sample.t);
      markQueued(m, input.sample.t);
      break;
    case "playback-ended":
      if (m.playing === input.checkpointId) {
        m.playing = null;
        m.lastEndedT = input.t;
        m.events.push({ type: "ended", t: input.t, checkpointId: input.checkpointId });
        tryStart(m, input.t);
      }
      break;
    case "tick":
      tryStart(m, input.t);
      break;
  }
  return { state: m.freeze(), events: m.events };
}

/** Robocza kopia stanu na czas jednego kroku. */
class Mutable {
  readonly base: EngineState;
  status: Record<string, CheckpointStatus>;
  nextIndex: number;
  filter: FilterState;
  offRoute: OffRouteState;
  progressM: number | null;
  progressT: number | null;
  maxProgressM: number | null;
  queue: string[];
  playing: string | null;
  lastEndedT: number | null;
  readonly events: EngineEvent[] = [];

  constructor(s: EngineState) {
    this.base = s;
    this.status = { ...s.status };
    this.nextIndex = s.nextIndex;
    this.filter = s.filter;
    this.offRoute = s.offRoute;
    this.progressM = s.progressM;
    this.progressT = s.progressT;
    this.maxProgressM = s.maxProgressM;
    this.queue = [...s.queue];
    this.playing = s.playing;
    this.lastEndedT = s.lastEndedT;
  }

  freeze(): EngineState {
    const { base } = this;
    return {
      route: base.route,
      profile: base.profile,
      checkpoints: base.checkpoints,
      status: this.status,
      nextIndex: this.nextIndex,
      filter: this.filter,
      offRoute: this.offRoute,
      progressM: this.progressM,
      progressT: this.progressT,
      maxProgressM: this.maxProgressM,
      queue: this.queue,
      playing: this.playing,
      lastEndedT: this.lastEndedT,
    };
  }

  skip(c: Checkpoint, t: number, reason: SkipReason) {
    this.status[c.id] = "skipped";
    this.events.push({ type: "skipped", t, checkpointId: c.id, reason });
  }
}

function onSample(m: Mutable, s: GpsSample) {
  const { profile, route } = m.base;
  const prev = m.filter.last;
  const fr = filterSample(m.filter, s, profile);
  m.filter = fr.state;
  if (!fr.accepted) {
    m.events.push({ type: "sample-rejected", t: s.t, reason: fr.reason });
    return;
  }

  const dt = prev ? s.t - prev.t : Infinity;
  const speed =
    s.speedMps !== undefined && s.speedMps >= 0 ? s.speedMps : prev && !fr.reset ? haversineM(prev, s) / dt : 0;

  // Rzut na trasę: w oknie wokół bieżącego postępu, gdy jesteśmy na trasie;
  // na całej trasie przed pierwszą pozycją, po zjeździe i po resecie filtra.
  let proj: Projection | null = null;
  if (m.progressM !== null && m.progressT !== null && !m.offRoute.offRoute && !fr.reset) {
    const reach = profile.maxSpeedMps * (s.t - m.progressT) + profile.forwardSlackM;
    // Przy remisie (ta sama ulica tam i z powrotem) wygrywa rzut bliższy
    // postępowi przewidywanemu z prędkości: ruch do przodu jest ciągły.
    const predicted = m.progressM + speed * (s.t - m.progressT);
    proj = projectOnRoute(route, s, { fromM: m.progressM - profile.backWindowM, toM: m.progressM + reach }, predicted);
  }
  proj ??= projectOnRoute(route, s, undefined, m.progressM ?? undefined)!;

  const wasOff = m.offRoute.offRoute;
  m.offRoute = updateOffRoute(m.offRoute, proj.lateralM, profile);
  if (!wasOff && m.offRoute.offRoute) m.events.push({ type: "off-route", t: s.t });
  const rejoined = wasOff && !m.offRoute.offRoute;
  if (rejoined) m.events.push({ type: "on-route", t: s.t });
  // Poza trasą albo pojedyncza daleka próbka: nie ruszamy postępu.
  if (m.offRoute.offRoute || proj.lateralM > profile.offRouteDistanceM) return;

  const firstFix = m.progressM === null;
  const discontinuity = firstFix || fr.reset || rejoined || dt > profile.gpsGapS;
  m.progressM = proj.progressM;
  m.progressT = s.t;
  m.maxProgressM = Math.max(m.maxProgressM ?? proj.progressM, proj.progressM);

  const cps = m.base.checkpoints;
  if (firstFix) {
    while (m.nextIndex < cps.length && cps[m.nextIndex]!.progressM < proj.progressM) {
      m.skip(cps[m.nextIndex]!, s.t, "before-start");
      m.nextIndex++;
    }
  }

  const lead = leadDistanceM(speed, profile);
  const crossed: Checkpoint[] = [];
  while (m.nextIndex < cps.length && cps[m.nextIndex]!.progressM - lead <= m.maxProgressM) {
    crossed.push(cps[m.nextIndex]!);
    m.nextIndex++;
  }
  if (crossed.length === 0) return;

  if (discontinuity && crossed.length > 1) {
    // Kilka punktów naraz po przerwie: gra jeden (najwyższy priorytet, przy remisie ostatni).
    const fresh = crossed.filter((c) => !isStale(c, m));
    const best = fresh.reduce<Checkpoint | null>(
      (acc, c) => (!acc || c.priority > acc.priority || (c.priority === acc.priority && c.progressM >= acc.progressM) ? c : acc),
      null,
    );
    for (const c of crossed) {
      if (c === best) continue;
      m.skip(c, s.t, fresh.includes(c) ? "gap" : "stale");
    }
    if (best) enqueue(m, best);
  } else {
    for (const c of crossed) enqueue(m, c);
  }
}

/** Zdarzenie „queued” dla historii, które weszły do kolejki i nie wystartowały od razu. */
function markQueued(m: Mutable, t: number) {
  for (const id of m.queue) {
    if (m.status[id] === "pending") {
      m.status[id] = "queued";
      m.events.push({ type: "queued", t, checkpointId: id });
    }
  }
}

function isStale(c: Checkpoint, m: Mutable): boolean {
  return m.maxProgressM !== null && c.progressM < m.maxProgressM - m.base.profile.staleAfterM;
}

/** Dodaje do kolejki (status zmienia się na „queued” dopiero, gdy historia nie wystartuje od razu). */
function enqueue(m: Mutable, c: Checkpoint) {
  m.queue.push(c.id);
}

/** Startuje następną historię z kolejki, jeśli odtwarzacz jest wolny i minął minimalny odstęp. */
function tryStart(m: Mutable, t: number) {
  if (m.playing !== null) return;
  if (m.lastEndedT !== null && t < m.lastEndedT + m.base.profile.minGapBetweenStoriesS) return;
  while (m.queue.length > 0) {
    const id = m.queue.shift()!;
    const c = m.base.checkpoints.find((x) => x.id === id)!;
    if (isStale(c, m)) {
      m.skip(c, t, "stale");
      continue;
    }
    m.status[id] = "played";
    m.playing = id;
    m.events.push({ type: "play", t, checkpointId: id });
    return;
  }
}
