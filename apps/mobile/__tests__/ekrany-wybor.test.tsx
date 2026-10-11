import { fireEvent, render, screen } from "@testing-library/react-native";
import { EkranSamochodu } from "../src/ekrany/EkranSamochodu";
import { EkranSpaceru } from "../src/ekrany/EkranSpaceru";
import { EkranStartowy } from "../src/ekrany/EkranStartowy";
import { EkranUjawnienia } from "../src/ekrany/EkranUjawnienia";
import { atrapy } from "./pomoc/atrapy";
import { mockRouter } from "./pomoc/router";

jest.mock("expo-router", () => require("./pomoc/router").expoRouterMock());

beforeEach(() => jest.clearAllMocks());

describe("ekran startowy", () => {
  it("przy pierwszym uruchomieniu przekierowuje do ujawnienia AI", async () => {
    const { Owijka } = atrapy({ potwierdzone: false });
    await render(<EkranStartowy />, { wrapper: Owijka });
    expect(await screen.findByText("przekierowanie:/ujawnienie-ai")).toBeOnTheScreen();
  });

  it("po ujawnieniu: wybór trybu samochód / pieszo", async () => {
    const { Owijka } = atrapy();
    await render(<EkranStartowy />, { wrapper: Owijka });
    await fireEvent.press(await screen.findByRole("button", { name: "Samochodem" }));
    expect(mockRouter.push).toHaveBeenCalledWith("/samochod");
    await fireEvent.press(screen.getByRole("button", { name: "Pieszo" }));
    expect(mockRouter.push).toHaveBeenCalledWith("/spacer");
  });
});

describe("ujawnienie AI", () => {
  it("mówi, że treść i głos są generowane przez AI, i zapamiętuje potwierdzenie", async () => {
    const { Owijka, ustawienia } = atrapy({ potwierdzone: false });
    await render(<EkranUjawnienia />, { wrapper: Owijka });
    expect(screen.getByText(/sztucznej inteligencji \(AI\)/)).toBeOnTheScreen();
    expect(screen.getByText(/głosem generowanym przez AI/)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole("button", { name: "Rozumiem" }));
    expect(ustawienia.potwierdzone).toBe(true);
    expect(mockRouter.replace).toHaveBeenCalledWith("/");
  });
});

describe("spacer: motyw i długość", () => {
  it("pokazuje motyw i opcje ok. 30/60/90 min; spacer 30 min prowadzi do sesji", async () => {
    const { Owijka } = atrapy();
    await render(<EkranSpaceru />, { wrapper: Owijka });
    expect(screen.getByRole("radio", { name: "Motyw demonstracyjny" })).toBeSelected();
    for (const d of [30, 60, 90]) expect(screen.getByRole("radio", { name: `ok. ${d} min` })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole("button", { name: /Spacer demonstracyjny/ }));
    expect(mockRouter.push).toHaveBeenCalledWith({ pathname: "/sesja", params: { pakiet: "demo-spacer" } });
  });

  it("dla innej długości: brak spaceru", async () => {
    const { Owijka } = atrapy();
    await render(<EkranSpaceru />, { wrapper: Owijka });
    await fireEvent.press(screen.getByRole("radio", { name: "ok. 60 min" }));
    expect(screen.getByText("Brak spaceru dla tego motywu i długości.")).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: /Spacer demonstracyjny/ })).toBeNull();
  });
});

describe("samochód: trasa i filtry motywów", () => {
  it("domyślnie wszystkie motywy; wyłączony motyw nie trafia do sesji", async () => {
    const { Owijka } = atrapy();
    await render(<EkranSamochodu />, { wrapper: Owijka });
    expect(screen.getByRole("radio", { name: /Trasa demonstracyjna/ })).toBeSelected();
    await fireEvent.press(screen.getByRole("checkbox", { name: "Motyw demonstracyjny B" }));
    expect(screen.getByRole("checkbox", { name: "Motyw demonstracyjny B" })).not.toBeChecked();
    await fireEvent.press(screen.getByRole("button", { name: "Dalej" }));
    expect(mockRouter.push).toHaveBeenCalledWith({ pathname: "/sesja", params: { pakiet: "demo-samochod", motywy: "demo-a" } });
  });

  it("bez żadnego motywu nie da się przejść dalej", async () => {
    const { Owijka } = atrapy();
    await render(<EkranSamochodu />, { wrapper: Owijka });
    await fireEvent.press(screen.getByRole("checkbox", { name: "Motyw demonstracyjny A" }));
    await fireEvent.press(screen.getByRole("checkbox", { name: "Motyw demonstracyjny B" }));
    expect(screen.getByText("Wybierz co najmniej jeden motyw.")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Dalej" })).toBeDisabled();
  });
});
