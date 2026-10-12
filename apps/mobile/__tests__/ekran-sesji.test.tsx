import { routeOf } from "@navistories/pakiet";
import { pointAtProgress, type GpsSample } from "@navistories/trigger";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Linking } from "react-native";
import { EkranSesji } from "../src/ekrany/EkranSesji";
import { EkranZrodel } from "../src/ekrany/EkranZrodel";
import { atrapy } from "./pomoc/atrapy";
import { mockParams, mockRouter } from "./pomoc/router";

jest.mock("expo-router", () => require("./pomoc/router").expoRouterMock());

beforeEach(() => {
  jest.clearAllMocks();
  mockParams.current = {};
});

type A = ReturnType<typeof atrapy>;

/** Próbka na trasie pakietu w danym postępie. */
function probka(a: A, pakietId: string, progressM: number, t: number, speedMps: number): GpsSample {
  const p = pointAtProgress(routeOf(a.katalog.pakiet(pakietId)!), progressM);
  return { lat: p.lat, lon: p.lon, t, accuracyM: 5, speedMps };
}

async function dojedz(a: A, pakietId: string, progressM: number[], speedMps: number) {
  const loc = a.lokalizacje[a.lokalizacje.length - 1]!;
  let t = 1000;
  for (const m of progressM) {
    await act(async () => loc.onSample?.(probka(a, pakietId, m, t, speedMps)));
    t += 10;
  }
}

async function wystartuj(pakiet: string, motywy?: string, aiGenerated?: { text: boolean; voice: boolean }) {
  const a = atrapy({ aiGenerated });
  mockParams.current = { pakiet, ...(motywy ? { motywy } : {}) };
  await render(<EkranSesji />, { wrapper: a.Owijka });
  return a;
}

describe("ekran jazdy: start", () => {
  it("nie startuje sam: lokalizacja dopiero po naciśnięciu Start", async () => {
    const a = await wystartuj("demo-samochod");
    expect(a.lokalizacje[0]?.startow ?? 0).toBe(0);
    await fireEvent.press(screen.getByRole("button", { name: "Start" }));
    expect(a.lokalizacje[0]!.startow).toBe(1);
    expect(screen.getByText("Szukam pozycji…")).toBeOnTheScreen();
  });

  it("nieznany pakiet: komunikat zamiast ekranu jazdy", async () => {
    await wystartuj("nie-ma");
    expect(screen.getByText("Nie znaleziono trasy.")).toBeOnTheScreen();
  });
});

describe("ekran jazdy: w ruchu tylko stan i trzy przyciski", () => {
  it("gra historię, pauza / graj, następna; w samochodzie bez przycisku Źródła", async () => {
    const a = await wystartuj("demo-samochod");
    await fireEvent.press(screen.getByRole("button", { name: "Start" }));
    await dojedz(a, "demo-samochod", [0, 100, 200, 300, 400, 450], 10);

    expect(screen.getByTestId("stan-sesji")).toHaveTextContent("Gra");
    expect(screen.getByText(/Punkt demonstracyjny 1/)).toBeOnTheScreen();
    expect(a.odtwarzacze[0]!.log).toEqual(["play:punkt-1"]);
    expect(screen.queryByRole("button", { name: "Źródła" })).toBeNull();

    await fireEvent.press(screen.getByRole("button", { name: "Pauza" }));
    expect(screen.getByTestId("stan-sesji")).toHaveTextContent("Pauza");
    await fireEvent.press(screen.getByRole("button", { name: "Graj" }));
    await fireEvent.press(screen.getByRole("button", { name: "Następna" }));
    expect(a.odtwarzacze[0]!.log).toEqual(["play:punkt-1", "pause", "resume", "stop"]);
    expect(screen.getByRole("button", { name: "Następna" })).toBeDisabled();

    const przyciski = screen.getAllByRole("button").map((b) => b.props.accessibilityLabel);
    expect(przyciski).toEqual(["Pauza", "Następna", "Zakończ"]);
  });

  it("poza trasą: stan „Poza trasą”", async () => {
    const a = await wystartuj("demo-samochod");
    await fireEvent.press(screen.getByRole("button", { name: "Start" }));
    await dojedz(a, "demo-samochod", [0, 50], 10);
    const loc = a.lokalizacje[0]!;
    // 300 m w bok od trasy (trasa biegnie na wschód wzdłuż 52°N)
    for (let i = 0; i < 4; i++) {
      await act(async () => loc.onSample?.({ lat: 52.0027, lon: 21.001 + i * 0.0001, t: 1100 + i * 5, accuracyM: 5, speedMps: 2 }));
    }
    expect(screen.getByTestId("stan-sesji")).toHaveTextContent("Poza trasą");
  });

  it("filtr motywów z parametrów: historia z wyłączonego motywu nie gra", async () => {
    const a = await wystartuj("demo-samochod", "demo-a");
    await fireEvent.press(screen.getByRole("button", { name: "Start" }));
    await dojedz(a, "demo-samochod", [0, 200, 400, 600, 800, 1000, 1150, 1200], 20);
    expect(a.odtwarzacze[0]!.log.filter((x) => x.startsWith("play"))).toEqual(["play:punkt-1"]);
    // punkt-2 (motyw B) nie czeka nawet w kolejce
    expect(screen.queryByText(/W kolejce/)).toBeNull();
  });

  it("bez filtra: punkt z motywu B czeka w kolejce za grającą historią", async () => {
    const a = await wystartuj("demo-samochod");
    await fireEvent.press(screen.getByRole("button", { name: "Start" }));
    await dojedz(a, "demo-samochod", [0, 200, 400, 600, 800, 1000, 1150, 1200], 20);
    expect(screen.getByText("W kolejce: 1")).toBeOnTheScreen();
  });
});

