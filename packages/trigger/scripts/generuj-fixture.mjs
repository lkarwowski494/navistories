// Generuje syntetyczny fixture GPX do testów scenariuszowych.
// Trasa i przejazd są w całości wymyślone (nie pochodzą z OpenStreetMap ani z warsztatu).
// Uruchom: pnpm --filter @navistories/trigger fixture
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const R = 6371008.8;
const D = Math.PI / 180;

function dest(p, brgDeg, d) {
  const φ1 = p.lat * D, λ1 = p.lon * D, θ = brgDeg * D, δ = d / R;
  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
  const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));
  return { lat: φ2 / D, lon: λ2 / D };
}

// Trasa: 2000 m na wschód, łuk 90° w lewo (promień 300 m), 2000 m na północ.
const START = { lat: 52.0, lon: 21.0 };
const STEP = 25;
const legs = [];
for (let i = 0; i < 2000 / STEP; i++) legs.push([90, STEP]);
const arcLen = (Math.PI / 2) * 300;
const arcSteps = Math.round(arcLen / STEP);
for (let i = 0; i < arcSteps; i++) legs.push([90 - (90 * (i + 0.5)) / arcSteps, arcLen / arcSteps]);
for (let i = 0; i < 2000 / STEP; i++) legs.push([0, STEP]);

const route = [START];
const brgs = [];
const cum = [0];
let cur = START;
for (const [b, d] of legs) {
  cur = dest(cur, b, d);
  route.push(cur);
  brgs.push(b);
  cum.push(cum[cum.length - 1] + d);
}
const LENGTH = cum[cum.length - 1];

function at(m) {
  let i = 0;
  while (i < legs.length - 1 && cum[i + 1] < m) i++;
  return { p: dest(route[i], brgs[i], m - cum[i]), brg: brgs[i] };
}

// Deterministyczny szum (LCG), żeby fixture był powtarzalny.
let seed = 12345;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648) * 2 - 1;

// Przejazd 1 Hz: 50 km/h do 1500 m, potem 90 km/h; tunel bez GPS na 2700–3300 m;
// jeden fałszywy odczyt (400 m w bok) w 30. sekundzie; szum boczny ±4 m.
const T0 = Date.UTC(2026, 0, 1, 8, 0, 0) / 1000;
const track = [];
let m = 0;
for (let t = 0; m <= LENGTH; t++) {
  const inTunnel = m >= 2700 && m <= 3300;
  if (!inTunnel) {
    const { p, brg } = at(m);
    let q = dest(p, brg + 90, rnd() * 4);
    if (t === 30) q = dest(p, brg + 90, 400);
    track.push({ ...q, t: T0 + t });
  }
  m += m < 1500 ? 50 / 3.6 : 90 / 3.6;
}

const iso = (t) => new Date(t * 1000).toISOString().replace(".000Z", "Z");
const f = (x) => x.toFixed(7);
const lines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<gpx version="1.1" creator="NaviStories generuj-fixture.mjs (dane syntetyczne)" xmlns="http://www.topografix.com/GPX/1/1">',
  `  <metadata><name>Syntetyczna trasa testowa (${Math.round(LENGTH)} m)</name></metadata>`,
  "  <rte>",
  ...route.map((p) => `    <rtept lat="${f(p.lat)}" lon="${f(p.lon)}"/>`),
  "  </rte>",
  "  <trk><trkseg>",
  ...track.map((s) => `    <trkpt lat="${f(s.lat)}" lon="${f(s.lon)}"><time>${iso(s.t)}</time></trkpt>`),
  "  </trkseg></trk>",
  "</gpx>",
  "",
];
const out = fileURLToPath(new URL("../test/fixtures/syntetyczna-trasa.gpx", import.meta.url));
writeFileSync(out, lines.join("\n"));
console.log(`zapisano ${out}: trasa ${Math.round(LENGTH)} m, ${route.length} punktów, ${track.length} próbek`);
