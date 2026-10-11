import { describe, expect, it } from "vitest";
import { parseGpx, toSamples } from "../src/gpx";

const XML = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="test" xmlns="http://www.topografix.com/GPX/1/1">
  <wpt lat="52.1" lon="21.1"><time>2026-01-01T00:00:00Z</time></wpt>
  <rte>
    <rtept lat="52.0" lon="21.0"/>
    <rtept lon="21.001" lat="52.001"></rtept>
  </rte>
  <trk><trkseg>
    <trkpt lat="52.0" lon="21.0"><ele>100</ele><time>2026-01-01T00:00:00Z</time></trkpt>
    <trkpt lat='52.0005' lon='21.0005'><time>2026-01-01T00:00:01.500Z</time><hdop>2.5</hdop></trkpt>
  </trkseg></trk>
</gpx>`;

describe("parseGpx", () => {
  it("czyta rtept, trkpt i wpt (atrybuty w dowolnej kolejności, oba cudzysłowy)", () => {
    const g = parseGpx(XML);
    expect(g.rte).toEqual([
      { lat: 52.0, lon: 21.0 },
      { lat: 52.001, lon: 21.001 },
    ]);
    expect(g.trk).toHaveLength(2);
    expect(g.trk[1]).toMatchObject({ lat: 52.0005, lon: 21.0005 });
    expect(g.wpt).toHaveLength(1);
  });

  it("czas jako sekundy epoki", () => {
    const g = parseGpx(XML);
    expect(g.trk[0]!.t).toBe(Date.UTC(2026, 0, 1) / 1000);
    expect(g.trk[1]!.t! - g.trk[0]!.t!).toBeCloseTo(1.5, 6);
  });

  it("toSamples wymaga czasu w każdym punkcie", () => {
    const g = parseGpx(XML);
    expect(toSamples(g.trk)).toHaveLength(2);
    expect(() => toSamples(g.rte)).toThrow();
  });

  it("odrzuca nieprawidłowe współrzędne", () => {
    expect(() => parseGpx('<gpx><trkpt lat="abc" lon="21"/></gpx>')).toThrow();
  });
});
