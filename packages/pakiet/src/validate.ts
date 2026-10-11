import { PROGRESS_ROUNDING_TOLERANCE_M } from "./config";
import { routeOf } from "./convert";
import { pakietSchema, type Pakiet } from "./schema";

export type ValidationResult = { ok: true; pakiet: Pakiet } | { ok: false; errors: string[] };

/**
 * Sprawdza pakiet: schemat (typy, zakresy, bezpieczne ścieżki audio, adresy
 * źródeł) i spójność (unikalne id, znane motywy, punkty na długości trasy).
 */
export function validatePakiet(input: unknown): ValidationResult {
  const parsed = pakietSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((i) => `${i.path.length ? i.path.join(".") : "(pakiet)"}: ${i.message}`),
    };
  }
  const p = parsed.data;
  const errors: string[] = [];

  let lengthM: number | null = null;
  try {
    lengthM = routeOf(p).lengthM;
  } catch {
    errors.push("route: trasa musi mieć co najmniej dwa różne punkty");
  }

  const themeIds = new Set(p.themes.map((t) => t.id));
  if (themeIds.size !== p.themes.length) errors.push("themes: powtórzone id motywu");

  const seen = new Set<string>();
  for (const pt of p.points) {
    if (seen.has(pt.id)) errors.push(`points: Powtórzone id punktu: ${pt.id}`);
    seen.add(pt.id);
    for (const t of pt.themes) {
      if (!themeIds.has(t)) errors.push(`points.${pt.id}.themes: Nieznany motyw: ${t}`);
    }
    if (lengthM !== null && pt.progressM > lengthM + PROGRESS_ROUNDING_TOLERANCE_M) {
      errors.push(`points.${pt.id}.progressM: punkt poza trasą (${pt.progressM} m > ${Math.round(lengthM)} m)`);
    }
  }

  return errors.length ? { ok: false, errors } : { ok: true, pakiet: p };
}

/** Jak validatePakiet, ale rzuca błąd z listą problemów. */
export function parsePakiet(input: unknown): Pakiet {
  const r = validatePakiet(input);
  if (!r.ok) throw new Error(`Nieprawidłowy pakiet:\n- ${r.errors.join("\n- ")}`);
  return r.pakiet;
}
