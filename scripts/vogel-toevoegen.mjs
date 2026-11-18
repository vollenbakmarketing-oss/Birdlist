// Voeg een of meer vogels toe aan app/data/vogels.json op basis van de huashu-bird-sticker dataset.
//   node scripts/vogel-toevoegen.mjs "Sitta europaea" "Certhia brachydactyla"
// Daarna: open vogels.json en vul `groep`, `zeldzaamheid`, `weetje` en eventueel `trek` aan (TODO).
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { leesVogels, schrijfVogels, APP_PAD } from "./_gemeen.mjs";

const CDN = "https://cdn.jsdelivr.net/gh/alchaincyf/huashu-bird-sticker@main/";
const namen = process.argv.slice(2);
if (!namen.length) { console.error('Gebruik: node scripts/vogel-toevoegen.mjs "Wetenschappelijke naam" ...'); process.exit(1); }

const TREK = { "sedentary": "standvogel", "partially migratory": "deels", "migratory": "zomergast" };

console.log("Dataset ophalen…");
const { species } = await (await fetch(CDN + "data/species.json")).json();
const vogels = await leesVogels();

for (const naam of namen) {
  const s = species.find(x => x.scientificName.toLowerCase() === naam.toLowerCase() || x.names?.nl?.toLowerCase() === naam.toLowerCase());
  if (!s) { console.warn(`✗ ${naam}: niet gevonden (gebruik de wetenschappelijke naam volgens AviList)`); continue; }
  if (vogels.some(v => v.id === s.id)) { console.warn(`• ${s.names.nl || s.scientificName} staat er al in`); continue; }

  const sticker = `stickers/${s.id}.webp`;
  const beeld = await fetch(CDN + s.sticker.file);
  await writeFile(join(APP_PAD, sticker), Buffer.from(await beeld.arrayBuffer()));

  const lengte = s.size?.bodyLengthCm?.map(Math.round) ?? [0, 0];
  const span = s.size?.wingspanCm?.map(Math.round) ?? [0, 0];
  vogels.push({
    nr: Math.max(0, ...vogels.map(v => v.nr)) + 1,
    id: s.id,
    naam: s.names?.nl || "TODO",
    wetenschappelijk: s.scientificName,
    groep: "tuin",               // TODO: tuin | bos | water | akker | roofvogel | uil
    zeldzaamheid: "zeldzaam",    // TODO: gewoon | vrij gewoon | zeldzaam | heel zeldzaam | legendarisch
    weetje: "TODO",
    lengteCm: lengte,
    spanwijdteCm: span,
    trek: TREK[s.traits?.migration] || "standvogel",  // TODO controleren voor België
    iucn: s.conservation?.iucn ?? null,
    ebird: s.ids?.ebird ?? null,
    geluid: null,
    sticker,
  });
  console.log(`✓ ${s.names?.nl || s.scientificName} toegevoegd${lengte[0] ? "" : " (lengte/spanwijdte ontbreken: vul aan)"}`);
}
await schrijfVogels(vogels);
