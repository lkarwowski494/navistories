import { describe, expect, it } from "vitest";
import { bearingDeg, destinationPoint, haversineM } from "../src/geo";

describe("haversineM", () => {
  it("zero dla tego samego punktu", () => {
    expect(haversineM({ lat: 52, lon: 21 }, { lat: 52, lon: 21 })).toBe(0);
  });

  it("1° długości na równiku = 2πR/360", () => {
    // R = 6371008.8 m → 111195.08 m
    expect(haversineM({ lat: 0, lon: 0 }, { lat: 0, lon: 1 })).toBeCloseTo(111195.08, 1);
  });

  it("1° szerokości wzdłuż południka = 2πR/360", () => {
    expect(haversineM({ lat: 52, lon: 21 }, { lat: 53, lon: 21 })).toBeCloseTo(111195.08, 1);
  });

  it("na 60° szerokości 1° długości to ok. połowa (cos 60° = 0,5)", () => {
    const d = haversineM({ lat: 60, lon: 0 }, { lat: 60, lon: 1 });
    // łuk wielkiego koła jest nieco krótszy niż łuk równoleżnika (55597.5 m)
    expect(d).toBeGreaterThan(55590);
    expect(d).toBeLessThan(55598);
  });

  it("jest symetryczna", () => {
    const a = { lat: 52.23, lon: 21.01 };
    const b = { lat: 50.72, lon: 23.25 };
    expect(haversineM(a, b)).toBeCloseTo(haversineM(b, a), 6);
  });
});

describe("destinationPoint i bearingDeg", () => {
  it("punkt w odległości d ma odległość d (w obie strony)", () => {
    const a = { lat: 52, lon: 21 };
    for (const brg of [0, 45, 90, 180, 270, 333]) {
      const b = destinationPoint(a, brg, 1234);
      expect(haversineM(a, b)).toBeCloseTo(1234, 3);
      expect(bearingDeg(a, b)).toBeCloseTo(brg % 360, 3);
    }
  });

  it("kurs na północ = 0, na wschód ≈ 90", () => {
    expect(bearingDeg({ lat: 52, lon: 21 }, { lat: 53, lon: 21 })).toBeCloseTo(0, 6);
    expect(bearingDeg({ lat: 0, lon: 21 }, { lat: 0, lon: 22 })).toBeCloseTo(90, 6);
  });
});
