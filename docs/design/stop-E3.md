# STOP E3: System „Drogowskaz” (Studio Projektowe, tryb build)

Data: 2026-10-18. Wejście: decyzje właściciela z 18.10.2026 (kierunek A „Drogowskaz”, krój Jost z ss01, treść krojem systemowym, etykieta rodzaju treści z kodem kształtu), spec. P4, wymóg stałego oznaczenia AI. Interfejs na gałęzi `iteracja-0/aplikacja` przeczytałem w całości:
- ekrany: `EkranStartowy`, `EkranUjawnienia`, `EkranSamochodu`, `EkranSpaceru`, `EkranSesji`, `EkranZrodel`, `EkranOAplikacji`;
- pozostałe pliki: `ui.tsx`, `teksty.ts`, `konfiguracja.ts`, `app.json`, `_layout.tsx`, `packages/pakiet/src/schema.ts`.

**Obejrzyj najpierw (ok. 10 min):**
1. [`arkusze/sesja.png`](arkusze/sesja.png): 7 stanów sesji we wszystkich wariantach;
2. [`arkusze/zrodla.png`](arkusze/zrodla.png): koniec podróży, Źródła, O aplikacji;
3. [`arkusze/ikona.png`](arkusze/ikona.png): ikona, ekran startowy, intro;
4. [`arkusze/przed-po.png`](arkusze/przed-po.png): dwie poprawki przed i po.

## 1. Co powstało

| Plik | Co to jest |
|---|---|
| [`tokeny.ts`](tokeny.ts) | Propozycja modułu motywu (bez importów z aplikacji): kolory w 4 wariantach, typografia z Dynamic Type, odstępy, promienie, obrzeża, cele, ruch, haptyka, funkcja `paleta()`, lista par kontrastu. Zastępuje `kolory`/`styl` z `ui.tsx`. |
| [`design-spec.md`](design-spec.md) | Zasady, element firmowy z danymi i tekstem VoiceOver, komponenty, słownik interakcji, macierz stanów, głos, ikona, ekran startowy i intro. |
| [`ekrany/*.html`](ekrany/) | 5 makiet, 17 stanów `[data-ekran]` (sesja ×7, start ×2, wybór ×2, źródła ×3, ikona ×3). Style: `system.css` + `tokeny.css` generowany z `tokeny.ts`. |
| [`wzorce-zrzuty/`](wzorce-zrzuty/) | 48 zrzutów wzorcowych (5,4 MB): 390 jasny, 390 ciemny i 320 jasny AX5 dla 14 stanów ekranów; ikona, ekran startowy i intro w wersji jasnej i ciemnej. |
| [`arkusze/`](arkusze/) | Arkusz zbiorczy na plik: 320/390/430 × jasny/ciemny × domyślny/AX5, do tego „Zwiększ kontrast” (390, oba motywy) i skala szarości. Plus `przed-po.png`. |
| [`narzedzia/`](narzedzia/) | `pary-e3.mjs` (pary kontrastu z tokenów), `css-z-tokenow.mjs`, `zrzuty-e3.mjs` (wariant `zrzuty.mjs` z arkuszami), wyniki `kontrast-e3-wynik.txt` i `tsc-e3-wynik.txt`. |

Makiety obejmują wszystkie ekrany z gałęzi:
- wybór trybu;
- samochód (trasa + motywy);
- spacer (motyw, długość, lista);
- ujawnienie AI przy pierwszym uruchomieniu;
- sesję: przed startem, w ruchu, czekam, poza trasą, na postoju, opcja B, brak uprawnienia;
- koniec podróży;
- Źródła;
- O aplikacji.

## 2. Dowody

**Kontrast** (`node narzedzia/pary-e3.mjs tokeny.ts narzedzia/pary-e3.json && node narzedzia/kontrast.mjs narzedzia/pary-e3.json`): wynik 64 z 64 OK, kod wyjścia 0. Mierzyłem 16 sąsiadujących par w każdym z 4 wariantów. Pary pochodzą z `tokeny.ts → pary`, więc nie da się ich rozjechać z kolorami.

| Wariant | Najniższy tekst (próg 4,5) | Najniższy element UI (próg 3) |
|---|---|---|
| jasny | 5,25:1 (`tekst2` na `tlo`) | 6,15:1 |
| jasny, zwiększony kontrast | 7,72:1 | 8,93:1 |
| ciemny | 6,13:1 (`ostrz` na `lico`) | 5,08:1 (pasek postępu) |
| ciemny, zwiększony kontrast | 8,93:1 | 5,82:1 |

