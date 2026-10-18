# NaviStories — system „Drogowskaz” (design-spec, E3)

Data: 2026-10-18. Kierunek wybrany przez właściciela 18.10.2026: „podoba mi się drogowskaz”. Krój tytułów Jost z ss01, treść krojem systemowym, etykieta rodzaju treści z kodem kształtu (decyzje właściciela, 18.10.2026).
Status: propozycja Studia (rola 04) do akceptacji na bramce E3. Raport: [`stop-E3.md`](stop-E3.md).

| Co | Gdzie |
|---|---|
| Tokeny (moduł motywu) | [`tokeny.ts`](tokeny.ts), zmienne CSS makiet generowane z niego: [`ekrany/tokeny.css`](ekrany/tokeny.css) |
| Kontrast (64 pary, 4 warianty) | [`narzedzia/kontrast-e3-wynik.txt`](narzedzia/kontrast-e3-wynik.txt) |
| Makiety | [`ekrany/sesja.html`](ekrany/sesja.html), [`start.html`](ekrany/start.html), [`wybor.html`](ekrany/wybor.html), [`zrodla.html`](ekrany/zrodla.html), [`ikona.html`](ekrany/ikona.html) |
| Zrzuty wzorcowe (linia bazowa audytu) | [`wzorce-zrzuty/`](wzorce-zrzuty/): 390 jasny, 390 ciemny, 320 jasny AX5 dla każdego stanu |
| Arkusze zbiorcze | [`arkusze/`](arkusze/): 320/390/430 × jasny/ciemny × domyślny/AX5 + „Zwiększ kontrast” + skala szarości |

## 1. Zasady

1. **Tablica = historia.** Brązowa tablica pojawia się tylko tam, gdzie jest historia (sesja, lista wysłuchanych, ikona). Gdzie indziej nie ma tablic. *Dlaczego:* element firmowy, który pojawia się bez danych, staje się ozdobą.
2. **W ruchu nic do czytania** (spec. P4). Tablica z dużą pauzą, etykieta rodzaju treści, „Steruj z kierownicy”, stałe oznaczenie AI. Zmiany na ekranie w ruchu są natychmiastowe, bez animacji. Stan, którego nie da się pokazać bez tekstu (np. „Poza trasą”), mówi głos.
3. **Jeden akcent.** Brąz drogowskazu turystycznego (E-7…E-12) znaczy „tu jest coś do zrobienia albo historia”. Czerwień tylko dla ostrzeżeń, zawsze z ikoną i tekstem (albo komunikatem głosowym w ruchu).
4. **Reszta jest systemowa.** Listy grupowane, ptaszki, przełączniki, segmenty i pasek nawigacji to kontrolki iOS. Marka widać tylko w kroju tytułów i barwie akcentu.
5. **Małe litery jak na znakach.** Bez wersalików w etykietach i nagłówkach sekcji, bez ciągów „A · B · C”, bez strzałek na przyciskach. Strzałka występuje tylko na tablicy, gdzie wskazuje stronę drogi.

Tablica jest **wywiedziona** ze znaków (barwa, obrzeże, sylwetka, małe litery), a nie skopiowana. Czy takie naśladowanie jest dozwolone, zostaje `[DO USTALENIA, prawne]`.

## 2. Element firmowy: tablica

| Dana | Jak wygląda | Skąd w aplikacji | Stan w schemacie pakietu |
|---|---|---|---|
| Typ obiektu | sylwetka (pałac, zamek, kościół, ratusz…) | metadane punktu | **brak pola**; trzeba dodać typ obiektu (warsztat + rola 05) |
| Nazwa | `nazwaMiejsca`, Jost 30 pt | `points[].title` | jest |
| Strona drogi i odległość do obiektu | strzałka + „4 km” | położenie obiektu względem trasy | **brak**; `progressM` daje tylko miejsce wyzwolenia na trasie |
| Rodzaj treści (spec. P16) | etykieta: znacznik pełny / kreskowany / kontur + słowo | segmenty historii z czasami | **brak**; potrzebne segmenty z czasem i rodzajem |
| Postęp historii | krawędź postępu wzdłuż dolnego obrzeża; w ruchu skokowo co 10 % | odtwarzacz (pozycja / długość) | jest w odtwarzaczu |
| Następna historia | mała tablica: sylwetka, nazwa, „za ok. 14 km” | następny punkt i `progressM` | częściowo (bez typu obiektu) |

