import { zbudujKatalog } from "../src/katalog/katalog";
import { DEMO } from "../src/katalog/demo";

describe("katalog pakietów", () => {
  it("pakiety demonstracyjne przechodzą walidację i mają wszystkie pliki audio", () => {
    const k = zbudujKatalog(DEMO);
    expect(k.bledy).toEqual([]);
    expect(k.pakiety.map((p) => [p.id, p.mode])).toEqual([
      ["demo-samochod", "car"],
      ["demo-spacer", "walk"],
    ]);
  });

  it("pakiety demonstracyjne nie udają treści AI ani prawdziwych źródeł", () => {
    for (const p of zbudujKatalog(DEMO).pakiety) {
      expect(p.aiGenerated).toEqual({ text: false, voice: false });
      for (const pt of p.points) for (const s of pt.sources) expect(s.url).toMatch(/^https:\/\/example\.org\//);
    }
  });

  it("rozwiązuje plik audio historii", () => {
    const k = zbudujKatalog(DEMO);
    expect(k.audio({ pakietId: "demo-spacer", pointId: "punkt-1", audio: "audio/ton-1.wav" })).not.toBeNull();
    expect(k.audio({ pakietId: "demo-spacer", pointId: "x", audio: "audio/brak.wav" })).toBeNull();
    expect(k.audio({ pakietId: "nie-ma", pointId: "x", audio: "audio/ton-1.wav" })).toBeNull();
  });

  it("pomija pakiet z błędami i pakiet bez pliku audio, z opisem", () => {
    const dobry = DEMO[1]!;
    const k = zbudujKatalog([
      { json: { formatVersion: 99 }, audio: {} },
      { json: dobry.json, audio: { "audio/ton-1.wav": 1 } },
      dobry,
      dobry,
    ]);
    expect(k.pakiety.map((p) => p.id)).toEqual(["demo-spacer"]);
    expect(k.bledy.join("\n")).toMatch(/formatVersion/);
    expect(k.bledy.join("\n")).toMatch(/brak plików audio: audio\/ton-2.wav, audio\/ton-3.wav/);
    expect(k.bledy.join("\n")).toMatch(/powtórzone id pakietu/);
  });
});
