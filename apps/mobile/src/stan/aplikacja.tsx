/**
 * Stan aplikacji: zależności (system, katalog, ustawienia) i aktywna sesja.
 * Zależności wstrzykuje się przez <AplikacjaProvider>, więc testy ekranów
 * podają atrapy zamiast expo-location i expo-audio.
 */
import type { Mode, Pakiet } from "@navistories/pakiet";
import { createSession, type Clock, type LocationSource, type Session, type SessionView, type StoryPlayer } from "@navistories/sesja";
import { createContext, useCallback, useContext, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import type { Katalog } from "../katalog/katalog";
import type { UstawieniaStore } from "../system/ustawienia";

export interface Zaleznosci {
  readonly katalog: Katalog;
  readonly ustawienia: UstawieniaStore;
  readonly zegar: Clock;
  lokalizacja(mode: Mode): LocationSource;
  odtwarzacz(katalog: Katalog): StoryPlayer & { release?(): void };
}

export interface AktywnaSesja {
  readonly session: Session;
  readonly pakiet: Pakiet;
  readonly motywy: readonly string[] | null;
}

interface Kontekst {
  readonly zaleznosci: Zaleznosci;
  readonly aktywna: AktywnaSesja | null;
  /** Tworzy sesję dla pakietu (bez startu) i zamyka poprzednią. Zwraca null, gdy pakietu nie ma. */
  przygotuj(pakietId: string, motywy: readonly string[] | null): AktywnaSesja | null;
  /** Zamyka aktywną sesję. */
  zakoncz(): void;
}

const Ctx = createContext<Kontekst | null>(null);

export function AplikacjaProvider({ zaleznosci, children }: { zaleznosci: Zaleznosci; children: ReactNode }) {
  const [aktywna, setAktywna] = useState<AktywnaSesja | null>(null);
  const ref = useRef<{ aktywna: AktywnaSesja; player: StoryPlayer & { release?(): void } } | null>(null);

  const zamknij = useCallback(() => {
    const cur = ref.current;
    if (!cur) return;
    cur.aktywna.session.stop();
    cur.player.release?.();
    ref.current = null;
  }, []);

  const przygotuj = useCallback(
    (pakietId: string, motywy: readonly string[] | null): AktywnaSesja | null => {
      const cur = ref.current?.aktywna;
      if (cur && cur.pakiet.id === pakietId && sameThemes(cur.motywy, motywy) && cur.session.view.phase !== "stopped") return cur;
      const pakiet = zaleznosci.katalog.pakiet(pakietId);
      if (!pakiet) return null;
      zamknij();
      const player = zaleznosci.odtwarzacz(zaleznosci.katalog);
      const session = createSession({
        pakiet,
        location: zaleznosci.lokalizacja(pakiet.mode),
        player,
        clock: zaleznosci.zegar,
        ...(motywy ? { themeFilter: motywy } : {}),
      });
      const nowa: AktywnaSesja = { session, pakiet, motywy };
      ref.current = { aktywna: nowa, player };
      setAktywna(nowa);
      return nowa;
    },
    [zaleznosci, zamknij],
  );

  const zakoncz = useCallback(() => {
    zamknij();
    setAktywna(null);
  }, [zamknij]);

  const value = useMemo(() => ({ zaleznosci, aktywna, przygotuj, zakoncz }), [zaleznosci, aktywna, przygotuj, zakoncz]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function sameThemes(a: readonly string[] | null, b: readonly string[] | null): boolean {
  if (a === null || b === null) return a === b;
  return a.length === b.length && a.every((x) => b.includes(x));
}

export function useAplikacja(): Kontekst {
  const c = useContext(Ctx);
  if (!c) throw new Error("Brak AplikacjaProvider");
  return c;
}

/** Bieżący widok sesji (odświeża komponent przy każdej zmianie). */
export function useSessionView(session: Session): SessionView {
  return useSyncExternalStore(
    useCallback((cb: () => void) => session.subscribe(cb), [session]),
    () => session.view,
  );
}
