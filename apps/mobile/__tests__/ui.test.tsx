import { render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { kolory, Oznaczenie, styl } from "../src/ekrany/ui";

/** Współczynnik kontrastu WCAG 2.x dla kolorów #RRGGBB. */
function kontrast(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * bl!;
  };
  const [j, c] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (j! + 0.05) / (c! + 0.05);
}

describe("Oznaczenie (napis AI)", () => {
  it("czytnik ekranu dostaje pełne zdanie z etykiety, a na ekranie zostaje tekst", async () => {
    await render(<Oznaczenie tekst="Głos wygenerowany przez AI." etykieta="Głos wygenerowany przez sztuczną inteligencję." testID="o" />);
    const el = screen.getByTestId("o");
    expect(el).toHaveTextContent("Głos wygenerowany przez AI.");
    expect(el.props.accessibilityRole).toBe("text");
    expect(screen.getByLabelText("Głos wygenerowany przez sztuczną inteligencję.")).toBe(el);
  });

  it("bez etykiety czytnik dostaje tekst", async () => {
    await render(<Oznaczenie tekst="Napis" testID="o" />);
    expect(screen.getByTestId("o").props.accessibilityLabel).toBe("Napis");
  });

  it("kontrast napisu względem tła spełnia WCAG AA dla małego tekstu (4,5:1)", () => {
    const s = StyleSheet.flatten(styl.oznaczenie);
    expect(s.color).toBe(kolory.drugorzedny);
    expect(s.fontSize).toBeLessThan(18); // mały tekst: próg 4,5:1
    expect(kontrast(kolory.drugorzedny, kolory.tlo)).toBeGreaterThanOrEqual(4.5);
  });
});
