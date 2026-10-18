# Karty stylu — trzy kierunki (E2)

Ekran kluczowy dla wszystkich: **sesja samochodowa w trakcie opowieści**, w dwóch stanach (rekomendacja C z E0): „W ruchu” (dla kierowcy, zgodnie z spec. P4) i „Na postoju / pasażer”. Treść próbna: trasa Warszawa–Zamość (pakiet `samochod-warszawa-zamosc-dorosli`, seria K1–K14 z dziennika 12.10.2026). **Fakty o miejscach w makietach to próbka, niezweryfikowana** (tytuł, odległości, strona drogi, czasy).

Kroje: zmierzyłem stosunek wysokości minuskuły do wersalika (canvas `measureText`, 17 kandydatów, skrypt roboczy poza repo; pomiar powtórzony w E2 pkt 6: `narzedzia/kroje-pomiar.mjs`). Liternictwo znaków drogowych ma m/d = 4/6 = 0,667 (Dz.U. 2019 poz. 2311, pkt 1.4.1). Wyniki: Public Sans 0,712, Red Hat Display 0,729, Signika 0,739, Barlow Semi Condensed 0,743, Overpass 0,743, Archivo 0,768; szeryfowe: Newsreader 0,662, Spectral 0,697, Literata 0,718; wąskie: Sofia Sans Condensed 0,742, Barlow Condensed 0,743, Antonio 0,860. Treść we wszystkich kierunkach: krój systemowy (SF Pro na iOS; w zrzutach z Linuksa zastępczy).

---

## A. Drogowskaz

- **Idea:** każda opowieść to brązowy drogowskaz turystyczny do miejsca, o którym właśnie słuchasz.
- **Element firmowy i dane:** „tablica” — biała plansza z brązowym obrzeżem i sylwetką obiektu (wzorem E-22b: „sylwetkę wskazywanego obiektu turystycznego – zamku, pałacu”). Dane: sylwetka typu obiektu (z metadanych opowieści), odległość do obiektu, strona drogi (z geometrii trasy — skrypt sprawdza jak odniesienia przestrzenne), postęp opowieści jako brązowy pasek wzdłuż dolnej krawędzi obrzeża.
- **Paleta:**
  | Nazwa | Hex | Pochodzenie |
  |---|---|---|
  | Lico tablicy | `#FFFFFF` | tło drogowskazów E-7…E-12 (pkt 6.3.4.1 — obrzeże i napisy brązowe na tle) |
  | Brąz drogowskazu | `#6B3815` | środek pola tolerancji „brązowa”, tab. 1.3, Y = 0,06 (rachunek, uproszczenie) |
  | Asfalt | `#26282B` | tło trybu ciemnego; wybór studia (nie z przepisu) |
  | Brąz nocny | `#D9A877` | rozjaśniony brąz na asfalt (kontrast ≥ 4.5) — wybór studia |
  | Czerwień ostrzegawcza | `#B20013` | środek pola „czerwona”, tab. 1.3, Y = 0,08 — **tylko** stany ostrzegawcze („Poza trasą”) |
  | Szary folii | `#5E6266` | tekst drugorzędny; wybór studia |
- **Kroje:** tytuły Public Sans 700 (najbliższa proporcji 4:6 wśród zmierzonych bezszeryfowych; uproszczenie — krój znaków `[DO USTALENIA]`); treść systemowy. Napisy „małymi literami, wielka na początku” jak na znakach.
- **Kształty i gęstość:** prostokąty z zaokrągleniem jak tablica (mały promień 6 pt na planszy, 22 pt na przycisku pauzy), grube obrzeże 6 pt; gęstość bardzo niska — jedna tablica na ekran.
- **Ruch / haptyka / dźwięk:** start opowieści: tablica wsuwa się od dołu (250 ms, wyłączone przy „Ogranicz ruch”) + jedno miękkie stuknięcie haptyczne + krótki dwutonowy sygnał (tylko gdy kierowca ma włączone sygnały).
- **Głos:** pusty stan „Pierwsza tablica pojawi się przy pierwszym miejscu na trasie.” · błąd „Zgubiłem sygnał GPS. Opowieści wrócą, gdy telefon znów zobaczy niebo.” · sukces „Przejechane: 14 miejsc, 4 h 12 min opowieści.”
- **Ikona:** biała plansza z brązowym obrzeżem i sylwetką bramy/wieży z łukiem; w ciemnej wersji odwrócona (brąz tła, biała sylwetka).

## B. Rejestr

- **Idea:** opowieść jako wpis w rejestrze miejsc, z widocznym pochodzeniem każdej informacji.
- **Element firmowy i dane:** „sygnatura” — pięciokątna tarczka ostrzem w dół (własny kształt; **nie** wzór znaku z Dz.U. 2004 nr 30 poz. 259), której wypełnienie koduje rodzaj segmentu (P16): pełne = Fakty, kreskowane = Legenda, sam kontur = Bajka; pod nią kreski = liczba źródeł szczebla 1–3 użytych w opowieści. Na postoju: numer opowieści w pakiecie (K10/14) i lista instytucji źródłowych.
- **Paleta:**
  | Nazwa | Hex | Pochodzenie |
  |---|---|---|
  | Karta | `#FFFFFF` | białe tło znaku zabytku („na białym tle”, § 2 ust. 1) |
  | Tusz | `#141A22` | wybór studia |
  | Błękit tarczy | `#1C4FA0` | „błękitny” z § 2 ust. 1; wartość `[DO USTALENIA]` (przepis bez barwy) — przybliżenie studia |
  | Błękit nocny | `#8DB2F0` | rozjaśniony błękit na ciemne tło |
  | Grafit | `#10151C` | tło trybu ciemnego |
  | Ostrzeżenie | `#B3261E` | studia; odróżniony od błękitu |
