/**
 * Lokalny test dymny na dowolnym pełnym pliku GPX z czasami (np. z prywatnego
 * repozytorium warsztatu). Ścieżka tylko przez zmienną środowiskową; bez niej
 * test jest pomijany. Żadne dane z pliku nie trafiają do repozytorium.
 *
 *   NAVISTORIES_GPX=/ścieżka/do/trasy.gpx pnpm test
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CAR } from "../src/config";
import { parseGpx, toSamples } from "../src/gpx";
import { buildRoute } from "../src/route";
import { simulate } from "../src/simulate";
import type { Checkpoint } from "../src/types";
import { expectInvariants } from "./invariants";

const path = process.env["NAVISTORIES_GPX"];

describe.skipIf(!path)("test dymny na pełnym GPX (NAVISTORIES_GPX)", () => {
  it("przejazd po własnej trasie: wszystkie historie rozstrzygnięte, niezmienniki spełnione", () => {
    const g = parseGpx(readFileSync(path!, "utf8"));
    const timed = [g.trk, g.wpt, g.rte].find((xs) => xs.length > 1 && xs.every((p) => p.t !== undefined));
    expect(timed, "plik musi mieć punkty z czasami").toBeDefined();
    const samples = toSamples(timed!);
    const route = buildRoute(g.rte.length > 1 ? g.rte : timed!);
    const every = 5000;
    const checkpoints: Checkpoint[] = [];
    for (let m = every; m < route.lengthM; m += every) {
      checkpoints.push({ id: `km${m / 1000}`, progressM: m, priority: 1 });
    }
    const events = simulate({ route, checkpoints, samples, profile: CAR, storyDurationS: 90 });
    expectInvariants(events, checkpoints, CAR, { allResolved: true });
    const count = (type: string) => events.filter((e) => e.type === type).length;
    const reasons: Record<string, number> = {};
    for (const e of events) if (e.type === "sample-rejected") reasons[e.reason] = (reasons[e.reason] ?? 0) + 1;
    console.log(
      `trasa ${(route.lengthM / 1000).toFixed(1)} km, próbek ${samples.length}, punktów ${checkpoints.length}: ` +
        `zagrane ${count("play")}, pominięte ${count("skipped")}, zjazdy ${count("off-route")}, ` +
        `odrzucone próbki ${JSON.stringify(reasons)}`,
    );
    expect(count("off-route")).toBe(0);
  });
});
