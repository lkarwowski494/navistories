# NaviStories

Aplikacja mobilna (iOS najpierw), która w czasie jazdy samochodem opowiada historie o miejscach mijanych na trasie.

Stan: przygotowanie do Iteracji 0 — pierwszy pełny przejazd na symulatorze z gotowymi nagraniami.

## Zasady repozytorium (publiczne)

- W repozytorium nie ma i nie może być kluczy, certyfikatów ani plików `.env`. Sekrety żyją wyłącznie w ustawieniach GitHub (Secrets) i nie są dostępne dla forków.
- Historie, polecenia dla AI i nagrania powstają w osobnym, prywatnym repozytorium (warsztat). Aplikacja dostaje gotowe pliki.
- Każda zmiana: najpierw test, potem kod.

## Dane map

Trasy wyznaczane na danych © współtwórcy OpenStreetMap (licencja ODbL).

## Rozwój

Monorepo pnpm (Node 22+, pnpm 10). `pnpm install`, potem `pnpm run ci`
(typecheck i testy wszystkich pakietów i aplikacji). Pakiety:

- `packages/trigger`: logika wyzwalania historii (czysty TypeScript, bez React Native).
- `packages/pakiet`: format pakietu trasy (JSON + audio), walidator, katalog (czysty TypeScript).
- `packages/sesja`: adapter lokalizacja → `step()` → odtwarzacz za interfejsami (czysty TypeScript).
- `apps/mobile`: aplikacja Expo (SDK 57, expo-router); uruchomienie, wymagania
  iOS (lokalizacja i audio w tle) i plan buildu: `apps/mobile/README.md`.
