# STOP E0 — Rozpoznanie (Studio Projektowe, tryb build)

Data: 2026-10-18 · Przebieg próbny (dry run): bramka zastąpiona raportem, dalsza praca na rekomendacji.

## 1. Środowisko (sprawdzone komendami)

| Sprawdź | Wynik | Dowód |
|---|---|---|
| System, Node, git | Linux x86_64, Node v22.22.0, git OK | `uname -a`, `node -v` |
| Repo `navistories` | publiczne; `main` ma tylko README, CLAUDE.md, .gitignore | `gh api repos/lkarwowski494/navistories --jq .visibility` → `public`; `git log` (3 commity) |
| Gałęzie z kodem | `iteracja-0/aplikacja` (fffd551), `iteracja-0/logika-wyzwalania` (5531f1c) — **istnieje już UI** | `git ls-remote origin`; klon tylko do odczytu poza repo |
| Playwright / Chromium | 1.56.1, Chromium w `/opt/pw-browsers`; import z katalogu tymczasowego po `npm i playwright@1.56.1` | `npx playwright --version`, `node t.mjs` → `ok` |
| Expo web | nie sprawdzone (bez `npm install` aplikacji; nie wolno modyfikować repo) | — |
| Xcode / symulator | brak (Linux) — zrzuty tylko z makiet HTML | — |
| Sieć | App Store i Google Fonts osiągalne (HTTP 404/200 z proxy) | `curl -w %{http_code}` |
| Zapis do repo | **zabroniony w tym przebiegu**; artefakty w katalogu roboczym, od 18.10.2026 skopiowane do `docs/design/` | polecenie przebiegu |

## 2. Co przeczytałem na wejściu

- `README.md`, `CLAUDE.md` repo (hierarchia źródeł dla historii i miejsc — ma pierwszeństwo przed domyślną z promptu).
- `docs/sztafeta.md`, `docs/decyzje.md`, `docs/scope-contract.md`, `docs/brd/` — **nie istnieją**. Rejestr decyzji i specyfikacja są na Google Drive:
  - „01 Specyfikacja MVP — NaviStories” v3.2 z 11.10.2026 (Google Drive, folder „NaviStories”), sekcje 1–4, 6–10, 12, 15;
  - „02 Dziennik decyzji — NaviStories” (Google Drive, folder „NaviStories”), wpisy 11–12.10.2026.
- Kod UI z gałęzi `iteracja-0/aplikacja`: `apps/mobile/src/ekrany/EkranSesji.tsx`, `ui.tsx`, `teksty.ts`, `app.json`.

**Rozbieżność z poleceniem przebiegu:** polecenie mówi „no UI exists yet”. W rzeczywistości jest szkielet UI (Iteracja 0, 176 testów wg dziennika 11.10.2026): białe tło, akcent `#0B5FFF`, przyciski 52/88 pt, tylko motyw jasny (`userInterfaceStyle: "light"`), domyślna ikona Expo. To nie jest artefakt roli 04 (brak systemu), więc zostaję w trybie `build`, ale **teksty i elementy ekranu sesji traktuję jako stan faktyczny**, a nie wymyślam ich od nowa.

## 3. Przepływy (z specyfikacji v3.2 i kodu; brak kontraktu zakresu → założenia oznaczone [Z])

| # | Kto | Cel | Kroki | Częstość |
|---|---|---|---|---|
| P-A | kierowca/pasażer na postoju | przygotować podróż | Start → „Samochodem” → trasa (pakiet) → motywy → Start | raz na podróż |
| P-B | **kierowca w ruchu** | słuchać; ewentualnie pauza / następna | Start podróży → historie same → [Pauza]/[Następna] z kierownicy (AVRCP) lub z telefonu | ciągle, 1–4 h |
| P-C | kierowca po jeździe | sprawdzić źródła, zakończyć | Zakończ → lista wysłuchanych → Źródła | raz na podróż |
| P-D | piechur | spacer 30/60/90 min | „Pieszo” → motyw, długość → Start → Źródła w trakcie | rzadziej |
| [Z] P-E | pasażer | zobaczyć mapę i „co dalej” | widok pasażera / postoju (spec. 4, Iteracja 3) | okazjonalnie |

Elementy ekranu jazdy, które **już są ustalone** (kod + decyzje): stan („Gra”, „Na trasie, czekam…”, „Poza trasą”, „Szukam pozycji…”), tytuł bieżącej historii, [Pauza/Graj], [Następna], [Zakończ], **stałe oznaczenie AI** (decyzja właściciela 12.10.2026, wariant C), etykieta segmentu Fakty/Legenda/Bajka (spec. P16).