describe("ekran jazdy: źródła", () => {
  it("spacer: przycisk Źródła bieżącej historii w trakcie", async () => {
    const a = await wystartuj("demo-spacer");
    await fireEvent.press(screen.getByRole("button", { name: "Start" }));
    await dojedz(a, "demo-spacer", [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 295], 1.4);
    expect(screen.getByTestId("stan-sesji")).toHaveTextContent("Gra");
    await fireEvent.press(screen.getByRole("button", { name: "Źródła" }));
    expect(mockRouter.push).toHaveBeenCalledWith({ pathname: "/zrodla", params: { pakiet: "demo-spacer", punkt: "punkt-1" } });
  });

  it("samochód: po zakończeniu lista wysłuchanych historii prowadzi do źródeł", async () => {
    const a = await wystartuj("demo-samochod");
    await fireEvent.press(screen.getByRole("button", { name: "Start" }));
    await dojedz(a, "demo-samochod", [0, 100, 200, 300, 400, 450], 10);
    await fireEvent.press(screen.getByRole("button", { name: "Zakończ" }));
    expect(a.lokalizacje[0]!.zatrzyman).toBe(1);
    expect(screen.getByText("Podróż zakończona")).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole("button", { name: /Punkt demonstracyjny 1/ }));
    expect(mockRouter.push).toHaveBeenCalledWith({ pathname: "/zrodla", params: { pakiet: "demo-samochod", punkt: "punkt-1" } });
    await fireEvent.press(screen.getByRole("button", { name: "Nowa podróż" }));
    expect(mockRouter.dismissTo).toHaveBeenCalledWith("/");
  });

  it("ekran Źródła: instytucje i adresy, adres otwiera się w przeglądarce", async () => {
    const a = atrapy();
    mockParams.current = { pakiet: "demo-spacer", punkt: "punkt-2" };
    const open = jest.spyOn(Linking, "openURL").mockResolvedValue(true);
    await render(<EkranZrodel />, { wrapper: a.Owijka });
    expect(screen.getByText("Instytucja przykładowa (dane demonstracyjne)")).toBeOnTheScreen();
    expect(screen.getByText("https://example.org/navistories-demo/zrodlo-2")).toBeOnTheScreen();
    expect(screen.getByText("Archiwum przykładowe (dane demonstracyjne)")).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole("link", { name: "Otwórz źródło: Archiwum przykładowe (dane demonstracyjne)" }));
    expect(open).toHaveBeenCalledWith("https://example.org/navistories-demo/archiwum-2");
  });

  it("ekran Źródła: nieznany punkt", async () => {
    const a = atrapy();
    mockParams.current = { pakiet: "demo-spacer", punkt: "nie-ma" };
    await render(<EkranZrodel />, { wrapper: a.Owijka });
    expect(screen.getByText("Nie znaleziono historii.")).toBeOnTheScreen();
  });
});

