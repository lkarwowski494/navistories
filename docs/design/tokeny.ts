/**
 * NaviStories — tokeny systemu „Drogowskaz” (Studio Projektowe, etap E3, 18.10.2026).
 *
 * PROPOZYCJA modułu motywu. Ma zastąpić `kolory` i `styl` z apps/mobile/src/ekrany/ui.tsx
 * (gałąź iteracja-0/aplikacja). Plik nie importuje niczego z aplikacji ani z React Native:
 * wartości są zwykłymi liczbami i napisami, które rola 08 podłącza do StyleSheet,
 * useColorScheme() i AccessibilityInfo. Dlaczego jeden plik: wygląd zmienia się w jednym
 * miejscu, a audyt (rola 04, tryb audit) porównuje ekrany z tym plikiem.
 *
 * Pochodzenie barw:
 * - lico (biel) i brąz: drogowskazy do obiektów turystycznych E-7…E-12 („Napisy, symbole
 *   i obrzeże tych znaków są barwy brązowej”, Dz.U. 2019 poz. 2311, pkt 6.3.4.1).
 * - #6B3815 (brąz) i #B20013 (czerwień) to PRZYBLIŻENIA: środek pola tolerancji
 *   z tab. 1.3 tego rozporządzenia (współrzędne x, y) przeliczony na sRGB przy założonym
 *   współczynniku luminancji Y = 0,06 (brąz) i Y = 0,08 (czerwień). Rozporządzenie podaje
 *   tylko minimum β, więc Y jest założeniem studia. Uproszczenie: folia znaku w świetle
 *   dziennym i ekran sRGB to nie to samo. Nie są to „hexy z przepisu”.
 * - Pozostałe barwy (szarości jezdni, wersje nocne i zwiększonego kontrastu): wybór studia,
 *   sprawdzony skryptem kontrastu (docs/design/narzedzia/kontrast-e3-wynik.txt).
 * Tablica w aplikacji jest WYWIEDZIONA ze znaków (barwa, obrzeże, sylwetka, małe litery),
 * nie jest kopią znaku urzędowego. Ocena prawna naśladowania: [DO USTALENIA].
 */

// ───────────────────────────── Kolory ─────────────────────────────

export type Schemat = 'jasny' | 'ciemny';
export type Wariant = 'standard' | 'zwiekszonyKontrast';

/** Role barw. Każda rola ma jedno znaczenie (HIG, Color: ten sam kolor nie znaczy dwóch rzeczy). */
export interface Kolory {
  /** „Jezdnia”: tło ekranu i list grupowanych. */
  readonly tlo: string;
  /** „Lico tablicy”: tło tablicy, komórek list, etykiet i przycisków drugorzędnych. */
  readonly lico: string;
  /** Brąz drogowskazu: jedyny akcent. Obrzeże tablicy, sylwetka, tytuły na licu, przycisk główny, linki, znaczniki wyboru. */
  readonly braz: string;
  /** Brąz wciśnięty (stan naciśnięcia przycisku głównego). */
  readonly brazNacisk: string;
  /** Tor paska postępu pod wypełnieniem z brązu. */
  readonly brazTor: string;
  /** Tekst i glif na brązie (przycisk główny, glif pauzy). */
  readonly naBrazie: string;
  /** Tekst podstawowy. */
  readonly tekst: string;
  /** Tekst drugorzędny: oznaczenie AI, podpowiedzi, opisy, nagłówki sekcji list. */
  readonly tekst2: string;
  /** Ostrzeżenie („Poza trasą”, błąd). Zawsze z ikoną i tekstem (lub komunikatem głosowym w ruchu), nigdy samo. */
  readonly ostrz: string;
  /** Linie podziału w listach. Dekoracyjne: nie niosą informacji, kontrastu nie mierzymy (WCAG 1.4.11 ich nie obejmuje). */
  readonly separator: string;
}

