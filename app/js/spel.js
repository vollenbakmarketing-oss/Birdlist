// Spellogica: punten, levels, badges. Pure functies, makkelijk te testen.
import { ZELDZAAMHEID, LEVELS, PUNTEN_HERHAALDE_WAARNEMING } from "./config.js";
import { BADGES } from "./badges.js";

export function berekenStatus(vogels, waarnemingen) {
  const perVogel = new Map();
  for (const w of [...waarnemingen].sort((a, b) => a.datum.localeCompare(b.datum))) {
    if (!perVogel.has(w.vogelId)) perVogel.set(w.vogelId, []);
    perVogel.get(w.vogelId).push(w);
  }
  const gevangen = vogels.filter(v => perVogel.has(v.id));

  let punten = 0;
  for (const v of gevangen) {
    punten += ZELDZAAMHEID[v.zeldzaamheid]?.punten ?? 0;
    punten += (perVogel.get(v.id).length - 1) * PUNTEN_HERHAALDE_WAARNEMING;
  }

  const s = { gevangen, waarnemingen, aantal: f => gevangen.filter(f).length };
  const badges = BADGES.map(b => ({ ...b, behaald: safe(() => b.voorwaarde(s)) }));

  return { perVogel, gevangen, punten, level: levelVoor(punten), badges };
}

function safe(f) { try { return !!f(); } catch { return false; } }

export function levelVoor(punten) {
  let i = 0;
  LEVELS.forEach((l, j) => { if (punten >= l.vanaf) i = j; });
  const huidig = LEVELS[i], volgend = LEVELS[i + 1];
  const voortgang = volgend ? (punten - huidig.vanaf) / (volgend.vanaf - huidig.vanaf) : 1;
  return { ...huidig, nummer: i + 1, volgend, voortgang };
}
