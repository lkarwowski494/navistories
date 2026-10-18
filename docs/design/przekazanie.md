# Przekazanie projektu wizualnego (etap E4) — 18.10.2026

Projekt „Drogowskaz” jest zatwierdzony: kierunek, krój, kod rodzaju treści i decyzje D1–D6 z etapu E3 (`stop-E3.md` §4 i §8).

## Źródła prawdy dla implementacji

| Co | Plik |
|---|---|
| Zasady, element firmowy, komponenty, słownik interakcji, stany, głos | `design-spec.md` |
| Moduł motywu (kolory 4 warianty, typografia, odstępy, promienie, ruch, haptyka) | `tokeny.ts` (propozycja; zastępuje obecny motyw na gałęzi aplikacji) |
| Ekrany wzorcowe (17 stanów) | `ekrany/*.html` |
| Linia bazowa audytu zgodności (rola 04 w trybie `audit`, SP-13) | `wzorce-zrzuty/` |
| Kroje z licencjami | `fonty/` (Jost: tytuły, ss01) |
| Pomiar kontrastu i typów | `narzedzia/kontrast-e3-wynik.txt`, `narzedzia/tsc-e3-wynik.txt` |

## Do wdrożenia w kodzie (rola Programista)

- Motyw z `tokeny.ts` w miejsce obecnego; `userInterfaceStyle: automatic` (D5).
- Tablica jako element firmowy z opisem VoiceOver; w ruchu cała tablica to przycisk pauzy (spec. P4); na postoju tablica wypełnia ekran (D1).
- Etykieta rodzaju treści z kodem kształtu; objaśnienie na ekranie „Zanim zaczniesz” (D6; brzmienie przez weryfikację treści).
- Pasek postępu w ruchu skokami co 10% bez animacji (D3); „Zakończ podróż” z potwierdzeniem (D4); intro ok. 1 s tylko przy pierwszym uruchomieniu, wyłączone przy „Ogranicz ruch” (D2).

## Otwarte pytania (z `stop-E3.md` §5)

- Schemat pakietu trasy nie ma pól na typ obiektu, stronę drogi i odległość ani na segmenty Fakty / Legenda / Bajka. Decyzja należy do architektury (rola 05) i repo treści. Do tego czasu tablica pokazuje mniej i niczego nie zgaduje.
- Do sprawdzenia na urządzeniu: ss01 przez `fontVariant`, ładowanie Jost przez `expo-font`, ustawienie „Zwiększ kontrast”, skalowanie paska nawigacji przy dużym tekście.
- `[DO USTALENIA]`: ryzyko prawne naśladowania znaku drogowego (znak wywodzimy, nie kopiujemy), typologia sylwetek obiektów, wykrywanie stanu „w ruchu” / „na postoju”.

## Po implementacji

Rola 04 w trybie `audit`: porównanie zbudowanych ekranów z `wzorce-zrzuty/`.