describe("ekran jazdy: stałe oznaczenie AI (decyzja właściciela 12.10.2026)", () => {
  const TEKST_I_GLOS = "Tekst i głos wygenerowane z pomocą AI. Fakty sprawdzone w źródłach.";
  const TYLKO_TEKST = "Tekst wygenerowany z pomocą AI. Fakty sprawdzone w źródłach.";
  const TYLKO_GLOS = "Głos wygenerowany przez AI. Fakty sprawdzone w źródłach.";
  // Czytnik ekranu: pełne zdanie, „sztuczna inteligencja” zamiast skrótu „AI”.
  const CZYTNIK_TEKST_I_GLOS = "Tekst i głos wygenerowane z pomocą sztucznej inteligencji. Fakty sprawdzone w źródłach.";
  const CZYTNIK_TYLKO_TEKST = "Tekst wygenerowany z pomocą sztucznej inteligencji. Fakty sprawdzone w źródłach.";
  const CZYTNIK_TYLKO_GLOS = "Głos wygenerowany przez sztuczną inteligencję. Fakty sprawdzone w źródłach.";

  function oznaczenie() {
    return screen.getByTestId("oznaczenie-ai");
  }

  it("tekst i głos z AI: napis przed startem, w trakcie i po zakończeniu; dostępny, nie przycisk", async () => {
    const a = await wystartuj("demo-samochod", undefined, { text: true, voice: true });
    expect(oznaczenie()).toHaveTextContent(TEKST_I_GLOS);
    expect(oznaczenie().props.accessibilityRole).toBe("text");
    expect(oznaczenie().props.accessibilityLabel).toBe(CZYTNIK_TEKST_I_GLOS);
    expect(screen.getByLabelText(CZYTNIK_TEKST_I_GLOS)).toBe(oznaczenie());

    await fireEvent.press(screen.getByRole("button", { name: "Start" }));
    await dojedz(a, "demo-samochod", [0, 100, 200, 300, 400, 450], 10);
    expect(screen.getByTestId("stan-sesji")).toHaveTextContent("Gra");
    expect(oznaczenie()).toHaveTextContent(TEKST_I_GLOS);
    // nie jest przyciskiem: w ruchu nadal tylko trzy przyciski
    expect(screen.getAllByRole("button").map((b) => b.props.accessibilityLabel)).toEqual(["Pauza", "Następna", "Zakończ"]);

    await fireEvent.press(screen.getByRole("button", { name: "Zakończ" }));
    expect(oznaczenie()).toHaveTextContent(TEKST_I_GLOS);
  });

  it("spacer: ten sam napis w trakcie", async () => {
    const a = await wystartuj("demo-spacer", undefined, { text: true, voice: true });
    await fireEvent.press(screen.getByRole("button", { name: "Start" }));
    await dojedz(a, "demo-spacer", [0, 15, 30], 1.4);
    expect(oznaczenie()).toHaveTextContent(TEKST_I_GLOS);
  });

  it("pakiet deklaruje tylko tekst z AI", async () => {
    await wystartuj("demo-samochod", undefined, { text: true, voice: false });
    expect(oznaczenie()).toHaveTextContent(TYLKO_TEKST);
    expect(oznaczenie().props.accessibilityLabel).toBe(CZYTNIK_TYLKO_TEKST);
  });

  it("pakiet deklaruje tylko głos z AI", async () => {
    await wystartuj("demo-samochod", undefined, { text: false, voice: true });
    expect(oznaczenie()).toHaveTextContent(TYLKO_GLOS);
    expect(oznaczenie().props.accessibilityLabel).toBe(CZYTNIK_TYLKO_GLOS);
  });

  it("pakiet demo (syntetyczne tony, aiGenerated: false/false): bez napisu, bo nie byłby prawdziwy", async () => {
    const a = await wystartuj("demo-samochod");
    expect(a.katalog.pakiet("demo-samochod")!.aiGenerated).toEqual({ text: false, voice: false });
    expect(screen.queryByTestId("oznaczenie-ai")).toBeNull();
  });
});
