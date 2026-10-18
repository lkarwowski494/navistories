# STOP E2 — Trzy kierunki (właściciel wybiera okiem)

> Zapis w repo (2026-10-18): z przebiegu E2 skopiowano makiety, stronę porównania i jej zrzuty. Zrzuty pojedynczych kierunków (`zrzuty/`), `porownanie-390.png` i ówczesne skrypty zostały w katalogu roboczym Studia. Aktualne narzędzia i wynik kontrastu: `narzedzia/` (od E2 pkt 6). Wybór właściciela 18.10.2026: „podoba mi się drogowskaz” — dalszy ciąg w `stop-E2-6.md`.

**Strona porównania:** `porownanie.html` (otwórz w przeglądarce; przełącznik motywu jasny/ciemny). Zrzuty strony: `porownanie-1500.png`, `porownanie-1500-ciemny.png`, `porownanie-390.png`.
Nie publikuję strony (Artifact): zasada wspólna 12 wymaga osobnej zgody na publikację, a moduł „render-i-krytyka” każe publikować — rozbieżność opisana w notatkach z przebiegu.

## Pliki
| Kierunek | Makieta | Zrzuty 320/390/430 × jasny/ciemny + 200 % tekstu |
|---|---|---|
| A. Drogowskaz | `kierunki/drogowskaz.html` | `zrzuty/drogowskaz-*.png` |
| B. Rejestr | `kierunki/rejestr.html` | `zrzuty/rejestr-*.png` |
| C. Pasmo | `kierunki/pasmo.html` | `zrzuty/pasmo-*.png` |

Karty stylu i test generyczności: `kierunki/karty-stylu.md`. Narzędzia: `narzedzia/zrzuty.mjs`, `kontrast.mjs`, `strona2.mjs`, `montaz.py`, pary kontrastu `narzedzia/pary-*.json`.

## Przebieg renderu i poprawki (co zobaczyłem na zrzutach)

**A. Drogowskaz** — 3 rundy.
1. Runda 1: na postoju duża pusta przestrzeń pod kartą „Lublin”; ciąg „Fakty · 1:12 z 3:40” (klisza „A · B”); przy 200 % tekstu nazwa ucięta, bo ekran miał stałą wysokość i `overflow: hidden`.
2. Runda 2: tablica na postoju powiększona, etykieta „Fakty” wydzielona; sylwetka kurczyła się przy 320 pt (flex), a przy 200 % czas nachodził na pasek postępu.
3. Runda 3: sylwetka `flex: none`, przyciski przechodzą w stos przy dużym tekście (`minmax(9rem, 1fr)`). Stan końcowy: czytelne we wszystkich 7 zrzutach.

**B. Rejestr** — 2 rundy. Kreski „liczba źródeł” pod tarczką w widoku kierowcy nic mu nie mówiły (ozdoba bez danych dla tego użytkownika) — usunięte; karta „Lublin” miała zły układ (kolumna) — poprawiona; przy 200 % tytuł wychodził poza kartę — `flex-wrap` + `overflow-wrap`.

**C. Pasmo** — 3 rundy. Kropki stacji nachodziły na siebie (K11/K12 co 8 km) — mniejszy promień; nazwy „Warszawa/Zamość” w SVG nie skalowały się z tekstem — przeniesione do HTML; 3 pary kontrastu poniżej progu — poprawione (niżej).

## Krytyka (lista z modułu), stan po poprawkach