export const kolory: Readonly<Record<Schemat, Readonly<Record<Wariant, Kolory>>>> = {
  jasny: {
    standard: {
      tlo: '#ECEDEE',
      lico: '#FFFFFF',
      braz: '#6B3815', // przybliżenie z tab. 1.3, Y = 0,06 (opis wyżej)
      brazNacisk: '#4F290F',
      brazTor: '#F3ECE6',
      naBrazie: '#FFFFFF',
      tekst: '#1D1F21',
      tekst2: '#5E6266',
      ostrz: '#B20013', // przybliżenie z tab. 1.3, Y = 0,08; tylko ostrzeżenia
      separator: '#D3D5D8',
    },
    zwiekszonyKontrast: {
      tlo: '#E4E5E7',
      lico: '#FFFFFF',
      braz: '#4F290F',
      brazNacisk: '#361B08',
      brazTor: '#E6D6C6',
      naBrazie: '#FFFFFF',
      tekst: '#0F1011',
      tekst2: '#3B3E42',
      ostrz: '#8E000F',
      separator: '#9EA2A7',
    },
  },
  ciemny: {
    standard: {
      tlo: '#1C1E21', // asfalt nocą
      lico: '#2A2C30', // tablica nocą: jaśniejsza od jezdni, ale nie świeci bielą
      braz: '#D9A877', // brąz rozjaśniony na noc (wybór studia)
      brazNacisk: '#E9C59F',
      brazTor: '#4A3A2D',
      naBrazie: '#1C1E21',
      tekst: '#F1EEEA',
      tekst2: '#AEB2B7',
      ostrz: '#FF8A80',
      separator: '#3C3F44',
    },
    zwiekszonyKontrast: {
      tlo: '#141517', // ciemniej niż standard: powód = zwiększony kontrast, nie „chrom”
      lico: '#24262A',
      braz: '#F0CFA8',
      brazNacisk: '#F8E2C8',
      brazTor: '#5C4837',
      naBrazie: '#141517',
      tekst: '#FFFFFF',
      tekst2: '#D0D3D7',
      ostrz: '#FFB4AB',
      separator: '#6A6E74',
    },
  },
};

/**
 * Wybór palety. `schemat` z useColorScheme() ('light' | 'dark' | null),
 * `zwiekszonyKontrast`: iOS AccessibilityInfo.isDarkerSystemColorsEnabled(), Android
 * isHighTextContrastEnabled() (AccessibilityInfo.d.ts, RN v0.86.3, wiersze 79 i 86). Że „darker system
 * colors” to systemowe „Zwiększ kontrast”: do sprawdzenia na urządzeniu [DO USTALENIA].
 */
export function paleta(schemat: 'light' | 'dark' | null | undefined, zwiekszonyKontrast: boolean): Kolory {
  const s: Schemat = schemat === 'dark' ? 'ciemny' : 'jasny';
  return kolory[s][zwiekszonyKontrast ? 'zwiekszonyKontrast' : 'standard'];
}

/**
 * Pary sąsiadujących barw do pomiaru kontrastu (WCAG 2.2: 1.4.3 tekst, 1.4.11 elementy interfejsu).
 * Mierzone w KAŻDYM schemacie i wariancie przez docs/design/narzedzia/kontrast-e3.mjs.
 * prog 4.5: tekst zwykły; prog 3: element interfejsu lub grafika niosąca informację
 * (albo tekst ≥ 24 pt, ≥ 19 pt pogrubiony; tu nie korzystamy z tej ulgi dla tekstu).
 */
export interface Para {
  readonly nazwa: string;
  readonly przod: keyof Kolory;
  readonly tlo: keyof Kolory;
  readonly prog: 4.5 | 3;
}