Tablica nie pokazuje żadnej danej, której pakiet nie dostarcza. Dopóki brakuje pól, aplikacja pokazuje sylwetkę zastępczą (sama droga) i pomija strzałkę z odległością. Nie zgaduje tych wartości.

**VoiceOver.** Sylwetka, nazwa, strzałka i czas są ukryte (`accessibilityElementsHidden`). Tablica jest jednym elementem z pełnym zdaniem:

| Stan | Rola | Etykieta | Wartość / opis |
|---|---|---|---|
| W ruchu, gra | przycisk | „Pauza” (po pauzie: „Graj”) | „Gra: Pałac w Kozłówce. Fakty. Minęła 1 minuta 12 sekund z 3 minut 40 sekund.” |
| W ruchu, czekam | tekst | „Czekam na następną historię. Następna za około 14 kilometrów.” | — |
| W ruchu, poza trasą | tekst | „Poza trasą. Historie wrócą, gdy wrócisz na trasę.” | — |
| Na postoju | grupa | „Gra: Pałac w Kozłówce. Fakty. 4 kilometry w lewo od trasy. Minęła 1 minuta 12 sekund z 3 minut 40 sekund.” | — |
| Etykieta rodzaju treści | tekst | „Rodzaj treści: fakty” (legenda, bajka) | — |

Liczby w etykietach VoiceOver są pełnymi słowami („kilometry”, „minuta”), bez skrótów. Tak samo robi już `aiCzytnik` w `teksty.ts`.

## 3. Tokeny (skrót; wartości w `tokeny.ts`)

- **Kolory:** 10 ról (`tlo`, `lico`, `braz`, `brazNacisk`, `brazTor`, `naBrazie`, `tekst`, `tekst2`, `ostrz`, `separator`), każda w czterech wariantach: jasny, ciemny i oba ze „Zwiększ kontrast”. Brąz `#6B3815` i czerwień `#B20013` to przybliżenia przeliczone ze współrzędnych z tab. 1.3 Dz.U. 2019 poz. 2311 (założone Y 0,06 / 0,08), a nie wartości z przepisu. Nocą tablica (`#2A2C30`) jest jaśniejsza od jezdni (`#1C1E21`), ale nie świeci bielą. Kontrast: 64 z 64 par OK. Najniższy wynik dla tekstu to 5,25:1 (jasny), a dla elementów interfejsu 5,08:1 (ciemny, pasek postępu).
- **Mapowanie z obecnego `ui.tsx`:** `tlo #FFFFFF` → `tlo` (ekran) + `lico` (komórki); `akcent #0B5FFF` → `braz`; `ramka` → `separator` (listy) albo `braz` (obrzeża); `wybrany #E3ECFF` → ptaszek `braz` (bez tła); `blad` → `ostrz`; `wylaczony` (opacity 0,4) → kreskowana ramka `tekst2`, bo stan nie może zależeć tylko od jasności.
- **Typografia:** Jost 500/600 (`fontVariant: ['stylistic-one']`) dla tytułów, przycisków, etykiety rodzaju i nazw na tablicy. Treść używa stylów systemowych (Body 17/22, Subhead 15/20, Footnote 13/18, wg tabeli HIG „Large (default)”).
- **Dynamic Type:** RN mnoży wszystkie rozmiary jednym współczynnikiem (AX5 = 3,571). Każdy styl ma więc `maxFontSizeMultiplier`:
  - treść: 3,12 (53 pt przy AX5, jak Body w HIG);
  - tytuły: max(1,8; 53 / rozmiar), więc żaden tytuł nie jest mniejszy od treści;
  - wyjątki nazwane: duży tytuł 1,5 (najdłuższe słowo musi zmieścić się w 320 pt) i etykieta 2,0;
  - od AX1 rzędy przycisków przechodzą w stos, a liczby z jednostką się nie łamią.
