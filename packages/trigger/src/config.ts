/**
 * Jedyne miejsce liczb konfiguracyjnych logiki wyzwalania.
 *
 * Żadna z tych wartości nie pochodzi z literatury ani z pomiarów: każda jest
 * oznaczona „(kal.)”, czyli to propozycja inżynierska do kalibracji na
 * prawdziwych przejazdach i spacerach. Zmieniaj je tylko tutaj; reszta kodu je
 * importuje (pilnuje tego test `test/config.test.ts`).
 *
 * Profil ruchu to wyłącznie dane: ten sam kod obsługuje samochód i pieszego.
 * Jednostki: metry, sekundy, metry na sekundę.
 */

export interface MotionProfile {
  /** Nazwa profilu (do logów i testów). */
  readonly name: string;

  // --- odrzucanie złych próbek GPS ---
  /** Próbka z deklarowaną dokładnością gorszą niż ta wartość jest odrzucana [m]. */
  readonly maxAccuracyM: number;
  /** Największa wiarygodna prędkość między dwiema próbkami [m/s]. */
  readonly maxSpeedMps: number;
  /** Zapas na szum przy teście skoku: dopuszczalny skok = maxSpeedMps·dt + jumpToleranceM [m]. */
  readonly jumpToleranceM: number;
  /** Po tylu kolejnych odrzuceniach za skok przyjmujemy próbkę i zaczynamy od niej od nowa. */
  readonly maxConsecutiveRejects: number;

  // --- zjazd z trasy (histereza) ---
  /** Odległość boczna, powyżej której próbka liczy się jako „poza trasą” [m]. */
  readonly offRouteDistanceM: number;
  /** Odległość boczna, poniżej której próbka liczy się jako „na trasie” (mniejsza niż powyżej: histereza) [m]. */
  readonly onRouteDistanceM: number;
  /** Tyle kolejnych próbek „poza trasą”, żeby uznać zjazd. */
  readonly offRouteSamples: number;
  /** Tyle kolejnych próbek „na trasie”, żeby uznać powrót. */
  readonly onRouteSamples: number;

  // --- wyprzedzenie (start historii przed punktem) ---
  /** Wyprzedzenie w czasie: wyprzedzenie [m] = prędkość · leadTimeS, przycięte do [minLeadM, maxLeadM] [s]. */
  readonly leadTimeS: number;
  /** Najmniejsze wyprzedzenie [m]. */
  readonly minLeadM: number;
  /** Największe wyprzedzenie [m]. */
  readonly maxLeadM: number;

  // --- przerwy w GPS i kolejka ---
  /** Odstęp między przyjętymi próbkami dłuższy niż ten oznacza przerwę w GPS (np. tunel) [s]. */
  readonly gpsGapS: number;
  /** Historia, której punkt został w tyle o więcej niż tyle metrów, jest pomijana zamiast odtwarzana [m]. */
  readonly staleAfterM: number;
  /** Minimalny odstęp między końcem jednej historii a startem następnej [s]. */
  readonly minGapBetweenStoriesS: number;

  // --- okno szukania rzutu na trasę ---
  /** O ile metrów wstecz od najdalszego osiągniętego postępu wolno rzutować próbkę [m]. */
  readonly backWindowM: number;
  /** Zapas do przodu ponad maxSpeedMps·dt przy rzutowaniu próbki [m]. */
  readonly forwardSlackM: number;
}

/** Samochód: prędkości do ok. 140 km/h, rzadziej gęste punkty, lepszy widok nieba. */
export const CAR: MotionProfile = {
  name: "car",
  maxAccuracyM: 50, // (kal.) propozycja inżynierska do kalibracji
  maxSpeedMps: 70, // (kal.) propozycja inżynierska do kalibracji; ok. 250 km/h, zapas ponad 140 km/h
  jumpToleranceM: 50, // (kal.) propozycja inżynierska do kalibracji
  maxConsecutiveRejects: 5, // (kal.) propozycja inżynierska do kalibracji
  offRouteDistanceM: 60, // (kal.) propozycja inżynierska do kalibracji
  onRouteDistanceM: 35, // (kal.) propozycja inżynierska do kalibracji
  offRouteSamples: 3, // (kal.) propozycja inżynierska do kalibracji
  onRouteSamples: 3, // (kal.) propozycja inżynierska do kalibracji
  leadTimeS: 6, // (kal.) propozycja inżynierska do kalibracji
  minLeadM: 30, // (kal.) propozycja inżynierska do kalibracji
  maxLeadM: 250, // (kal.) propozycja inżynierska do kalibracji
  gpsGapS: 10, // (kal.) propozycja inżynierska do kalibracji
  staleAfterM: 1500, // (kal.) propozycja inżynierska do kalibracji
  minGapBetweenStoriesS: 3, // (kal.) propozycja inżynierska do kalibracji
  backWindowM: 100, // (kal.) propozycja inżynierska do kalibracji
  forwardSlackM: 100, // (kal.) propozycja inżynierska do kalibracji
};

/** Pieszo: ok. 3–6 km/h, gęste punkty, duży szum GPS między budynkami. */
export const WALK: MotionProfile = {
  name: "walk",
  maxAccuracyM: 30, // (kal.) propozycja inżynierska do kalibracji
  maxSpeedMps: 4, // (kal.) propozycja inżynierska do kalibracji; ok. 14 km/h, zapas ponad 6 km/h
  jumpToleranceM: 30, // (kal.) propozycja inżynierska do kalibracji
  maxConsecutiveRejects: 8, // (kal.) propozycja inżynierska do kalibracji
  offRouteDistanceM: 35, // (kal.) propozycja inżynierska do kalibracji
  onRouteDistanceM: 20, // (kal.) propozycja inżynierska do kalibracji
  offRouteSamples: 6, // (kal.) propozycja inżynierska do kalibracji
  onRouteSamples: 4, // (kal.) propozycja inżynierska do kalibracji
  leadTimeS: 5, // (kal.) propozycja inżynierska do kalibracji
  minLeadM: 5, // (kal.) propozycja inżynierska do kalibracji
  maxLeadM: 15, // (kal.) propozycja inżynierska do kalibracji
  gpsGapS: 30, // (kal.) propozycja inżynierska do kalibracji
  staleAfterM: 150, // (kal.) propozycja inżynierska do kalibracji
  minGapBetweenStoriesS: 3, // (kal.) propozycja inżynierska do kalibracji
  backWindowM: 30, // (kal.) propozycja inżynierska do kalibracji
  forwardSlackM: 40, // (kal.) propozycja inżynierska do kalibracji
};

export const PROFILES = { car: CAR, walk: WALK } as const;
export type ProfileName = keyof typeof PROFILES;

/**
 * Wspólne dla wszystkich profili: dwa rzuty na trasę, których odległości boczne
 * różnią się mniej niż ta wartość, uznajemy za równie dobre i wybieramy ten
 * bliższy dotychczasowemu postępowi (trasy „tam i z powrotem” tą samą ulicą) [m].
 */
export const ROUTE_PROJECTION_TIE_M = 1; // (kal.) propozycja inżynierska do kalibracji
