import type { GpsSample } from "@navistories/trigger";

/**
 * Interfejsy („porty”), za którymi stoją telefon i system. Aplikacja podaje
 * implementacje na expo-location i expo-audio; testy podają atrapy.
 */

/** Źródło próbek lokalizacji. */
export interface LocationSource {
  /**
   * Prosi o uprawnienie i zaczyna dostarczać próbki. Odrzuca obietnicę
   * (np. LocationPermissionError), jeśli nie da się zacząć.
   */
  start(onSample: (s: GpsSample) => void, onError: (e: Error) => void): Promise<void>;
  stop(): void;
}

/** Brak uprawnienia do lokalizacji. */
export class LocationPermissionError extends Error {
  constructor() {
    super("Brak uprawnienia do lokalizacji");
    this.name = "LocationPermissionError";
  }
}

/** Historia do zagrania: plik audio z pakietu. */
export interface StoryRef {
  readonly pakietId: string;
  readonly pointId: string;
  /** Ścieżka względna w pakiecie (points[].audio). */
  readonly audio: string;
}

/** Odtwarzacz historii (jedna naraz). */
export interface StoryPlayer {
  /** Zaczyna historię od początku (przerywa poprzednią, jeśli grała). */
  play(story: StoryRef): void;
  pause(): void;
  resume(): void;
  /** Zatrzymuje bieżącą historię bez zgłaszania końca. */
  stop(): void;
  /**
   * Wywołanie, gdy historia skończyła się sama albo nie dała się odtworzyć
   * (błąd pliku): sesja w obu przypadkach idzie dalej.
   */
  setOnEnded(cb: ((pointId: string) => void) | null): void;
}

/** Czas i zegar (w testach sterowany ręcznie). */
export interface Clock {
  /** Bieżący czas [s], ta sama epoka co t w próbkach GPS. */
  now(): number;
  setTimeout(fn: () => void, ms: number): unknown;
  clearTimeout(handle: unknown): void;
}

