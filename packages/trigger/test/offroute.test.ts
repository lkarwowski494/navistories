import { describe, expect, it } from "vitest";
import { CAR, WALK } from "../src/config";
import { initialOffRouteState, updateOffRoute } from "../src/offroute";

function feed(laterals: number[], profile = CAR) {
  let s = initialOffRouteState();
  const states: boolean[] = [];
  for (const l of laterals) {
    s = updateOffRoute(s, l, profile);
    states.push(s.offRoute);
  }
  return states;
}

describe("updateOffRoute (histereza)", () => {
  const far = CAR.offRouteDistanceM + 1;
  const near = CAR.onRouteDistanceM - 1;
  const mid = (CAR.offRouteDistanceM + CAR.onRouteDistanceM) / 2;

  it("pojedynczy skok GPS nie przełącza stanu", () => {
    expect(feed([0, far, 0, far, 0])).toEqual([false, false, false, false, false]);
  });

  it("zjazd po offRouteSamples kolejnych dalekich próbkach", () => {
    const laterals = Array(CAR.offRouteSamples).fill(far);
    const st = feed([0, ...laterals]);
    expect(st.slice(0, -1).every((x) => !x)).toBe(true);
    expect(st[st.length - 1]).toBe(true);
  });

  it("powrót dopiero po onRouteSamples bliskich próbkach", () => {
    const off = Array(CAR.offRouteSamples).fill(far);
    const on = Array(CAR.onRouteSamples).fill(near);
    const st = feed([...off, ...on]);
    expect(st[CAR.offRouteSamples - 1]).toBe(true);
    expect(st[st.length - 2]).toBe(true);
    expect(st[st.length - 1]).toBe(false);
  });

  it("strefa pośrednia nie powoduje powrotu (histereza)", () => {
    const off = Array(CAR.offRouteSamples).fill(far);
    const st = feed([...off, ...Array(10).fill(mid)]);
    expect(st[st.length - 1]).toBe(true);
  });

  it("strefa pośrednia nie powoduje zjazdu", () => {
    expect(feed(Array(20).fill(mid)).some((x) => x)).toBe(false);
  });

  it("pieszo potrzeba więcej próbek niż w samochodzie", () => {
    const farWalk = WALK.offRouteDistanceM + 1;
    const n = CAR.offRouteSamples;
    expect(WALK.offRouteSamples).toBeGreaterThan(n);
    expect(feed(Array(n).fill(farWalk), WALK).some((x) => x)).toBe(false);
  });
});
