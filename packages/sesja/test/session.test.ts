import { describe, expect, it } from "vitest";
import { createSession, type Session, type SessionView } from "../src/session";
import { LocationPermissionError } from "../src/ports";
import { FakeClock, FakeLocation, FakePlayer } from "./fakes";
import { carPakiet, drive, point } from "./helpers";

function setup(points = [point("p1", 500), point("p2", 600), point("p3", 1500)], themeFilter?: string[]) {
  const pakiet = carPakiet(points);
  const clock = new FakeClock(0);
  const location = new FakeLocation();
  const player = new FakePlayer(clock, () => 20);
  const session = createSession({ pakiet, location, player, clock, ...(themeFilter ? { themeFilter } : {}) });
  const views: SessionView[] = [];
  session.subscribe((v) => views.push(v));
  return { pakiet, clock, location, player, session, views };
}

async function started(s: ReturnType<typeof setup>): Promise<ReturnType<typeof setup>> {
  await s.session.start();
  return s;
}

/** Jedzie do toM i zwraca widok w chwili ostatniej próbki. */
function driveTo(s: ReturnType<typeof setup>, toM: number, fromM = 0, t0 = 1000) {
  s.location.feed(drive(s.pakiet, { fromM, toM, speedMps: 10, t0 }), s.clock);
  return s.session.view;
}

describe("sesja: start", () => {
  it("nie startuje sama: przed start() nie prosi o lokalizację", () => {
    const s = setup();
    expect(s.location.started).toBe(0);
    expect(s.session.view.phase).toBe("ready");
  });

  it("start() włącza lokalizację; bez pozycji stan „szukam pozycji”", async () => {
    const s = await started(setup());
    expect(s.location.started).toBe(1);
    expect(s.session.view).toMatchObject({ phase: "running", activity: "no-fix", current: null });
  });

  it("brak uprawnienia: faza błędu z kodem, bez odtwarzania", async () => {
    const s = setup();
    s.location.failWith = new LocationPermissionError();
    await s.session.start();
    expect(s.session.view).toMatchObject({ phase: "error", error: "location-permission" });
  });

  it("inny błąd startu lokalizacji: kod „location”", async () => {
    const s = setup();
    s.location.failWith = new Error("GPS wyłączony");
    await s.session.start();
    expect(s.session.view).toMatchObject({ phase: "error", error: "location" });
  });

  it("stop() w trakcie startu (czekanie na uprawnienie) wygrywa", async () => {
    const s = setup();
    const p = s.session.start();
    s.session.stop();
    await p;
    expect(s.session.view.phase).toBe("stopped");
  });

  it("drugi start() nic nie robi", async () => {
    const s = await started(setup());
    await s.session.start();
    expect(s.location.started).toBe(1);
  });
});

describe("sesja: odtwarzanie", () => {
  it("po dojechaniu do punktu gra jego audio z pakietu", async () => {
    const s = await started(setup());
    const v = driveTo(s, 470);
    expect(s.player.current).toEqual({ pakietId: "test-auto", pointId: "p1", audio: "audio/p1.wav" });
    expect(v).toMatchObject({ activity: "playing", paused: false });
    expect(v.current?.id).toBe("p1");
  });

  it("kolejny punkt w trakcie historii czeka w kolejce, potem gra po odstępie", async () => {
    const s = await started(setup());
    let v = driveTo(s, 560);
    expect(v).toMatchObject({ activity: "playing", queued: 1 });
    v = driveTo(s, 1000, 570, 1057);
    expect(s.player.log).toEqual(["play:p1", "end:p1", "play:p2", "end:p2"]);
    expect(v.played).toEqual(["p1", "p2"]);
  });

  it("pauza i wznowienie przekazane do odtwarzacza, widok pokazuje pauzę", async () => {
    const s = await started(setup());
    driveTo(s, 470);
    s.session.pause();
    expect(s.session.view.paused).toBe(true);
    expect(s.player.paused).toBe(true);
    s.session.resume();
    expect(s.session.view.paused).toBe(false);
    expect(s.player.log).toEqual(["play:p1", "pause:p1", "resume:p1"]);
  });

  it("„następna” kończy bieżącą historię i zwalnia odtwarzacz dla kolejki", async () => {
    const s = await started(setup());
    driveTo(s, 560);
    s.session.next();
    expect(s.player.log).toEqual(["play:p1", "stop:p1"]);
    expect(s.session.view.current).toBeNull();
    // następna z kolejki startuje po minimalnym odstępie (bez nowej próbki)
    s.clock.advanceTo(s.clock.now() + 10);
    expect(s.player.current?.pointId).toBe("p2");
  });

  it("„następna” bez grającej historii nic nie robi", async () => {
    const s = await started(setup());
    s.session.next();
    expect(s.player.log).toEqual([]);
  });

  it("błąd odtwarzania nie zatrzymuje sesji", async () => {
    const s = await started(setup());
    driveTo(s, 560);
    s.player.fail();
    s.clock.advanceTo(s.clock.now() + 10);
    expect(s.player.current?.pointId).toBe("p2");
  });

  it("filtr motywów: grają tylko punkty z wybranych motywów", async () => {
    const s = await started(setup([point("p1", 500, { themes: ["a"] }), point("p2", 900, { themes: ["b"] })], ["b"]));
    driveTo(s, 1200);
    s.clock.advanceTo(s.clock.now() + 60);
    expect(s.player.log.filter((x) => x.startsWith("play"))).toEqual(["play:p2"]);
  });
});

describe("sesja: poza trasą i koniec", () => {
  it("zjazd z trasy widoczny w stanie, powrót przywraca", async () => {
    const s = setup([point("p1", 1800)]);
    await s.session.start();
    const views: SessionView[] = [];
    s.session.subscribe((v) => views.push(v));
    s.location.feed(drive(s.pakiet, { fromM: 0, toM: 900, speedMps: 10, offset: { fromM: 300, toM: 600, lateralM: 200 } }), s.clock);
    expect(views.some((v) => v.activity === "off-route" && v.offRoute)).toBe(true);
    expect(s.session.view).toMatchObject({ offRoute: false, activity: "waiting" });
  });

  it("stop() wyłącza lokalizację i odtwarzacz; dalsze próbki nic nie robią", async () => {
    const s = await started(setup());
    driveTo(s, 470);
    s.session.stop();
    expect(s.location.stopped).toBe(1);
    expect(s.player.current).toBeNull();
    expect(s.session.view.phase).toBe("stopped");
    expect(s.clock.pending).toBe(0);
  });

  it("subskrypcja dostaje widoki i da się ją wyłączyć", async () => {
    const s = setup();
    const seen: SessionView[] = [];
    const off = s.session.subscribe((v) => seen.push(v));
    await s.session.start();
    const n = seen.length;
    expect(n).toBeGreaterThan(0);
    off();
    driveTo(s, 470);
    expect(seen.length).toBe(n);
  });
});

describe("sesja: widok jest niezmiennym obiektem", () => {
  it("każda zmiana daje nowy obiekt (React wykrywa zmianę)", async () => {
    const s: ReturnType<typeof setup> = await started(setup());
    const before = s.session.view;
    driveTo(s, 470);
    expect(s.session.view).not.toBe(before);
    const ses: Session = s.session;
    expect(Object.isFrozen(ses.view)).toBe(true);
  });
});
