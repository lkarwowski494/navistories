/** Atrapy portów: zegar sterowany ręcznie, lokalizacja z listy próbek, odtwarzacz z czasem trwania. */
import type { GpsSample } from "@navistories/trigger";
import type { Clock, LocationSource, StoryPlayer, StoryRef } from "../src/ports";

interface Timer {
  id: number;
  at: number;
  fn: () => void;
}

export class FakeClock implements Clock {
  private t: number;
  private timers: Timer[] = [];
  private nextId = 1;

  constructor(t0 = 0) {
    this.t = t0;
  }
  now(): number {
    return this.t;
  }
  setTimeout(fn: () => void, ms: number): unknown {
    const id = this.nextId++;
    this.timers.push({ id, at: this.t + ms / 1000, fn });
    return id;
  }
  clearTimeout(handle: unknown): void {
    this.timers = this.timers.filter((x) => x.id !== handle);
  }
  /** Przesuwa czas do t, po drodze wykonując zaplanowane wywołania w kolejności. */
  advanceTo(t: number): void {
    for (;;) {
      const due = this.timers.filter((x) => x.at <= t).sort((a, b) => a.at - b.at || a.id - b.id)[0];
      if (!due) break;
      this.timers = this.timers.filter((x) => x !== due);
      this.t = Math.max(this.t, due.at);
      due.fn();
    }
    if (Number.isFinite(t)) this.t = Math.max(this.t, t);
  }
  get pending(): number {
    return this.timers.length;
  }
}

export class FakeLocation implements LocationSource {
  onSample: ((s: GpsSample) => void) | null = null;
  onError: ((e: Error) => void) | null = null;
  started = 0;
  stopped = 0;
  failWith: Error | null = null;

  async start(onSample: (s: GpsSample) => void, onError: (e: Error) => void): Promise<void> {
    if (this.failWith) throw this.failWith;
    this.started++;
    this.onSample = onSample;
    this.onError = onError;
  }
  stop(): void {
    this.stopped++;
    this.onSample = null;
  }
  /** Podaje próbki w ich czasie (zegar przesuwa się do t każdej próbki). */
  feed(samples: readonly GpsSample[], clock: FakeClock): void {
    for (const s of samples) {
      clock.advanceTo(s.t);
      this.onSample?.(s);
    }
  }
}

export class FakePlayer implements StoryPlayer {
  readonly log: string[] = [];
  current: StoryRef | null = null;
  paused = false;
  private onEnded: ((id: string) => void) | null = null;
  private timer: unknown = null;
  private remainingS = 0;
  private startedAt = 0;

  constructor(
    private readonly clock: FakeClock,
    private readonly durationS: (pointId: string) => number,
  ) {}

  play(story: StoryRef): void {
    this.clearTimer();
    this.current = story;
    this.paused = false;
    this.log.push(`play:${story.pointId}`);
    this.schedule(this.durationS(story.pointId));
  }
  pause(): void {
    if (!this.current || this.paused) return;
    this.paused = true;
    this.remainingS -= this.clock.now() - this.startedAt;
    this.clearTimer();
    this.log.push(`pause:${this.current.pointId}`);
  }
  resume(): void {
    if (!this.current || !this.paused) return;
    this.paused = false;
    this.log.push(`resume:${this.current.pointId}`);
    this.schedule(this.remainingS);
  }
  stop(): void {
    this.clearTimer();
    if (this.current) this.log.push(`stop:${this.current.pointId}`);
    this.current = null;
    this.paused = false;
  }
  setOnEnded(cb: ((id: string) => void) | null): void {
    this.onEnded = cb;
  }
  /** Symuluje błąd odtwarzania (np. brak pliku): koniec natychmiast. */
  fail(): void {
    const id = this.current?.pointId;
    this.clearTimer();
    this.current = null;
    if (id) this.onEnded?.(id);
  }

  private schedule(s: number) {
    this.remainingS = s;
    this.startedAt = this.clock.now();
    this.timer = this.clock.setTimeout(() => {
      const id = this.current!.pointId;
      this.log.push(`end:${id}`);
      this.current = null;
      this.timer = null;
      this.onEnded?.(id);
    }, s * 1000);
  }
  private clearTimer() {
    if (this.timer !== null) this.clock.clearTimeout(this.timer);
    this.timer = null;
  }
}
