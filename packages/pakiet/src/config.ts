/**
 * Jedyne miejsce liczb konfiguracyjnych formatu pakietu.
 */

/** Wersja formatu pakietu, którą rozumie ta aplikacja. Zmiana niezgodna wstecz = nowa wersja. */
export const FORMAT_VERSION = 1;

/**
 * Zapas na zaokrąglenia przy sprawdzaniu, czy postęp punktu mieści się w
 * długości trasy (warsztat i aplikacja liczą długość tą samą metodą, ale z
 * zaokrąglonych współrzędnych) [m]. Wartość techniczna, nie do kalibracji.
 */
export const PROGRESS_ROUNDING_TOLERANCE_M = 1;

/** Rozszerzenia plików audio, które przyjmujemy w pakiecie (obsługiwane przez odtwarzacz iOS). */
export const AUDIO_EXTENSIONS = ["m4a", "mp3", "aac", "wav"] as const;
