import { describe, expect, it } from "vitest";
import { CAR, WALK, type MotionProfile } from "../src/config";
import { createEngine, step, type EngineEvent, type EngineInput, type EngineState } from "../src/engine";
import { leadDistanceM } from "../src/lead";
import type { Route } from "../src/route";
import type { Checkpoint, GpsSample } from "../src/types";
import { concat, drive, offsetPoint, routeFromLegs, straightRoute } from "./helpers";

const cp = (id: string, progressM: number, priority = 1): Checkpoint => ({ id, progressM, priority });

/** Podaje wejścia po kolei; zwraca stan i wszystkie zdarzenia. */
function run(state: EngineState, inputs: EngineInput[]) {
  const events: EngineEvent[] = [];
  let s = state;
  for (const input of inputs) {
    const r = step(s, input);
    s = r.state;
    events.push(...r.events);
  }
  return { state: s, events };
}

const samples = (xs: GpsSample[]): EngineInput[] => xs.map((sample) => ({ type: "sample", sample }));
const of = (events: EngineEvent[], type: EngineEvent["type"]) => events.filter((e) => e.type === type);
const ids = (events: EngineEvent[], type: EngineEvent["type"]) =>
  of(events, type).map((e) => ("checkpointId" in e ? e.checkpointId : ""));

function engine(route: Route, cps: Checkpoint[], profile: MotionProfile = CAR) {
  return createEngine({ route, checkpoints: cps, profile });
}

describe("wyzwalanie z wyprzedzeniem", () => {
  const route = straightRoute(3000);

  it("historia startuje po osiągnięciu postępu punktu minus wyprzedzenie", () => {
    const v = 20;
    const lead = leadDistanceM(v, CAR);
    const { events } = run(engine(route, [cp("a", 1500)]), samples(drive(route, { fromM: 0, toM: 3000, speedMps: v, withSpeed: true })));
    const plays = of(events, "play");
    expect(plays).toHaveLength(1);
    expect(plays[0]!.t).toBe(Math.ceil((1500 - lead) / v));
  });

  it("przy większej prędkości startuje wcześniej (w metrach)", () => {
    const at = (v: number) => {
      const { events } = run(engine(route, [cp("a", 1500)]), samples(drive(route, { fromM: 0, toM: 3000, speedMps: v, withSpeed: true })));
      return of(events, "play")[0]!.t * v;
    };
    expect(at(30)).toBeLessThan(at(10));
  });

  it("bez prędkości z systemu liczy ją z kolejnych próbek", () => {
    const v = 25;
    const { events } = run(engine(route, [cp("a", 1500)]), samples(drive(route, { fromM: 0, toM: 3000, speedMps: v })));
    const t = of(events, "play")[0]!.t;
    expect(t * v).toBeGreaterThanOrEqual(1500 - leadDistanceM(v, CAR) - v);
    expect(t * v).toBeLessThan(1500);
  });
});

