# @navistories/mobile

Szkielet aplikacji mobilnej NaviStories: Expo SDK 57 (React Native 0.86,
React 19.2), TypeScript, expo-router. Logika jest w pakietach workspace:

- `@navistories/trigger`: kiedy grać historię (maszyna stanów);
- `@navistories/pakiet`: format pakietu trasy i walidator;
- `@navistories/sesja`: adapter lokalizacja → `step()` → odtwarzacz, za interfejsami.

Aplikacja dokłada tylko ekrany i implementacje interfejsów na expo-location
(`src/system/lokalizacja.ts`) i expo-audio (`src/system/odtwarzacz.ts`).

## Ekrany (`src/app` = trasy expo-router, `src/ekrany` = komponenty)

| Trasa | Ekran |
| --- | --- |
| `/` | wybór trybu: samochód / pieszo (przy pierwszym uruchomieniu przekierowanie do ujawnienia AI) |
| `/ujawnienie-ai` | treść i głos są generowane przez AI; potwierdzenie zapisane w AsyncStorage |
| `/spacer` | motyw, długość (ok. 30/60/90 min), lista gotowych spacerów |
| `/samochod` | trasa (pakiet) i filtr motywów |
| `/sesja?pakiet=…&motywy=…` | start przyciskiem; w ruchu tylko stan (gra / w kolejce / poza trasą), Pauza/Graj, Następna, Zakończ; stały mały napis o AI według `aiGenerated` pakietu (bez napisu, gdy pakiet nie deklaruje AI) |
| `/zrodla?pakiet=…&punkt=…` | źródła historii: instytucje i adresy, oznaczenie AI |

Bezpieczeństwo kierowcy: w samochodzie przycisk „Źródła” nie pojawia się w
trakcie jazdy; źródła wysłuchanych historii są na ekranie końca podróży.
Na spacerze „Źródła” bieżącej historii są dostępne od razu.

Teksty interfejsu: `src/teksty.ts` (jeden moduł, typ `Teksty` do tłumaczeń).
Liczby konfiguracyjne aplikacji: `src/konfiguracja.ts`.

## Pakiety demonstracyjne

`assets/demo/demo-samochod` i `assets/demo/demo-spacer`: całkowicie
syntetyczne (trasa z fixture'u GPX pakietu trigger, źródła na example.org,
trzy tony sinusoidalne zamiast nagrań). `pakiet.json` jest w repozytorium,
pliki `.wav` generuje `postinstall` (`scripts/generuj-demo.mjs`, czysty Node,
bez ffmpeg); po zmianie skryptu `pnpm --filter @navistories/mobile demo`.

## Testy

```sh
pnpm --filter @navistories/mobile test        # jest-expo + @testing-library/react-native
pnpm --filter @navistories/mobile typecheck   # tsc --noEmit
pnpm --filter @navistories/mobile doctor      # expo-doctor (potrzebuje sieci)
```

Testy ekranów działają na Linuksie bez symulatora: expo-router, lokalizacja i
odtwarzacz są zastąpione atrapami (`__tests__/pomoc`). `__tests__/system.test.ts`
sprawdza, jak wołamy expo-location, expo-task-manager i expo-audio (atrapy
modułów natywnych); prawdziwe zachowanie trzeba sprawdzić na telefonie.

## Uruchomienie lokalne

```sh
pnpm install
pnpm --filter @navistories/mobile start      # serwer Metro (Expo CLI)
```

- **Expo Go** (najszybciej, bez Maca): zeskanuj kod QR. Ograniczenia: Expo Go
  nie obsługuje lokalizacji w tle, więc aplikacja przełącza się na
  `watchPositionAsync` (tylko przy włączonym ekranie); ustawienia z `app.json`
  (opisy uprawnień, tryby tła) nie obowiązują. Wystarczy do przejścia ekranów.
- **Development build** (pełne zachowanie, wymaga Maca z Xcode):
  `pnpm --filter @navistories/mobile exec expo run:ios` (generuje `ios/`
  przez prebuild; katalog jest w `.gitignore`). Na symulatorze trasę można
  „przejechać”: Xcode → Debug → Simulate Location (plik GPX) albo
  `xcrun simctl location <urządzenie> start --speed=14 52.0,21.0 52.0,21.03`.

