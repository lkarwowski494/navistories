import type { MotionProfile } from "./config";
import { createEngine, step, type EngineEvent, type EngineInput, type EngineState } from "./engine";
import type { Route } from "./route";
import type { Checkpoint, GpsSample } from "./types";

export interface SimulationInput {
  readonly route: Route;
  readonly checkpoints: readonly Checkpoint[];
  readonly samples: readonly GpsSample[];
  readonly profile: MotionProfile;
  /** Czas trwania historii [s]: stały albo zależny od id. */
  readonly storyDurationS: number | ((checkpointId: string) => number);
}

/**
 * Przepuszcza strumień próbek (np. z GPX) przez maszynę stanów z symulowanym
 * odtwarzaczem i zwraca listę zdarzeń. Do testów scenariuszowych.
 */
export function simulate(input: SimulationInput): EngineEvent[] {
  const duration = typeof input.storyDurationS === "number" ? () => input.storyDurationS as number : input.storyDurationS;
  let state = createEngine(input);
  const events: EngineEvent[] = [];
  let endsAt: number | null = null;

  const feed = (i: EngineInput) => {
    const r = step(state, i);
    state = r.state;
    for (const e of r.events) {
      events.push(e);
      if (e.type === "play") endsAt = e.t + duration(e.checkpointId);
    }
  };

  /** Doprowadza odtwarzacz do chwili t: kończy historie i startuje kolejne z kolejki. */
  const advance = (t: number) => {
    for (;;) {
      if (state.playing !== null && endsAt !== null && endsAt <= t) {
        feed({ type: "playback-ended", t: endsAt, checkpointId: state.playing });
        endsAt = null;
        continue;
      }
      const startAt = nextStart(state);
      if (state.playing === null && startAt !== null && startAt <= t) {
        const before = events.length;
        feed({ type: "tick", t: startAt });
        if (events.length > before) continue;
      }
      return;
    }
  };

  for (const sample of input.samples) {
    advance(sample.t);
    feed({ type: "sample", sample });
  }
  advance(Infinity);
  return events;
}

function nextStart(s: EngineState): number | null {
  if (s.queue.length === 0) return null;
  return s.lastEndedT === null ? null : s.lastEndedT + s.profile.minGapBetweenStoriesS;
}