## 4. Kontekst użycia

| Przepływ | Miejsce i światło | Ręce / oczy | Spojrzenie / sesja | Hałas |
|---|---|---|---|---|
| P-B jazda | auto; od pełnego słońca na szybie po noc; telefon w uchwycie | ręce na kierownicy, **oczy zajęte** | spojrzenie — kierunkowo ≤2 s (NHTSA, punkt odniesienia z promptu, nieotwarty → [DO USTALENIA]); sesja 20 min–4 h | silnik, radio, dzieci, komunikaty nawigacji |
| P-A, P-C postój | dom, parking, MOP | wolne | minuty | dowolny |
| P-D spacer | ulica, słońce | jedna ręka, oczy częściowo wolne | 2–5 s | ruch uliczny |

→ Włączam moduł `kontekst-oczy-zajete`.

**Ograniczenie z projektu, które wygrywa z modułem:** spec. 2B.7 / P4: „Ekran telefonu w ruchu pokazuje najwyżej duży przycisk pauzy albo komunikat »Steruj z kierownicy«, bez list, tekstu i animacji”. Moduł promptu mówi tymczasem „ekran pokazuje stan na jedno spojrzenie: co gra, gdzie jesteśmy, co dalej”, a obecny kod pokazuje tytuł, [Następna] i [Zakończ]. To sprawa produktowa (zakres ekranu), nie merytoryczna → pytanie do właściciela niżej.

## 5. Pamięć portfolio — czego nie powtarzać

- Trening: niebieski akcent `#1F5FD1` (uwaga: obecny akcent aplikacji `#0B5FFF` jest bardzo blisko), papier `#F4F3EF`, IBM Plex Sans/Mono, metafora talerzy.
- Organizer: piasek `#F7F2EA` + terakota `#B4471F`, Bricolage Grotesque + Atkinson Hyperlegible Next, metafora linii/wstążek/„stacji” i „węzła przesiadkowego” — **uwaga: NaviStories to też trasa z punktami; metafora „linii metra ze stacjami” byłaby kopią Organizera.**
- Wpis NaviStories w pamięci: `[DO USTALENIA]` (pusty). Proponuję wpis po E4.

## 6. Plan i szacunek czasu

| Etap | Agent | Oczekiwanie | Właściciel |
|---|---|---|---|
| E1 świat dziedziny + skan ~12 aplikacji | 60–90 min | sieć | 10 min lektury |
| E2 trzy kierunki, zrzuty, porównanie | 2–3 h | rendery (sekundy) | 15–20 min wybór okiem (+ opcjonalnie 1 h test 5 osób) |
| E3 system (poza tym przebiegiem) | 2–3 h | — | 15 min |
| E4 przekazanie (poza tym przebiegiem) | 30 min | — | 5 min |

## 7. Pytania do właściciela (decyzje produktowe)

1. **Brak kontraktu zakresu.** (A) pracuję na założeniach [Z] ze specyfikacji v3.2 i kodu Iteracji 0 — szybciej, ryzyko, że rola 03 zmieni zakres ekranów; (B) najpierw rola 03 — wolniej o sesję. **Rekomendacja: A** (zakres ekranu jazdy jest już opisany w spec. i kodzie). *W przebiegu próbnym: przyjęte A (zgoda właściciela w poleceniu).*
2. **Ile pokazuje ekran jazdy?** (A) ściśle P4: tylko duży przycisk pauzy + oznaczenie AI, bez tekstu — najbezpieczniej, ale identyfikacja wizualna ma prawie nic do niesienia; (B) stan kodu: tytuł, Pauza, Następna, Zakończ — więcej informacji, sprzeczne z literą P4; (C) **dwie warstwy**: domyślnie widok kierowcy (pauza + jeden niewerbalny wskaźnik + AI), a pełny tytuł i „co dalej” jako widok postoju/pasażera, przełączany automatycznie przy prędkości ≈0 — [DO USTALENIA] wykrywanie postoju. **Rekomendacja: C**: zgodne z P4 w ruchu, a tytuł widać tam, gdzie wolno patrzeć. *Przyjęte C dla makiet E2: każdy kierunek pokazuje oba stany obok siebie.*
3. Ciemny motyw: obecnie wyłączony (`light`). Jazda nocą wymaga motywu ciemnego (moduł, zasada 4). **Rekomendacja: włączyć tryb automatyczny w E3.**

Otwarte `[DO USTALENIA]`: stan wytycznych NHTSA dla urządzeń przenośnych i zasady CarPlay/Android Auto dla audio (wg spec. 15.2 CarPlay po teście rodzinnym — nie projektuję szablonów CarPlay w E2).
