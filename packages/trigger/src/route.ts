import { ROUTE_PROJECTION_TIE_M } from "./config";
import { DEG_TO_RAD, EARTH_RADIUS_M } from "./constants";
import { haversineM } from "./geo";
import type { LatLon } from "./types";

/** Trasa jako polilinia z policzonym postępem w każdym wierzchołku. */
export interface Route {
  readonly points: readonly LatLon[];
  /** cumM[i] = długość trasy od startu do points[i] [m]. */
  readonly cumM: readonly number[];
  readonly lengthM: number;
}

/** Wynik rzutu punktu na trasę. */
export interface Projection {
  /** Postęp wzdłuż trasy w miejscu rzutu [m]. */
  readonly progressM: number;
  /** Odległość punktu od trasy [m]. */
  readonly lateralM: number;
  /** Indeks odcinka (points[i] → points[i+1]). */
  readonly segmentIndex: number;
}

/** Zakres postępu, w którym szukamy rzutu [m]. */
export interface ProgressWindow {
  readonly fromM: number;
  readonly toM: number;
}

export function buildRoute(points: readonly LatLon[]): Route {
  const pts: LatLon[] = [];
  for (const p of points) {
    const prev = pts[pts.length - 1];
    if (!prev || prev.lat !== p.lat || prev.lon !== p.lon) pts.push({ lat: p.lat, lon: p.lon });
  }
  if (pts.length < 2) throw new Error("Trasa musi mieć co najmniej dwa różne punkty");
  const cumM = [0];
  for (let i = 1; i < pts.length; i++) cumM.push(cumM[i - 1]! + haversineM(pts[i - 1]!, pts[i]!));
  return { points: pts, cumM, lengthM: cumM[cumM.length - 1]! };
}

/** Indeks odcinka zawierającego postęp m (wyszukiwanie binarne). */
function segmentAt(route: Route, m: number): number {
  let lo = 0;
  let hi = route.points.length - 2;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (route.cumM[mid]! <= m) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/** Punkt na trasie w odległości m od startu (przycięte do [0, długość]). */
export function pointAtProgress(route: Route, m: number): LatLon {
  if (m <= 0) return route.points[0]!;
  if (m >= route.lengthM) return route.points[route.points.length - 1]!;
  const i = segmentAt(route, m);
  const a = route.points[i]!;
  const b = route.points[i + 1]!;
  const len = route.cumM[i + 1]! - route.cumM[i]!;
  const f = len > 0 ? (m - route.cumM[i]!) / len : 0;
  return { lat: a.lat + (b.lat - a.lat) * f, lon: a.lon + (b.lon - a.lon) * f };
}

/**
 * Rzut punktu na trasę: najbliższy punkt polilinii (w oknie postępu, jeśli podane).
 * Uproszczenie: w obrębie odcinka płaskie rzutowanie równoodległościowe
 * (odcinki tras są krótkie). Przy remisie odległości bocznej (ROUTE_PROJECTION_TIE_M)
 * wygrywa rzut bliższy preferM.
 */
export function projectOnRoute(route: Route, p: LatLon, window?: ProgressWindow, preferM?: number): Projection | null {
  const fromM = Math.max(0, window?.fromM ?? 0);
  const toM = Math.min(route.lengthM, window?.toM ?? route.lengthM);
  if (fromM > toM) return null;
  const first = segmentAt(route, fromM);
  const last = segmentAt(route, toM);
  let best: Projection | null = null;
  for (let i = first; i <= last; i++) {
    const a = route.points[i]!;
    const b = route.points[i + 1]!;
    const segStart = route.cumM[i]!;
    const segLen = route.cumM[i + 1]! - segStart;
    const kx = EARTH_RADIUS_M * DEG_TO_RAD * Math.cos(a.lat * DEG_TO_RAD);
    const ky = EARTH_RADIUS_M * DEG_TO_RAD;
    const bx = (b.lon - a.lon) * kx;
    const by = (b.lat - a.lat) * ky;
    const px = (p.lon - a.lon) * kx;
    const py = (p.lat - a.lat) * ky;
    const len2 = bx * bx + by * by;
    let t = len2 > 0 ? (px * bx + py * by) / len2 : 0;
    // ogranicz do odcinka i do okna postępu
    const tMin = segLen > 0 ? Math.max(0, (fromM - segStart) / segLen) : 0;
    const tMax = segLen > 0 ? Math.min(1, (toM - segStart) / segLen) : 0;
    t = Math.min(tMax, Math.max(tMin, t));
    const lateralM = Math.hypot(px - t * bx, py - t * by);
    const progressM = segStart + t * segLen;
    const cand: Projection = { progressM, lateralM, segmentIndex: i };
    if (!best || isBetter(cand, best, preferM)) best = cand;
  }
  return best;
}

function isBetter(c: Projection, best: Projection, preferM: number | undefined): boolean {
  if (preferM !== undefined && Math.abs(c.lateralM - best.lateralM) <= ROUTE_PROJECTION_TIE_M) {
    return Math.abs(c.progressM - preferM) < Math.abs(best.progressM - preferM);
  }
  return c.lateralM < best.lateralM;
}

/** Postęp wzdłuż trasy dla miejsca (np. zabytku obok drogi): rzut na całą trasę [m]. */
export function progressOfPoint(route: Route, p: LatLon): number {
  return projectOnRoute(route, p)!.progressM;
}