**Typy:** `npx -y -p typescript@5 tsc --noEmit --strict docs/design/tokeny.ts` → TypeScript 5.9.3, kod wyjścia 0 (`narzedzia/tsc-e3-wynik.txt`). Uwaga: `npx -y typescript@5 tsc` z polecenia kończy się błędem „could not determine executable to run”, bo paczka nazywa się inaczej niż program; poprawna forma to `-p typescript@5 tsc`.

**Źródła przeczytane w tym etapie (18.10.2026):**
- HIG, Typography: tabele iOS Dynamic Type „Large (default)” i „AX5” (Body 17→53 pt, Large Title 34→60 pt). Odczyt z `developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json`, czyli z danych strony HIG.
- `RCTAccessibilityManager.mm` (react-native v0.86.3, wiersze 259–272): mnożniki kategorii, AX5 = 3.571.
- `RCTFont.mm` (wiersz 289): `fontVariant 'stylistic-one'`.
- `AccessibilityInfo.d.ts` (wiersze 52, 71, 79, 86, 94): `isBoldTextEnabled`, `isReduceMotionEnabled`, `isHighTextContrastEnabled` (Android), `isDarkerSystemColorsEnabled` (iOS), `prefersCrossFadeTransitions`.
- Jost.ttf (fontTools): oś wght 100–900, nazwane instancje 500/600/700, cechy `ss01` i `tnum`.

## 3. Krytyka i poprawki (3 rundy zrzutów)

Najpierw usterki. P1 to usterka do naprawy przed końcem etapu, P2 poważna, P3 drobna.

| Ekran | Usterka (runda) | Waga | Poprawka |
|---|---|---|---|
| sesja | Piktogram „droga” był wypełnionym trójkątem, czytanym jak znak ostrzegawczy; stany „czekam” i „poza trasą” wyglądały podobnie (1) | P1 | Jezdnia narysowana samym konturem; ostrzeżenie to osobny trójkąt w kolorze `ostrz` |
| sesja | „Poza trasą”: różowa jezdnia (czerwień 35 %), czyli barwa spoza tokenów, a trójkąt nachodził na jezdnię (1) | P1 | Jezdnia w brązie, trójkąt obok; w skali szarości odróżnia go kształt |
| sesja | „Przed startem”: pusta tablica z jezdnią, czyli tablica bez danych (zasada 1) (1) | P1 | Zamiast niej lista: liczba historii na trasie i motywy |
| sesja | Brak uprawnienia, 320 AX5: tekst banera ucięty z prawej (1) | P1 | Zawijanie, `min-width: 0`; **przed/po: `arkusze/przed-po.png`** |
| sesja, start, wybór | AX5: duży tytuł łamał się w środku słowa („Warszaw/a”, „NaviStori/es”, „Samochó/d”) (1, 2) | P1 | Pomiar Josta: „zakończona” ma 5,3 em, więc przy 280 pt mieści się do 52,8 pt; mnożnik dużego tytułu 1,5 (wyjątek nazwany w `tokeny.ts`) |
| start, wybór, źródła | AX5: tytuły wierszy krojem Jost (×1,8) mniejsze od opisów pod nimi (×3,1), czyli odwrócona hierarchia (1) | P1 | Reguła `mnoznikTytulu = max(1,8; 53 / rozmiar)`; makiety liczą rozmiar jak RN: mnożnik systemu ucięty `maxMnoznik` stylu |
| źródła | Adres przyklejony do nazwy instytucji („Dziedzictwaexample.org…”) (1) | P1 | Osobne wiersze; **przed/po: `arkusze/przed-po.png`** |
| źródła, sesja B | Miniatury sylwetek 34×22 nieczytelne (1) | P1 | 50×30 w ramce 60×44 |
| ikona | Krawędź postępu w rogu przy 29 pt wyglądała jak wyszczerbiony róg (1) | P1 | Usunięta z ikony (zostaje na tablicy w aplikacji) |
| ikona | Sylwetka zajmowała ok. 50 % lica, a obrzeże 8/100 dawało w wersji ciemnej podwójną ramę (1) | P2 | Sylwetka ok. 60 %, obrzeże 7/100 |
| wszystkie | AX5: przycisk „‹ Wstecz” rósł jak treść i ucinał się (1) | P2 | Limit ×1,353 (xxxLarge); większe rozmiary obsługuje systemowy Large Content Viewer `[DO SPRAWDZENIA na urządzeniu]` |
| start | AX5: etykieta „Legenda” wystawała poza komórkę (2) | P2 | Mnożnik etykiety 2,0 |
| źródła | AX5: „Wysłuchane:” wychodziło poza ekran (2) | P2 | `overflow-wrap` w treści |
| wybór | Ciemny: tor wyłączonego przełącznika prawie niewidoczny na licu | P2, **zostaje** | W aplikacji systemowy `Switch` (kolor ustawiamy tylko dla stanu „włączony”); stan niesie położenie gałki |
| wszystkie | 320 pt + AX5: długie słowa treści („lokalizacji”) łamią się w środku | P3, **zostaje** | 53 pt na 280 pt; tak samo zachowuje się iOS. Nie da się tego naprawić bez zmniejszenia treści poniżej HIG |
| wybór trybu | Poza krojem tytułu ekran nie ma nic rozpoznawalnego | P3, **świadomie** | Zasada 1: tablica tylko przy historii |