| Pytanie | A. Drogowskaz | B. Rejestr | C. Pasmo |
|---|---|---|---|
| 1. Co widać w 1. sekundzie? | sylwetka pałacu nad dużą pauzą — „co gra” i „jak zatrzymać” | niebieska tarcza z pauzą — „jak zatrzymać”, rodzaj treści dopiero po nauce kodu | duża gałka pauzy; skala na dole jest drugorzędna |
| 2. Element firmowy z danymi, czytelny przy 320 pt? | tak: sylwetka, odległość, strona drogi, postęp | tak: rodzaj treści i postęp; kod trzeba poznać | tak: km i stacje; przy 320 pt cyfry skali ok. 12 px i **nie skalują się** z Dynamic Type |
| 3. Kalibracja bez decyzji? | brak (biel/brąz z przepisu; małe litery jak na znakach) | ryzyko: szeryf + biel → „poważny dokument”; zapisane w teście generyczności | nocą „czarne + jeden jaskrawy akcent” — wymaga decyzji właściciela |
| 4. Hierarchia | wyraźna; na postoju wciąż ok. 150 pt pustego miejsca przy 390 pt | dobra na karcie; pusta przestrzeń pod „Lublin” | dobra; pusta przestrzeń na postoju |
| 5. Ciemny zaprojektowany? | tak: asfalt + rozjaśniony brąz, tablica nie świeci bielą | tak: grafit + rozjaśniony błękit | tak: bursztyn podświetlenia, gałka z obrysem |
| 6. 200 % tekstu | po poprawkach bez ucięć; ekran rośnie (przewijanie) | jw. | tekst OK; cyfry w skali zostają małe |
| 7. Rozpoznawalna bez nazwy i ikony? | tak (polski drogowskaz turystyczny) | słabo: tarcza kojarzy się z aplikacją bezpieczeństwa/VPN | tak (radio), ale jako „aplikacja audio”, nie „o miejscach” |

**Wspólny problem wszystkich trzech:** widok na postoju ma za mało treści na pełny ekran. To pytanie o zakres (co pasażer ma tam widzieć: mapa? lista wysłuchanych? źródła są decyzją właściciela dopiero po podróży), nie o styl → do E3 / roli 03.

## Kontrast (skrypt `narzedzia/kontrast.mjs`, WCAG 2.2)

Pierwszy przebieg: A 16/16 OK, B 15/15 OK, **C 3 BRAK**:
```
BRAK 4.36:1 (min 4.5) jasny: ostrzeżenie na panelu #C92A2A na #E4E6E8
BRAK 1.48:1 (min 3) ciemny: wskazówka do bursztynu — rozróżnienie stacji (UI) #FF7A3D na #FFB547
BRAK 1.23:1 (min 3) ciemny: gałka do panelu (UI) #2A2C2F na #1A1B1D
```
Poprawki C: ostrzeżenie → `#B02323`; gałka dostała obrys (bursztyn nocą, tusz w dzień) zamiast polegać na kolorze wypełnienia; para „wskazówka/bursztyn” usunięta, bo bieżąca stacja jest odróżniona kształtem (pierścień), a nie samym kolorem — wskazówka i stacje nie sąsiadują ze sobą, sąsiadują z szybą (para „wskazówka do szyby” 7,55:1).

Wynik końcowy (`narzedzia/kontrast-wynik.txt`, kod wyjścia 0 dla każdego kierunku):
```
== drogowskaz
OK   9.54:1 (min 4.5) jasny: brąz na licu (tytuł, Fakty) #6B3815 na #FFFFFF
OK   9.54:1 (min 4.5) jasny: lico na brązie (glif pauzy, przycisk) #FFFFFF na #6B3815
OK   14.10:1 (min 4.5) jasny: tekst na jezdni #1D1F21 na #ECEDEE
OK   5.25:1 (min 4.5) jasny: tekst drugorzędny na jezdni (AI, podpowiedź) #5E6266 na #ECEDEE
OK   6.15:1 (min 4.5) jasny: tekst drugorzędny na licu (czas) #5E6266 na #FFFFFF
OK   8.14:1 (min 3) jasny: obrzeże tablicy do jezdni (UI) #6B3815 na #ECEDEE
OK   8.15:1 (min 3) jasny: pasek postępu brąz do jasnego brązu (UI) #6B3815 na #F3ECE6
OK   7.24:1 (min 4.5) jasny: ostrzeżenie na licu #B20013 na #FFFFFF
OK   7.54:1 (min 4.5) ciemny: brąz nocny na licu nocnym #D9A877 na #1F2124
OK   7.54:1 (min 4.5) ciemny: lico nocne na brązie nocnym (glif pauzy) #1F2124 na #D9A877
OK   12.78:1 (min 4.5) ciemny: tekst na asfalcie #F1EEEA na #26282B
OK   6.55:1 (min 4.5) ciemny: tekst drugorzędny na asfalcie #A9ADB2 na #26282B
OK   7.15:1 (min 4.5) ciemny: tekst drugorzędny na licu nocnym #A9ADB2 na #1F2124
OK   6.91:1 (min 3) ciemny: obrzeże do asfaltu (UI) #D9A877 na #26282B
OK   6.15:1 (min 3) ciemny: pasek postępu (UI) #D9A877 na #3A2E25
OK   7.07:1 (min 4.5) ciemny: ostrzeżenie na licu nocnym #FF8A80 na #1F2124
kod wyjścia: 0
== rejestr  (15/15 OK, min. 5.71:1)    == pasmo  (18/18 OK, min. 5.09:1)
```
Pełny wydruk B i C: `narzedzia/kontrast-wynik.txt`. Wariant „Zwiększ kontrast” — E3.

