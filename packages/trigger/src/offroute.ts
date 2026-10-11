import type { MotionProfile } from "./config";

export interface OffRouteState {
  readonly offRoute: boolean;
  /** Ile kolejnych próbek przemawia za zmianą stanu. */
  readonly streak: number;
}

export function initialOffRouteState(): OffRouteState {
  return { offRoute: false, streak: 0 };
}

/**
 * Histereza zjazdu z trasy: zjazd po offRouteSamples kolejnych próbkach dalej
 * niż offRouteDistanceM; powrót po onRouteSamples kolejnych próbkach nie dalej
 * niż onRouteDistanceM. Próbka „pomiędzy” zeruje licznik.
 */
export function updateOffRoute(state: OffRouteState, lateralM: number, profile: MotionProfile): OffRouteState {
  if (!state.offRoute) {
    if (lateralM > profile.offRouteDistanceM) {
      const streak = state.streak + 1;
      return streak >= profile.offRouteSamples ? { offRoute: true, streak: 0 } : { offRoute: false, streak };
    }
    return { offRoute: false, streak: 0 };
  }
  if (lateralM <= profile.onRouteDistanceM) {
    const streak = state.streak + 1;
    return streak >= profile.onRouteSamples ? { offRoute: false, streak: 0 } : { offRoute: true, streak };
  }
  return { offRoute: true, streak: 0 };
}
