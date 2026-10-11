/** Dane testowe: wymyślona prosta trasa i przejazd wzdłuż niej (liczby to dane testowe, nie konfiguracja). */
import type { Pakiet, Point } from "@navistories/pakiet";
import { buildRoute, destinationPoint, pointAtProgress, type GpsSample, type LatLon } from "@navistories/trigger";

const ORIGIN: LatLon = { lat: 52.0, lon: 21.0 };
const EAST = 90;

/** Prosta trasa na wschód, punkty co 50 m. */
export function straightRoute(lengthM: number): [number, number][] {
  const out: [number, number][] = [];
  for (let m = 0; m <= lengthM; m += 50) {
    const p = destinationPoint(ORIGIN, EAST, m);
    out.push([p.lat, p.lon]);
  }
  return out;
}

export function point(id: string, progressM: number, extra: Partial<Point> = {}): Point {
  return {
    id,
    progressM,
    priority: 1,
    title: `Punkt ${id}`,
    audio: `audio/${id}.wav`,
    themes: ["a"],
    sources: [{ institution: "Instytucja przykładowa", url: `https://example.org/${id}` }],
    ...extra,
  };
}

export function carPakiet(points: Point[], lengthM = 2000): Pakiet {
  return {
    formatVersion: 1,
    id: "test-auto",
    version: "1",
    title: "Trasa testowa",
    mode: "car",
    themes: [
      { id: "a", name: "A" },
      { id: "b", name: "B" },
    ],
    aiGenerated: { text: true, voice: true },
    route: straightRoute(lengthM),
    points,
  };
}

/** Jazda wzdłuż trasy pakietu ze stałą prędkością, próbka co 1 s, od fromM do toM; opcjonalne przesunięcie boczne na odcinku. */
export function drive(
  p: Pakiet,
  opts: { fromM: number; toM: number; speedMps: number; t0?: number; offset?: { fromM: number; toM: number; lateralM: number } },
): GpsSample[] {
  const route = buildRoute(p.route.map(([lat, lon]) => ({ lat, lon })));
  const out: GpsSample[] = [];
  const t0 = opts.t0 ?? 1000;
  for (let i = 0; ; i++) {
    const m = opts.fromM + opts.speedMps * i;
    if (m > opts.toM) break;
    let pos = pointAtProgress(route, m);
    const o = opts.offset;
    if (o && m >= o.fromM && m <= o.toM) pos = destinationPoint(pos, EAST + 90, o.lateralM);
    out.push({ lat: pos.lat, lon: pos.lon, t: t0 + i, accuracyM: 5, speedMps: opts.speedMps });
  }
  return out;
}
