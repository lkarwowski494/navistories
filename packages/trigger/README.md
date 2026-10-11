# @navistories/trigger

Rdzeń logiki wyzwalania historii: czysty TypeScript, bez React Native i bez
telefonu. Dostaje trasę (polilinię z OpenStreetMap), listę checkpointów i
strumień próbek GPS; zwraca zdarzenia „graj”, „w kolejce”, „pominięta”,
„zjazd z trasy” itd.

## Co robi

- `geo.ts`: odległość haversine, kurs, punkt docelowy.
- `route.ts`: trasa z postępem w każdym wierzchołku; rzut punktu GPS na trasę
  (postęp od startu i odległość boczna), z oknem postępu, żeby trasa „tam i z
  powrotem” tą samą ulicą nie myliła kierunków.
- `filter.ts`: odrzucanie złych próbek (słaba dokładność, czas nie rosnący,
  nierealny skok dla profilu; reset po serii odrzuceń).
- `offroute.ts`: zjazd z trasy z histerezą (N kolejnych próbek, osobny próg
  powrotu).
- `lead.ts`: wyprzedzenie zależne od prędkości.
- `engine.ts`: maszyna stanów (`createEngine`, `step`). Reguły:
  - checkpoint wyzwala się, gdy najdalszy osiągnięty postęp ≥ postęp punktu − wyprzedzenie;
  - nie przerywa trwającej historii (kolejka), między historiami jest minimalny odstęp;
  - każda historia najwyżej raz; jazda wstecz niczego nie wyzwala ponownie;
  - kilka punktów miniętych naraz po przerwie (tunel, powrót na trasę, reset
    pozycji): gra jeden (najwyższy priorytet, przy remisie ostatni), reszta
    „pominięta”;
  - historia, której punkt został za daleko w tyle, jest pomijana jako przeterminowana;
  - punkty przed miejscem startu śledzenia są pomijane.
  Stan to zwykłe dane (JSON poza trasą), `step` nie zmienia wejścia.
- `simulate.ts`: przepuszcza strumień próbek przez maszynę z symulowanym
  odtwarzaczem; do testów scenariuszowych.
- `gpx.ts`: minimalny parser GPX (rtept, trkpt, wpt, czas).

## Profile ruchu i liczby

Wszystkie liczby są w `src/config.ts` (profile `car` i `walk`; profil to dane,
nie osobny kod). **Każda liczba jest oznaczona „(kal.)”: to propozycja
inżynierska do kalibracji na prawdziwych przejazdach, nie wartość z literatury.**
Test `test/config.test.ts` pilnuje, żeby w innych plikach `src/` nie pojawiały
się liczby (poza 0, 1, 2 i stałymi matematycznymi w `constants.ts`).

## Testy

```sh
pnpm install
pnpm test                       # z korzenia repozytorium (albo pnpm run ci)
pnpm --filter @navistories/trigger test
```

Fixture `test/fixtures/syntetyczna-trasa.gpx` jest w całości syntetyczny
(ok. 4,5 km, tunel bez GPS, jeden fałszywy odczyt); generuje go
`pnpm --filter @navistories/trigger fixture`.

Lokalny test dymny na dowolnym pełnym GPX z czasami (plik spoza repozytorium,
pomijany bez zmiennej):

```sh
NAVISTORIES_GPX=/ścieżka/do/trasy.gpx pnpm --filter @navistories/trigger test
```