- **Odstępy:** siatka 4 pt, margines boczny 20. **Promienie według hierarchii:**
  - tablica 10;
  - mała tablica 8;
  - przycisk pauzy 22;
  - przycisk 12;
  - komórka listy 10;
  - etykieta 6;
  - znacznik 3.

  **Obrzeża:** 6 / 3 / 2 / 2 pt; przy „Zwiększ kontrast” 8 / 4 / 3 / 3.
- **Ruch:**
  - wjazd tablicy na postoju: 250 ms;
  - w ruchu: 0 ms;
  - przy „Ogranicz ruch”: przenikanie 150 ms;
  - intro: najwyżej 1000 ms.
- **Haptyka:** tylko w odpowiedzi na dotyk:
  - Pauza/Graj: impact Medium;
  - Następna: Light;
  - Start podróży: Success;
  - wybór: selection;
  - błąd po akcji: Error.

  Zdarzenia bez dotyku (start historii, „Poza trasą”) nie mają haptyki, bo telefon leży w uchwycie. To nazwany wyjątek od zasady „dźwięk zawsze z haptyką”.

## 4. Komponenty

| Komponent | Systemowy / własny | Uwagi |
|---|---|---|
| Pasek nawigacji z dużym tytułem, wstecz | systemowy (native-stack) | duży tytuł krojem Jost (`headerLargeTitleStyle.fontFamily`) |
| Lista grupowana, ptaszek, przełącznik, segmenty | systemowe | `Switch trackColor.true = braz`; segmenty przy AX → lista z ptaszkiem |
| Okno potwierdzenia, Ustawienia, Linking | systemowe | |
| Przycisk główny / drugorzędny | własny styl na `Pressable` | 56 pt (duży 88 pt); wyłączony = kreskowana ramka |
| **Tablica** (`Tablica`) | własny, element firmowy | `react-native-svg`: obrzeże, sylwetka, pauza, krawędź postępu; warianty: w ruchu, na postoju, czekam, poza trasą |
| **Etykieta rodzaju treści** (`EtykietaRodzaju`) | własny | znacznik 1,05 em: pełny / kreski 45° / kontur + słowo; nigdy sam kolor |
| **Krawędź postępu** (`KrawedzPostepu`) | własny | część tablicy, 10 pt, ukryta dla VoiceOver (wartość w zdaniu tablicy) |
| Mała tablica (następna historia, miniatura w liście) | własny wariant tablicy | 3 pt obrzeża, bez postępu |
| Oznaczenie AI (`Oznaczenie`) | istniejący, nowe tokeny | Footnote, `tekst2`, statyczne, zawsze widoczne w sesji |
| Baner ostrzeżenia | własny, prosty | ikona + tekst + czerwony pasek; `accessibilityRole="alert"` |
| Ikona, ekran startowy, intro | zasoby | sekcja 8 |

## 5. Słownik interakcji

