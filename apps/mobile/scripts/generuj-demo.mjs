// Generuje syntetyczne pakiety demonstracyjne (bez treści z warsztatu, bez nagrań głosu).
//
// - pakiet.json: trasa z syntetycznego fixture'u GPX pakietu @navistories/trigger
//   (wymyślona, nie z OpenStreetMap), punkty z przykładowymi źródłami z domeny
//   example.org (zarezerwowanej do przykładów);
// - audio/ton-N.wav: krótkie tony sinusoidalne liczone tutaj (PCM 16 bit, mono).
//
// Pliki .wav nie są w repozytorium (.gitignore: audio/, *.wav); tworzy je
// `postinstall`. Pliki pakiet.json są w repozytorium; po zmianie skryptu:
//   pnpm --filter @navistories/mobile demo           (JSON + audio)
//   pnpm --filter @navistories/mobile demo:audio     (tylko audio)
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const demoDir = join(here, "..", "assets", "demo");
const fixture = join(here, "..", "..", "..", "packages", "trigger", "test", "fixtures", "syntetyczna-trasa.gpx");
const onlyAudio = process.argv.includes("--tylko-audio");

// --- audio: ton sinusoidalny z łagodnym wejściem i wyjściem ---
const RATE = 22050;
const TONE_S = 3;
const FADE_S = 0.05;
const AMPLITUDE = 0.3;
const TONES_HZ = [440, 554.37, 659.25]; // A4, C#5, E5

function wav(freq) {
  const n = Math.round(RATE * TONE_S);
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16); // rozmiar bloku fmt
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(RATE, 24);
  buf.writeUInt32LE(RATE * 2, 28); // bajtów na sekundę
  buf.writeUInt16LE(2, 32); // bajtów na próbkę
  buf.writeUInt16LE(16, 34); // bitów na próbkę
  buf.write("data", 36);
  buf.writeUInt32LE(n * 2, 40);
  const fade = Math.round(RATE * FADE_S);
  for (let i = 0; i < n; i++) {
    const env = Math.min(1, i / fade, (n - 1 - i) / fade);
    const v = Math.sin((2 * Math.PI * freq * i) / RATE) * AMPLITUDE * env;
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  return buf;
}

// --- trasa z fixture'u ---
const R = 6371008.8;
const D = Math.PI / 180;
function haversine(a, b) {
  const dφ = (b[0] - a[0]) * D;
  const dλ = (b[1] - a[1]) * D;
  const h = Math.sin(dφ / 2) ** 2 + Math.cos(a[0] * D) * Math.cos(b[0] * D) * Math.sin(dλ / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function readRoute() {
  const xml = readFileSync(fixture, "utf8");
  return [...xml.matchAll(/<rtept lat="([^"]+)" lon="([^"]+)"/g)].map((m) => [Number(m[1]), Number(m[2])]);
}
function prefix(route, maxM) {
  const out = [route[0]];
  let cum = 0;
  for (let i = 1; i < route.length; i++) {
    cum += haversine(route[i - 1], route[i]);
    if (cum > maxM) break;
    out.push(route[i]);
  }
  return out;
}

function point(i, progressM, themes, priority = 1) {
  return {
    id: `punkt-${i}`,
    progressM,
    priority,
    title: `Punkt demonstracyjny ${i} (ton ${Math.round(TONES_HZ[i - 1])} Hz)`,
    audio: `audio/ton-${i}.wav`,
    themes,
    sources: [
      { institution: "Instytucja przykładowa (dane demonstracyjne)", url: `https://example.org/navistories-demo/zrodlo-${i}` },
      { institution: "Archiwum przykładowe (dane demonstracyjne)", url: `https://example.org/navistories-demo/archiwum-${i}` },
    ],
  };
}

const COMMON = { formatVersion: 1, version: "demo-1", aiGenerated: { text: false, voice: false } };

function packages() {
  const route = readRoute();
  return {
    "demo-samochod": {
      ...COMMON,
      id: "demo-samochod",
      title: "Trasa demonstracyjna (syntetyczna, ok. 4,5 km)",
      mode: "car",
      themes: [
        { id: "demo-a", name: "Motyw demonstracyjny A" },
        { id: "demo-b", name: "Motyw demonstracyjny B" },
      ],
      route,
      points: [point(1, 500, ["demo-a"]), point(2, 1200, ["demo-b"]), point(3, 3050, ["demo-a", "demo-b"], 2)],
    },
    "demo-spacer": {
      ...COMMON,
      id: "demo-spacer",
      title: "Spacer demonstracyjny (syntetyczny, ok. 2 km)",
      mode: "walk",
      themes: [{ id: "demo-spacer", name: "Motyw demonstracyjny" }],
      durationMin: 30,
      route: prefix(route, 2000),
      points: [point(1, 300, ["demo-spacer"]), point(2, 1000, ["demo-spacer"]), point(3, 1700, ["demo-spacer"])],
    },
  };
}

for (const [id, pakiet] of Object.entries(packages())) {
  const dir = join(demoDir, id);
  mkdirSync(join(dir, "audio"), { recursive: true });
  if (!onlyAudio) writeFileSync(join(dir, "pakiet.json"), JSON.stringify(pakiet, null, 2).replace(/\[\s+(-?[\d.]+),\s+(-?[\d.]+)\s+\]/g, "[$1, $2]") + "\n");
  TONES_HZ.forEach((f, i) => writeFileSync(join(dir, "audio", `ton-${i + 1}.wav`), wav(f)));
}
console.log(`Pakiety demonstracyjne: ${demoDir}${onlyAudio ? " (tylko audio)" : ""}`);
