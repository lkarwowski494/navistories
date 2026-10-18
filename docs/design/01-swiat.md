# 01 — Świat dziedziny NaviStories

Data odczytu wszystkich źródeł: 2026-10-18. Kopie robocze źródeł (PDF/HTML rozporządzeń) trzymane poza repo; adresy niżej.

## 1. Inwentarz

### Przedmioty i narzędzia
- Uchwyt telefonu na szybie / kratce; telefon w poziomie zasięgu wzroku kierowcy.
- Radio samochodowe: skala strojenia, wskazówka, pokrętła; przyciski na kierownicy (spec. P4: sterowanie przez AVRCP).
- Drogowskazy, tablice kierunkowe (E-13), numery dróg (E-15a…), tablice miejscowości.
- Mapa samochodowa / atlas; przewodnik turystyczny.
- Tarcza zabytku na budynkach wpisanych do rejestru.

### Materiały
- Folia odblaskowa znaków (typ 1, typ 2, pryzmatyczna) — Dz.U. 2019 poz. 2311, pkt 1.3.
- Blacha znaku; asfalt; punktowe elementy odblaskowe na jezdni.
- Papier map i kart ewidencyjnych zabytków.

### Znaki i oznaczenia (z przeczytanym źródłem)
| Fakt | Źródło (szczebel 1) | Cytat / miejsce |
|---|---|---|
| E-15a numer drogi krajowej: tło czerwone, biała ramka, napis biały | Dz.U. 2021 poz. 438, pkt 6.3.7.2 (zmiana załącznika do rozporządzenia o warunkach technicznych), https://api.sejm.gov.pl/eli/acts/DU/2021/438/text.html | „Znak E-15a »numer drogi krajowej« o tle barwy czerwonej z białą ramką tarczy znaku i napisie barwy białej” |
| E-15d to „numer drogi ekspresowej” | Dz.U. 2019 poz. 2310, § 65 ust. 1 pkt 4, https://api.sejm.gov.pl/eli/acts/DU/2019/2310/text.html | „4) E-15d »numer drogi ekspresowej«” — barwa E-15d `[DO USTALENIA]` (opis tylko na rysunku) |
| Drogowskazy do obiektów turystycznych E-7…E-12: napisy, symbole i obrzeże brązowe | Dz.U. 2019 poz. 2311, pkt 6.3.4.1, s. 272–273, https://api.sejm.gov.pl/eli/acts/DU/2019/2311/text.pdf | „Napisy, symbole i obrzeże tych znaków są barwy brązowej.” Obiekty: „muzeum, zabytek kultury, zabytek przyrody, punkt obserwacyjny…” |
| E-22b może nieść sylwetkę obiektu | tamże, pkt 6.3.13.2, s. 295 | „Na znaku umieszcza się sylwetkę wskazywanego obiektu turystycznego – zamku, pałacu itp.” |
| Barwy lic znaków: współrzędne chromatyczności (x, y) dla białej, żółtej, czerwonej, zielonej, niebieskiej, pomarańczowej, brązowej, szarej | tamże, tab. 1.3, s. 11 | np. brązowa: x 0,455/0,523/0,479/0,558; y 0,397/0,429/0,373/0,394; β min. 0,03 |
| Liternictwo znaków: siatka w jednostkach „gr”: wersaliki d = 6 gr, minuskuły m = 4 gr, wiersz 8 gr, interlinia 2 gr; napisy małymi literami z wielką na początku | tamże, pkt 1.4.1, s. 14–15 | „Napisy sporządza się małymi literami. Do rozpoczynania napisów i nazw miejscowości stosuje się duże litery” |
| Prawa krawędź jezdni: czerwone punktowe elementy odblaskowe | Dz.U. 2019 poz. 2310, § 85 ust. 4 (znaki poziome) | „punktowe elementy odblaskowe barwy czerwonej wyznaczają prawą krawędź jezdni” |
| Znak zabytku: pięciokątna tarcza ostrzem w dół, 185 × 100 mm, białe tło, napis „ZABYTEK CHRONIONY PRAWEM”, poniżej tarcza z błękitnego kwadratu i błękitnego trójkąta | Rozporządzenie Ministra Kultury z 9.02.2004, Dz.U. 2004 nr 30 poz. 259, § 2 ust. 1 (status: obowiązujący wg api.sejm.gov.pl), https://api.sejm.gov.pl/eli/acts/DU/2004/259/text.pdf | „Znak ma kształt pięciokątnej tarczy skierowanej ostrzem w dół, o wymiarach 185 x 100 mm” |

**Rachunek (nie twierdzenie merytoryczne):** środek wielokąta tolerancji z tab. 1.3 przeliczony na sRGB przy założonym współczynniku luminancji Y (rozporządzenie podaje tylko minimum β): brązowa x 0,504, y 0,398 → `#6B3815` (Y 0,06); czerwona → `#B20013` (Y 0,08); niebieska → `#003C7B` (Y 0,04); zielona → `#006645` (Y 0,08); żółta → `#D7A100` (Y 0,40). To **uproszczenie**: barwa folii w świetle dziennym i ekran sRGB to nie to samo; kierunkowo zgodne z przepisem.

