/**
 * Wszystkie teksty interfejsu w jednym miejscu (polski). Tłumaczenie = nowy
 * obiekt o tym samym kształcie (typ `Teksty`).
 */
export const pl = {
  aplikacja: "NaviStories",

  ujawnienie: {
    tytul: "Zanim zaczniesz",
    tresc:
      "Historie w NaviStories są pisane z pomocą sztucznej inteligencji (AI) i czytane głosem generowanym przez AI. " +
      "Każdy fakt sprawdzamy w źródłach; dla każdej historii możesz zobaczyć listę instytucji i adresów, z których pochodzą informacje.",
    przycisk: "Rozumiem",
  },

  start: {
    pytanie: "Jak dziś podróżujesz?",
    samochod: "Samochodem",
    samochodOpis: "Historie o miejscach mijanych na trasie",
    spacer: "Pieszo",
    spacerOpis: "Spacer z historiami po okolicy",
  },

  spacer: {
    tytul: "Spacer",
    motyw: "Motyw",
    dlugosc: "Długość",
    dlugoscOpcja: (min: number) => `ok. ${min} min`,
    spacery: "Spacery",
    brak: "Brak spaceru dla tego motywu i długości.",
    brakMotywow: "Brak dostępnych spacerów.",
  },

  samochod: {
    tytul: "Samochód",
    trasa: "Trasa",
    motywy: "Motywy",
    motywyOpis: "Wybierz, o czym chcesz słuchać.",
    brak: "Brak dostępnych tras.",
    dalej: "Dalej",
    wybierzMotyw: "Wybierz co najmniej jeden motyw.",
  },

  sesja: {
    start: "Start",
    startOpis: "Historie zaczną się, gdy dotrzesz do pierwszego punktu.",
    stop: "Zakończ",
    graj: "Graj",
    pauza: "Pauza",
    nastepna: "Następna",
    zrodla: "Źródła",
    stan: {
      playing: "Gra",
      queued: "W kolejce",
      "off-route": "Poza trasą",
      waiting: "Na trasie, czekam na następną historię",
      "no-fix": "Szukam pozycji…",
    },
    wKolejce: (n: number) => `W kolejce: ${n}`,
    zatrzymana: "Pauza",
    blad: {
      "location-permission": "Bez dostępu do lokalizacji historie nie mogą się włączać. Zezwól na lokalizację „Podczas używania” w Ustawieniach.",
      location: "Nie udało się włączyć lokalizacji.",
    },
    koniec: "Podróż zakończona",
    zagrane: "Wysłuchane historie",
    brakZagranych: "Żadna historia nie została odtworzona.",
    nowa: "Nowa podróż",
    brakPakietu: "Nie znaleziono trasy.",
  },

  lokalizacjaWTle: {
    // Android: powiadomienie usługi pierwszoplanowej, gdy lokalizacja działa przy zablokowanym ekranie.
    tytul: "NaviStories śledzi trasę",
    tresc: "Historie włączą się przy kolejnych miejscach.",
  },

  zrodla: {
    tytul: "Źródła",
    wstep: "Informacje w tej historii pochodzą z:",
    ai: "Tekst i głos tej historii zostały wygenerowane z pomocą AI.",
    aiTekst: "Tekst tej historii został wygenerowany z pomocą AI.",
    aiGlos: "Głos tej historii został wygenerowany przez AI.",
    otworz: (instytucja: string) => `Otwórz źródło: ${instytucja}`,
    brak: "Nie znaleziono historii.",
  },
} as const;

export type Teksty = typeof pl;

/** Bieżący język interfejsu. */
export const t: Teksty = pl;