describe("kolejka i jednorazowość", () => {
  const route = straightRoute(5000);

  it("nie przerywa trwającej historii: następna czeka w kolejce", () => {
    const xs = drive(route, { fromM: 0, toM: 2000, speedMps: 20, withSpeed: true });
    const { state, events } = run(engine(route, [cp("a", 800), cp("b", 1000)]), samples(xs));
    expect(ids(events, "play")).toEqual(["a"]);
    expect(ids(events, "queued")).toEqual(["b"]);
    expect(state.playing).toBe("a");
  });

  it("po zakończeniu i minimalnym odstępie gra następna z kolejki", () => {
    const xs = drive(route, { fromM: 0, toM: 1200, speedMps: 20, withSpeed: true });
    let r = run(engine(route, [cp("a", 800), cp("b", 1000)]), samples(xs));
    const tEnd = xs[xs.length - 1]!.t;
    r = run(r.state, [{ type: "playback-ended", t: tEnd, checkpointId: "a" }]);
    expect(ids(r.events, "ended")).toEqual(["a"]);
    // przed upływem minimalnego odstępu nic nie startuje
    r = run(r.state, [{ type: "tick", t: tEnd + CAR.minGapBetweenStoriesS - 0.5 }]);
    expect(of(r.events, "play")).toHaveLength(0);
    r = run(r.state, [{ type: "tick", t: tEnd + CAR.minGapBetweenStoriesS }]);
    expect(ids(r.events, "play")).toEqual(["b"]);
  });

  it("historia z kolejki startuje też na zwykłej próbce (bez ticka)", () => {
    const xs = drive(route, { fromM: 0, toM: 1500, speedMps: 20, withSpeed: true });
    const cut = xs.findIndex((s) => s.t === 60);
    let r = run(engine(route, [cp("a", 800), cp("b", 1000)]), samples(xs.slice(0, cut)));
    r = run(r.state, [{ type: "playback-ended", t: xs[cut - 1]!.t, checkpointId: "a" }]);
    r = run(r.state, samples(xs.slice(cut)));
    const play = of(r.events, "play")[0]!;
    expect(play).toMatchObject({ checkpointId: "b" });
    expect(play.t).toBe(xs[cut - 1]!.t + CAR.minGapBetweenStoriesS);
  });

  it("zakończenie innej historii niż grająca jest ignorowane", () => {
    const xs = drive(route, { fromM: 0, toM: 1000, speedMps: 20, withSpeed: true });
    let r = run(engine(route, [cp("a", 800)]), samples(xs));
    r = run(r.state, [{ type: "playback-ended", t: 999, checkpointId: "zzz" }]);
    expect(r.events).toEqual([]);
    expect(r.state.playing).toBe("a");
  });

  it("dwa punkty minięte w jednej próbce bez przerwy w GPS: oba zagrane po kolei, nic nie pominięte", () => {
    const xs = drive(route, { fromM: 0, toM: 1500, speedMps: 35, withSpeed: true });
    const { events } = run(engine(route, [cp("a", 1000), cp("b", 1005)]), samples(xs));
    expect(ids(events, "play")).toEqual(["a"]);
    expect(ids(events, "queued")).toEqual(["b"]);
    expect(of(events, "skipped")).toHaveLength(0);
  });

  it("każda historia najwyżej raz; jazda wstecz niczego nie wyzwala ponownie", () => {
    const xs = concat(
      drive(route, { fromM: 0, toM: 1200, speedMps: 15 }),
      drive(route, { fromM: 1200, toM: 300, speedMps: 15 }),
      drive(route, { fromM: 300, toM: 1300, speedMps: 15 }),
    );
    const inputs = samples(xs);
    // kończ historie od razu, żeby kolejka nie blokowała
    const events: EngineEvent[] = [];
    let state = engine(route, [cp("a", 500), cp("b", 1000)]);
    for (const input of inputs) {
      const r = step(state, input);
      state = r.state;
      events.push(...r.events);
      if (state.playing && input.type === "sample") {
        const e = step(state, { type: "playback-ended", t: input.sample.t, checkpointId: state.playing });
        state = e.state;
        events.push(...e.events);
      }
    }
    expect(ids(events, "play")).toEqual(["a", "b"]);
  });

  it("historia za daleko w tyle (przeterminowana) jest pomijana zamiast grana", () => {
    const xs = drive(route, { fromM: 0, toM: 1000 + CAR.staleAfterM + 500, speedMps: 30, withSpeed: true });
    let r = run(engine(route, [cp("a", 900), cp("b", 1000)]), samples(xs));
    const last = xs[xs.length - 1]!;
    r = run(r.state, [
      { type: "playback-ended", t: last.t, checkpointId: "a" },
      { type: "tick", t: last.t + CAR.minGapBetweenStoriesS },
    ]);
    expect(of(r.events, "play")).toHaveLength(0);
    expect(of(r.events, "skipped")).toEqual([{ type: "skipped", t: last.t + CAR.minGapBetweenStoriesS, checkpointId: "b", reason: "stale" }]);
  });
});

describe("przerwa w GPS (tunel)", () => {
  const route = straightRoute(5000);
  const tunnel = (cps: Checkpoint[]) => {
    const before = drive(route, { fromM: 0, toM: 800, speedMps: 20, withSpeed: true });
    const t = before[before.length - 1]!.t;
    const after = drive(route, { fromM: 1700, toM: 2000, speedMps: 20, withSpeed: true, t0: t + 40 });
    return run(engine(route, cps), samples([...before, ...after])).events;
  };

  it("gra tylko najwyższy priorytet, resztę oznacza jako pominiętą", () => {
    const events = tunnel([cp("a", 1000, 1), cp("b", 1200, 3), cp("c", 1400, 2)]);
    expect(ids(events, "play")).toEqual(["b"]);
    expect(of(events, "skipped").map((e) => [("checkpointId" in e && e.checkpointId), "reason" in e && e.reason])).toEqual([
      ["a", "gap"],
      ["c", "gap"],
    ]);
  });

  it("przy równym priorytecie gra ostatni (najbliższy bieżącej pozycji)", () => {
    const events = tunnel([cp("a", 1000), cp("b", 1200), cp("c", 1400)]);
    expect(ids(events, "play")).toEqual(["c"]);
    expect(ids(events, "skipped").sort()).toEqual(["a", "b"]);
  });
});