## iOS: lokalizacja i dźwięk w tle

Decyzja D3: tylko uprawnienie „Podczas używania”. Telefon w uchwycie z
wygaszonym ekranem to zwykła sytuacja w samochodzie, a `watchPositionAsync`
w expo-location działa tylko na pierwszym planie (w kodzie natywnym
`allowsBackgroundLocationUpdates = false`). Dlatego sesja używa
`Location.startLocationUpdatesAsync` z zadaniem TaskManagera
(`navistories-lokalizacja`, zdefiniowane w `src/system/lokalizacja.ts`,
importowane w `src/app/_layout.tsx`). W expo-location 57 ta funkcja na iOS
sprawdza tylko uprawnienie pierwszoplanowe i tryb tła `location`
(komentarz w `ios/LocationModule.swift`: „As a user-initiated foreground
service, this does NOT require the background location permission”); iOS
pokazuje wtedy niebieski wskaźnik używania lokalizacji.

Potrzebne w Info.plist (ustawiają pluginy w `app.json`, sprawdź
`npx expo config --type introspect`):

- `UIBackgroundModes`: `location` (expo-location, `isIosBackgroundLocationEnabled`),
  `audio` (expo-audio, `enableBackgroundPlayback`); `fetch` dokłada
  automatycznie expo-task-manager (nieużywany przez nas);
- `NSLocationWhenInUseUsageDescription` (opis po polsku);
- `NSLocationAlwaysAndWhenInUseUsageDescription` i
  `NSLocationAlwaysUsageDescription`: aplikacja nie prosi o „Zawsze”, ale
  biblioteka zawiera to API, a App Store Connect może odrzucić binarkę bez
  tych opisów; opis mówi wprost, że „Zawsze” nie jest potrzebne;
- bez mikrofonu (`microphonePermission: false`) i bez czujnika ruchu.

Audio: `setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true,
interruptionMode: "duckOthers" })`: historia przycisza muzykę z innych
aplikacji, bez sterowania z ekranu blokady.

Android (poza zakresem Iteracji 0): lokalizacja przy wygaszonym ekranie przez
usługę pierwszoplanową (`isAndroidForegroundServiceEnabled`, powiadomienie z
`src/teksty.ts`), bez `ACCESS_BACKGROUND_LOCATION`.

## Plan: build iOS na runnerze macOS w GitHub Actions (jeszcze nie wdrożony)

Repozytorium nie ma jeszcze workflow ani `eas.json` (decyzja: najpierw
uprawnienia Actions po stronie właściciela; EAS ma limity). Plan:

1. Runner `macos-latest` (w repozytorium publicznym standardowe runnery są
   darmowe; sprawdzić aktualne limity przed włączeniem).
2. Kroki: checkout → `pnpm/action-setup` + `actions/setup-node` (Node 22) →
   `pnpm install --frozen-lockfile` → `pnpm run ci` → wybór Xcode zgodnego z
   Expo SDK 57.
3. Build: `npx eas-cli build --platform ios --profile preview --local
   --non-interactive --output navistories.ipa` w `apps/mobile`. `--local`
   buduje na runnerze, więc nie zużywa limitu buildów w chmurze EAS, ale
   wymaga: `eas.json` z profilem, konta Expo (darmowe) i `EXPO_TOKEN` w
   GitHub Secrets oraz poświadczeń Apple (certyfikat dystrybucyjny i profil:
   zdalne poświadczenia EAS albo `credentials.json` składany w kroku z
   sekretów; pliki `.p12`/`.mobileprovision` nigdy w repozytorium).
4. Wysyłka do TestFlight: `xcrun altool`/`fastlane pilot` z kluczem App Store
   Connect API (sekret) albo `eas submit --path navistories.ipa`.
5. Wyzwalanie ręczne (`workflow_dispatch`) albo tagiem; sekrety niedostępne dla forków.

Alternatywa bez EAS: `npx expo prebuild -p ios` → `xcodebuild archive` +
`-exportArchive` (fastlane `gym`). Więcej konfiguracji podpisu, zero zależności od Expo.
