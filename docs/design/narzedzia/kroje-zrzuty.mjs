// kroje-zrzuty.mjs — zrzuty ekranu kluczowego Drogowskazu dla każdego kroju tytułów + arkusze zbiorcze.
// Użycie (z katalogu z playwright@1.56.1): node kroje-zrzuty.mjs <docs/design/kroje/drogowskaz-kroje.html> <katalog-roboczy> <docs/design> [polecany-krój]
// Konwencja modułu „render-i-krytyka”: stany ekranu to <main data-ekran>, szerokość --w, AX5 = --dt-tytul 1.8 / --dt-tresc 3.1.
// Wynik: <katalog-roboczy>/*.png (pojedyncze zrzuty), <docs/design>/kroje-porownanie.png, <docs/design>/kod-tresci-opcje.png.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const [file, outArg, designArg, polecany = 'jost'] = process.argv.slice(2);
const out = resolve(outArg), design = resolve(designArg);
mkdirSync(out, { recursive: true });
const KROJE = [
  ['public-sans', 'Public Sans', 'OFL 1.1', 'stan obecny (E2); krój administracji USA (USWDS)'],
  ['signika', 'Signika', 'OFL 1.1', 'krój do oznakowania i wayfindingu; deklarowana obsługa polskiego'],
  ['league-spartan', 'League Spartan', 'OFL 1.1', 'wersja Spartana — wg Devroye minuskuły Drogowskazu są mu najbliższe'],
  ['jost', 'Jost', 'OFL 1.1', 'geometryczny (niemieckie groteski lat 20.); z ss01 jednopiętrowe „a” jak w rys. 1.4.3'],
  ['overpass', 'Overpass', 'OFL 1.1', 'kontrola: amerykańskie liternictwo drogowe Highway Gothic (inny kraj)'],
];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 2 });
await page.goto('file://' + resolve(file));
const set = (o) => page.evaluate(async ({ kroj, theme = 'light', w = 390, ax5 = false, kod = 'nie' }) => {
  const r = document.documentElement;
  r.dataset.kroj = kroj; r.dataset.theme = theme; r.dataset.kod = kod;
  r.style.setProperty('--w', w + 'px');
  r.style.setProperty('--dt-tytul', ax5 ? '1.8' : '1');
  r.style.setProperty('--dt-tresc', ax5 ? '3.1' : '1');
  document.body.offsetHeight; await document.fonts.ready;
}, o);
const shot = async (sel, path) => { await page.locator(sel).screenshot({ path }); return path; };
// 1. zrzuty do arkusza krojów + kontrola, czy krój naprawdę się załadował
const rows = [];
for (const [id, fam, lic, skad] of KROJE) {
  await set({ kroj: id });
  const loaded = await page.evaluate(() => [...document.fonts].filter((x) => x.status === 'loaded').map((x) => x.family.replace(/["']/g, '')));
  if (!loaded.includes(fam)) { console.error(`BRAK KROJU: ${fam}`); process.exit(1); }
  const used = await page.evaluate(() => getComputedStyle(document.querySelector('.nazwa')).fontFamily);
  console.log(`załadowany: ${fam} (nazwa używa: ${used}; treść: ${loaded.includes('Tresc') ? 'Inter lokalnie' : 'BRAK zastępczego'})`);
  const s = {};
  for (const theme of ['light', 'dark']) {
    await set({ kroj: id, theme });
    s[`w-ruchu-${theme}`] = await shot('[data-ekran="w-ruchu"]', `${out}/${id}-w-ruchu-390-${theme}.png`);
    s[`na-postoju-${theme}`] = await shot('[data-ekran="na-postoju"]', `${out}/${id}-na-postoju-390-${theme}.png`);
  }
  await set({ kroj: id, ax5: true });
  s['na-postoju-ax5'] = await shot('[data-ekran="na-postoju"]', `${out}/${id}-na-postoju-390-light-ax5.png`);
  rows.push({ id, fam, lic, skad, s });
}
// 2. pełny przegląd (320/390/430 × jasny/ciemny × domyślny/AX5) dla polecanego kroju — do krytyki
for (const w of [320, 390, 430]) for (const theme of ['light', 'dark']) for (const ax5 of [false, true]) {
  await set({ kroj: polecany, theme, w, ax5 });
  for (const e of ['w-ruchu', 'na-postoju']) await shot(`[data-ekran="${e}"]`, `${out}/pelny-${polecany}-${e}-${w}-${theme}${ax5 ? '-ax5' : ''}.png`);
}
// 3. kod rodzaju treści: bez / z kodem, polecany krój
const kod = {};
for (const k of ['nie', 'tak']) for (const theme of ['light', 'dark']) {
  await set({ kroj: polecany, theme, kod: k });
  kod[`${k}-${theme}`] = await shot('[data-ekran="na-postoju"]', `${out}/kod-${k}-${theme}.png`);
  kod[`${k}-${theme}-et`] = await shot('[data-panel="etykiety"]', `${out}/kod-${k}-${theme}-etykiety.png`);
}
// 4. arkusze zbiorcze (HTML w katalogu roboczym -> PNG w docs/design)
const css = `body{margin:0;background:#E9E9E7;font:15px/1.35 Inter,sans-serif;color:#1B1C1E}
h1{font-size:22px;margin:0 0 4px} p.l{margin:0 0 14px;color:#4A4F55;max-width:1500px}
.w{padding:20px} table{border-collapse:separate;border-spacing:10px 0}
td{vertical-align:top;padding:0 0 18px} th{font-size:13px;text-align:left;color:#4A4F55;font-weight:600;padding-bottom:6px}
.k{width:430px} .k b{font-size:20px;display:block;margin-bottom:4px} .k span{display:block;color:#4A4F55;font-size:14px}
.k .p,.k .d{font-size-adjust:cap-height 0.7;color:#6B3815;white-space:nowrap}
.k .p{font-size:44px;line-height:1.15;margin:12px 0 4px} .k .d{font-size:30px;line-height:1.3}
img{width:390px;display:block;border-radius:4px} img.m{width:234px} .ax img{width:auto;height:844px}
.ax i{display:block;color:#4A4F55;font-style:normal;font-size:12px;padding:3px 0}`;
const ff = KROJE.map(([id, fam]) => `@font-face{font-family:"${fam}";src:url("file://${design}/fonty/${id}/${({ 'public-sans': 'PublicSans', signika: 'Signika', 'league-spartan': 'LeagueSpartan', jost: 'Jost', overpass: 'Overpass' })[id]}.ttf");font-weight:100 900}`).join('\n');
const W = { 'public-sans': 600, signika: 470, 'league-spartan': 540, jost: 490, overpass: 610 };
const arkusz = `<!doctype html><meta charset="utf-8"><style>${ff}\n${css}</style><div class="w">
<h1>Krój tytułów — kierunek A „Drogowskaz”, ekran sesji, 390 pt</h1>
<p class="l">Każdy krój w wadze, przy której grubość pnia = 1/6 wysokości wersalika (jak gr = d/6 w Dz.U. 2019 poz. 2311, pkt 1.4.1). Treść: na iOS SF Pro; w makiecie zastępczo Inter — nie oceniać. Wysokość wersalika wyrównana (font-size-adjust: cap-height), więc widać kształt, nie wielkość. Widok w ruchu pomniejszony do 60 % (tekstu tytułowego jest tam tylko „Fakty”). Ostatnia kolumna: AX5 (tytuły 180 %, treść 310 %, uproszczenie HIG), cały przewijany ekran pomniejszony. Dane na ekranie to [PRZYKŁAD].</p>
<table><tr><th></th><th>W ruchu · jasny</th><th>W ruchu · ciemny</th><th>Na postoju · jasny</th><th>Na postoju · ciemny</th><th>Na postoju · jasny · AX5</th></tr>
${rows.map((r) => `<tr><td class="k"><b>${r.fam}</b><span>${r.lic}, waga ${W[r.id]}</span><span>${r.skad}</span>
<div class="p" style="font-family:'${r.fam}';font-weight:${W[r.id]};${r.id === 'jost' ? "font-feature-settings:'ss01'" : ''}">Pałac w Kozłówce</div><div class="d" style="font-family:'${r.fam}';font-weight:${W[r.id]};${r.id === 'jost' ? "font-feature-settings:'ss01'" : ''}">Łącko Il1 agt 4 7 9 km<br>ąęłńóśźż ĄĘŁŃÓŚŹŻ</div></td>
<td><img class="m" src="file://${r.s['w-ruchu-light']}"></td><td><img class="m" src="file://${r.s['w-ruchu-dark']}"></td>
<td><img src="file://${r.s['na-postoju-light']}"></td><td><img src="file://${r.s['na-postoju-dark']}"></td>
<td class="ax"><img src="file://${r.s['na-postoju-ax5']}"><i>AX5, cały ekran (przewijany) pomniejszony</i></td></tr>`).join('')}
</table></div>`;
writeFileSync(`${out}/arkusz-kroje.html`, arkusz);
const kodHtml = `<!doctype html><meta charset="utf-8"><style>${css} .et img{width:390px;height:auto}</style><div class="w">
<h1>Kod rodzaju treści na etykiecie (spec. P16) — krój ${KROJE.find((k) => k[0] === polecany)[1]}</h1>
<p class="l">Lewa para: tylko słowo „Fakty / Legenda / Bajka”. Prawa para: słowo + znacznik z kierunku B — pełny = Fakty, kreskowany = Legenda, kontur = Bajka. Dane na ekranie to [PRZYKŁAD].</p>
<table><tr><th>Bez kodu · jasny</th><th>Bez kodu · ciemny</th><th>Z kodem · jasny</th><th>Z kodem · ciemny</th></tr>
<tr><td class="et"><img src="file://${kod['nie-light-et']}"></td><td class="et"><img src="file://${kod['nie-dark-et']}"></td><td class="et"><img src="file://${kod['tak-light-et']}"></td><td class="et"><img src="file://${kod['tak-dark-et']}"></td></tr>
<tr><td><img src="file://${kod['nie-light']}"></td><td><img src="file://${kod['nie-dark']}"></td><td><img src="file://${kod['tak-light']}"></td><td><img src="file://${kod['tak-dark']}"></td></tr></table></div>`;
writeFileSync(`${out}/arkusz-kod.html`, kodHtml);
const p2 = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 1 });
for (const [src, dst] of [['arkusz-kroje.html', 'kroje-porownanie.png'], ['arkusz-kod.html', 'kod-tresci-opcje.png']]) {
  await p2.goto(`file://${out}/${src}`); await p2.evaluate(() => document.fonts.ready);
  await p2.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0));
  await p2.screenshot({ path: `${design}/${dst}`, fullPage: true }); console.log(`${design}/${dst}`);
}
await browser.close();
