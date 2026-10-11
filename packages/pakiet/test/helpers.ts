/** Dane testowe: wymyślone pakiety (syntetyczne trasy, przykładowe adresy z domeny example.org). */
import type { Pakiet } from "../src/schema";

/** Prosta trasa na wschód ok. 1,4 km (pięć punktów co ok. 0,005° długości ≈ 343 m na 52° N). */
export const ROUTE: [number, number][] = [
  [52.0, 21.0],
  [52.0, 21.005],
  [52.0, 21.01],
  [52.0, 21.015],
  [52.0, 21.02],
];

export function validPakiet(overrides: Partial<Pakiet> = {}): Pakiet {
  return {
    formatVersion: 1,
    id: "test-spacer",
    version: "1.0.0",
    title: "Spacer testowy",
    mode: "walk",
    themes: [{ id: "architektura", name: "Architektura" }],
    durationMin: 30,
    aiGenerated: { text: true, voice: true },
    route: ROUTE,
    points: [
      {
        id: "p1",
        progressM: 200,
        priority: 1,
        title: "Punkt pierwszy",
        audio: "audio/p1.wav",
        themes: ["architektura"],
        sources: [{ institution: "Instytucja przykładowa", url: "https://example.org/zrodlo-1" }],
      },
      {
        id: "p2",
        progressM: 900,
        priority: 2,
        title: "Punkt drugi",
        audio: "audio/p2.wav",
        themes: ["architektura"],
        sources: [
          { institution: "Instytucja przykładowa", url: "https://example.org/zrodlo-2" },
          { institution: "Archiwum przykładowe", url: "https://example.org/archiwum" },
        ],
      },
    ],
    ...overrides,
  };
}
