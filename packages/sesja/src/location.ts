import type { GpsSample } from "@navistories/trigger";
import { MS_PER_S } from "./constants";

/** Kształt obiektu lokalizacji z expo-location (LocationObject), bez zależności od Expo. */
export interface LocationLike {
  /** Czas w ms od epoki. */
  readonly timestamp: number;
  readonly coords: {
    readonly latitude: number;
    readonly longitude: number;
    readonly accuracy: number | null;
    readonly speed: number | null;
  };
}

/** Obiekt lokalizacji systemu → próbka GPS dla logiki wyzwalania (czas w s; braki i wartości ujemne pomijane). */
export function sampleFromLocation(loc: LocationLike): GpsSample {
  const { latitude: lat, longitude: lon, accuracy, speed } = loc.coords;
  return {
    lat,
    lon,
    t: loc.timestamp / MS_PER_S,
    ...(accuracy !== null && accuracy >= 0 ? { accuracyM: accuracy } : {}),
    ...(speed !== null && speed >= 0 ? { speedMps: speed } : {}),
  };
}