| Termin | Kiedy | Gdzie |
|---|---|---|
| **Start** | rozpoczęcie podróży (jedyny sposób) | przycisk główny, dół ekranu |
| **Pauza** / **Graj** | wstrzymanie i wznowienie historii | tablica w ruchu (cała jest celem), przycisk na postoju, kierownica |
| **Następna** | pominięcie bieżącej historii | przycisk na postoju, kierownica; w ruchu nie ma go na ekranie |
| **Zakończ podróż** | koniec sesji (dziś „Zakończ”) | link pod tablicą na postoju; potwierdzenie: decyzja D4 |
| **Dalej** | przejście z wyboru trasy do sesji | przycisk główny |
| **Rozumiem** | potwierdzenie ujawnienia AI | przycisk główny, raz |
| **Nowa podróż** | po końcu podróży albo błędzie | przycisk główny / drugorzędny |
| **Źródła** | lista instytucji i adresów historii | wiersz listy wysłuchanych |
| **Otwórz Ustawienia** | brak uprawnienia | przycisk główny przy banerze |
| Etykieta VoiceOver źródła | „Otwórz źródło: {instytucja}” | cały wiersz jest linkiem |

Ta sama akcja ma jedną nazwę: obecne „Zakończ” proponuję zmienić na „Zakończ podróż”, bo na postoju obok jest „Następna”, a samo „Zakończ” jest dwuznaczne.

## 6. Macierz stanów (tylko stany, które dotyczą danego ekranu)

| Ekran | Typowy | Pierwsze użycie | Ładowanie | Błąd | Dane częściowe | Brak wyników | Brak uprawnienia | Ostrzeżenie | Offline / tło |
|---|---|---|---|---|---|---|---|---|---|
| Sesja w ruchu | `w-ruchu` | — | `w-ruchu-czeka` (szukam pozycji: ta sama tablica, głos „Szukam pozycji”) | głosem | tablica bez strzałki/sylwetki, gdy pakiet ich nie ma | — | przed startem | `w-ruchu-poza-trasa` (piktogram + głos) | działa offline; ekran zgaszony = dźwięk gra dalej |
| Sesja na postoju | `na-postoju` | — | — | baner | jw. | — | — | baner „Poza trasą” z ikoną | jw. |
| Przed startem | `przed-startem` | — | — | `brak-uprawnienia` / błąd lokalizacji | — | „Nie znaleziono trasy.” | `brak-uprawnienia` + Otwórz Ustawienia | — | — |
| Pierwsze uruchomienie | `pierwsze-uruchomienie` | to jest ten stan | — | — | — | — | — | — | — |
| Wybór trybu | `wybor-trybu` | — | — | — | — | — | — | — | — |
| Samochód / Spacer | `samochod`, `spacer` | — | — | — | — | stopka z frazą i wyjściem; „Dalej” wyłączone przy 0 motywów | — | — | — |
| Koniec podróży | `koniec-podrozy` | — | — | — | — | „Tym razem nie zagrała żadna historia.” | — | — | — |
| Źródła | `zrodla` | — | — | — | — | „Nie znaleziono historii.” | — | — | offline: stopka „Bez internetu. Adres otworzysz, gdy telefon złapie sieć.” |

Szkielet ładowania nie jest potrzebny, bo pakiety są w aplikacji i nie ma operacji dłuższych niż chwila.

## 7. Głos interfejsu

- **Ton:** spokojny przewodnik obok kierowcy. Krótko, w stronie czynnej, zdania zwykłą wielką literą, bez wykrzykników.
- **Słowa:** używamy słów „historia” (nie „opowieść”, tak jak w `teksty.ts`), „trasa”, „podróż”, „źródła” i „Ustawienia”.
- **Słowa zakazane:** „Ups”, „Niestety”, „Przepraszamy”, „magiczny”, „odkryj”, „AI-powered”, kody błędów, „GPS” w tekstach dla użytkownika (piszemy „lokalizacja”).
- **Teksty uczące dziedziny** przechodzą przez rejestr merytoryczny (rola 06). Dotyczy to też objaśnień „Fakty / Legenda / Bajka” na ekranie pierwszego uruchomienia; ich brzmienie w makiecie to [PRZYKŁAD].

