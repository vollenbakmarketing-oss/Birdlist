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
  assert.equal(s.gevangen.length, 2);
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
