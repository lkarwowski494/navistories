/**
 * Jedyne miejsce liczb konfiguracyjnych aplikacji (poza logiką wyzwalania,
 * której liczby są w @navistories/trigger/src/config.ts).
 *
 * „(kal.)” = propozycja inżynierska do kalibracji na prawdziwych przejazdach
 * i spacerach, nie wartość z literatury ani z pomiarów.
 */
import type { Mode } from "@navistories/pakiet";

/** Opcje długości spaceru do wyboru [min] (decyzja produktu: ok. 30/60/90 min). */
export const WALK_DURATION_OPTIONS_MIN = [30, 60, 90] as const;

/** Ustawienia odbiornika lokalizacji dla trybu. */
export interface LocationTuning {
  /** Minimalne przemieszczenie między aktualizacjami [m]. */
  readonly distanceIntervalM: number;
  /** Minimalny odstęp między aktualizacjami [ms] (Android). */
  readonly timeIntervalMs: number;
}

export const LOCATION_TUNING: Record<Mode, LocationTuning> = {
  car: {
    distanceIntervalM: 10, // (kal.) propozycja inżynierska do kalibracji
    timeIntervalMs: 1000, // (kal.) propozycja inżynierska do kalibracji
  },
  walk: {
    distanceIntervalM: 3, // (kal.) propozycja inżynierska do kalibracji
    timeIntervalMs: 1000, // (kal.) propozycja inżynierska do kalibracji
  },
};
