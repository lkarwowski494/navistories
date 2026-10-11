import { DEG_TO_RAD, EARTH_RADIUS_M, FULL_TURN_DEG, RAD_TO_DEG } from "./constants";
import type { LatLon } from "./types";

/** Odległość po wielkim kole (wzór haversine, Ziemia jako kula) [m]. */
export function haversineM(a: LatLon, b: LatLon): number {
  const φ1 = a.lat * DEG_TO_RAD;
  const φ2 = b.lat * DEG_TO_RAD;
  const dφ = φ2 - φ1;
  const dλ = (b.lon - a.lon) * DEG_TO_RAD;
  const h = Math.sin(dφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Kurs początkowy z a do b, w stopniach [0, 360). */
export function bearingDeg(a: LatLon, b: LatLon): number {
  const φ1 = a.lat * DEG_TO_RAD;
  const φ2 = b.lat * DEG_TO_RAD;
  const dλ = (b.lon - a.lon) * DEG_TO_RAD;
  const y = Math.sin(dλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(dλ);
  const deg = Math.atan2(y, x) * RAD_TO_DEG;
  return ((deg % FULL_TURN_DEG) + FULL_TURN_DEG) % FULL_TURN_DEG;
}

/** Punkt w odległości distanceM od p w kierunku bearing (stopnie). */
export function destinationPoint(p: LatLon, bearing: number, distanceM: number): LatLon {
  const φ1 = p.lat * DEG_TO_RAD;
  const λ1 = p.lon * DEG_TO_RAD;
  const θ = bearing * DEG_TO_RAD;
  const δ = distanceM / EARTH_RADIUS_M;
  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
  const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));
  return { lat: φ2 * RAD_TO_DEG, lon: λ2 * RAD_TO_DEG };
}