export const pary: readonly Para[] = [
  // tekst
  { nazwa: 'tekst na jezdni (trasa, nagłówki ekranów, „Zakończ podróż”)', przod: 'tekst', tlo: 'tlo', prog: 4.5 },
  { nazwa: 'tekst na licu (komórki list, treść ujawnienia AI)', przod: 'tekst', tlo: 'lico', prog: 4.5 },
  { nazwa: 'tekst drugorzędny na jezdni (oznaczenie AI, podpowiedź, nagłówek sekcji)', przod: 'tekst2', tlo: 'tlo', prog: 4.5 },
  { nazwa: 'tekst drugorzędny na licu (czas, opis komórki, przycisk wyłączony)', przod: 'tekst2', tlo: 'lico', prog: 4.5 },
  { nazwa: 'brąz na licu (nazwa miejsca, km, etykieta rodzaju treści, linki, przycisk drugorzędny)', przod: 'braz', tlo: 'lico', prog: 4.5 },
  { nazwa: 'brąz na jezdni (link „Źródła” poza komórką)', przod: 'braz', tlo: 'tlo', prog: 4.5 },
  { nazwa: 'tekst na brązie (przycisk główny)', przod: 'naBrazie', tlo: 'braz', prog: 4.5 },
  { nazwa: 'tekst na brązie wciśniętym', przod: 'naBrazie', tlo: 'brazNacisk', prog: 4.5 },
  { nazwa: 'ostrzeżenie na licu (tekst i ikona „Poza trasą”, błąd)', przod: 'ostrz', tlo: 'lico', prog: 4.5 },
  { nazwa: 'ostrzeżenie na jezdni (tekst błędu poza komórką)', przod: 'ostrz', tlo: 'tlo', prog: 4.5 },
  // elementy interfejsu i grafika z danymi
  { nazwa: 'obrzeże tablicy / przycisku / etykiety do jezdni (UI)', przod: 'braz', tlo: 'tlo', prog: 3 },
  { nazwa: 'sylwetka, znacznik rodzaju treści, ptaszek wyboru, przełącznik do lica (UI)', przod: 'braz', tlo: 'lico', prog: 3 },
  { nazwa: 'wypełnienie paska postępu do toru (UI)', przod: 'braz', tlo: 'brazTor', prog: 3 },
  { nazwa: 'glif pauzy na brązie (UI)', przod: 'naBrazie', tlo: 'braz', prog: 3 },
  { nazwa: 'kreskowana ramka przycisku wyłączonego do lica (UI)', przod: 'tekst2', tlo: 'lico', prog: 3 },
  { nazwa: 'ikona ostrzeżenia na licu (UI)', przod: 'ostrz', tlo: 'lico', prog: 3 },
];

// ───────────────────────────── Typografia ─────────────────────────────

/**
 * Tytuły: Jost (SIL OFL 1.1, docs/design/fonty/jost/) z zestawem ss01 (jednopiętrowe „a”,
 * jak we wzorach liter, Dz.U. 2019 poz. 2311, rys. 1.4.3). W RN 0.86 na iOS: fontVariant
 * ['stylistic-one'] (RCTFont.mm, wiersz 289, tag v0.86.3) — działanie z ss01 Josta do
 * sprawdzenia na urządzeniu [DO USTALENIA]; zapas: statyczna kopia kroju z zamrożonym ss01.
 * Waga 500 (najbliższa nazwana instancja do zmierzonej 490, przy której pień = 1/6 wersalika).
 *
 * Treść: kroj systemowy (SF Pro) przez style tekstu iOS; rozmiary i interlinie z HIG,
 * Typography, tabela iOS „Large (default)” (odczyt 18.10.2026).
 *
 * Dynamic Type w RN: rozmiar mnoży się przez jeden współczynnik dla wszystkich tekstów
 * (RCTAccessibilityManager.mm, v0.86.3: Large 1.0 … AX5 = 3.571). HIG dla AX5 skaluje
 * treść 17→53 pt (×3,12), a duży tytuł 34→60 pt (×1,76). Dlatego:
 * - treść: maxFontSizeMultiplier 3.12 (= 53/17, odpowiednik HIG Body przy AX5);
 * - tytuły Jost: maxFontSizeMultiplier = max(1.8, 53 / rozmiar): duże tytuły rosną ×1,8
 *   (≈ 60/34, jak duży tytuł HIG), małe (przyciski, wiersze, etykieta) dochodzą do 53 pt,
 *   czyli do rozmiaru treści, tak jak w HIG tytuły średnie rosną mocniej niż duży tytuł.
 *   Uproszczenie tabeli HIG, nazwane.
 * Wyjątki nazwane przy stylach: tytulDuzy 1.5, etykietaRodzaju 2.0 (szerokość 320 pt).
 * Makiety: mnożnik systemu = --dt-tresc (3.1 przy AX5), każdy styl ucięty swoim maxMnoznik (jak maxFontSizeMultiplier).
 * Pogrubiony tekst (AccessibilityInfo.isBoldTextEnabled): Jost 500 → 600, 600 → 700;
 * kroj systemowy pogrubia się sam.
 */
export const kroje = {
  tytul: 'Jost', // nazwa rodziny po rejestracji przez expo-font (rola 08)
  tytulCechy: ['stylistic-one'] as const, // ss01
  tresc: undefined, // undefined = kroj systemowy (SF Pro)
} as const;

export const wagi = {
  tytul: '500',
  tytulMocny: '600',
  tytulPogrubiony: '600', // gdy włączony „Pogrubiony tekst”
  tytulMocnyPogrubiony: '700',
} as const;

export interface StylTekstu {
  readonly kroj: 'tytul' | 'tresc';
  readonly rozmiar: number;
  readonly interlinia: number;
  readonly waga: '400' | '500' | '600' | '700';
  readonly maxMnoznik: number;
  readonly cyfryTabelaryczne?: boolean;
}

