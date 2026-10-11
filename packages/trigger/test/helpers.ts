/**
 * Pomocnicze generatory danych testowych (syntetyczne trasy i przejazdy).
 * Liczby tutaj to dane testowe, nie konfiguracja aplikacji.
 */
import { bearingDeg, destinationPoint } from "../src/geo";
import { buildRoute, pointAtProgress, type Route } from "../src/route";
import type { GpsSample, LatLon } from "../src/types";

export const ORIGIN: LatLon = { lat: 52.0, lon: 21.0 };

/** Trasa z odcinków prostych: lista [kurs w stopniach, długość w m], punkty co stepM. */
export function routeFromLegs(legs: ReadonlyArray<readonly [number, number]>, stepM = 25, start: LatLon = ORIGIN): Route {
  const pts: LatLon[] = [start];
  let cur = start;
  for (const [brg, len] of legs) {
    const n = Math.max(1, Math.round(len / stepM));
    for (let i = 0; i < n; i++) {
      cur = destinationPoint(cur, brg, len / n);
      pts.push(cur);
    }
  }
  return buildRoute(pts);
}

export function straightRoute(lengthM: number, brg = 90): Route {
  return routeFromLegs([[brg, lengthM]]);
}

/** Punkt na trasie przesunięty w bok o lateralM (dodatnie = w prawo). */
export function offsetPoint(route: Route, progressM: number, lateralM: number): LatLon {
  const p = pointAtProgress(route, progressM);
  if (lateralM === 0) return p;
  const ahead = pointAtProgress(route, Math.min(route.lengthM, progressM + 1));
  const behind = pointAtProgress(route, Math.max(0, progressM - 1));
  const brg = bearingDeg(behind, ahead);
  return destinationPoint(p, brg + 90, lateralM);
}

export interface DriveOptions {
  fromM: number;
  toM: number;
  speedMps: number;
  dtS?: number;
  t0?: number;
  lateralM?: number;
  accuracyM?: number;
  withSpeed?: boolean;
}

/** Próbki jazdy ze stałą prędkością od fromM do toM (także wstecz, gdy toM < fromM). */
export function drive(route: Route, o: DriveOptions): GpsSample[] {
  const dt = o.dtS ?? 1;
  const t0 = o.t0 ?? 0;
  const dir = o.toM >= o.fromM ? 1 : -1;
  const total = Math.abs(o.toM - o.fromM);
  const out: GpsSample[] = [];
  for (let i = 0; ; i++) {
    const d = Math.min(total, i * dt * o.speedMps);
    const p = offsetPoint(route, o.fromM + dir * d, o.lateralM ?? 0);
    const s: GpsSample = {
      ...p,
      t: t0 + i * dt,
      ...(o.accuracyM !== undefined ? { accuracyM: o.accuracyM } : {}),
      ...(o.withSpeed ? { speedMps: o.speedMps } : {}),
    };
    out.push(s);
    if (d >= total) break;
  }
  return out;
}

/** Skleja przejazdy, przesuwając czasy tak, by kolejny zaczynał się dtS po poprzednim. */
export function concat(...parts: GpsSample[][]): GpsSample[] {
  const out: GpsSample[] = [];
  for (const part of parts) {
    const first = part[0];
    if (!first) continue;
    const last = out[out.length - 1];
    const shift = last ? last.t + 1 - first.t : 0;
    for (const s of part) out.push({ ...s, t: s.t + shift });
  }
  return out;
}
