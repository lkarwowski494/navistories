import { describe, expect, it } from "vitest";
import { sampleFromLocation } from "../src/location";

describe("sampleFromLocation (obiekt lokalizacji systemu → próbka GPS)", () => {
  it("przelicza czas z ms na s i przenosi dokładność i prędkość", () => {
    expect(
      sampleFromLocation({ timestamp: 1_700_000_000_500, coords: { latitude: 52, longitude: 21, accuracy: 7, speed: 12.5 } }),
    ).toEqual({ lat: 52, lon: 21, t: 1_700_000_000.5, accuracyM: 7, speedMps: 12.5 });
  });

  it("pomija brakujące (null) i ujemne (nieznane) wartości", () => {
    expect(sampleFromLocation({ timestamp: 2000, coords: { latitude: 1, longitude: 2, accuracy: null, speed: -1 } })).toEqual({
      lat: 1,
      lon: 2,
      t: 2,
    });
  });
});
