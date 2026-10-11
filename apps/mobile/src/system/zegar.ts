import type { Clock } from "@navistories/sesja";

/** Milisekund w sekundzie (stała, nie konfiguracja). */
const MS_PER_S = 1000;

/** Zegar systemowy: czas w sekundach od epoki (ta sama epoka co próbki z expo-location). */
export const systemClock: Clock = {
  now: () => Date.now() / MS_PER_S,
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: (h) => clearTimeout(h as ReturnType<typeof setTimeout>),
};