**Nie ustalone `[DO USTALENIA]`:**
- nazwa i licencja kroju liter znaków drogowych (rozporządzenie podaje wzory w pkt 1.4.3, bez nazwy kroju; nazwa „Drogowskaz” znana mi tylko z pamięci — nie używam);
- barwa „błękitu” w znaku zabytku (rozporządzenie bez wartości barwy);
- konwencje barw historycznych map topograficznych (WIG, mapy Kwatermistrzostwa) — nie otwierałem źródła;
- słupki kilometrowe/pikietaż na drogach krajowych — nie otwierałem źródła.

### Dokumenty i formularze
- Karta ewidencyjna zabytku, wpis do rejestru (numer rejestru, np. w formacie „A/…”; format `[DO USTALENIA]` — nie otwierałem rejestru dla konkretnego obiektu w tym przebiegu).
- Mapa trasy (OSM, ODbL — README repo).
- Przewodnik z kilometrażem; pakiet trasy NaviStories (format z walidatorem w `packages/pakiet`).

### Dźwięki
- Tykanie kierunkowskazu; szum i strojenie radia; dżingiel stacji; komunikat nawigacji, który pauzuje opowieść (spec. P7); cisza 30–90 s między opowieściami (spec. P11 — „zakaz dopychania przerw mową”, więc sygnały dźwiękowe aplikacji muszą być krótkie i rzadkie).

### Kolory nadane przez autorytet
- Znaki drogowe: czerwień (E-15a), brąz (drogowskazy turystyczne), biel tła, niebieski, zieleń, żółć — tab. 1.3 Dz.U. 2019 poz. 2311 (wyżej).
- Znak zabytku: biel + błękit (Dz.U. 2004 nr 30 poz. 259; wartość błękitu `[DO USTALENIA]`).

## 2. Skan konkurencji (13 stron App Store otwartych 2026-10-18)

Strony pobrane `curl` i obejrzane jako arkusz ikon i zrzutów (`konkurencja/ikony.png`, `konkurencja/arkusz.png`, `konkurencja/zrzuty.png`).

> Uwaga do zapisu w repo (2026-10-18): zrzuty i ikony konkurencji (`konkurencja/*`) to cudzy materiał; trzymane są poza publicznym repo (kopie robocze Studia). Tu zostaje tylko lista z adresami App Store i wnioski.


| Aplikacja | Adres | Ikona | Ekran / zrzuty |
|---|---|---|---|
| Autio | https://apps.apple.com/us/app/id1300494609 | biała pinezka w ramce, granat | zdjęcie telefonu w uchwycie; odtwarzacz jak podcast: zdjęcie, suwak, ±15 s |
| GuideAlong | https://apps.apple.com/au/app/id1460032075 | czerwony dymek-pinezka | „Just Press Go & Tour!”, mapa z niebieską linią trasy |
| Action Tour Guide | https://apps.apple.com/gb/app/id1460565736 | pinezka + słuchawki, cyjan | mapa, gwiazdki ocen, uśmiechnięta osoba |
| Storyteller | https://apps.apple.com/us/app/id983084425 | litera S z krajobrazem, granat + pomarańcz | mapa z pinezkami „START”, liczniki „60+ Stories / 3–4 Hrs / 66 Miles” |
| USA National Parks Audio Guide | https://apps.apple.com/us/app/id6478661005 | ilustracja gór i lasu | szkic tuszem, siatka kart z fotografiami |
| Greg's Driving Tours | https://apps.apple.com/us/app/id6758044224 | zielona pinezka z G | zieleń, kolaż telefonów, zdjęcia parków |
| Road To Hana Audio Tour | https://apps.apple.com/us/app/id6444367157 | niebieska pinezka na fali | mapa, hibiskus, niebieski |
| UCPlaces | https://apps.apple.com/us/app/id1424277513 | szaro-niebieska pinezka | telefony na zdjęciach miast |
| izi.TRAVEL | https://apps.apple.com/us/app/id554726752 | wordmark „izi” | mapa, pinezki, kolaż zdjęć |
| VoiceMap | https://apps.apple.com/us/app/id852027939 | pinezka-spirala, niebieski gradient | zdjęcie zabytku, odtwarzacz na mapie |
| Narriva | https://apps.apple.com/us/app/id6748240174 | piktogram pieszego i auta z pinezką, niebieski | dwa duże kafle „Drive Mode” (kierownica, zieleń) i „Walk Mode” (niebieski) |
| WikiTrip | https://apps.apple.com/gb/app/id1438931523 | tarcza drogi międzystanowej z „W”, zieleń | mapa, zieleń |
| Guidude | https://apps.apple.com/us/app/id6778813799 | złoty kompas na granacie | lista kart z miastami |

