# @navistories/sesja

Adapter sesji: próbki lokalizacji → `step()` z `@navistories/trigger` → odtwarzacz.
Czysty TypeScript, bez React Native; telefon i system są za interfejsami
(`src/ports.ts`), więc całość da się testować bez telefonu.

- `LocationSource`: start (z prośbą o uprawnienie), stop, strumień próbek.
  Aplikacja: expo-location (`apps/mobile/src/system/lokalizacja.ts`).
- `StoryPlayer`: play / pause / resume / stop, zgłoszenie końca historii.
  Aplikacja: expo-audio (`apps/mobile/src/system/odtwarzacz.ts`).
- `Clock`: czas i timery (w testach sterowany ręcznie).

`createSession({ pakiet, themeFilter?, location, player, clock })` zwraca
sesję z widokiem dla ekranu jazdy (`phase`, `activity`: gra / w kolejce / poza
trasą / czekam / szukam pozycji, bieżąca historia, pauza, zagrane i pominięte)
oraz metodami `start` (tylko na żądanie użytkownika), `stop`, `pause`,
`resume`, `next`. Decyzje (co i kiedy grać) podejmuje wyłącznie maszyna stanów
z `@navistories/trigger`; adapter tylko przekazuje zdarzenia i budzi maszynę
po minimalnym odstępie między historiami.

`sampleFromLocation` zamienia obiekt lokalizacji expo-location na próbkę GPS.

## Testy

```sh
pnpm --filter @navistories/sesja test
```

`test/integracja-gpx.test.ts` przepuszcza syntetyczny przejazd z
`packages/trigger/test/fixtures` przez sesję z atrapami lokalizacji,
odtwarzacza i zegara i sprawdza, że zdarzenia są identyczne z referencyjną
symulacją `simulate()`.