**Lista kontrolna (stan końcowy):**
1. W pierwszej sekundzie w ruchu widać sylwetkę i dużą pauzę: co gra i jak to zatrzymać.
2. Tablica niesie dane, przy 320 pt jest czytelna, a w ruchu wypełnia ekran.
3. Kalibracja domyślnych wyborów jest sprawdzona niżej.
4. Hierarchia: na postoju tablica > Pauza/Następna > następna historia > Zakończ podróż > oznaczenie AI.
5. Ciemny motyw jest zaprojektowany: tablica jaśniejsza od asfaltu, ale nie świeci bielą; przycisk główny w jasnym brązie.
6. Po poprawkach przy AX5 nic nie znika i nic się nie nakłada (wyjątek P3 wyżej).
7. Bez nazwy i ikony aplikację rozpoznaje się po brązowej tablicy z sylwetką, czyli po polskim drogowskazie turystycznym. Nie tylko po kolorze, bo w skali szarości kształt zostaje.

**Kalibracja domyślnych wyborów:** zero pozycji bez decyzji.
- Krem z terakotą: nie; szarość jezdni i brąz z przeliczenia przepisu, dalej od pary Organizera (`#F7F2EA` + `#B4471F`).
- Przyciemniona czerń: ciemny wariant „Zwiększ kontrast” ma `#141517`. Powód to zwiększony kontrast, zapisany przy tokenie.
- Strzałka: tylko na tablicy, gdzie niesie stronę drogi.
- Wersaliki, „A · B”, mono, emoji, numeracja: brak.
- Ruch: jeden (wjazd tablicy na postoju).
- Inter: tylko jako zastępczy krój treści w makiecie.

## 4. Decyzje dla właściciela (sprawy produktowe)

**D1. Puste ok. 170 pt na ekranie postoju/pasażera.**
- **(A) Zostawić pustkę.** Kontrolki zostają na dole, w zasięgu kciuka. Najtaniej i najspokojniej, ale ekran wygląda na niedokończony.
- **(B) Lista „Wysłuchane w tej podróży” z dostępem do Źródeł** (stan `na-postoju-opcja-b`). Zmienia specyfikację: dziś w samochodzie Źródła są dopiero po podróży. Pasażer dostaje wartość, ale ekran ma więcej do czytania.
- **(C) Tablica rośnie i wypełnia miejsce** (stan `na-postoju`). Bez nowego zakresu i bez nowych danych; widok postoju jest tym samym, co widok w ruchu, plus szczegóły. Kosztem jest mniej informacji niż w B.
- **(D) „Co dalej”: 2–3 następne historie z km.** Dużo danych, ale kolejność może się zmienić po zjeździe z trasy, a lista zdradza, co będzie dalej.
- **Rekomendacja: C teraz.** B zostaje jako kandydat do decyzji o Źródłach w trakcie jazdy (rola 03).

**D2. Intro ok. 1 s.**
- (a) tylko przy pierwszym uruchomieniu, przed ujawnieniem AI;
- (b) przy każdym zimnym starcie;
- (c) bez intro.

Kompromis: (b) powtarzane opóźnia każde wejście, (c) jest najtańsze. **Rekomendacja: (a).**

**D3. Pasek postępu w ruchu** (P4: bez animacji).
- (a) skacze co 10 % bez przejścia;
- (b) w ruchu jest ukryty.

Kompromis: (a) daje informację „ile jeszcze” jednym spojrzeniem; (b) jest najściślejsze wobec P4. **Rekomendacja: (a).**

**D4. „Zakończ podróż”.**
- (a) okno potwierdzenia [Wróć] [Zakończ podróż];
- (b) bez potwierdzenia.

Koniec sesji jest nieodwracalny, a link leży obok „Następna”. **Rekomendacja: (a).**

**D5. Motyw ciemny.**
- (a) `userInterfaceStyle: automatic`;
- (b) zostaje tylko jasny.

