/** Punkt geograficzny w stopniach (WGS84). */
export interface LatLon {
  readonly lat: number;
  readonly lon: number;
}

/** Próbka GPS. Czas w sekundach (dowolna epoka, rosnący). */
export interface GpsSample extends LatLon {
  readonly t: number;
  /** Deklarowana dokładność pozioma [m], jeśli system ją podaje. */
  readonly accuracyM?: number;
  /** Prędkość z systemu [m/s], jeśli jest (ujemna = brak). */
  readonly speedMps?: number;
}

/** Punkt na trasie, do którego przypięta jest historia. */
export interface Checkpoint {
  readonly id: string;
  /** Postęp wzdłuż trasy od startu [m]. */
  readonly progressM: number;
  /** Wyższa liczba = ważniejsza historia. */
  readonly priority: number;
}
