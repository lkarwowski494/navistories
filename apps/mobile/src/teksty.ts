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
    oAplikacji: "O aplikacji",
  },

  // Ekran „O aplikacji” (decyzja właściciela 12.10.2026; ujawnianie AI wg AI Act art. 50).
  oAplikacji: {
    tytul: "O aplikacji",
    redakcjaNaglowek: "Redakcja",
    redakcja: (osoba: string) => `Za treści historii redakcyjnie odpowiada ${osoba}.`,
    kontakt: (adres: string) => `Kontakt z redakcją: ${adres}`,
    kontaktBrak: "Kontakt z redakcją zostanie uzupełniony.",
    procesNaglowek: "Jak powstają historie",
    proces:
      "Teksty historii są przygotowywane z pomocą sztucznej inteligencji (AI). " +
      "Fakty sprawdza człowiek względem źródeł, które podajemy przy każdej historii. " +
      "Głos lektora jest wygenerowany przez AI.",
    mapyNaglowek: "Dane map",
    mapy: "Dane tras: © OpenStreetMap contributors, licencja ODbL.",
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
    // Stałe oznaczenie AI na ekranie odtwarzania (decyzja właściciela 12.10.2026); wariant według aiGenerated pakietu.
    // Brzmienie za zaakceptowanym ujawnieniem (`ujawnienie.tresc`) i oznaczeniem w `zrodla`.
    ai: {
      tekstIGlos: "Tekst i głos wygenerowane z pomocą AI. Fakty sprawdzone w źródłach.",
      tekst: "Tekst wygenerowany z pomocą AI. Fakty sprawdzone w źródłach.",
      glos: "Głos wygenerowany przez AI. Fakty sprawdzone w źródłach.",
    },
    // To samo dla czytnika ekranu (VoiceOver/TalkBack): pełne słowa zamiast skrótu „AI”.
    aiCzytnik: {
      tekstIGlos: "Tekst i głos wygenerowane z pomocą sztucznej inteligencji. Fakty sprawdzone w źródłach.",
      tekst: "Tekst wygenerowany z pomocą sztucznej inteligencji. Fakty sprawdzone w źródłach.",
      glos: "Głos wygenerowany przez sztuczną inteligencję. Fakty sprawdzone w źródłach.",
    },
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
