import { render, screen } from "@testing-library/react-native";
import { DANE_OSM_W_PAKIETACH, KONTAKT_REDAKCJI, REDAKCJA_OSOBA } from "../src/konfiguracja";
import { EkranOAplikacji } from "../src/ekrany/EkranOAplikacji";
import { DEMO } from "../src/katalog/demo";

const OSM = "Dane tras: © OpenStreetMap contributors, licencja ODbL.";

describe("ekran „O aplikacji”", () => {
  it("podaje osobę odpowiedzialną redakcyjnie i proces: AI, sprawdzenie przez człowieka, głos AI", async () => {
    await render(<EkranOAplikacji />);
    expect(REDAKCJA_OSOBA).toBe("Łukasz Karwowski");
    expect(screen.getByText("Za treści historii redakcyjnie odpowiada Łukasz Karwowski.")).toBeOnTheScreen();
    expect(screen.getByText(/przygotowywane z pomocą sztucznej inteligencji \(AI\)/)).toBeOnTheScreen();
    expect(screen.getByText(/Fakty sprawdza człowiek względem źródeł/)).toBeOnTheScreen();
    expect(screen.getByText(/Głos lektora jest wygenerowany przez AI/)).toBeOnTheScreen();
    expect(screen.getAllByRole("header").length).toBeGreaterThanOrEqual(2);
  });

  it("bez ustalonego kontaktu: informacja, że zostanie uzupełniony", async () => {
    await render(<EkranOAplikacji kontakt={null} />);
    expect(screen.getByText("Kontakt z redakcją zostanie uzupełniony.")).toBeOnTheScreen();
  });

  it("z kontaktem: pokazuje adres", async () => {
    await render(<EkranOAplikacji kontakt="redakcja@example.org" />);
    expect(screen.getByText("Kontakt z redakcją: redakcja@example.org")).toBeOnTheScreen();
    expect(screen.queryByText("Kontakt z redakcją zostanie uzupełniony.")).toBeNull();
  });

  // Przypomnienie przed wydaniem: KONTAKT_REDAKCJI w src/konfiguracja.ts jest jeszcze null
  // (decyzja właściciela 12.10.2026: kontakt na razie placeholder). Po uzupełnieniu test przechodzi w zwykły.
  if (KONTAKT_REDAKCJI === null) {
    it.todo("PRZED WYDANIEM: uzupełnić KONTAKT_REDAKCJI (publiczny adres redakcji, nie prywatny e-mail)");
  } else {
    it("kontakt redakcji jest uzupełniony", () => {
      expect(KONTAKT_REDAKCJI).toMatch(/\S/);
    });
  }

  it("atrybucja OpenStreetMap (ODbL) tylko, gdy pakiety zawierają dane OSM", async () => {
    const { unmount } = await render(<EkranOAplikacji daneOSM />);
    expect(screen.getByText(OSM)).toBeOnTheScreen();
    await unmount();
    await render(<EkranOAplikacji daneOSM={false} />);
    expect(screen.queryByText(OSM)).toBeNull();
  });

  it("konfiguracja OSM zgodna z pakietami: dziś tylko pakiety demo (trasy wymyślone, nie z OSM)", () => {
    // Pierwszy pakiet spoza demo (trasa z OSM) wymaga DANE_OSM_W_PAKIETACH = true; ten test o tym przypomni.
    expect(DEMO.every((p) => String((p.json as { id: string }).id).startsWith("demo-"))).toBe(true);
    expect(DANE_OSM_W_PAKIETACH).toBe(false);
  });
});
