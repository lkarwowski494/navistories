/**
 * Stałe matematyczne i fizyczne (nie konfiguracja, nie do kalibracji).
 */

/**
 * Średni promień Ziemi R1 = (2a + b) / 3 dla elipsoidy GRS80/WGS84, w metrach.
 * Wartość konwencjonalna dla obliczeń haversine na kuli. Model kulisty to
 * nazwane uproszczenie względem elipsoidy; jego wpływ na wyzwalanie sprawdzi
 * kalibracja na prawdziwych przejazdach.
 */
export const EARTH_RADIUS_M = 6371008.8;

/** Stopnie na radiany. */
export const DEG_TO_RAD = Math.PI / 180;

/** Radiany na stopnie. */
export const RAD_TO_DEG = 180 / Math.PI;

/** Pełny kąt w stopniach. */
export const FULL_TURN_DEG = 360;

/** Milisekund w sekundzie. */
export const MS_PER_S = 1000;
