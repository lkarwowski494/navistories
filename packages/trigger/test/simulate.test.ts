import { describe, expect, it } from "vitest";
import { CAR, WALK } from "../src/config";
import { simulate } from "../src/simulate";
import { drive, offsetPoint, straightRoute } from "./helpers";
import { expectInvariants } from "./invariants";

describe("simulate", () => {
  const route = straightRoute(4000);
  const checkpoints = [
    { id: "a", progressM: 800, priority: 1 },
    { id: "b", progressM: 1000, priority: 1 },
    { id: "c", progressM: 3000, priority: 1 },
  ];
  const samples = drive(route, { fromM: 0, toM: 4000, speedMps: 20, withSpeed: true });

  it("odtwarza historie z zadanym czasem trwania i odstępem", () => {
    const events = simulate({ route, checkpoints, samples, profile: CAR, storyDurationS: 30 });
    expectInvariants(events, checkpoints, CAR, { allResolved: true });
    const plays = events.filter((e) => e.type === "play");
    expect(plays.map((e) => e.checkpointId)).toEqual(["a", "b", "c"]);
    const a = plays[0]!, b = plays[1]!;
    expect(b.t).toBeGreaterThanOrEqual(a.t + 30 + CAR.minGapBetweenStoriesS);
  });

  it("czas trwania może zależeć od historii", () => {
    const events = simulate({ route, checkpoints, samples, profile: CAR, storyDurationS: (id) => (id === "a" ? 5 : 30) });
    const ended = events.filter((e) => e.type === "ended");
    const plays = events.filter((e) => e.type === "play");
    expect(ended[0]!.t - plays[0]!.t).toBe(5);
  });

  it("po ostatniej próbce dokańcza kolejkę (historie grane do końca)", () => {
    const short = drive(route, { fromM: 0, toM: 1100, speedMps: 20, withSpeed: true });
    const events = simulate({ route, checkpoints, samples: short, profile: CAR, storyDurationS: 120 });
    expect(events.filter((e) => e.type === "play").map((e) => e.checkpointId)).toEqual(["a", "b"]);
    expect(events[events.length - 1]).toMatchObject({ type: "ended", checkpointId: "b" });
  });

  it("jest deterministyczna", () => {
    const a = simulate({ route, checkpoints, samples, profile: CAR, storyDurationS: 30 });
    const b = simulate({ route, checkpoints, samples, profile: CAR, storyDurationS: 30 });
    expect(a).toEqual(b);
  });
});

describe("profile ruchu w scenariuszach", () => {
  // deterministyczny szum ±amp metrów w bok
  const noisy = (xs: ReturnType<typeof drive>, route: ReturnType<typeof straightRoute>, amp: number, speed: number) => {
    let seed = 7;
    const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648) * 2 - 1;
    return xs.map((s, i) => ({ ...offsetPoint(route, Math.min(route.lengthM, i * speed), rnd() * amp), t: s.t }));
  };

  it("pieszo: szum GPS ±15 m w mieście nie powoduje zjazdu ani pominięć", () => {
    const route = straightRoute(1500);
    const xs = noisy(drive(route, { fromM: 0, toM: 1500, speedMps: 1.4 }), route, 15, 1.4);
    const checkpoints = [100, 400, 700, 1000, 1300].map((m, i) => ({ id: `p${i}`, progressM: m, priority: 1 }));
    const events = simulate({ route, checkpoints, samples: xs, profile: WALK, storyDurationS: 60 });
    expectInvariants(events, checkpoints, WALK, { allResolved: true });
    expect(events.filter((e) => e.type === "off-route")).toHaveLength(0);
    expect(events.filter((e) => e.type === "play").map((e) => e.checkpointId)).toEqual(["p0", "p1", "p2", "p3", "p4"]);
  });

  it("samochód 140 km/h, gęste punkty: zaległe historie pomijane tylko jako przeterminowane", () => {
    const v = 140 / 3.6;
    const route = straightRoute(20000);
    const xs = noisy(drive(route, { fromM: 0, toM: 20000, speedMps: v }), route, 5, v);
    const checkpoints = Array.from({ length: 39 }, (_, i) => ({ id: `c${i}`, progressM: 500 * (i + 1), priority: 1 }));
    const events = simulate({ route, checkpoints, samples: xs, profile: CAR, storyDurationS: 20 });
    expectInvariants(events, checkpoints, CAR, { allResolved: true });
    const reasons = new Set(events.flatMap((e) => (e.type === "skipped" ? [e.reason] : [])));
    expect([...reasons].every((r) => r === "stale")).toBe(true);
    expect(events.filter((e) => e.type === "off-route" || e.type === "sample-rejected")).toHaveLength(0);
  });
});
