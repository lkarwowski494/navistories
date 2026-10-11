import { describe, expect, it } from "vitest";
import { CAR, WALK } from "../src/config";
import { leadDistanceM } from "../src/lead";

describe("leadDistanceM", () => {
  it("rośnie z prędkością", () => {
    const v = (CAR.minLeadM / CAR.leadTimeS) * 2;
    expect(leadDistanceM(v, CAR)).toBeCloseTo(v * CAR.leadTimeS, 6);
  });

  it("przycina do minimum i maksimum", () => {
    expect(leadDistanceM(0, CAR)).toBe(CAR.minLeadM);
    expect(leadDistanceM(1000, CAR)).toBe(CAR.maxLeadM);
    expect(leadDistanceM(Number.NaN, CAR)).toBe(CAR.minLeadM);
  });

  it("pieszo wyprzedzenie jest małe", () => {
    expect(leadDistanceM(1.4, WALK)).toBeLessThanOrEqual(WALK.maxLeadM);
    expect(leadDistanceM(1.4, WALK)).toBeLessThan(leadDistanceM(1.4, CAR));
  });

  it("140 km/h w samochodzie nie przekracza maksimum", () => {
    expect(leadDistanceM(140 / 3.6, CAR)).toBeLessThanOrEqual(CAR.maxLeadM);
  });
});
