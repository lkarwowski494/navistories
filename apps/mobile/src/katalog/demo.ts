/**
 * Pakiety demonstracyjne (syntetyczne, generuje je scripts/generuj-demo.mjs).
 * Pliki .wav powstają przy `pnpm install` (postinstall) i nie są w repozytorium.
 * Metro wymaga statycznych `require` dla zasobów, stąd jawna mapa.
 */
import type { SurowyPakiet } from "./katalog";

export const DEMO: readonly SurowyPakiet[] = [
  {
    json: require("../../assets/demo/demo-samochod/pakiet.json"),
    audio: {
      "audio/ton-1.wav": require("../../assets/demo/demo-samochod/audio/ton-1.wav"),
      "audio/ton-2.wav": require("../../assets/demo/demo-samochod/audio/ton-2.wav"),
      "audio/ton-3.wav": require("../../assets/demo/demo-samochod/audio/ton-3.wav"),
    },
  },
  {
    json: require("../../assets/demo/demo-spacer/pakiet.json"),
    audio: {
      "audio/ton-1.wav": require("../../assets/demo/demo-spacer/audio/ton-1.wav"),
      "audio/ton-2.wav": require("../../assets/demo/demo-spacer/audio/ton-2.wav"),
      "audio/ton-3.wav": require("../../assets/demo/demo-spacer/audio/ton-3.wav"),
    },
  },
];
