// Spellogica: punten, levels, badges. Pure functies, makkelijk te testen.
import { ZELDZAAMHEID, LEVELS, PUNTEN_HERHAALDE_WAARNEMING } from "./config.js";
import { BADGES } from "./badges.js";
import { continentVan } from "./landen.js";

// spelStats = resultaten van "Raad de vogel" (opslag.get().spel)
export function berekenStatus(vogels, waarnemingen, spelStats = {}) {
  const perVogel = new Map();
  for (const w of [...waarnemingen].sort((a, b) => a.datum.localeCompare(b.datum))) {
    if (!perVogel.has(w.vogelId)) perVogel.set(w.vogelId, []);
    perVogel.get(w.vogelId).push(w);
  }
  const gespot = vogels.filter(v => perVogel.has(v.id));

  let punten = 0;
  for (const v of gespot) {
    punten += ZELDZAAMHEID[v.zeldzaamheid]?.punten ?? 0;
    punten += (perVogel.get(v.id).length - 1) * PUNTEN_HERHAALDE_WAARNEMING;
  }

  // landen en continenten waar je vogels spotte
  const landen = new Map();      // "be" -> "België"
  for (const w of waarnemingen) if (w.land) landen.set(w.land, w.landNaam || w.land.toUpperCase());
  const continenten = new Set([...landen.keys()].map(continentVan).filter(Boolean));

  const s = { gespot, waarnemingen, landen, continenten, spel: { rondes: 0, beste: 0, perfect: 0, geraden: 0, ...spelStats },
    aantal: f => gespot.filter(f).length };
  const badges = BADGES.map(b => ({ ...b, behaald: safe(() => b.voorwaarde(s)) }));

  return { perVogel, gespot, punten, level: levelVoor(punten), badges, landen, continenten };
}

function safe(f) { try { return !!f(); } catch { return false; } }

export function levelVoor(punten) {
  let i = 0;
  LEVELS.forEach((l, j) => { if (punten >= l.vanaf) i = j; });
  const huidig = LEVELS[i], volgend = LEVELS[i + 1];
  const voortgang = volgend ? (punten - huidig.vanaf) / (volgend.vanaf - huidig.vanaf) : 1;
  return { ...huidig, nummer: i + 1, volgend, voortgang };
}