export const MNOZNIK_TYTULY = 1.8;
export const MNOZNIK_TRESC = 3.12;
/** Rozmiar treści (Body) przy AX5 wg HIG [pt]. */
export const TRESC_AX5 = 53;
/**
 * Mnożnik tytułu: co najmniej 1,8, ale tytuł przy AX5 nie może być mniejszy niż treść (53 pt).
 * Bez tej reguły małe tytuły Jost (przyciski, wiersze list, etykieta) przy AX5 wychodziły
 * mniejsze od tekstu pod nimi (usterka z rundy 1 zrzutów E3).
 */
export const mnoznikTytulu = (rozmiar: number): number => Math.round(Math.max(MNOZNIK_TYTULY, TRESC_AX5 / rozmiar) * 100) / 100;

export const typografia = {
  // Jost (tytuły i elementy tablicy)
  tytulDuzy: { kroj: 'tytul', rozmiar: 34, interlinia: 41, waga: '500', maxMnoznik: 1.5 }, // duży tytuł paska nawigacji; 1,5 zamiast 1,8: najdłuższe słowo tytułu („zakończona”, 5,3 em Josta) musi się zmieścić w 280 pt (ekran 320 pt) — pomiar narzedzia, runda 2
  nazwaMiejsca: { kroj: 'tytul', rozmiar: 30, interlinia: 34, waga: '500', maxMnoznik: mnoznikTytulu(30) }, // nazwa na tablicy
  tytulSekcji: { kroj: 'tytul', rozmiar: 24, interlinia: 29, waga: '500', maxMnoznik: mnoznikTytulu(24) }, // „Jak dziś podróżujesz?”
  odleglosc: { kroj: 'tytul', rozmiar: 24, interlinia: 24, waga: '500', maxMnoznik: mnoznikTytulu(24), cyfryTabelaryczne: true }, // „4 km” obok strzałki
  tytulWiersza: { kroj: 'tytul', rozmiar: 20, interlinia: 24, waga: '500', maxMnoznik: mnoznikTytulu(20) }, // następna opowieść, opcje trybu
  przycisk: { kroj: 'tytul', rozmiar: 19, interlinia: 22, waga: '500', maxMnoznik: mnoznikTytulu(19) },
  przyciskGlowny: { kroj: 'tytul', rozmiar: 19, interlinia: 22, waga: '600', maxMnoznik: mnoznikTytulu(19) },
  etykietaRodzaju: { kroj: 'tytul', rozmiar: 18, interlinia: 20, waga: '500', maxMnoznik: 2.0 }, // Fakty / Legenda / Bajka; 2,0 (36 pt): etykieta nie łamie się, a „Legenda” ze znacznikiem musi się zmieścić w 280 pt
  // kroj systemowy (style iOS, HIG „Large (default)”)
  body: { kroj: 'tresc', rozmiar: 17, interlinia: 22, waga: '400', maxMnoznik: MNOZNIK_TRESC },
  headline: { kroj: 'tresc', rozmiar: 17, interlinia: 22, waga: '600', maxMnoznik: MNOZNIK_TRESC },
  callout: { kroj: 'tresc', rozmiar: 16, interlinia: 21, waga: '400', maxMnoznik: MNOZNIK_TRESC },
  subhead: { kroj: 'tresc', rozmiar: 15, interlinia: 20, waga: '400', maxMnoznik: MNOZNIK_TRESC, cyfryTabelaryczne: true },
  footnote: { kroj: 'tresc', rozmiar: 13, interlinia: 18, waga: '400', maxMnoznik: MNOZNIK_TRESC }, // oznaczenie AI, nagłówki sekcji
} as const satisfies Record<string, StylTekstu>;

/**
 * Zachowanie przy dużym tekście (od AX1, mnożnik RN ≥ 1.786):
 * - rzędy przycisków (Pauza | Następna) przechodzą w stos pionowy;
 * - wiersz „następna opowieść” przenosi tekst pod sylwetkę;
 * - liczby z jednostką („14 km”, „10 z 18”, „1:12 z 3:40”) nie łamią się w środku;
 * - ekran na postoju przewija się; ekran w ruchu nie zmienia układu (tekstu prawie nie ma).
 */
export const PROG_STOSU = 1.786;

// ───────────────────────────── Odstępy, promienie, obrzeża ─────────────────────────────

