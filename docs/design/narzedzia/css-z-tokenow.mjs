// css-z-tokenow.mjs — zmienne CSS dla makiet z docs/design/tokeny.ts (makiety nie mają własnych wartości).
// Użycie: node css-z-tokenow.mjs <docs/design/tokeny.ts> <docs/design/ekrany/tokeny.css>
// Motyw: <html data-theme="light|dark">; zwiększony kontrast: <html data-kontrast="tak">.
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const [tok, out] = process.argv.slice(2);
const t = await import(pathToFileURL(resolve(tok)).href);
const kebab = (s) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
const blok = (k) => Object.entries(k).map(([n, v]) => `  --${kebab(n)}: ${v};`).join('\n');
const sel = {
  'jasny/standard': ':root',
  'jasny/zwiekszonyKontrast': ':root[data-kontrast="tak"]',
  'ciemny/standard': ':root[data-theme="dark"]',
  'ciemny/zwiekszonyKontrast': ':root[data-theme="dark"][data-kontrast="tak"]',
};
let css = `/* WYGENEROWANE z docs/design/tokeny.ts przez narzedzia/css-z-tokenow.mjs — nie edytuj ręcznie. */\n`;
for (const [s, w] of Object.entries(t.kolory)) for (const [v, k] of Object.entries(w)) css += `${sel[`${s}/${v}`]} {\n${blok(k)}\n}\n`;
const px = (o, p) => Object.entries(o).map(([n, v]) => `  --${p}-${kebab(n)}: ${v}px;`).join('\n');
css += `:root {\n${px(t.odstep, 'od')}\n${px(t.promien, 'r')}\n`;
css += Object.entries(t.obrzeze).map(([n, [a]]) => `  --ob-${kebab(n)}: ${a}px;`).join('\n') + '\n';
css += `  --postep-h: ${t.WYSOKOSC_POSTEPU}px;\n  --cel-min: ${t.cel.minimum}px;\n  --cel-przycisk: ${t.cel.przycisk}px;\n  --cel-pauza: ${t.cel.pauzaWRuchu}px;\n`;
// typografia: rozmiar w rem (16 px = 1 rem) × mnożnik Dynamic Type (--dt-tytul / --dt-tresc)
for (const [n, s] of Object.entries(t.typografia)) {
  // jak w RN: jeden mnożnik systemu (--dt-tresc; AX5 = 3.1) ucięty przez maxMnoznik stylu (maxFontSizeMultiplier)
  const fs = `calc(${s.rozmiar / 16}rem * min(var(--dt-tresc, 1), ${s.maxMnoznik}))`;
  css += `  --fs-${kebab(n)}: ${fs};\n  --lh-${kebab(n)}: ${(s.interlinia / s.rozmiar).toFixed(3)};\n  --fw-${kebab(n)}: ${s.waga};\n`;
}
css += `}\n:root[data-kontrast="tak"] {\n` + Object.entries(t.obrzeze).map(([n, [, b]]) => `  --ob-${kebab(n)}: ${b}px;`).join('\n') + '\n}\n';
writeFileSync(out, css);
console.log(out);
