// kroje-pomiar.mjs — pomiar krojów względem liternictwa znaków drogowych (Dz.U. 2019 poz. 2311, pkt 1.4.1–1.4.2, tab. 1.10).
// Użycie (z katalogu z zainstalowanym playwright@1.56.1): node kroje-pomiar.mjs <ścieżka do docs/design/fonty>
// Kryteria z przepisu (jednostka gr = grubość elementu litery):
//   d (wersalik) = 6 gr, m (minuskuła) = 4 gr  -> m/d = 0,667;  gr/d = 1/6 = 0,167;
//   napis „Łącko” = 21,99 gr między punktami odmierzania (z odstępami 1,5 gr) -> 21,99/6 = 3,665 d.
// Metoda: canvas measureText (actualBoundingBox) przy 400 px; grubość pnia = szerokość lewego pnia „H”
// zmierzona pikselami na wysokości 1/4 d (poniżej poprzeczki). Waga = ta, przy której pień/d jest najbliżej 1/6.
import { chromium } from 'playwright';
import { resolve } from 'node:path';
const dir = resolve(process.argv[2]);
const kroje = [
  ['Public Sans', 'public-sans/PublicSans.ttf', 100, 900],
  ['Signika', 'signika/Signika.ttf', 300, 700],
  ['League Spartan', 'league-spartan/LeagueSpartan.ttf', 100, 900],
  ['Jost', 'jost/Jost.ttf', 100, 900],
  ['Overpass', 'overpass/Overpass.ttf', 100, 900],
];
const b = await chromium.launch();
const p = await b.newPage();
await p.goto('file://' + dir + '/');
const wynik = await p.evaluate(async ({ kroje, dir }) => {
  const out = [];
  for (const [fam, file, wmin, wmax] of kroje) {
    const ff = new FontFace(fam, `url("file://${dir}/${file}")`, { weight: `${wmin} ${wmax}` });
    await ff.load(); document.fonts.add(ff);
    const S = 400, cv = document.createElement('canvas'); cv.width = 1400; cv.height = 600;
    const c = cv.getContext('2d', { willReadFrequently: true });
    const stem = (w) => {
      c.clearRect(0, 0, cv.width, cv.height); c.font = `${w} ${S}px "${fam}"`; c.fillStyle = '#000';
      const base = 500, x0 = 100; c.fillText('H', x0, base);
      const H = c.measureText('H').actualBoundingBoxAscent; const y = Math.round(base - H / 4);
      const row = c.getImageData(0, y, cv.width, 1).data; let a = -1, e = -1;
      for (let i = 0; i < cv.width; i++) { const on = row[i * 4 + 3] > 127; if (on && a < 0) a = i; if (!on && a >= 0) { e = i; break; } }
      return { H, stem: e - a };
    };
    let best = null;
    for (let w = wmin; w <= wmax; w += 10) { const { H, stem: s } = stem(w); const r = s / H; if (!best || Math.abs(r - 1 / 6) < Math.abs(best.r - 1 / 6)) best = { w, r }; }
    const w = best.w; c.font = `${w} ${S}px "${fam}"`;
    const H = c.measureText('H').actualBoundingBoxAscent, x = c.measureText('x').actualBoundingBoxAscent;
    const L = c.measureText('Łącko'), lw = L.actualBoundingBoxLeft + L.actualBoundingBoxRight;
    // dodatkowe rozstrzelenie (em) na każdy z 4 odstępów, żeby „Łącko” miało 3,665 d
    const track = ((3.665 * H - lw) / 4) / S;
    const r700 = stem(Math.min(700, wmax));
    const T = (t, px) => { c.font = `${w} ${px}px "${fam}"`; const m = c.measureText(t); return m.actualBoundingBoxLeft + m.actualBoundingBoxRight; };
    out.push({ kroj: fam, waga_gr: w, 'pień/d': +best.r.toFixed(3), 'pień/d przy 700': +(r700.stem / r700.H).toFixed(3),
      'm/d': +(x / H).toFixed(3), 'Łącko/d': +(lw / H).toFixed(3), 'rozstrzel. em': +track.toFixed(3),
      'd/em': +(H / S).toFixed(3), 'tytuł 28px szer.': Math.round(T('Pałac w Kozłówce', 28)),
      zaladowany: document.fonts.check(`${w} 20px "${fam}"`) && ff.status === 'loaded' });
  }
  return out;
}, { kroje, dir });
console.table(wynik);
console.log('Przepis: m/d 0.667 · pień/d 0.167 · Łącko/d 3.665 (z odstępami znaków 1,5 gr)');
console.log(JSON.stringify(wynik));
await b.close();
