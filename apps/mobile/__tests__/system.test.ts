/**
 * Implementacje portów na expo-location i expo-audio, z atrapami modułów
 * natywnych (sprawdzamy, jak wołamy API; prawdziwe działanie: na telefonie).
 */
import { LocationPermissionError } from "@navistories/sesja";

const mockLocation = {
  requestForegroundPermissionsAsync: jest.fn(),
  startLocationUpdatesAsync: jest.fn(),
  stopLocationUpdatesAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  Accuracy: { BestForNavigation: 6 },
  ActivityType: { AutomotiveNavigation: 2, Fitness: 3 },
};
const mockTasks: Record<string, (body: unknown) => Promise<void>> = {};

jest.mock("expo-location", () => mockLocation);
jest.mock("expo-task-manager", () => ({
  defineTask: (name: string, fn: (body: unknown) => Promise<void>) => {
    mockTasks[name] = fn;
  },
}));

type Listener = (status: { didJustFinish: boolean; error: string | null }) => void;
const mockPlayer = {
  replace: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  remove: jest.fn(),
  listener: null as Listener | null,
  addListener: jest.fn((_: string, l: Listener) => {
    mockPlayer.listener = l;
  }),
};
const mockSetAudioMode = jest.fn().mockResolvedValue(undefined);
jest.mock("expo-audio", () => ({
  createAudioPlayer: jest.fn(() => mockPlayer),
  setAudioModeAsync: (...a: unknown[]) => mockSetAudioMode(...a),
}));

// Moduły ładowane po przygotowaniu atrap (importy byłyby wyniesione przed nie).
const { createExpoLocationSource, LOCATION_TASK } = require("../src/system/lokalizacja") as typeof import("../src/system/lokalizacja");
const { createExpoStoryPlayer } = require("../src/system/odtwarzacz") as typeof import("../src/system/odtwarzacz");

beforeEach(() => {
  jest.clearAllMocks();
  mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: "granted" });
  mockLocation.startLocationUpdatesAsync.mockResolvedValue(undefined);
  mockLocation.stopLocationUpdatesAsync.mockResolvedValue(undefined);
  mockLocation.watchPositionAsync.mockResolvedValue({ remove: jest.fn() });
});

const loc = (lat: number, ts: number) => ({ timestamp: ts, coords: { latitude: lat, longitude: 21, accuracy: 5, speed: 10 } });

describe("lokalizacja (expo-location)", () => {
  it("prosi tylko o uprawnienie „Podczas używania” i odmowę zgłasza jako LocationPermissionError", async () => {
    mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: "denied" });
    await expect(createExpoLocationSource("car").start(jest.fn(), jest.fn())).rejects.toBeInstanceOf(LocationPermissionError);
    expect(mockLocation.startLocationUpdatesAsync).not.toHaveBeenCalled();
  });

  it("samochód: zadanie w tle z nawigacją samochodową i wskaźnikiem tła; próbki z zadania trafiają do sesji", async () => {
    const onSample = jest.fn();
    const src = createExpoLocationSource("car");
    await src.start(onSample, jest.fn());
    expect(mockLocation.startLocationUpdatesAsync).toHaveBeenCalledWith(
      LOCATION_TASK,
      expect.objectContaining({ activityType: 2, showsBackgroundLocationIndicator: true, pausesUpdatesAutomatically: false }),
    );
    await mockTasks[LOCATION_TASK]!({ data: { locations: [loc(52, 1000), loc(52.001, 2000)] }, error: null });
    expect(onSample.mock.calls.map((c) => c[0].t)).toEqual([1, 2]);
    src.stop();
    expect(mockLocation.stopLocationUpdatesAsync).toHaveBeenCalledWith(LOCATION_TASK);
    await mockTasks[LOCATION_TASK]!({ data: { locations: [loc(52, 3000)] }, error: null });
    expect(onSample).toHaveBeenCalledTimes(2);
  });

  it("bez zadania w tle (np. Expo Go): rezerwa watchPositionAsync na pierwszym planie", async () => {
    mockLocation.startLocationUpdatesAsync.mockRejectedValue(new Error("LocationUpdatesUnavailable"));
    const sub = { remove: jest.fn() };
    mockLocation.watchPositionAsync.mockResolvedValue(sub);
    const onSample = jest.fn();
    const src = createExpoLocationSource("walk");
    await src.start(onSample, jest.fn());
    const cb = mockLocation.watchPositionAsync.mock.calls[0][1];
    cb(loc(52, 5000));
    expect(onSample).toHaveBeenCalledWith(expect.objectContaining({ lat: 52, t: 5 }));
    src.stop();
    expect(sub.remove).toHaveBeenCalled();
    expect(mockLocation.stopLocationUpdatesAsync).not.toHaveBeenCalled();
  });

  it("błąd zadania przekazany do sesji", async () => {
    const onError = jest.fn();
    await createExpoLocationSource("car").start(jest.fn(), onError);
    await mockTasks[LOCATION_TASK]!({ data: null, error: { code: 1, message: "kCLErrorDenied" } });
    expect(onError).toHaveBeenCalledWith(new Error("kCLErrorDenied"));
  });
});

describe("odtwarzacz (expo-audio)", () => {
  const ref = { pakietId: "p", pointId: "a", audio: "audio/a.wav" };

  it("odtwarzanie w tle, przyciszanie innych aplikacji; koniec pliku zgłoszony sesji", async () => {
    const onEnded = jest.fn();
    const player = createExpoStoryPlayer(() => 42);
    player.setOnEnded(onEnded);
    player.play(ref);
    expect(mockSetAudioMode).toHaveBeenCalledWith({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: "duckOthers" });
    expect(mockPlayer.replace).toHaveBeenCalledWith(42);
    expect(mockPlayer.play).toHaveBeenCalled();
    mockPlayer.listener!({ didJustFinish: true, error: null });
    expect(onEnded).toHaveBeenCalledWith("a");
    mockPlayer.listener!({ didJustFinish: true, error: null });
    expect(onEnded).toHaveBeenCalledTimes(1);
  });

  it("błąd pliku też kończy historię; zatrzymana historia nie zgłasza końca", () => {
    const onEnded = jest.fn();
    const player = createExpoStoryPlayer(() => 1);
    player.setOnEnded(onEnded);
    player.play(ref);
    mockPlayer.listener!({ didJustFinish: false, error: "brak pliku" });
    expect(onEnded).toHaveBeenCalledWith("a");
    player.play({ ...ref, pointId: "b" });
    player.stop();
    mockPlayer.listener!({ didJustFinish: true, error: null });
    expect(onEnded).toHaveBeenCalledTimes(1);
  });

  it("brak pliku w pakiecie: koniec zgłoszony asynchronicznie, bez odtwarzania", () => {
    jest.useFakeTimers();
    const onEnded = jest.fn();
    const player = createExpoStoryPlayer(() => null);
    player.setOnEnded(onEnded);
    player.play(ref);
    expect(onEnded).not.toHaveBeenCalled();
    jest.runAllTimers();
    expect(onEnded).toHaveBeenCalledWith("a");
    jest.useRealTimers();
  });

  it("pauza i wznowienie", () => {
    const player = createExpoStoryPlayer(() => 1);
    player.play(ref);
    player.pause();
    expect(mockPlayer.pause).toHaveBeenCalled();
    player.resume();
    expect(mockPlayer.play).toHaveBeenCalledTimes(2);
    player.release();
    expect(mockPlayer.remove).toHaveBeenCalled();
  });
});
