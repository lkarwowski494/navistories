import { describe, expect, it } from "vitest";
import { CAR, WALK } from "../src/config";
import { destinationPoint } from "../src/geo";
import { filterSample, initialFilterState } from "../src/filter";
import type { GpsSample } from "../src/types";

const A: GpsSample = { lat: 52, lon: 21, t: 0 };
const after = (from: GpsSample, meters: number, dt: number, extra: Partial<GpsSample> = {}): GpsSample => ({
  ...destinationPoint(from, 90, meters),
  t: from.t + dt,
  ...extra,
});

describe("filterSample", () => {
  it("przyjmuje pierwszą poprawną próbkę", () => {
    const r = filterSample(initialFilterState(), A, CAR);
    expect(r.accepted).toBe(true);
    expect(r.state.last).toEqual(A);
  });

  it("odrzuca słabą dokładność", () => {
    const r = filterSample(initialFilterState(), { ...A, accuracyM: CAR.maxAccuracyM + 1 }, CAR);
    expect(r).toMatchObject({ accepted: false, reason: "accuracy" });
    expect(filterSample(initialFilterState(), { ...A, accuracyM: CAR.maxAccuracyM }, CAR).accepted).toBe(true);
  });

  it("odrzuca próbkę z czasem nie późniejszym niż poprzednia", () => {
    const s = filterSample(initialFilterState(), A, CAR).state;
    expect(filterSample(s, { ...A, t: 0 }, CAR)).toMatchObject({ accepted: false, reason: "time" });
    expect(filterSample(s, { ...A, t: -1 }, CAR)).toMatchObject({ accepted: false, reason: "time" });
  });

  it("140 km/h w samochodzie to nie skok", () => {
    const s = filterSample(initialFilterState(), A, CAR).state;
    expect(filterSample(s, after(A, 38.9, 1), CAR).accepted).toBe(true);
  });

  it("odrzuca nierealny skok dla profilu", () => {
    const s = filterSample(initialFilterState(), A, CAR).state;
    const limit = CAR.maxSpeedMps * 1 + CAR.jumpToleranceM;
    expect(filterSample(s, after(A, limit + 10, 1), CAR)).toMatchObject({ accepted: false, reason: "jump" });
  });

  it("ta sama odległość jest skokiem pieszo, a nie jest w samochodzie", () => {
    const sCar = filterSample(initialFilterState(), A, CAR).state;
    const sWalk = filterSample(initialFilterState(), A, WALK).state;
    const b = after(A, 60, 1);
    expect(filterSample(sCar, b, CAR).accepted).toBe(true);
    expect(filterSample(sWalk, b, WALK)).toMatchObject({ accepted: false, reason: "jump" });
  });

  it("po długiej przerwie (tunel) duża odległość jest wiarygodna", () => {
    const s = filterSample(initialFilterState(), A, CAR).state;
    expect(filterSample(s, after(A, 2000, 60), CAR).accepted).toBe(true);
  });

  it("odrzucona próbka nie przesuwa punktu odniesienia", () => {
    let s = filterSample(initialFilterState(), A, CAR).state;
    s = filterSample(s, after(A, 5000, 1), CAR).state;
    expect(s.last).toEqual(A);
    expect(filterSample(s, after(A, 30, 2), CAR).accepted).toBe(true);
  });

  it("po maxConsecutiveRejects skokach z rzędu przyjmuje nową pozycję (reset)", () => {
    let s = filterSample(initialFilterState(), A, WALK).state;
    const far = destinationPoint(A, 0, 3000);
    let last;
    for (let i = 1; i <= WALK.maxConsecutiveRejects + 1; i++) {
      last = filterSample(s, { ...far, t: i }, WALK);
      s = last.state;
      if (i <= WALK.maxConsecutiveRejects) expect(last.accepted).toBe(false);
    }
    expect(last!).toMatchObject({ accepted: true, reset: true });
    expect(s.consecutiveRejects).toBe(0);
  });
});
