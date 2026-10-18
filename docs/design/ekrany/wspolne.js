// Wspólne definicje SVG makiet E3 (sylwetki, piktogramy, glify). Wstrzykiwane na początek <body>.
// Sylwetki to [PRZYKŁAD] typologii obiektów; właściwa typologia: [DO USTALENIA] (pkt 6.3.4 Dz.U. 2019 poz. 2311, rysunki).
document.body.insertAdjacentHTML('afterbegin', `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <pattern id="kreski" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="2.4" height="5" style="fill:var(--braz)"/>
    </pattern>
    <symbol id="palac" viewBox="0 0 240 110">
      <g fill="currentColor"><rect x="0" y="104" width="240" height="6"/><rect x="70" y="40" width="100" height="64"/><polygon points="64,42 120,10 176,42"/><rect x="10" y="62" width="58" height="42"/><rect x="172" y="62" width="58" height="42"/><rect x="114" y="0" width="12" height="14"/></g>
      <g style="fill:var(--lico)"><rect x="84" y="56" width="12" height="18"/><rect x="114" y="56" width="12" height="18"/><rect x="144" y="56" width="12" height="18"/><rect x="108" y="82" width="24" height="22"/><rect x="22" y="74" width="10" height="14"/><rect x="46" y="74" width="10" height="14"/><rect x="184" y="74" width="10" height="14"/><rect x="208" y="74" width="10" height="14"/></g>
    </symbol>
    <symbol id="zamek" viewBox="0 0 240 110">
      <g fill="currentColor"><rect x="0" y="104" width="240" height="6"/><rect x="40" y="18" width="40" height="86"/><rect x="160" y="30" width="40" height="74"/><rect x="80" y="50" width="80" height="54"/>
        <rect x="40" y="8" width="9" height="12"/><rect x="55" y="8" width="10" height="12"/><rect x="71" y="8" width="9" height="12"/><rect x="160" y="20" width="9" height="12"/><rect x="175" y="20" width="10" height="12"/><rect x="191" y="20" width="9" height="12"/>
        <rect x="80" y="42" width="10" height="10"/><rect x="100" y="42" width="10" height="10"/><rect x="130" y="42" width="10" height="10"/><rect x="150" y="42" width="10" height="10"/></g>
      <g style="fill:var(--lico)"><path d="M108 104 v-22 a12 12 0 0 1 24 0 v22 z"/><rect x="55" y="34" width="10" height="16"/><rect x="175" y="46" width="10" height="16"/></g>
    </symbol>
    <symbol id="kosciol" viewBox="0 0 240 110">
      <g fill="currentColor"><rect x="0" y="104" width="240" height="6"/><rect x="60" y="54" width="130" height="50"/><polygon points="56,56 125,28 194,56"/><rect x="30" y="34" width="36" height="70"/><polygon points="26,36 48,0 70,36"/></g>
      <g style="fill:var(--lico)"><path d="M40 70 v-12 a8 8 0 0 1 16 0 v12 z"/><path d="M90 92 v-18 a7 7 0 0 1 14 0 v18 z"/><path d="M146 92 v-18 a7 7 0 0 1 14 0 v18 z"/><rect x="118" y="80" width="14" height="24"/></g>
    </symbol>
    <symbol id="ratusz" viewBox="0 0 240 110">
      <g fill="currentColor"><rect x="0" y="104" width="240" height="6"/><rect x="30" y="56" width="180" height="48"/><rect x="104" y="14" width="32" height="44"/><polygon points="100,16 120,0 140,16"/><polygon points="40,58 70,44 100,58"/><polygon points="140,58 170,44 200,58"/></g>
      <g style="fill:var(--lico)"><rect x="114" y="26" width="12" height="14"/><rect x="48" y="70" width="12" height="16"/><rect x="80" y="70" width="12" height="16"/><rect x="148" y="70" width="12" height="16"/><rect x="180" y="70" width="12" height="16"/><path d="M110 104 v-16 a10 10 0 0 1 20 0 v16 z"/></g>
    </symbol>
    <!-- piktogram „droga przed nami” (stan: czekam na historię): krawędzie jezdni i oś, sam kontur — nie trójkąt -->
    <symbol id="droga" viewBox="0 0 100 80">
      <g fill="none" stroke="currentColor" stroke-linecap="round"><path d="M40 2 L8 78 M60 2 L92 78" stroke-width="6"/><path d="M50 6 V14 M50 26 V38 M50 52 V70" stroke-width="5"/></g>
    </symbol>
    <!-- piktogram „poza trasą”: jezdnia (brąz) odsunięta w lewo + osobny trójkąt ostrzegawczy (czerwień) — wywiedziony, nie kopia znaku A-30 -->
    <symbol id="poza" viewBox="0 0 120 80">
      <g style="color:var(--braz)" fill="none" stroke="currentColor" stroke-linecap="round"><path d="M26 2 L2 78 M42 2 L66 78" stroke-width="5"/><path d="M34 8 V16 M34 30 V42 M34 56 V72" stroke-width="4"/></g>
      <g style="color:var(--ostrz)"><path d="M94 20 L118 64 H70 Z" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round"/><rect x="91" y="34" width="6" height="16" rx="2" fill="currentColor"/><circle cx="94" cy="56" r="3.6" fill="currentColor"/></g>
    </symbol>
    <symbol id="g-pauza" viewBox="0 0 24 24"><rect x="5" y="3" width="5" height="18" rx="1"/><rect x="14" y="3" width="5" height="18" rx="1"/></symbol>
    <symbol id="g-nastepna" viewBox="0 0 24 24"><polygon points="4,3 16,12 4,21"/><rect x="17" y="3" width="3" height="18"/></symbol>
    <symbol id="g-strzalka-l" viewBox="0 0 44 26"><polygon points="0,13 16,0 16,8 44,8 44,18 16,18 16,26"/></symbol>
  </defs>
</svg>
`);
