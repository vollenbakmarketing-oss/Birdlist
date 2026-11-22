import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { berekenStatus, levelVoor } from "../app/js/spel.js";
import { ZELDZAAMHEID, GROEPEN, TREK } from "../app/js/config.js";

const vogels = JSON.parse(readFileSync(new URL("../app/data/vogels.json", import.meta.url)));

test("vogels.json is geldig", () => {
  const ids = new Set(), nrs = new Set();
  for (const v of vogels) {
    assert.ok(!ids.has(v.id), `dubbele id ${v.id}`); ids.add(v.id);
    assert.ok(!nrs.has(v.nr), `dubbel nr ${v.nr}`); nrs.add(v.nr);
    assert.ok(v.zeldzaamheid in ZELDZAAMHEID, `${v.naam}: onbekende zeldzaamheid ${v.zeldzaamheid}`);
    assert.ok(v.groep in GROEPEN, `${v.naam}: onbekende groep ${v.groep}`);
    assert.ok(v.trek in TREK, `${v.naam}: onbekend trekgedrag ${v.trek}`);
    assert.ok(v.weetje && v.weetje !== "TODO", `${v.naam}: weetje ontbreekt`);
    assert.equal(v.lengteCm.length, 2); assert.equal(v.spanwijdteCm.length, 2);
    assert.ok(Array.isArray(v.kenmerken) && v.kenmerken.length === 3, `${v.naam}: geef precies 3 kenmerken`);
  }
});

test("punten, level en badges", () => {
  const merel = vogels.find(v => v.naam === "Merel");
  const ijsvogel = vogels.find(v => v.naam === "IJsvogel");
  const w = [
    { vogelId: merel.id, datum: "2026-05-01T06:30:00.000Z", plaats: "Gent" },
    { vogelId: merel.id, datum: "2026-05-02T10:00:00.000Z", plaats: "Gent" },
    { vogelId: ijsvogel.id, datum: "2026-05-03T10:00:00.000Z", plaats: "Brugge" },
  ];
  const s = berekenStatus(vogels, w);
  assert.equal(s.gespot.length, 2);
  assert.equal(s.punten, 10 + 2 + 50);
  assert.equal(s.level.naam, "Kuiken");
  assert.ok(s.badges.find(b => b.id === "eerste").behaald);
  assert.ok(s.badges.find(b => b.id === "zeldzaam").behaald);
  assert.ok(!s.badges.find(b => b.id === "legende").behaald);
});

test("levels", () => {
  assert.equal(levelVoor(0).naam, "Eitje");
  assert.equal(levelVoor(5000).volgend, undefined);
});

import { beoordeel, normaliseer, volgendeLetter, kiesVogels, puntenVoorPoging } from "../app/js/raden.js";
import { continentVan } from "../app/js/landen.js";

test("Raad de vogel: antwoorden beoordelen", () => {
  assert.equal(normaliseer("Grote Bonte Specht"), "grotebontespecht");
  assert.equal(beoordeel("grote bonte specht", "Grote Bonte Specht"), "juist");
  assert.equal(beoordeel("GroteBonteSpecht", "Grote Bonte Specht"), "juist");
  assert.equal(beoordeel("ijsvogel", "IJsvogel"), "juist");
  assert.equal(beoordeel("ijsfogel", "IJsvogel"), "bijna");   // 1 tikfout bij lange naam telt
  assert.equal(beoordeel("hop", "Hop"), "juist");
  assert.equal(beoordeel("hip", "Hop"), "fout");               // korte naam: geen tikfout toegestaan
  assert.equal(beoordeel("merel", "Koolmees"), "fout");
  assert.equal(beoordeel("", "Merel"), "fout");
  assert.deepEqual([1, 2, 3, 4].map(puntenVoorPoging), [30, 20, 10, 0]);
});

test("Raad de vogel: letters onthullen en vogels kiezen", () => {
  const zichtbaar = new Set();
  const eerste = volgendeLetter("Turkse Tortel", zichtbaar, () => 0.5);
  assert.equal(eerste, 0);                                      // eerst de eerste letter
  zichtbaar.add(eerste);
  const tweede = volgendeLetter("Turkse Tortel", zichtbaar, () => 0.5);
  assert.notEqual("Turkse Tortel"[tweede], " ");                // nooit een spatie
  assert.ok(!zichtbaar.has(tweede));
  const gekozen = kiesVogels(vogels.slice(0, 3), 5);
  assert.equal(gekozen.length, 3);                              // nooit meer dan de pool
  assert.equal(new Set(gekozen).size, 3);
});

test("reisbadges: landen en continenten", () => {
  assert.equal(continentVan("BE"), "EU");
  assert.equal(continentVan("ke"), "AF");
  assert.equal(continentVan("aq"), "AN");
  const merel = vogels.find(v => v.naam === "Merel");
  const w = (land, landNaam) => ({ vogelId: merel.id, datum: "2026-05-01T10:00:00.000Z", land, landNaam, lat: 1, lon: 1 });
  const s = berekenStatus(vogels, [w("be", "België"), w("fr", "Frankrijk"), w("ke", "Kenia")]);
  assert.equal(s.landen.size, 3);
  assert.deepEqual([...s.continenten].sort(), ["AF", "EU"]);
  const badge = id => s.badges.find(b => b.id === id).behaald;
  assert.ok(badge("land-1") && badge("land-2") && !badge("land-5"));
  assert.ok(badge("continent-EU") && badge("continent-AF") && !badge("continent-AS"));
  assert.ok(!badge("continent-alle"));
  const metSpel = berekenStatus(vogels, [], { rondes: 1, perfect: 1, geraden: 5, beste: 150 });
  assert.ok(metSpel.badges.find(b => b.id === "spel-perfect").behaald);
});
