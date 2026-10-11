/**
 * Odtwarzacz historii na expo-audio (decyzja D4), z odtwarzaniem w tle
 * (tryb tła `audio` dodaje plugin expo-audio w app.json).
 *
 * interruptionMode „duckOthers”: historia przycisza muzykę z innej aplikacji,
 * zamiast ją zatrzymywać. Bez sterowania z ekranu blokady (wymagałoby
 * „doNotMix”; w samochodzie i tak nie obsługujemy telefonu w ruchu).
 */
import type { StoryPlayer, StoryRef } from "@navistories/sesja";
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer, type AudioSource } from "expo-audio";

export type AudioResolver = (ref: StoryRef) => AudioSource | null;

let audioModeSet: Promise<void> | null = null;
function ensureAudioMode(): Promise<void> {
  audioModeSet ??= setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: true,
    interruptionMode: "duckOthers",
  }).catch(() => {
    audioModeSet = null;
  });
  return audioModeSet;
}

export function createExpoStoryPlayer(resolve: AudioResolver): StoryPlayer & { release(): void } {
  let player: AudioPlayer | null = null;
  let current: string | null = null;
  let onEnded: ((id: string) => void) | null = null;

  const finish = () => {
    const id = current;
    current = null;
    if (id !== null) onEnded?.(id);
  };

  const get = (): AudioPlayer => {
    if (!player) {
      player = createAudioPlayer(null);
      player.addListener("playbackStatusUpdate", (status) => {
        if (current === null) return;
        // Koniec albo błąd pliku: w obu przypadkach sesja idzie dalej.
        if (status.didJustFinish || status.error) finish();
      });
    }
    return player;
  };

  return {
    play(ref) {
      void ensureAudioMode();
      const source = resolve(ref);
      current = ref.pointId;
      if (source === null) {
        // Brak pliku w pakiecie: zgłoś koniec asynchronicznie (jak odtwarzacz).
        setTimeout(finish, 0);
        return;
      }
      const p = get();
      p.replace(source);
      p.play();
    },
    pause() {
      player?.pause();
    },
    resume() {
      if (current !== null) player?.play();
    },
    stop() {
      current = null;
      player?.pause();
    },
    setOnEnded(cb) {
      onEnded = cb;
    },
    release() {
      current = null;
      onEnded = null;
      player?.remove();
      player = null;
    },
  };
}