- **Kroje:** tytuły Literata 600 (krój do czytania, szeryfowy jak druk instytucji); treść systemowy; **bez** kroju mono (kalibracja).
- **Kształty i gęstość:** ostre narożniki karty (promień 2 pt), pięciokąt jako jedyna forma ozdobna; gęstość średnia na postoju (lista źródeł), minimalna w ruchu.
- **Ruch / haptyka / dźwięk:** koniec opowieści: tarczka „zapełnia się” od ostrza w górę (400 ms), podwójne stuknięcie, sygnał „pieczątki” — opowieść trafia do „Wysłuchanych”.
- **Głos:** pusty „Rejestr tej podróży jest pusty. Pierwszy wpis przy pierwszym miejscu.” · błąd „Brak pozycji GPS. Wpisy wrócą po odzyskaniu sygnału.” · sukces „Wpisano 14 opowieści. Źródła każdej są w Wysłuchanych.”
- **Ikona:** pięciokątna tarczka (połowa wypełniona błękitem, połowa kreskowana) na bieli; ciemna: na grafitowym tle.

## C. Pasmo

- **Idea:** trasa to pasmo radiowe, opowieści to stacje, a auto to wskazówka, która je łapie.
- **Element firmowy i dane:** „skala” — pozioma podziałka trasy w km (0 = Warszawa, koniec = Zamość), znaczniki stacji w miejscach opowieści (pełne = wysłuchane, puste = przed nami), wskazówka = bieżąca pozycja na trasie (postęp z silnika wyzwalania), podświetlona stacja = opowieść, która gra.
- **Paleta:**
  | Nazwa | Hex | Pochodzenie |
  |---|---|---|
  | Panel | `#E4E6E8` | aluminium panelu radia — wybór studia (bez autorytetu) |
  | Szkło skali | `#121416` | ciemna szyba skali — wybór studia |
  | Druk skali | `#F2F2EF` | biały nadruk podziałki |
  | Wskazówka | `#E8590C` | pomarańcz wskazówki — wybór studia, jedyny akcent |
  | Podświetlenie nocne | `#FFB547` | bursztyn podświetlenia skali nocą — wybór studia |
  | Ostrzeżenie | `#B02323` | studia; od pomarańczu odróżnia je ikona i tekst |
- **Kroje:** podziałka i tytuły Sofia Sans Condensed 700; treść systemowy.
- **Kształty i gęstość:** skala jak szyba radia (promień 10 pt), duży okrągły przycisk pauzy (pokrętło), reszta płaska.
- **Ruch / haptyka / dźwięk:** start opowieści: wskazówka „dociera” do stacji, znacznik rozjaśnia się (300 ms), krótki szum strojenia 0,4 s + stuknięcie.
- **Głos:** pusty „Pierwsza stacja za 12 km.” · błąd „Brak sygnału GPS. Wskazówka stoi, opowieści czekają.” · sukces „Złapane stacje: 14 z 14.”
- **Ikona:** ciemna szyba z podziałką i pomarańczową wskazówką; jasna wersja: aluminium.

---

## Test generyczności (przed budową)

| Kierunek | Pokrycie z „Kalibracją domyślnych wyborów” | Zmiana i powód |
|---|---|---|
| A | Brak kremu/terakoty (biel + brąz z przepisu). Ryzyko: „etykieta WERSALIKAMI” — znaki używają małych liter, więc **żadnych wersalików**. „→ doklejane do przycisków”: strzałka na tablicy niesie dane (strona drogi), na przyciskach jej nie ma. | Zmieniłem pierwotny pomysł czcionki (Overpass, wzorowany na amerykańskiej Highway Gothic) na Public Sans z powodu proporcji 4:6 z przepisu. |
| B | Ryzyko 1: biel + szeryf = „poważny układ gazetowy” (cienkie linie, zero zaokrągleń). Ryzyko 2: niebieski = klisza kategorii (6/13). Ryzyko 3: mono na numery. | Usunąłem kolumny i cienkie linie podziału (jedna karta, nie gazeta); błękit tylko w tarczce, nie w przyciskach (przycisk pauzy w tuszu); numer K10 krojem tytułowym, nie mono. |
| C | Wersja nocna = „prawie czarne tło z jednym jaskrawym akcentem” (kalibracja, poz. 3). Pomarańcz zbliżony do „cynobrowego”. | Wersja dzienna na aluminium (nie czarna); nocą bursztyn podświetlenia ma funkcję (nie oślepia — mała luminancja tła), zapisuję to jako świadomą decyzję do weta; pomarańcz tylko na wskazówce. Ryzyko pokrewieństwa z Organizerem (linia z punktami): skala nie ma linii łączących ani „przesiadek”; pokazuję km, nie przystanki. |

**Pytanie kontrolne „czy dla podobnej aplikacji z innej dziedziny wyszedłby ten sam plan?”** A — nie (przepis o polskich znakach jest tylko w tej dziedzinie). B — częściowo (karta z pochodzeniem pasowałaby do aplikacji o muzeach); wyróżnia go kodowanie Fakty/Legenda/Bajka, które jest wymogiem tego projektu. C — częściowo (skala radia pasuje do każdej aplikacji audio); wyróżnia go to, że skala to kilometry tej trasy.
