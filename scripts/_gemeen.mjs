// Gedeelde hulpjes voor de beheerscripts.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export const VOGELS_PAD = fileURLToPath(new URL("../app/data/vogels.json", import.meta.url));
export const APP_PAD = fileURLToPath(new URL("../app/", import.meta.url));

export async function leesVogels() {
  return JSON.parse(await readFile(VOGELS_PAD, "utf8"));
}

// Schrijft vogels.json leesbaar weg (getallenparen op één regel).
export async function schrijfVogels(vogels) {
  const tekst = JSON.stringify(vogels, null, 2).replace(/\[\s+(\d+),\s+(\d+)\s+\]/g, "[$1, $2]");
  await writeFile(VOGELS_PAD, tekst + "\n");
}

export function vereisSleutel(naam, waar) {
  const s = process.env[naam];
  if (!s) {
    console.error(`Zet eerst je sleutel: ${naam}=... (aan te vragen op ${waar})`);
    process.exit(1);
  }
  return s;
}

export const wacht = ms => new Promise(r => setTimeout(r, ms));
