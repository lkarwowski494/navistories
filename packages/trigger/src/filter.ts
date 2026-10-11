import type { MotionProfile } from "./config";
import { haversineM } from "./geo";
import type { GpsSample } from "./types";

export interface FilterState {
  /** Ostatnia przyjęta próbka (punkt odniesienia dla testu skoku). */
  readonly last: GpsSample | null;
  /** Ile kolejnych próbek odrzucono za skok. */
  readonly consecutiveRejects: number;
}

export type RejectReason = "accuracy" | "time" | "jump";

export type FilterResult =
  | { readonly accepted: true; readonly reset: boolean; readonly state: FilterState }
  | { readonly accepted: false; readonly reason: RejectReason; readonly state: FilterState };

export function initialFilterState(): FilterState {
  return { last: null, consecutiveRejects: 0 };
}

/**
 * Odrzuca złe próbki: słaba deklarowana dokładność, czas nie rosnący, nierealny
 * skok dla profilu (odległość > maxSpeedMps·dt + jumpToleranceM). Po
 * maxConsecutiveRejects skokach z rzędu przyjmuje próbkę jako nowy punkt
 * odniesienia (reset), żeby nie utknąć po prawdziwej zmianie pozycji.
 */
export function filterSample(state: FilterState, s: GpsSample, profile: MotionProfile): FilterResult {
  if (s.accuracyM !== undefined && !(s.accuracyM <= profile.maxAccuracyM)) {
    return { accepted: false, reason: "accuracy", state };
  }
  const last = state.last;
  if (!last) return { accepted: true, reset: false, state: { last: s, consecutiveRejects: 0 } };
  const dt = s.t - last.t;
  if (!(dt > 0)) return { accepted: false, reason: "time", state };
  const d = haversineM(last, s);
  if (d > profile.maxSpeedMps * dt + profile.jumpToleranceM) {
    const n = state.consecutiveRejects + 1;
    if (n > profile.maxConsecutiveRejects) {
      return { accepted: true, reset: true, state: { last: s, consecutiveRejects: 0 } };
    }
    return { accepted: false, reason: "jump", state: { last, consecutiveRejects: n } };
  }
  return { accepted: true, reset: false, state: { last: s, consecutiveRejects: 0 } };
}
