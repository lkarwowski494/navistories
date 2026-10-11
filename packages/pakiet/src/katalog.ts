import type { Pakiet, Theme } from "./schema";

/**
 * Najbliższa opcja długości spaceru (np. „ok. 30/60/90 min”); przy remisie krótsza.
 * Opcje podaje aplikacja (decyzja produktu, nie format pakietu).
 */
export function durationOption(durationMin: number, options: readonly number[]): number {
  let best = options[0];
  if (best === undefined) throw new Error("Brak opcji długości");
  for (const o of options) {
    if (Math.abs(o - durationMin) < Math.abs(best - durationMin)) best = o;
  }
  return best;
}

/** Motywy dostępnych spacerów, bez powtórzeń, w kolejności katalogu. */
export function walkThemes(catalog: readonly Pakiet[]): Theme[] {
  const out = new Map<string, Theme>();
  for (const p of catalog) {
    if (p.mode !== "walk") continue;
    for (const t of p.themes) if (!out.has(t.id)) out.set(t.id, t);
  }
  return [...out.values()];
}

/** Spacery z danym motywem, których długość pasuje do wybranej opcji. */
export function findWalks(catalog: readonly Pakiet[], themeId: string, option: number, options: readonly number[]): Pakiet[] {
  return catalog.filter(
    (p) =>
      p.mode === "walk" &&
      p.durationMin !== undefined &&
      p.themes.some((t) => t.id === themeId) &&
      durationOption(p.durationMin, options) === option,
  );
}

/** Trasy samochodowe. */
export function carRoutes(catalog: readonly Pakiet[]): Pakiet[] {
  return catalog.filter((p) => p.mode === "car");
}
