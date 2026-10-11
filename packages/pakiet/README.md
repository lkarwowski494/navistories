# @navistories/pakiet

Format pakietu trasy: typy, walidator i funkcje katalogu. Czysty TypeScript
(bez React Native), walidacja przez [zod](https://zod.dev).

## Pakiet na dysku

```
<id-pakietu>/
  pakiet.json        # opis (schemat poniżej)
  audio/…            # pliki audio, ścieżki względne z points[].audio
```

## `pakiet.json` (formatVersion 1)

| Pole | Typ | Opis |
| --- | --- | --- |
| `formatVersion` | `1` | wersja formatu; aplikacja odrzuca nieznane |
| `id` | string | `a-z0-9-` |
| `version` | string | wersja treści, nadaje warsztat |
| `title` | string | nazwa trasy lub spaceru |
| `mode` | `"car"` \| `"walk"` | tryb; wybiera profil ruchu logiki wyzwalania |
| `themes` | `{id, name}[]` | motywy pakietu (spacer: zwykle jeden) |
| `durationMin` | number | przybliżony czas spaceru; wymagany dla `walk` |
| `aiGenerated` | `{text, voice}` | oznaczenie treści i głosu generowanych przez AI |
| `route` | `[lat, lon][]` | polilinia trasy (WGS84, np. z OpenStreetMap) |
| `points` | Point[] | co najmniej jeden |

Point: `id`, `progressM` (postęp wzdłuż trasy od startu, m), `priority`
(całkowita, wyższa = ważniejsza), `title`, `audio` (ścieżka względna, bez `..`,
rozszerzenie m4a/mp3/aac/wav), `themes` (id z `themes` pakietu), `sources`
(co najmniej jedno: `{institution, url}`, adres http/https).

Walidator odrzuca też: nieznane pola (literówki), powtórzone id, nieznane
motywy, punkty dalej niż długość trasy, trasę bez dwóch różnych punktów.

## API

- `validatePakiet(json)` → `{ok: true, pakiet}` albo `{ok: false, errors}`;
  `parsePakiet(json)` rzuca błąd.
- `routeOf(pakiet)`, `checkpointsOf(pakiet, filtrMotywów?)`: dane dla `@navistories/trigger`.
- `walkThemes`, `findWalks`, `durationOption`, `carRoutes`: wybór z katalogu.

```sh
pnpm --filter @navistories/pakiet test
```
