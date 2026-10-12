/** Atrapy zależności do testów ekranów (bez telefonu). */
import type { Mode } from "@navistories/pakiet";
import type { Clock, LocationSource, StoryPlayer, StoryRef } from "@navistories/sesja";
import type { GpsSample } from "@navistories/trigger";
import type { ReactNode } from "react";
import { zbudujKatalog } from "../../src/katalog/katalog";
import { DEMO } from "../../src/katalog/demo";
import { AplikacjaProvider, type Zaleznosci } from "../../src/stan/aplikacja";
import type { UstawieniaStore } from "../../src/system/ustawienia";

export class AtrapaLokalizacji implements LocationSource {
  startow = 0;
  zatrzyman = 0;
  onSample: ((s: GpsSample) => void) | null = null;
  constructor(readonly mode: Mode) {}
  async start(onSample: (s: GpsSample) => void): Promise<void> {
    this.startow++;
    this.onSample = onSample;
  }
  stop(): void {
    this.zatrzyman++;
    this.onSample = null;
  }
}

export class AtrapaOdtwarzacza implements StoryPlayer {
  readonly log: string[] = [];
  onEnded: ((id: string) => void) | null = null;
  play(r: StoryRef) {
    this.log.push(`play:${r.pointId}`);
  }
  pause() {
    this.log.push("pause");
  }
  resume() {
    this.log.push("resume");
  }
  stop() {
    this.log.push("stop");
  }
  setOnEnded(cb: ((id: string) => void) | null) {
    this.onEnded = cb;
  }
}

export class AtrapaUstawien implements UstawieniaStore {
  potwierdzone: boolean;
  constructor(potwierdzone: boolean) {
    this.potwierdzone = potwierdzone;
  }
  async czyUjawnienieAIPotwierdzone() {
    return this.potwierdzone;
  }
  async potwierdzUjawnienieAI() {
    this.potwierdzone = true;
  }
}

export const zegarTestowy: Clock = {
  now: () => 0,
  setTimeout: () => 0,
  clearTimeout: () => undefined,
};

/** Pakiety demo z podmienioną deklaracją AI (pakiety demo deklarują brak AI: tony syntetyczne). */
function demoZAI(aiGenerated: { text: boolean; voice: boolean }) {
  return DEMO.map((s) => ({ ...s, json: { ...(s.json as object), aiGenerated } }));
}

export function atrapy(opts: { potwierdzone?: boolean; aiGenerated?: { text: boolean; voice: boolean } } = {}) {
  const lokalizacje: AtrapaLokalizacji[] = [];
  const odtwarzacze: AtrapaOdtwarzacza[] = [];
  const katalog = zbudujKatalog(opts.aiGenerated ? demoZAI(opts.aiGenerated) : DEMO);
  const ustawienia = new AtrapaUstawien(opts.potwierdzone ?? true);
  const zaleznosci: Zaleznosci = {
    katalog,
    ustawienia,
    zegar: zegarTestowy,
    lokalizacja: (mode) => {
      const l = new AtrapaLokalizacji(mode);
      lokalizacje.push(l);
      return l;
    },
    odtwarzacz: () => {
      const o = new AtrapaOdtwarzacza();
      odtwarzacze.push(o);
      return o;
    },
  };
  const Owijka = ({ children }: { children: ReactNode }) => <AplikacjaProvider zaleznosci={zaleznosci}>{children}</AplikacjaProvider>;
  return { zaleznosci, katalog, ustawienia, lokalizacje, odtwarzacze, Owijka };
}
