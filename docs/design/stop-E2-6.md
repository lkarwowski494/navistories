# STOP E2 pkt 6 — krój tytułów i kod rodzaju treści (kierunek A „Drogowskaz”)

Data: 2026-10-18. Wybór kierunku przez właściciela (18.10.2026, dosłownie): „podoba mi się drogowskaz”.

**Obejrzyj:** `kroje-porownanie.png` (5 krojów × w ruchu / na postoju, jasny / ciemny, 390 pt + AX5) i `kod-tresci-opcje.png` (etykieta „Fakty” bez kodu i z kodem). Makieta: `kroje/drogowskaz-kroje.html`.

## 1. Miara z dziedziny

Litery na polskich znakach drogowych opisuje Dz.U. 2019 poz. 2311, pkt 1.4.1–1.4.2 i tab. 1.10 (https://api.sejm.gov.pl/eli/acts/DU/2019/2311/text.pdf, odczyt 18.10.2026):
- „wysokość liter dużych i cyfr d = 6 gr”, „zasadnicza wysokość liter małych m = 4 gr”, czyli **m/d = 0,667**; grubość elementu gr = **d/6**;
- „Łącko” ma 21,99 gr między punktami odmierzania, czyli **3,665 d**;
- wzory liter (pkt 1.4.3, s. 22–27, obejrzane jako obraz): jednopiętrowe „a” i „g”, okrągłe „o”, „M” o pionowych bokach, „9” z prostym ogonem, ostre kreski akcentów.

Wszystkie kroje mierzę w wadze, w której pień „H” ma grubość d/6. Skrypt: `narzedzia/kroje-pomiar.mjs`, wynik: `narzedzia/kroje-pomiar-wynik.txt`. Na arkuszu wysokość wersalika jest wyrównana, więc widać kształt liter, a nie ich wielkość.

**Krój samych znaków.** Drogowskaz zaprojektował Marek Sigmund w 1975 r. Według Luca Devroye (https://luc.devroye.org/fonts-100779.html, odczyt 18.10.2026) jego wersaliki są wzorowane na Johnstonie („strong influence from Johnston”), a minuskuły są bliskie Spartanowi („closer to Spartan”). Alphabettes (https://www.alphabettes.org/laura-loves-polskie-pismo-drogowe/) pisze o nim: „geometric sans-serif typeface designed without optical compensations. It uses a single-story lowercase »a«”. Istnieją darmowe wersje cyfrowe: E. Wojtacki (2006) i G. Klimczewski (2001). Tekstu ich licencji nie znalazłem, dlatego są oznaczone **[DO USTALENIA] i nie zostały użyte**. Sigmund i Sigmund Pro (Borutta) to kroje komercyjne, więc odpadają przez zasadę 0 zł.

## 2. Pięć krojów

Wszystkie kroje mają licencję SIL OFL 1.1. Plik licencji przeczytałem z google/fonts (`raw.githubusercontent.com/google/fonts/main/ofl/<krój>/OFL.txt`, 18.10.2026); kopia leży w `fonty/<krój>/OFL.txt`. Polskie znaki sprawdziłem w tablicy cmap (fontTools) dla zestawu ą ę ł ń ó ś ź ż ć Ą Ę Ł Ń Ó Ś Ź Ż Ć.

| Krój | Skąd w świecie dziedziny | Waga (gr = d/6) | m/d (przepis 0,667) | „Łącko”/d (3,665) | Konstrukcja jak w rys. 1.4.3 | PL |
|---|---|---|---|---|---|---|
| Public Sans (stan z E2) | krój administracji USA (USWDS); neutralny | 600 | 0,723 (+8%) | 3,75 | „a” dwupiętrowe, „9” z łukiem | tak |
| Signika | opis Google Fonts: „developed for wayfinding, signage”, „supporting … Polish” | 470 | 0,750 (+12%) | 3,59 | „a” dwupiętrowe, „M” rozwarte | tak |
| League Spartan | wersja Spartana, który jest wzorem minuskuł Drogowskazu | 540 | 0,628 (−6%) | 3,52 | **„a” jednopiętrowe, „M” pionowe, proste „9”** | tak |
| **Jost** (z ss01) | geometryczny, „inspired by 1920s German sans-serifs” (rodzina Futury i Spartana) | 490 | **0,667 (0%)** | 3,57 | „a” jednopiętrowe (ss01), proste „9”; „M” rozwarte | tak |
| Overpass | kontrola: amerykańskie „Highway Gothic” (FHWA), czyli liternictwo drogowe z innego kraju | 610 | 0,733 (+10%) | 3,80 | „a” dwupiętrowe | tak |

Odrzucony bez renderu: **B612** (krój do kokpitów Airbusa, ciekawy ze względu na czytelność przy jednym spojrzeniu). W cmap brakuje mu ą ę ł ń ś ź ż ć Ą Ę Ł Ń Ś Ź Ż Ć.

Uwaga wspólna dla wszystkich pięciu krojów: I i l są nierozróżnialne. Tak samo jest we wzorach z przepisu (tab. 1.10: I = l = 1,00 gr). W nazwach miejsc nie traktuję tego jako problemu.

## 3. Rekomendacja: Jost z zestawem ss01

Powód jest funkcjonalny:
- jako jedyny krój ma dokładnie proporcję minuskuły do wersalika z przepisu (m/d 0,667);
- ma tę samą konstrukcję co litery znaków: jednopiętrowe „a” i prostą „9”;
- ma pełne polskie znaki;
- ma wagi do 900, więc może reagować na systemowy „Pogrubiony tekst”.

Ryzyka:
- „M” jest rozwarte, inaczej niż we wzorach z przepisu;
- Jost to popularny krój z Google Fonts. Tożsamość niesie jednak tablica, a nie krój.

**Druga opcja: League Spartan.** Konstrukcją jest najbliżej przepisu, ale minuskuły ma o 6% niższe i wygląda ciężej.

**Nie polecam Overpass.** Ma amerykańskie proporcje (+10%), a prompt Studia ostrzega przed krojami, które pasują stylem, ale pochodzą z innego kraju.

Krój treści: na iOS SF Pro. Na zrzutach z Linuksa treść jest złożona zastępczo krojem Inter, więc jej nie oceniaj.

## 4. Kod rodzaju treści (spec. P16): dwie opcje

- **(A) Bez kodu:** etykieta zawiera tylko słowo „Fakty”, „Legenda” albo „Bajka”. Jest najprostsza, ale kierowca musi przeczytać słowo. Kwadrat z makiety E2 jest wtedy ozdobą bez danych i usuwam go.
- **(B) Z kodem z kierunku B:** przed słowem stoi znacznik: pełny oznacza Fakty, kreskowany Legendę, a sam kontur Bajkę. Rodzaj treści rozpoznaje się po kształcie, bez czytania i niezależnie od koloru. Znacznik ma kontrast 9,5:1 w jasnym motywie i 7,5:1 w ciemnym. Kosztem jest jedna rzecz do nauczenia; słowo zostaje obok znacznika.

**Rekomendacja: B.** W ruchu etykieta jest jedyną informacją tekstową na ekranie, a kształt odczytuje się szybciej niż słowo. VoiceOver czyta etykietę „Rodzaj treści: fakty”.

## 5. Krytyka i poprawki (4 rundy zrzutów)

| Usterka | Gdzie | Poprawka |
|---|---|---|
| Kroje różnej wielkości przy tym samym rozmiarze pisma; wynik był zafałszowany (League Spartan ok. 9% mniejszy) | cały arkusz | `font-size-adjust: cap-height 0.7` |
| Próbki krojów za małe, łamały się | kolumna opisu | szersza kolumna, próbka 44 px |
| AX5: „Następna” wychodziła poza przycisk | przyciski | próg kolumn mnożony przez `--dt-tytul` (para przed/po: `kroje/ax5-przed-po.png`) |
| AX5: „10 z 18”, „14 km” i „1:12 z 3:40” rozdzielane między wiersze | trasa, następna, czas | `nowrap` na liczbach z jednostką |
| 320 pt: Pauza i Następna w stosie już przy domyślnym tekście | przyciski | próg 8 rem |
| Znaczniki kodu czarne, bo style nie przechodziły przez `<use>`; panel etykiet rozciągnięty na całą wysokość | arkusz kodu | SVG wpisane w miejscu, `align-self` |

Zostaje do E3 lub roli 03: na postoju ok. 170 pt pustego miejsca. To kwestia zakresu ekranu, nie kroju; zgłoszone już w E2.

## 6. Kontrast

Skrypt: `narzedzia/kontrast.mjs` z parami w `narzedzia/pary-drogowskaz.json`, tylko pary sąsiadujące. Wynik: 18 z 18 OK, kod wyjścia 0. Najniższe wartości: 5,25:1 (tekst drugorzędny na jezdni, motyw jasny) i 6,15:1 (pasek postępu, motyw ciemny). Pełny wydruk: `narzedzia/kontrast-wynik.txt`.

## 7. Decyzje dla właściciela

1. **Krój tytułów:** Jost (rekomendacja), League Spartan albo pozostanie przy Public Sans.
2. **Kod rodzaju treści:** B (rekomendacja) albo A.

## 8. Otwarte pytania

- [DO USTALENIA] Licencje darmowych wersji Drogowskazu (Wojtacki, Klimczewski). Do czasu sprawdzenia nie używam ich.
- [DO USTALENIA, prawne] Czy własna cyfrowa wersja liter z rys. 1.4.3 jest dozwolona (litery są częścią aktu prawnego)? Czy tablica wywiedziona z E-7…E-12 i E-22b nie sugeruje urzędowego statusu? Obecnie tylko wywodzę barwę, proporcje i logikę, bez kopii znaku.
- Wpis do rejestru decyzji (Drive), do uzupełnienia słowami właściciela: „2026-10-18 — kierunek A Drogowskaz (»podoba mi się drogowskaz«); krój tytułów: …; kod rodzaju treści: …; odrzucone: …”.

## 9. Czas

| | Agent | Oczekiwanie | Właściciel |
|---|---|---|---|
| E2 pkt 6 (ten etap) | ok. 2,5 h | rendery po ok. 1 min, sieć | 10–15 min: obejrzeć 2 zrzuty, wybrać krój i opcję kodu |
| E3 (następny etap) | 2–3 h | — | ok. 15 min |

Zapis E0–E2 skopiowany do `docs/design/`. Zrzuty i ikony konkurencji zostały poza publicznym repo, bo to cudzy materiał. Usunąłem identyfikatory dokumentów z Dysku Google.