Nie otwarto (brak strony w App Store w wynikach albo 404): RoadWhisper, AI TourMate, Roadguide, Waytale (`https://apps.apple.com/app/id6751321190` → 404).

### Klisze kategorii
1. **Pinezka lokalizacji** w ikonie: 8 z 13 (Autio, GuideAlong, Action, Greg's, Road To Hana, UCPlaces, VoiceMap, Narriva).
2. **Niebieski / cyjan** jako barwa główna: 6 z 13. Obecny akcent aplikacji `#0B5FFF` wpada w tę kliszę (i blisko Treningu).
3. **Mapa z niebieską linią trasy i pinezkami** na zrzutach: większość.
4. **Zdjęcia krajobrazu / zabytku** jako tło odtwarzacza; telefon w uchwycie na tle deski rozdzielczej.
5. **Odtwarzacz w stylu podcastu** (suwak, ±15 s, małe przyciski) — sprzeczny z naszym P4.
6. **Kompas, kierownica, słuchawki** jako symbole.
7. **Tarcza drogowa** — tylko WikiTrip (amerykańska Interstate). Polskie znaki drogowe nie występują u nikogo.
8. Liczniki „60+ Stories · 3–4 Hrs · 66 Miles” (ciągi „A · B · C” z kalibracji).

Sprawdzenie akcentów: brąz drogowskazu turystycznego — nie występuje u żadnej z 13. Czerwień E-15a — GuideAlong ma czerwoną ikonę (ryzyko średnie). Błękit tarczy zabytku — bliski kliszy niebieskiej (ryzyko wysokie, wymaga kształtu, nie koloru, jako nośnika).

## 3. Kandydaci na metaforę (10)

| # | Metafora (jedno zdanie) | Prawdziwe dane | Moment firmowy | Ryzyko |
|---|---|---|---|---|
| 1 | **Drogowskaz turystyczny**: każda opowieść to brązowy drogowskaz do obiektu z jego sylwetką (E-22b, E-7…E-12) | odległość do obiektu, strona drogi (z geometrii), nazwa obiektu, numer drogi | nowa opowieść = nowa tablica „wjeżdża” jak znak mijany za szybą | koszt sylwetek dla każdego obiektu; podróbka znaku urzędowego (nie kopiujemy znaku 1:1) |
| 2 | **Tarcza i rejestr**: opowieść jako karta z rejestru, ze stemplem rodzaju treści i liczbą źródeł | numer rejestru NID, liczba i szczebel źródeł, segment Fakty/Legenda/Bajka | „pieczęć” po wysłuchaniu: opowieść trafia do „Twojego rejestru” | wprowadzanie w błąd, jeśli tarcza sugeruje urzędowy znak; błękit = klisza |
| 3 | **Skala radia**: trasa jako pasmo strojenia, opowieści jako stacje, wskazówka = auto | km przebyte/do celu, położenie opowieści na trasie, stan grania | wskazówka „łapie stację” — opowieść startuje | kicz retro; pokrewne „linii ze stacjami” Organizera |
| 4 | **Pikietaż**: słupek kilometrowy jako licznik trasy i opowieści | km trasy, km do następnej opowieści | słupek mija się co km | źródło konwencji `[DO USTALENIA]`; mało wyrazu |
| 5 | **Nakładka starej mapy**: obecna pozycja na fragmencie historycznej mapy | pozycja, data mapy | przejście współczesna → dawna mapa | licencje map; mapa w ruchu sprzeczna z P4 |
| 6 | **Linia ze stacjami** | kolejne punkty | — | **odrzucone**: kopia metafory Organizera |
| 7 | **Kaseta: strona A/B** | postęp opowieści jako szpule | przewinięcie | kicz, brak związku z miejscem |
| 8 | **Paszport podróżnika / pieczątki** | wysłuchane opowieści | pieczątka | grywalizacja; zachęta do patrzenia w ekran |
| 9 | **Nocna jezdnia, odblaski** | postęp jako mijane pasy | — | „prawie czarne + kwasowy akcent” z kalibracji |
| 10 | **Lusterko wsteczne**: co już za nami | ostatnio minięte miejsce | — | dosłowne, mało danych |

## 4. Do rozwinięcia w E2 (3 + 1 zapasowy)

1. **Drogowskaz (#1)** — jedyny kandydat z kolorem i literą z przepisu (szczebel 1), nieobecny u konkurencji, a sylwetka obiektu niesie treść opowieści.
2. **Rejestr (#2)** — niesie wyróżnik z spec. 9 „Ugruntowane fakty”: dane o źródłach są w produkcie; kształt zamiast koloru, żeby uciec od niebieskiej kliszy.
3. **Pasmo (#3)** — świat dźwięku: aplikacja zastępuje radio (spec. 9: dla dojeżdżających konkurentem jest radio i podcasty); wskazówka niesie realne km trasy. Ryzyko pokrewieństwa z Organizerem nazwane: skala strojenia to linijka z podziałką, nie sieć linii; sprawdzam w teście generyczności.
4. Zapas: Pikietaż (#4), po ustaleniu źródła.
