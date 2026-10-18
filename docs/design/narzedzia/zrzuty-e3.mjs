// zrzuty-e3.mjs — wariant skryptu „zrzuty.mjs” z modułu render-i-krytyka (rola 04), etap E3.
// Użycie (z katalogu z playwright@1.56.1, przeglądarki w $PLAYWRIGHT_BROWSERS_PATH):
//   node zrzuty-e3.mjs <katalog-roboczy> <docs/design/wzorce-zrzuty> <docs/design/arkusze> <plik.html>...
// Dla każdego <main data-ekran>: 320/390/430 × jasny/ciemny × tekst domyślny/AX5 (--dt-tytul 1.8, --dt-tresc 3.1,
// uproszczenie tabeli HIG), do tego „Zwiększ kontrast” (390, jasny i ciemny) i skala szarości (390, jasny).
// Wszystkie zrzuty → katalog roboczy (poza repo). Zrzuty wzorcowe (linia bazowa audytu) → wzorce-zrzuty:
// 390 jasny, 390 ciemny, 320 jasny AX5. Arkusz zbiorczy na plik (siatka miniatur) → arkusze/<plik>.png.
// ikona.html: tylko 390 jasny i ciemny (ikona nie zależy od szerokości ani Dynamic Type).
import { chromium } from 'playwright';
import { mkdirSync, copyFileSync, writeFileSync } from 'node:fs';
import { resolve, basename } from 'node:path';
const [outA, refsA, sheetsA, ...files] = process.argv.slice(2);
const out = resolve(outA), refs = resolve(refsA), sheets = resolve(sheetsA);
for (const d of [out, refs, sheets]) mkdirSync(d, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 2 });
const set = (o) => page.evaluate(async ({ theme, w, ax5, zk, szary }) => {
  const r = document.documentElement;
  r.dataset.theme = theme;
  if (zk) r.dataset.kontrast = 'tak'; else delete r.dataset.kontrast;
  r.style.setProperty('--w', w + 'px');
  r.style.setProperty('--dt-tytul', ax5 ? '1.8' : '1');
  r.style.setProperty('--dt-tresc', ax5 ? '3.1' : '1');
  r.style.filter = szary ? 'grayscale(1)' : '';
  document.body.offsetHeight; await document.fonts.ready;
}, o);
const PELNE = [];
for (const w of [320, 390, 430]) for (const theme of ['light', 'dark']) for (const ax5 of [false, true]) PELNE.push({ w, theme, ax5 });
PELNE.push({ w: 390, theme: 'light', zk: true }, { w: 390, theme: 'dark', zk: true }, { w: 390, theme: 'light', szary: true });
const nazwa = (v) => `${v.w}-${v.theme}${v.ax5 ? '-ax5' : ''}${v.zk ? '-zk' : ''}${v.szary ? '-szary' : ''}`;
const WZORCOWE = new Set(['390-light', '390-dark', '320-light-ax5']);
for (const file of files) {
  const base = basename(file, '.html');
  await page.goto('file://' + resolve(file));
  await page.evaluate(() => document.fonts.ready);
  const loaded = await page.evaluate(() => [...document.fonts].filter((x) => x.status === 'loaded').map((x) => x.family.replace(/["']/g, '')));
  for (const f of ['Jost', 'Tresc']) if (!loaded.includes(f)) { console.error(`BRAK KROJU: ${f} w ${file}`); process.exit(1); }
  const warianty = base === 'ikona' ? [{ w: 390, theme: 'light' }, { w: 390, theme: 'dark' }] : PELNE;
  const ekrany = await page.locator('[data-ekran]').evaluateAll((els) => els.map((e) => e.dataset.ekran));
  const grid = {};
  for (const v of warianty) {
    await set(v);
    for (const e of ekrany) {
      const p = `${out}/${base}-${e}-${nazwa(v)}.png`;
      await page.locator(`[data-ekran="${e}"]`).screenshot({ path: p });
      (grid[e] ??= []).push([nazwa(v), p]);
      if (WZORCOWE.has(nazwa(v))) copyFileSync(p, `${refs}/${base}-${e}-${nazwa(v)}.png`);
    }
  }
  // arkusz zbiorczy
  const thumb = base === 'ikona' ? 360 : 150;
  const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#D9DADC;font:13px/1.3 Inter,sans-serif;color:#1B1C1E}
.w{padding:16px} h1{font-size:18px;margin:0 0 4px} p{margin:0 0 12px;color:#44484D;max-width:1800px}
table{border-collapse:separate;border-spacing:8px 0} th{font-size:11px;font-weight:600;text-align:left;color:#44484D;padding:0 0 4px;white-space:nowrap}
td{vertical-align:top;padding:0 0 14px} td.n{font-weight:600;width:110px;font-size:13px} img{width:${thumb}px;display:block;outline:1px solid #0002}</style>
<div class="w"><h1>${base}.html — arkusz zbiorczy (E3, system Drogowskaz)</h1>
<p>Miniatury całych ekranów (AX5 przewija się, więc jest wyższy). Kolumny: szerokość pt, motyw, AX5 = mnożnik systemu 3,1, a każdy styl ucięty swoim maxMnoznik z tokeny.ts (uproszczenie HIG), zk = „Zwiększ kontrast”, szary = test „nic tylko kolorem”. Treść: na iOS SF Pro; w makiecie zastępczo Inter — nie oceniać kroju treści. Dane: [PRZYKŁAD].</p>
<table><tr><th></th>${grid[ekrany[0]].map(([n]) => `<th>${n}</th>`).join('')}</tr>
${ekrany.map((e) => `<tr><td class="n">${e}</td>${grid[e].map(([, p]) => `<td><img src="file://${p}"></td>`).join('')}</tr>`).join('\n')}
</table></div>`;
  writeFileSync(`${out}/arkusz-${base}.html`, html);
  const p2 = await browser.newPage({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 1 });
  await p2.goto(`file://${out}/arkusz-${base}.html`);
  await p2.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0));
  await p2.screenshot({ path: `${sheets}/${base}.png`, fullPage: true });
  await p2.close();
  console.log(`${base}: ${ekrany.length} ekranów × ${warianty.length} wariantów → ${sheets}/${base}.png`);
}
await browser.close();