Jazda nocą przy jasnym ekranie oślepia, a koszt wariantu ciemnego jest już w tokenach. **Rekomendacja: (a).**

**D6. Objaśnienie oznaczeń Fakty/Legenda/Bajka na ekranie „Zanim zaczniesz”.**
- (a) dodać (makieta);
- (b) nie dodawać.

Kod kształtu trzeba raz poznać, a (a) wydłuża pierwszy ekran o trzy wiersze. **Rekomendacja: (a).** Brzmienie przejdzie przez rolę 06.

## 5. Otwarte pytania

- `[DO USTALENIA, prawne]` Czy wolno naśladować polskie znaki drogowe? Tablicę wywodzimy (barwa, obrzeże, sylwetka), nie kopiujemy znaku 1:1. Tak samo trójkąt „poza trasą”, który nie jest kopią A-30.
- **Brakujące dane tablicy w schemacie pakietu:**
  - typ obiektu (sylwetka);
  - położenie obiektu względem trasy (strona drogi, odległość);
  - segmenty rodzaju treści z czasami (P16).

  To zadanie dla roli 05 i warsztatu. Do tego czasu tablica pokazuje mniej, a niczego nie zgaduje.
- `[DO USTALENIA]` Typologia sylwetek: pkt 6.3.4 Dz.U. 2019 poz. 2311, rysunki jeszcze nieobejrzane. Sylwetki w makietach to [PRZYKŁAD].
- `[DO USTALENIA]` Jak wykrywać ruch i postój (próg prędkości trafi do `konfiguracja.ts`).
- `[DO SPRAWDZENIA na urządzeniu]`:
  - `fontVariant 'stylistic-one'` z ss01 Josta;
  - rejestracja Josta (500/600) w `expo-font`;
  - czy `isDarkerSystemColorsEnabled` to „Zwiększ kontrast”;
  - skalowanie przycisków paska nawigacji przy AX.
- `[DO USTALENIA]` Czy istnieje komunikat głosowy „Poza trasą” (rola treści/audio)?
- `[DO USTALENIA]` Najszerszy aktualny iPhone (430 pt przyjęte z promptu, specyfikacja Apple nieczytana w tym etapie).
- Wcześniejsze otwarte punkty bez zmian: licencje cyfrowych wersji kroju „Drogowskaz”; NHTSA i zasady CarPlay jako `[DO USTALENIA]`.
- Wpisy do rejestru decyzji (Dysk Google) dopisuje koordynator lub właściciel. Dotyczą D1–D6 oraz decyzji Studia z odrzuconymi opcjami:
  - mnożniki Dynamic Type;
  - haptyka tylko po dotyku;
  - „historia” zamiast „opowieść”.

## 6. Czas

| | Agent | Oczekiwanie | Właściciel |
|---|---|---|---|
| E3 (ten etap) | ok. 3,5 h | rendery 3 × ok. 1 min, npm ok. 1 min, odczyt źródeł | ok. 20 min: 3 arkusze + 6 decyzji |
| E4 (przekazanie) | ok. 30 min | — | ok. 5 min |

## 7. Proponowany wpis do pamięci portfolio (repo `prompts`, dopisuje właściciel)

| Aplikacja | Metafora / element firmowy | Paleta (rdzeń) | Kroje | Uwagi właściciela |
|---|---|---|---|---|
| NaviStories („Drogowskaz”) | Polski brązowy drogowskaz turystyczny (E-7…E-12, E-22b). **Tablica** = bieżąca historia: sylwetka typu obiektu, nazwa, strzałka strony drogi z km, etykieta rodzaju treści (pełny / kreskowany / kontur = Fakty / Legenda / Bajka), krawędź postępu wzdłuż dolnego obrzeża. W ruchu tablica jest jednym wielkim przyciskiem pauzy. Ikona: tablica z sylwetką. | lico `#FFFFFF`, brąz `#6B3815` (przeliczony z tab. 1.3 Dz.U. 2019 poz. 2311, Y 0,06 — przybliżenie), jezdnia `#ECEDEE`, asfalt nocą `#1C1E21`, brąz nocny `#D9A877`, ostrzeżenie `#B20013` (tylko ostrzeżenia) | Jost 500/600 z ss01 (tytuły; proporcja m/d 0,667 jak w pkt 1.4.1 przepisu), treść SF Pro | 18.10.2026: „podoba mi się drogowskaz”; Jost z ss01; etykieta z kodem kształtu. Uwaga dla kolejnych aplikacji: brąz + biel + sylwetka obiektu należą do NaviStories. |