describe("zjazd z trasy", () => {
  const route = straightRoute(5000);

  it("pojedynczy skok w bok nie zmienia stanu ani nie wyzwala", () => {
    const xs = drive(route, { fromM: 0, toM: 600, speedMps: 20, withSpeed: true });
    const spikeAt = 10;
    const s = xs[spikeAt]!;
    // 80 m w bok: przechodzi filtr skoku, ale jest dalej niż próg zjazdu
    xs[spikeAt] = { ...offsetPoint(route, 200, 80), t: s.t, speedMps: 20 };
    const { events } = run(engine(route, [cp("a", 2000)]), samples(xs));
    expect(of(events, "off-route")).toHaveLength(0);
    expect(of(events, "play")).toHaveLength(0);
  });

  it("w czasie zjazdu nic się nie wyzwala; po powrocie dalej minięte punkty jak po przerwie", () => {
    const xs = concat(
      drive(route, { fromM: 0, toM: 800, speedMps: 20, withSpeed: true }),
      drive(route, { fromM: 800, toM: 2000, speedMps: 20, withSpeed: true, lateralM: 400 }),
      drive(route, { fromM: 2000, toM: 2400, speedMps: 20, withSpeed: true }),
    );
    const { events } = run(engine(route, [cp("a", 1200, 2), cp("b", 1600, 1), cp("c", 3000)]), samples(xs));
    const types = events.filter((e) => e.type !== "sample-rejected").map((e) => e.type);
    expect(types.indexOf("off-route")).toBeLessThan(types.indexOf("on-route"));
    const tOff = of(events, "off-route")[0]!.t;
    const tOn = of(events, "on-route")[0]!.t;
    const plays = of(events, "play");
    expect(plays.every((p) => p.t < tOff || p.t >= tOn)).toBe(true);
    expect(ids(events, "play")).toEqual(["a"]);
    expect(ids(events, "skipped")).toEqual(["b"]);
  });
});

describe("odrzucone próbki i start w połowie trasy", () => {
  const route = straightRoute(5000);

  it("zła dokładność daje zdarzenie sample-rejected i nie przesuwa postępu", () => {
    const xs = drive(route, { fromM: 0, toM: 1000, speedMps: 20, accuracyM: CAR.maxAccuracyM + 10 });
    const { events, state } = run(engine(route, [cp("a", 500)]), samples(xs));
    expect(of(events, "sample-rejected")).toHaveLength(xs.length);
    expect(of(events, "play")).toHaveLength(0);
    expect(state.progressM).toBeNull();
  });

  it("punkty przed miejscem startu są pomijane jako „przed startem”, nie grane", () => {
    const xs = drive(route, { fromM: 2000, toM: 2600, speedMps: 20, withSpeed: true });
    const { events } = run(engine(route, [cp("a", 500), cp("b", 1500), cp("c", 2400)]), samples(xs));
    expect(of(events, "skipped").map((e) => "reason" in e && e.reason)).toEqual(["before-start", "before-start"]);
    expect(ids(events, "play")).toEqual(["c"]);
  });
});

describe("profil pieszy", () => {
  it("trasa tam i z powrotem tą samą ulicą: punkt drogi powrotnej nie gra na drodze tam", () => {
    const route = routeFromLegs([[90, 600], [270, 600]], 10);
    const xs = drive(route, { fromM: 0, toM: 1200, speedMps: 1.4, withSpeed: true });
    // punkt „a” na 200 m drogi tam, „b” w tym samym miejscu na drodze powrotnej (1000 m)
    const events: EngineEvent[] = [];
    let state = createEngine({ route, checkpoints: [cp("a", 200), cp("b", 1000)], profile: WALK });
    for (const sample of xs) {
      const r = step(state, { type: "sample", sample });
      state = r.state;
      events.push(...r.events);
      if (state.playing) {
        const e = step(state, { type: "playback-ended", t: sample.t, checkpointId: state.playing });
        state = e.state;
        events.push(...e.events);
      }
    }
    const plays = of(events, "play");
    expect(plays.map((p) => "checkpointId" in p && p.checkpointId)).toEqual(["a", "b"]);
    expect(plays[1]!.t * 1.4).toBeGreaterThan(900);
    expect(of(events, "skipped")).toHaveLength(0);
  });
});

describe("czystość", () => {
  it("step nie modyfikuje stanu wejściowego", () => {
    const route = straightRoute(3000);
    const s0 = engine(route, [cp("a", 500), cp("b", 600)]);
    const xs = drive(route, { fromM: 0, toM: 800, speedMps: 20, withSpeed: true });
    let s = s0;
    for (const sample of xs) {
      const snapshot = JSON.stringify(s);
      const r = step(s, { type: "sample", sample });
      expect(JSON.stringify(s)).toBe(snapshot);
      s = r.state;
    }
  });

  it("stan da się zserializować do JSON i wznowić", () => {
    const route = straightRoute(3000);
    const xs = drive(route, { fromM: 0, toM: 2000, speedMps: 20, withSpeed: true });
    const half = Math.floor(xs.length / 2);
    const a = run(engine(route, [cp("a", 500), cp("b", 1500)]), samples(xs.slice(0, half)));
    const revived = { ...(JSON.parse(JSON.stringify({ ...a.state, route: undefined })) as EngineState), route };
    const b1 = run(a.state, samples(xs.slice(half)));
    const b2 = run(revived, samples(xs.slice(half)));
    expect(b2.events).toEqual(b1.events);
  });

  it("odrzuca checkpointy z powtórzonym id", () => {
    expect(() => engine(straightRoute(1000), [cp("a", 100), cp("a", 200)])).toThrow();
  });
});
