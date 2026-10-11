/**
 * Źródło lokalizacji na expo-location.
 *
 * Uprawnienie: tylko „Podczas używania” (decyzja D3). Żeby historie działały
 * przy zablokowanym ekranie (samochód: telefon w uchwycie, ekran gaśnie),
 * aktualizacje idą przez zadanie TaskManagera (`startLocationUpdatesAsync`):
 * na iOS wymaga to tylko uprawnienia „Podczas używania” i trybu tła
 * `location` w Info.plist, gdy aktualizacje zaczyna użytkownik na pierwszym
 * planie (iOS pokazuje wtedy niebieski wskaźnik). `watchPositionAsync` działa
 * tylko na pierwszym planie (expo-location ustawia w nim
 * allowsBackgroundLocationUpdates = false), więc jest rezerwą, gdy zadanie nie
 * jest dostępne (np. Expo Go).
 *
 * `defineTask` musi być wywołane na poziomie modułu, przy starcie JS:
 * ten moduł importuje główny layout (`src/app/_layout.tsx`).
 */
import type { Mode } from "@navistories/pakiet";
import { LocationPermissionError, sampleFromLocation, type LocationSource } from "@navistories/sesja";
import type { GpsSample } from "@navistories/trigger";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { LOCATION_TUNING } from "../konfiguracja";
import { t } from "../teksty";

export const LOCATION_TASK = "navistories-lokalizacja";

type Sink = { onSample: (s: GpsSample) => void; onError: (e: Error) => void };
let sink: Sink | null = null;

TaskManager.defineTask<{ locations?: Location.LocationObject[] }>(LOCATION_TASK, async ({ data, error }) => {
  if (!sink) return;
  if (error) {
    sink.onError(new Error(error.message));
    return;
  }
  for (const loc of data?.locations ?? []) sink.onSample(sampleFromLocation(loc));
});

export function createExpoLocationSource(mode: Mode): LocationSource {
  let subscription: Location.LocationSubscription | null = null;
  let usingTask = false;
  let active = false;

  return {
    async start(onSample, onError) {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== "granted") throw new LocationPermissionError();
      active = true;
      const tuning = LOCATION_TUNING[mode];
      const accuracy = Location.Accuracy.BestForNavigation;
      sink = { onSample, onError };
      try {
        await Location.startLocationUpdatesAsync(LOCATION_TASK, {
          accuracy,
          distanceInterval: tuning.distanceIntervalM,
          timeInterval: tuning.timeIntervalMs,
          activityType: mode === "car" ? Location.ActivityType.AutomotiveNavigation : Location.ActivityType.Fitness,
          pausesUpdatesAutomatically: false,
          showsBackgroundLocationIndicator: true,
          foregroundService: { notificationTitle: t.lokalizacjaWTle.tytul, notificationBody: t.lokalizacjaWTle.tresc },
        });
        usingTask = true;
      } catch {
        // Zadanie w tle niedostępne (np. Expo Go): tylko pierwszy plan.
        usingTask = false;
        sink = null;
        if (!active) return;
        subscription = await Location.watchPositionAsync(
          { accuracy, distanceInterval: tuning.distanceIntervalM, timeInterval: tuning.timeIntervalMs },
          (loc) => onSample(sampleFromLocation(loc)),
          (reason) => onError(new Error(reason)),
        );
      }
    },
    stop() {
      active = false;
      sink = null;
      if (usingTask) {
        usingTask = false;
        Location.stopLocationUpdatesAsync(LOCATION_TASK).catch(() => undefined);
      }
      subscription?.remove();
      subscription = null;
    },
  };
}
