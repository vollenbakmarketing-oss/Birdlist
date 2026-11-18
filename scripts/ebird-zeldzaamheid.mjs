// Stelt een zeldzaamheid voor op basis van recente eBird-waarnemingen in België.
//   EBIRD_API_KEY=... node scripts/ebird-zeldzaamheid.mjs            (toont voorstel)
//   EBIRD_API_KEY=... node scripts/ebird-zeldzaamheid.mjs --schrijf  (past vogels.json aan)
//
// Werkwijze: per soort tellen we op hoeveel verschillende plaatsen ze de laatste
// 30 dagen gemeld is, en vergelijken dat met de meest gemelde soort.
// Let op: dit hangt af van het seizoen (een zomergast scoort in de winter 0).
// Draai het daarom liefst een paar keer per jaar en kijk het voorstel kritisch na.
import { leesVogels, schrijfVogels, vereisSleutel, wacht } from "./_gemeen.mjs";

const sleutel = vereisSleutel("EBIRD_API_KEY", "https://ebird.org/api/keygen");
const REGIO = process.env.EBIRD_REGIO || "BE";
const schrijf = process.argv.includes("--schrijf");

// grens = minimaal aandeel t.o.v. de meest gemelde soort
const DREMPELS = [[0.30, "gewoon"], [0.10, "vrij gewoon"], [0.02, "zeldzaam"], [0.0001, "heel zeldzaam"], [0, "legendarisch"]];

const vogels = await leesVogels();
const tellingen = new Map();
for (const v of vogels) {
  if (!v.ebird) continue;
  const r = await fetch(`https://api.ebird.org/v2/data/obs/${REGIO}/recent/${v.ebird}?back=30`, { headers: { "X-eBirdApiToken": sleutel } });
  const obs = r.ok ? await r.json() : [];
  tellingen.set(v.id, new Set(obs.map(o => o.locId)).size);
  process.stdout.write(".");
  await wacht(150);
}
console.log();
const max = Math.max(1, ...tellingen.values());
for (const v of vogels) {
  if (!tellingen.has(v.id)) continue;
  const aandeel = tellingen.get(v.id) / max;
  const voorstel = DREMPELS.find(([g]) => aandeel >= g)[1];
  const vlag = voorstel !== v.zeldzaamheid ? "  ← anders" : "";
  console.log(`${v.naam.padEnd(22)} ${String(tellingen.get(v.id)).padStart(5)} plaatsen   nu: ${v.zeldzaamheid.padEnd(14)} voorstel: ${voorstel}${vlag}`);
  if (schrijf) v.zeldzaamheid = voorstel;
}
if (schrijf) { await schrijfVogels(vogels); console.log("vogels.json aangepast."); }
