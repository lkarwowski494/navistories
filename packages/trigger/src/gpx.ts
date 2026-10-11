import { MS_PER_S } from "./constants";
import type { GpsSample, LatLon } from "./types";

/** Punkt z pliku GPX; t w sekundach epoki, jeśli plik ma <time>. */
export type GpxPoint = LatLon & { readonly t?: number };

export interface Gpx {
  readonly rte: GpxPoint[];
  readonly trk: GpxPoint[];
  readonly wpt: GpxPoint[];
}

/**
 * Minimalny parser GPX bez DOM (działa w Node i w React Native): czyta
 * rtept, trkpt i wpt z atrybutami lat/lon i opcjonalnym <time>.
 */
export function parseGpx(xml: string): Gpx {
  return { rte: points(xml, "rtept"), trk: points(xml, "trkpt"), wpt: points(xml, "wpt") };
}

function points(xml: string, tag: string): GpxPoint[] {
  const re = new RegExp(`<${tag}\\b([^>]*?)(?:/>|>([\\s\\S]*?)</${tag}>)`, "g");
  const out: GpxPoint[] = [];
  for (const m of xml.matchAll(re)) {
    const attrs = m[1] ?? "";
    const lat = Number(attr(attrs, "lat"));
    const lon = Number(attr(attrs, "lon"));
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error(`Nieprawidłowe współrzędne w <${tag}${attrs}>`);
    const time = /<time>([^<]+)<\/time>/.exec(m[2] ?? "")?.[1];
    if (time === undefined) {
      out.push({ lat, lon });
    } else {
      const ms = Date.parse(time.trim());
      if (Number.isNaN(ms)) throw new Error(`Nieprawidłowy czas: ${time}`);
      out.push({ lat, lon, t: ms / MS_PER_S });
    }
  }
  return out;
}

function attr(attrs: string, name: string): string | undefined {
  return new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`).exec(attrs)?.[1];
}

/** Zamienia punkty GPX na próbki GPS; każdy punkt musi mieć czas. */
export function toSamples(points: readonly GpxPoint[]): GpsSample[] {
  return points.map((p, i) => {
    if (p.t === undefined) throw new Error(`Punkt ${i} nie ma czasu`);
    return { lat: p.lat, lon: p.lon, t: p.t };
  });
}
