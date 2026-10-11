/**
 * Test integracyjny adaptera na syntetycznym przejeździe GPX z @navistories/trigger:
 * pakiet (zbudowany z trasy fixture i przepuszczony przez walidator) + atrapy
 * lokalizacji, odtwarzacza i zegara. Sesja ma dać te same zdarzenia co
 * referencyjna symulacja `simulate()` z pakietu trigger.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkpointsOf, parsePakiet, routeOf, type Pakiet } from "@navistories/pakiet";
import { CAR, parseGpx, simulate, toSamples, type EngineEvent } from "@navistories/trigger";
import { createSession } from "../src/session";
import { FakeClock, FakeLocation, FakePlayer } from "./fakes";

const require = createRequire(import.meta.url);
const triggerDir = dirname(require.resolve("@navistories/trigger/package.json"));
const gpx = parseGpx(readFileSync(join(triggerDir, "test/fixtures/syntetyczna-trasa.gpx"), "utf8"));
const samples = toSamples(gpx.trk);
const STORY_S = 45;

// Te same punkty co w scenariuszu pakietu trigger (tunel na 2700–3300 m).
const POINTS: [string, number, number][] = [
  ["rynek", 500, 1],
  ["kosciol", 1200, 1],
  ["tunel-wjazd", 2900, 1],
  ["tunel-zamek", 3050, 5],
  ["tunel-most", 3200, 2],
  ["meta", 4300, 1],
];

const pakiet: Pakiet = parsePakiet({
  formatVersion: 1,
  id: "syntetyczna-trasa",
  version: "test",
  title: "Syntetyczna trasa",
  mode: "car",
  themes: [{ id: "demo", name: "Demo" }],
  aiGenerated: { text: false, voice: false },
  route: gpx.rte.map((p) => [p.lat, p.lon]),
  points: POINTS.map(([id, progressM, priority]) => ({
    id,
    progressM,
    priority,
    title: id,
    audio: `audio/${id}.wav`,
    themes: ["demo"],
    sources: [{ institution: "Instytucja przykładowa", url: `https://example.org/${id}` }],
  })),
});

function runSession() {
  const clock = new FakeClock(samples[0]!.t - 1);
  const location = new FakeLocation();
  const player = new FakePlayer(clock, () => STORY_S);
  const events: EngineEvent[] = [];
  const session = createSession({ pakiet, location, player, clock });
  session.onEngineEvents((e) => events.push(...e));
  return { clock, location, player, session, events };
}

describe("adapter na syntetycznym GPX", () => {
  const expected = simulate({
    route: routeOf(pakiet),
    checkpoints: checkpointsOf(pakiet),
    samples,
    profile: CAR,
    storyDurationS: STORY_S,
  });

  it("daje te same zdarzenia co simulate()", async () => {
    const r = runSession();
    await r.session.start();
    r.location.feed(samples, r.clock);
    r.clock.advanceTo(Infinity);
    expect(r.events).toEqual(expected);
  });

  it("odtwarzacz dostał właściwe pliki w kolejności; po tunelu tylko najważniejsza historia", async () => {
    const r = runSession();
    await r.session.start();
    r.location.feed(samples, r.clock);
    r.clock.advanceTo(Infinity);
    expect(r.player.log.filter((x) => x.startsWith("play:"))).toEqual(["play:rynek", "play:kosciol", "play:tunel-zamek", "play:meta"]);
    expect(r.session.view.played).toEqual(["rynek", "kosciol", "tunel-zamek", "meta"]);
    expect(r.session.view.skipped).toEqual(["tunel-wjazd", "tunel-most"]);
  });

  it("pauza w trakcie historii przesuwa jej koniec, ale nie gubi kolejnych", async () => {
    const r = runSession();
    await r.session.start();
    const half = Math.floor(samples.length / 4);
    r.location.feed(samples.slice(0, half), r.clock);
    if (r.session.view.current) {
      r.session.pause();
      r.clock.advanceTo(r.clock.now() + 5);
      r.session.resume();
    }
    r.location.feed(samples.slice(half), r.clock);
    r.clock.advanceTo(Infinity);
    expect(r.session.view.played).toContain("meta");
  });
});
