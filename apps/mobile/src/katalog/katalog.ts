import { validatePakiet, type Pakiet } from "@navistories/pakiet";
import type { StoryRef } from "@navistories/sesja";
import type { AudioSource } from "expo-audio";

/** Dostępne pakiety i dostęp do ich plików audio. */
export interface Katalog {
  readonly pakiety: readonly Pakiet[];
  /** Plik audio historii albo null, jeśli pakiet go nie ma. */
  audio(ref: StoryRef): AudioSource | null;
  pakiet(id: string): Pakiet | null;
}

export interface SurowyPakiet {
  readonly json: unknown;
  /** Ścieżka względna w pakiecie → źródło audio (moduł zasobu albo URI pliku). */
  readonly audio: Readonly<Record<string, AudioSource>>;
}

/**
 * Buduje katalog z surowych pakietów: każdy przechodzi walidację; pakiet z
 * błędami albo bez któregoś pliku audio jest pomijany (z opisem w `bledy`).
 */
export function zbudujKatalog(surowe: readonly SurowyPakiet[]): Katalog & { readonly bledy: readonly string[] } {
  const pakiety: Pakiet[] = [];
  const audio = new Map<string, Readonly<Record<string, AudioSource>>>();
  const bledy: string[] = [];
  for (const s of surowe) {
    const r = validatePakiet(s.json);
    if (!r.ok) {
      bledy.push(...r.errors);
      continue;
    }
    const p = r.pakiet;
    const brak = p.points.filter((pt) => !(pt.audio in s.audio)).map((pt) => pt.audio);
    if (brak.length) {
      bledy.push(`${p.id}: brak plików audio: ${brak.join(", ")}`);
      continue;
    }
    if (audio.has(p.id)) {
      bledy.push(`${p.id}: powtórzone id pakietu`);
      continue;
    }
    pakiety.push(p);
    audio.set(p.id, s.audio);
  }
  return {
    pakiety,
    bledy,
    audio: (ref) => audio.get(ref.pakietId)?.[ref.audio] ?? null,
    pakiet: (id) => pakiety.find((p) => p.id === id) ?? null,
  };
}
