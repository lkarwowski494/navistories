import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PROFILES, type MotionProfile } from "../src/config";

describe("config: profile ruchu", () => {
  for (const [name, p] of Object.entries(PROFILES) as [string, MotionProfile][]) {
    describe(name, () => {
      it("wszystkie liczby skończone i dodatnie", () => {
        for (const [k, v] of Object.entries(p)) {
          if (k === "name") continue;
          expect(Number.isFinite(v), k).toBe(true);
          expect(v as number, k).toBeGreaterThan(0);
        }
      });

      it("histereza: próg powrotu mniejszy niż próg zjazdu", () => {
        expect(p.onRouteDistanceM).toBeLessThan(p.offRouteDistanceM);
      });

      it("minimalne wyprzedzenie nie większe niż maksymalne", () => {
        expect(p.minLeadM).toBeLessThanOrEqual(p.maxLeadM);
      });

      it("liczniki próbek są całkowite", () => {
        for (const k of ["offRouteSamples", "onRouteSamples", "maxConsecutiveRejects"] as const) {
          expect(Number.isInteger(p[k]), k).toBe(true);
        }
      });
    });
  }

  it("samochód: 140 km/h mieści się w limicie prędkości", () => {
    expect(PROFILES.car.maxSpeedMps).toBeGreaterThan(140 / 3.6);
  });

  it("pieszo: 6 km/h mieści się w limicie prędkości", () => {
    expect(PROFILES.walk.maxSpeedMps).toBeGreaterThan(6 / 3.6);
  });

  it("każda liczba w config.ts ma oznaczenie (kal.)", () => {
    const src = readFileSync(new URL("../src/config.ts", import.meta.url), "utf8");
    const numericLines = src.split("\n").filter((l) => /^\s+\w+:\s*-?\d/.test(l));
    expect(numericLines.length).toBeGreaterThan(0);
    for (const l of numericLines) expect(l, l).toContain("(kal.)");
  });
});

describe("liczby konfiguracyjne tylko w config.ts", () => {
  // Poza config.ts (kalibracja) i constants.ts (stałe matematyczne) w kodzie
  // wolno używać tylko 0, 1, 2 i -1.
  const dir = new URL("../src/", import.meta.url);
  const files = readdirSync(dir).filter((f) => f.endsWith(".ts") && f !== "config.ts" && f !== "constants.ts");
  for (const f of files) {
    it(f, () => {
      const code = readFileSync(new URL(f, dir), "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/.*$/gm, "")
        .replace(/(["'`])(?:\\.|(?!\1).)*\1/g, '""');
      const numbers = code.match(/(?<![\w.])\d+(?:\.\d+)?(?:e[+-]?\d+)?(?![\w])/gi) ?? [];
      const bad = numbers.filter((n) => !["0", "1", "2"].includes(n));
      expect(bad, `liczby w ${f}`).toEqual([]);
    });
  }
});
