import type { MotionProfile } from "./config";

/** Wyprzedzenie [m]: prędkość · leadTimeS, przycięte do [minLeadM, maxLeadM]. */
export function leadDistanceM(speedMps: number, profile: MotionProfile): number {
  const v = Number.isFinite(speedMps) && speedMps > 0 ? speedMps : 0;
  return Math.min(profile.maxLeadM, Math.max(profile.minLeadM, v * profile.leadTimeS));
}
