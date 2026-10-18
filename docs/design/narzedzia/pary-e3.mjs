// pary-e3.mjs — buduje plik par kontrastu z tokenów (jedno źródło prawdy: docs/design/tokeny.ts).
// Użycie (Node ≥ 22.18, natywne usuwanie typów TS): node pary-e3.mjs <docs/design/tokeny.ts> <wyjście.json>
// Potem: node kontrast.mjs <wyjście.json>
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const [tok, out] = process.argv.slice(2);
const { kolory, pary } = await import(pathToFileURL(resolve(tok)).href);
const wynik = {};
for (const [schemat, warianty] of Object.entries(kolory)) {
  for (const [wariant, k] of Object.entries(warianty)) {
    for (const p of pary) wynik[`${schemat}/${wariant}: ${p.nazwa}`] = [k[p.przod], k[p.tlo], p.prog];
  }
}
writeFileSync(out, JSON.stringify(wynik, null, 1) + '\n');
console.log(`${Object.keys(wynik).length} par → ${out}`);