/** Siatka 4 pt. `margines` = boczny margines ekranu (jak dotąd 20 pt w ui.tsx). */
export const odstep = {
  xxs: 4,
  xs: 8,
  s: 12,
  m: 16,
  margines: 20,
  l: 24,
  xl: 32,
  xxl: 48,
} as const;

/**
 * Promienie według hierarchii (nie jeden promień na wszystko).
 * Tablica ma mały promień jak blacha znaku; elementy wewnątrz tablicy są współśrodkowe
 * (promień wewnętrzny = promień zewnętrzny − obrzeże). Duży promień ma tylko przycisk pauzy,
 * bo to jedyny element, który kierowca ma trafić bez patrzenia.
 */
export const promien = {
  tablica: 10,
  tablicaMala: 8, // „następna opowieść”, miniatury w liście wysłuchanych, ikona
  przyciskPauzy: 22,
  przycisk: 12,
  komorkaGrupy: 10, // lista grupowana (iOS inset grouped)
  etykieta: 6,
  znacznik: 3,
} as const;

/** Grubość obrzeży [pt]. Przy „Zwiększ kontrast” każde rośnie (drugie pole). */
export const obrzeze = {
  tablica: [6, 8],
  tablicaMala: [3, 4],
  przycisk: [2, 3],
  etykieta: [2, 3],
} as const satisfies Record<string, readonly [number, number]>;

/** Wysokość paska postępu wzdłuż dolnej krawędzi tablicy [pt]. */
export const WYSOKOSC_POSTEPU = 10;

/** Cele dotykowe [pt]. 44 = decyzja studia (minimum HIG 28). */
export const cel = {
  minimum: 44,
  przycisk: 56,
  pauzaWRuchu: 132,
} as const;

// ───────────────────────────── Ruch ─────────────────────────────

/**
 * Czasy [ms]. W RUCHU (spec. P4: bez animacji) każda zmiana na ekranie jest natychmiastowa:
 * nowa tablica podmienia się bez przejścia, pasek postępu skacze co `krokPostepuWRuchu`.
 * „Ogranicz ruch” (AccessibilityInfo.isReduceMotionEnabled; preferencja przenikania:
 * prefersCrossFadeTransitions): przesunięcia zamieniają się na przenikanie `przenikanie`, intro nie gra wcale.
 */
export const ruch = {
  tablicaWjazd: 250, // na postoju: nowa tablica wsuwa się od dołu
  przenikanie: 150, // zamiennik przesunięć przy „Ogranicz ruch”
  zmianaStanu: 120, // przycisk Pauza ↔ Graj, zaznaczenie w liście
  intro: 1000, // maksimum; tylko pierwsze uruchomienie, do pominięcia dotknięciem
  wRuchu: 0,
  krokPostepuWRuchu: 0.1, // ułamek długości opowieści; między krokami pasek stoi
} as const;

/** Krzywe (cubic-bezier) dla Animated / Reanimated. */
export const krzywa = {
  wjazd: [0.2, 0.8, 0.2, 1] as const, // szybki start, miękkie hamowanie (jak mijany znak)
  standard: [0.4, 0, 0.2, 1] as const,
} as const;

// ───────────────────────────── Haptyka ─────────────────────────────

/**
 * Znaczenie → rodzaj (nazwy jak w expo-haptics: impactAsync(Light|Medium|…),
 * notificationAsync(Success|Warning|Error), selectionAsync()).
 * Zasada: haptyka tylko w odpowiedzi na dotyk. Zdarzenia bez dotyku (start opowieści,
 * „Poza trasą”) ogłasza dźwięk i głos (spec. P11), bez haptyki: telefon leży w uchwycie,
 * więc wibracji nie poczuć, a stuka o uchwyt. To nazwany wyjątek od zasady studia
 * „dźwięk zawsze w parze z haptyką”. Haptykę wyłącza systemowe ustawienie.
 */
export const haptyka = {
  pauzaGraj: { rodzaj: 'impact', styl: 'Medium' },
  nastepna: { rodzaj: 'impact', styl: 'Light' },
  startPodrozy: { rodzaj: 'notification', styl: 'Success' },
  zakonczPodroz: { rodzaj: 'impact', styl: 'Medium' },
  wybor: { rodzaj: 'selection', styl: null }, // trasa, motyw, długość spaceru
  bladPoAkcji: { rodzaj: 'notification', styl: 'Error' }, // np. brak uprawnienia po dotknięciu Start
} as const;
