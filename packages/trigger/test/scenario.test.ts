import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CAR } from "../src/config";
import { parseGpx, toSamples } from "../src/gpx";
import { buildRoute } from "../src/route";
import { simulate } from "../src/simulate";
import type { Checkpoint } from "../src/types";
import { expectInvariants } from "./invariants";

// Syntetyczny przejazd (scripts/generuj-fixture.mjs): ok. 4,5 km, 50 km/h do 1500 m,
// potem 90 km/h, tunel bez GPS na 2700–3300 m, jeden fałszywy odczyt w 30. sekundzie.
const gpx = parseGpx(readFileSync(new URL("./fixtures/syntetyczna-trasa.gpx", import.meta.url), "utf8"));
const route = buildRoute(gpx.rte);
const samples = toSamples(gpx.trk);

const checkpoints: Checkpoint[] = [
  { id: "rynek", progressM: 500, priority: 1 },
  { id: "kosciol", progressM: 1200, priority: 1 },
  { id: "tunel-wjazd", progressM: 2900, priority: 1 },
  { id: "tunel-zamek", progressM: 3050, priority: 5 },
  { id: "tunel-most", progressM: 3200, priority: 2 },
  { id: "meta", progressM: 4300, priority: 1 },
];

describe("scenariusz: syntetyczna trasa z tunelem", () => {
  const events = simulate({ route, checkpoints, samples, profile: CAR, storyDurationS: 45 });

  it("fixture ma oczekiwany kształt", () => {
    expect(route.lengthM).toBeGreaterThan(4400);
    expect(route.lengthM).toBeLessThan(4600);
    expect(samples.length).toBeGreaterThan(150);
  });

  it("fałszywy odczyt jest odrzucony, nie ma zjazdu z trasy", () => {
    const rejected = events.filter((e) => e.type === "sample-rejected");
    expect(rejected).toHaveLength(1);
    expect(rejected[0]).toMatchObject({ reason: "jump" });
    expect(events.filter((e) => e.type === "off-route")).toHaveLength(0);
  });

  it("po tunelu gra tylko najważniejsza historia z tunelu", () => {
    const plays = events.filter((e) => e.type === "play").map((e) => e.checkpointId);
    expect(plays).toEqual(["rynek", "kosciol", "tunel-zamek", "meta"]);
    const skipped = events.filter((e) => e.type === "skipped");
    expect(skipped.map((e) => [e.checkpointId, e.reason])).toEqual([
      ["tunel-wjazd", "gap"],
      ["tunel-most", "gap"],
    ]);
  });

  it("spełnia niezmienniki", () => {
    expectInvariants(events, checkpoints, CAR, { allResolved: true });
  });
});
