import { describe, expect, it } from "vitest";
import { haversineM } from "../src/geo";
import { buildRoute, pointAtProgress, progressOfPoint, projectOnRoute } from "../src/route";
import { offsetPoint, routeFromLegs, straightRoute } from "./helpers";

describe("buildRoute", () => {
  it("liczy skumulowaną długość haversine", () => {
    const pts = [
      { lat: 52, lon: 21 },
      { lat: 52.001, lon: 21 },
      { lat: 52.001, lon: 21.001 },
    ];
    const r = buildRoute(pts);
    const a = pts[0]!, b = pts[1]!, c = pts[2]!;
    expect(r.cumM[0]).toBe(0);
    expect(r.cumM[1]).toBeCloseTo(haversineM(a, b), 6);
    expect(r.lengthM).toBeCloseTo(haversineM(a, b) + haversineM(b, c), 6);
  });

  it("odrzuca trasę z mniej niż dwóch punktów", () => {
    expect(() => buildRoute([{ lat: 52, lon: 21 }])).toThrow();
  });

  it("pomija zdublowane kolejne punkty", () => {
    const r = buildRoute([
      { lat: 52, lon: 21 },
      { lat: 52, lon: 21 },
      { lat: 52.001, lon: 21 },
    ]);
    expect(r.points.length).toBe(2);
  });
});

describe("pointAtProgress", () => {
  it("odwraca postęp: punkt na 1234 m ma postęp 1234 m", () => {
    const r = routeFromLegs([[90, 1000], [0, 1000]]);
    const p = pointAtProgress(r, 1234);
    const proj = projectOnRoute(r, p);
    expect(proj).not.toBeNull();
    expect(proj!.progressM).toBeCloseTo(1234, 0);
    expect(proj!.lateralM).toBeLessThan(0.5);
  });

  it("przycina do początku i końca", () => {
    const r = straightRoute(500);
    expect(pointAtProgress(r, -10)).toEqual(r.points[0]);
    expect(pointAtProgress(r, 1e9)).toEqual(r.points[r.points.length - 1]);
  });
});

describe("projectOnRoute", () => {
  const r = routeFromLegs([[90, 2000], [0, 2000]]);

  it("punkt z boku trasy: postęp jak u stopy prostopadłej, odległość boczna", () => {
    for (const lateral of [5, 20, -40, 100]) {
      const p = offsetPoint(r, 700, lateral);
      const proj = projectOnRoute(r, p)!;
      expect(proj.progressM).toBeCloseTo(700, 0);
      expect(proj.lateralM).toBeCloseTo(Math.abs(lateral), 0);
    }
  });

  it("punkt przed startem trasy ma postęp 0", () => {
    const p = { lat: 52, lon: 20.99 };
    const proj = projectOnRoute(r, p)!;
    expect(proj.progressM).toBe(0);
    expect(proj.lateralM).toBeCloseTo(haversineM(p, r.points[0]!), 0);
  });

  it("okno postępu ogranicza wybór odcinka (trasa tam i z powrotem)", () => {
    // 1000 m na wschód i 1000 m z powrotem tą samą drogą
    const back = routeFromLegs([[90, 1000], [270, 1000]]);
    const p = offsetPoint(back, 300, 0);
    const early = projectOnRoute(back, p, { fromM: 0, toM: 900 })!;
    const late = projectOnRoute(back, p, { fromM: 1100, toM: 2000 })!;
    expect(early.progressM).toBeCloseTo(300, 0);
    expect(late.progressM).toBeCloseTo(1700, 0);
  });

  it("puste okno zwraca null", () => {
    expect(projectOnRoute(r, r.points[0]!, { fromM: 5000, toM: 6000 })).toBeNull();
  });
});

describe("progressOfPoint", () => {
  it("rzutuje miejsce (np. zabytek obok drogi) na postęp wzdłuż trasy", () => {
    const place = offsetPoint(r0(), 2500, 150);
    expect(progressOfPoint(r0(), place)).toBeCloseTo(2500, 0);
  });
});

function r0() {
  return routeFromLegs([[90, 2000], [0, 2000]]);
}
