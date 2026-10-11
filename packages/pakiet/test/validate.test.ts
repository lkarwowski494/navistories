import { describe, expect, it } from "vitest";
import { parsePakiet, validatePakiet } from "../src/validate";
import { validPakiet, ROUTE } from "./helpers";

function errorsOf(input: unknown): string[] {
  const r = validatePakiet(input);
  return r.ok ? [] : r.errors;
}

describe("validatePakiet: poprawny pakiet", () => {
  it("przyjmuje poprawny pakiet spaceru", () => {
    const r = validatePakiet(validPakiet());
    expect(r.ok).toBe(true);
  });

  it("przyjmuje pakiet samochodowy bez durationMin", () => {
    const { durationMin: _d, ...rest } = validPakiet();
    expect(validatePakiet({ ...rest, mode: "car" }).ok).toBe(true);
  });

  it("przyjmuje pakiet po serializacji do JSON i z powrotem", () => {
    expect(validatePakiet(JSON.parse(JSON.stringify(validPakiet()))).ok).toBe(true);
  });

  it("parsePakiet zwraca pakiet albo rzuca błąd z listą problemów", () => {
    expect(parsePakiet(validPakiet()).id).toBe("test-spacer");
    expect(() => parsePakiet({})).toThrow(/Nieprawidłowy pakiet/);
  });
});

describe("validatePakiet: struktura", () => {
  it("odrzuca nie-obiekt", () => {
    expect(errorsOf(null).length).toBeGreaterThan(0);
    expect(errorsOf("pakiet").length).toBeGreaterThan(0);
  });

  it("odrzuca nieznaną wersję formatu", () => {
    expect(errorsOf({ ...validPakiet(), formatVersion: 2 }).join()).toMatch(/formatVersion/);
  });

  it("odrzuca nieznany tryb", () => {
    expect(errorsOf({ ...validPakiet(), mode: "bike" }).join()).toMatch(/mode/);
  });

  it("odrzuca nieznane pola (literówki w warsztacie)", () => {
    expect(errorsOf({ ...validPakiet(), tytul: "x" }).length).toBeGreaterThan(0);
  });

  it("wymaga oznaczenia treści AI", () => {
    const { aiGenerated: _a, ...rest } = validPakiet();
    expect(errorsOf(rest).join()).toMatch(/aiGenerated/);
  });

  it("spacer wymaga długości w minutach", () => {
    const { durationMin: _d, ...rest } = validPakiet();
    expect(errorsOf(rest).join()).toMatch(/durationMin/);
  });

  it("odrzuca trasę z mniej niż dwoma różnymi punktami", () => {
    expect(errorsOf(validPakiet({ route: [[52, 21], [52, 21]] })).join()).toMatch(/route/);
  });

  it("odrzuca współrzędne poza zakresem", () => {
    expect(errorsOf(validPakiet({ route: [[95, 21], ...ROUTE] })).join()).toMatch(/route/);
  });
});

describe("validatePakiet: punkty", () => {
  it("odrzuca powtórzone id punktu", () => {
    const p = validPakiet();
    const points = [p.points[0]!, { ...p.points[1]!, id: "p1" }];
    expect(errorsOf({ ...p, points }).join()).toMatch(/Powtórzone id punktu: p1/);
  });

  it("odrzuca postęp poza długością trasy", () => {
    const p = validPakiet();
    const points = [{ ...p.points[0]!, progressM: 5000 }];
    expect(errorsOf({ ...p, points }).join()).toMatch(/poza trasą/);
  });

  it("odrzuca ujemny postęp", () => {
    const p = validPakiet();
    expect(errorsOf({ ...p, points: [{ ...p.points[0]!, progressM: -1 }] }).length).toBeGreaterThan(0);
  });

  it("wymaga co najmniej jednego źródła (wyróżnik produktu)", () => {
    const p = validPakiet();
    expect(errorsOf({ ...p, points: [{ ...p.points[0]!, sources: [] }] }).join()).toMatch(/sources/);
  });

  it("adres źródła musi być adresem http(s)", () => {
    const p = validPakiet();
    const bad = [{ institution: "X", url: "javascript:alert(1)" }];
    expect(errorsOf({ ...p, points: [{ ...p.points[0]!, sources: bad }] }).join()).toMatch(/url/);
  });

  it("motyw punktu musi być zadeklarowany w pakiecie", () => {
    const p = validPakiet();
    expect(errorsOf({ ...p, points: [{ ...p.points[0]!, themes: ["kuchnia"] }] }).join()).toMatch(/Nieznany motyw: kuchnia/);
  });

  for (const audio of ["../sekret.wav", "/etc/passwd", "audio/../../x.wav", "audio\\p1.wav", "", "https://example.org/a.mp3"]) {
    it(`odrzuca niebezpieczną ścieżkę audio: ${JSON.stringify(audio)}`, () => {
      const p = validPakiet();
      expect(errorsOf({ ...p, points: [{ ...p.points[0]!, audio }] }).length).toBeGreaterThan(0);
    });
  }

  it("odrzuca pakiet bez punktów", () => {
    expect(errorsOf(validPakiet({ points: [] })).join()).toMatch(/points/);
  });
});