| Sytuacja | Tekst (stan na gałęzi → propozycja) |
|---|---|
| Brak uprawnienia | „Bez dostępu do lokalizacji historie nie mogą się włączać. Zezwól na lokalizację „Podczas używania” w Ustawieniach.” (bez zmian) + **przycisk „Otwórz Ustawienia”** (nowy) |
| Błąd lokalizacji | „Nie udało się włączyć lokalizacji.” → „Nie udało się włączyć lokalizacji. Wróć i dotknij Start jeszcze raz.” |
| Brak tras | „Brak dostępnych tras.” → „Nie ma jeszcze tras do wyboru.” |
| Brak spaceru | „Brak spaceru dla tego motywu i długości.” → „Nie ma spaceru o tej długości w tym motywie. Wybierz inną długość.” |
| Nic nie zagrało | „Żadna historia nie została odtworzona.” → „Tym razem nie zagrała żadna historia.” |
| Offline (Źródła) | nowy: „Bez internetu. Adres otworzysz, gdy telefon złapie sieć.” |
| Poza trasą (głos, w ruchu) | nowy: „Poza trasą. Historie wrócą, gdy wrócisz na trasę.” `[DO USTALENIA]`: czy istnieje komunikat głosowy (rola treści/audio) |
| Przed startem | „Historie zaczną się, gdy dotrzesz do pierwszego punktu.” (bez zmian) |
| Podsumowanie | nowy: „Wysłuchane: 4 historie, 15 minut.” (liczby z sesji) |
| Oznaczenie AI | bez zmian, wszystkie warianty z `teksty.ts` (`sesja.ai`, `aiCzytnik`, `zrodla.ai*`) |

## 8. Ikona, ekran startowy, intro

- **Ikona:** tablica z brązowym obrzeżem i sylwetką na licu. Wersja ciemna to tablica na asfalcie z jasnym brązem. W rundzie 1 krawędź postępu przy 29 pt wyglądała jak wyszczerbiony róg, więc usunąłem ją z ikony. Ikona nie ma napisu ani pinezki (klisza kategorii 8/13). Zrzut: [`arkusze/ikona.png`](arkusze/ikona.png). Do zrobienia przy wydaniu: wersja „tinted” iOS i pliki 1024 pt bez zaokrągleń.
- **Ekran startowy:** tło `tlo` (jasne / ciemne) i sama tablica 112 pt na środku, bez nazwy i hasła. Ekran startowy nie jest reklamą (HIG, Branding). W `expo-splash-screen`: `backgroundColor` z tokenu i obraz tablicy, osobno dla trybu ciemnego.
- **Intro (opcjonalne, decyzja D2):** trwa około 1 s:
  - tablica wjeżdża z prawej jak mijany znak (600 ms, krzywa `wjazd`);
  - zatrzymuje się;
  - następuje cięcie do pierwszego ekranu.

  Intro pomija się dotknięciem. Nie gra przy „Ogranicz ruch”, przy powrocie do aktywnej sesji ani w ruchu. Klatki: `ekrany/ikona.html`, stan `intro`.

## 9. Dla programisty (rola 08)

- Ekrany korzystają wyłącznie z `tokeny.ts` i komponentów z sekcji 4. `ui.tsx → kolory` znika, `userInterfaceStyle` przechodzi na `automatic` (decyzja D5).
- Jost rejestrujemy przez `expo-font` (instancje 500 i 600 z pliku zmiennego albo statyczne kopie). `fontVariant: ['stylistic-one']` trzeba sprawdzić na urządzeniu.
- Przełączanie widoku ruch/postój: próg prędkości to liczba konfiguracyjna i należy do `konfiguracja.ts`, nie do tokenów. `[DO USTALENIA]`: metoda.
- Brakujące dane tablicy (typ obiektu, położenie obiektu, segmenty rodzaju treści) to zmiana schematu pakietu (rola 05 + warsztat), nie zadanie UI.
- Po implementacji rola 04 wraca w trybie `audit` i porównuje ekrany z `wzorce-zrzuty/`.
