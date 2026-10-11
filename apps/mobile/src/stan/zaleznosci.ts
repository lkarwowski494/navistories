/** Prawdziwe zależności aplikacji (telefon). Testy ekranów podają atrapy. */
import { zbudujKatalog } from "../katalog/katalog";
import { DEMO } from "../katalog/demo";
import { createExpoLocationSource } from "../system/lokalizacja";
import { createExpoStoryPlayer } from "../system/odtwarzacz";
import { asyncStorageUstawienia } from "../system/ustawienia";
import { systemClock } from "../system/zegar";
import type { Zaleznosci } from "./aplikacja";

const katalog = zbudujKatalog(DEMO);
if (katalog.bledy.length) console.warn(`Pominięte pakiety:\n${katalog.bledy.join("\n")}`);

export const zaleznosciSystemowe: Zaleznosci = {
  katalog,
  ustawienia: asyncStorageUstawienia,
  zegar: systemClock,
  lokalizacja: createExpoLocationSource,
  odtwarzacz: (k) => createExpoStoryPlayer((ref) => k.audio(ref)),
};
