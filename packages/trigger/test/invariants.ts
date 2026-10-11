import { expect } from "vitest";
import type { MotionProfile } from "../src/config";
import type { EngineEvent } from "../src/engine";
import type { Checkpoint } from "../src/types";

/** Niezmienniki, które muszą być spełnione w każdym scenariuszu. */
export function expectInvariants(events: EngineEvent[], checkpoints: Checkpoint[], profile: MotionProfile, opts: { allResolved: boolean }) {
  const outcome = new Map<string, string[]>();
  let playing: string | null = null;
  let lastEnd = -Infinity;
  let lastT = -Infinity;
  for (const e of events) {
    expect(e.t).toBeGreaterThanOrEqual(lastT);
    lastT = e.t;
    if (e.type === "play" || e.type === "skipped") {
      outcome.set(e.checkpointId, [...(outcome.get(e.checkpointId) ?? []), e.type]);
    }
    if (e.type === "play") {
      expect(playing).toBeNull();
      expect(e.t).toBeGreaterThanOrEqual(lastEnd + profile.minGapBetweenStoriesS);
      playing = e.checkpointId;
    }
    if (e.type === "ended") {
      expect(e.checkpointId).toBe(playing);
      playing = null;
      lastEnd = e.t;
    }
  }
  // każda historia rozstrzygnięta najwyżej raz (zagrana albo pominięta)
  for (const [id, xs] of outcome) expect(xs, id).toHaveLength(1);
  if (opts.allResolved) {
    expect([...outcome.keys()].sort()).toEqual(checkpoints.map((c) => c.id).sort());
  }
}