## Decyzja dla właściciela (produktowa: wygląd)

- **A. Drogowskaz** — kompromis: najlepsza odpowiedź na „co gra” bez tekstu, paleta z przepisu; koszt: typologia ok. 10–15 sylwetek; pytanie prawne o naśladowanie znaków.
- **B. Rejestr** — kompromis: najtańszy, niesie wyróżnik „ugruntowane fakty”; koszt: tarcza/niebieski = klisza, słaba rozpoznawalność.
- **C. Pasmo** — kompromis: najsilniejszy „moment” (wskazówka łapie stację), pokazuje całą trasę; koszt: informacja zbędna dla kierowcy w ruchu, nocna paleta blisko wyboru domyślnego.
- Połączenia dozwolone (np. **A + kod rodzaju treści z B**).

**Rekomendacja: A, z kodem rodzaju treści z B w etykiecie „Fakty / Legenda / Bajka”.** Powód: funkcja ekranu w ruchu (jedno spojrzenie, bez czytania), nie gust.
Opcjonalnie test pięciosekundowy z 5 kierowcami, ok. 1 h czasu właściciela.

## Otwarte pytania
1. Zakres widoku na postoju/pasażera (wspólna pusta przestrzeń) — rola 03 lub właściciel.
2. Czy ekran w ruchu może mieć cokolwiek poza pauzą (P4 vs stan kodu: tytuł, Następna, Zakończ) — decyzja z E0, pyt. 2.
3. `[DO USTALENIA]`: zgodność naśladowania polskich znaków drogowych / znaku zabytku z prawem; typologia symboli obiektów z pkt 6.3.4 Dz.U. 2019 poz. 2311 jako źródło sylwetek (nie przeczytałem rysunków — w PDF są obrazy).
4. Krój: Public Sans to uproszczenie (najbliższa proporcja 4:6 spośród 17 zmierzonych). Pełne porównanie ok. 5 krojów na ekranie — E3.

## Szkic wpisu do `docs/decyzje.md` (do uzupełnienia słowami właściciela)
```
### 2026-10-18 — Kierunek wizualny (Studio Projektowe, E2)
Status: PRZEBIEG PRÓBNY — przyjęta rekomendacja studia, NIE wybór właściciela.
Wybór właściciela (dosłownie): „…” (data: …)
Rekomendacja: A. Drogowskaz + kod rodzaju treści z B.
Odrzucone: B. Rejestr (klisza tarczy/błękitu), C. Pasmo (dane zbędne kierowcy, nocna paleta blisko domyślnej).
Zależy od: decyzji o zakresie ekranu w ruchu (E0 pyt. 2); opinii prawnej o naśladowaniu znaków drogowych.
```
*Przebieg próbny: kontynuowałbym E3 z kierunkiem A + kod z B. Prawdziwy wybór należy do właściciela.*
