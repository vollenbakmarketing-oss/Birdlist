// Zoekt voor elke vogel zonder geluid een goede opname op xeno-canto (liefst uit België).
//   XC_API_KEY=... node scripts/zoek-geluiden.mjs
// Sleutel: maak een account op xeno-canto.org en kijk bij je accountinstellingen.
// Opnames hebben een Creative Commons-licentie; de opnemer en licentie worden mee bewaard
// en op het kaartje getoond.
import { leesVogels, schrijfVogels, vereisSleutel, wacht } from "./_gemeen.mjs";

const sleutel = vereisSleutel("XC_API_KEY", "https://xeno-canto.org");
const alles = process.argv.includes("--alles"); // ook bestaande geluiden vervangen

async function zoek(query) {
  const url = `https://xeno-canto.org/api/3/recordings?query=${encodeURIComponent(query)}&key=${sleutel}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`xeno-canto ${r.status}`);
  return (await r.json()).recordings || [];
}

const vogels = await leesVogels();
for (const v of vogels) {
  if (v.geluid && !alles) continue;
  const sp = `sp:"${v.wetenschappelijk}"`;
  let opnames = await zoek(`${sp} q:A cnt:"Belgium"`);
  if (!opnames.length) opnames = await zoek(`${sp} q:A cnt:"Netherlands"`);
  if (!opnames.length) opnames = await zoek(`${sp} q:A`);
  // voorkeur: zang, korter dan 1 minuut
  const kort = o => { const [m, s] = String(o.length || "9:99").split(":").map(Number); return m * 60 + s <= 60; };
  const keuze = opnames.find(o => /song/i.test(o.type) && kort(o)) || opnames.find(kort) || opnames[0];
  if (keuze) {
    v.geluid = "XC" + keuze.id;
    v.geluidBron = `${keuze.rec}, xeno-canto XC${keuze.id}, ${keuze.lic?.replace(/^\/\//, "https://")}`;
    console.log(`✓ ${v.naam}: XC${keuze.id} (${keuze.cnt}, ${keuze.type})`);
  } else console.log(`✗ ${v.naam}: niets gevonden`);
  await wacht(300);
}
await schrijfVogels(vogels);
