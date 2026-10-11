import { describe, expect, it } from "vitest";
import { carRoutes, durationOption, findWalks, walkThemes } from "../src/katalog";
import type { Pakiet } from "../src/schema";
import { validPakiet } from "./helpers";

const OPTIONS = [30, 60, 90] as const;

function walk(id: string, themeId: string, durationMin: number): Pakiet {
  return validPakiet({ id, themes: [{ id: themeId, name: themeId.toUpperCase() }], durationMin, points: validPakiet().points.map((p) => ({ ...p, themes: [themeId] })) });
}

const catalog: Pakiet[] = [
  walk("w1", "architektura", 28),
  walk("w2", "architektura", 65),
  walk("w3", "wojna", 90),
  validPakiet({ id: "c1", mode: "car" }),
];

describe("katalog pakietów", () => {
  it("długość spaceru przypisana do najbliższej opcji (ok. 30/60/90 min)", () => {
    expect(durationOption(28, OPTIONS)).toBe(30);
    expect(durationOption(44, OPTIONS)).toBe(30);
    expect(durationOption(46, OPTIONS)).toBe(60);
    expect(durationOption(120, OPTIONS)).toBe(90);
    expect(durationOption(45, OPTIONS)).toBe(30); // remis: krótsza opcja
  });

  it("motywy spacerów bez powtórzeń, w kolejności katalogu", () => {
    expect(walkThemes(catalog)).toEqual([
      { id: "architektura", name: "ARCHITEKTURA" },
      { id: "wojna", name: "WOJNA" },
    ]);
  });

  it("spacery według motywu i długości", () => {
    expect(findWalks(catalog, "architektura", 30, OPTIONS).map((p) => p.id)).toEqual(["w1"]);
    expect(findWalks(catalog, "architektura", 60, OPTIONS).map((p) => p.id)).toEqual(["w2"]);
    expect(findWalks(catalog, "architektura", 90, OPTIONS)).toEqual([]);
  });

  it("trasy samochodowe to pakiety w trybie car", () => {
    expect(carRoutes(catalog).map((p) => p.id)).toEqual(["c1"]);
  });
});
