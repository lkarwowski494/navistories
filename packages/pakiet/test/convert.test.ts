import { describe, expect, it } from "vitest";
import { checkpointsOf, routeOf } from "../src/convert";
import { validPakiet } from "./helpers";

describe("konwersja pakietu na dane logiki wyzwalania", () => {
  it("trasa ma długość policzoną z polilinii", () => {
    const r = routeOf(validPakiet());
    expect(r.points).toHaveLength(5);
    expect(r.lengthM).toBeGreaterThan(1300);
    expect(r.lengthM).toBeLessThan(1500);
  });

  it("punkty zamieniają się na checkpointy (id, postęp, priorytet)", () => {
    expect(checkpointsOf(validPakiet())).toEqual([
      { id: "p1", progressM: 200, priority: 1 },
      { id: "p2", progressM: 900, priority: 2 },
    ]);
  });

  it("filtr motywów zostawia tylko punkty z wybranych motywów", () => {
    const p = validPakiet({
      themes: [
        { id: "a", name: "A" },
        { id: "b", name: "B" },
      ],
    });
    const points = [
      { ...p.points[0]!, themes: ["a"] },
      { ...p.points[1]!, themes: ["a", "b"] },
    ];
    const pk = { ...p, points };
    expect(checkpointsOf(pk, ["b"]).map((c) => c.id)).toEqual(["p2"]);
    expect(checkpointsOf(pk, ["a"]).map((c) => c.id)).toEqual(["p1", "p2"]);
    expect(checkpointsOf(pk, []).map((c) => c.id)).toEqual([]);
    expect(checkpointsOf(pk).map((c) => c.id)).toEqual(["p1", "p2"]);
  });
});
