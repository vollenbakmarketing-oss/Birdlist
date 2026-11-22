// Logica van het spel "Raad de vogel" (gebaseerd op Birdle).
// Je ziet de vogel en typt de naam. Je hebt SPEL.pogingen kansen; na elke foute
// poging wordt er een letter van de naam zichtbaar. Geen schermcode hier: makkelijk te testen.
import { SPEL } from "./config.js";

// "Grote Bonte Specht" -> "grotebontespecht", "Turkse Tortel" -> "turksetortel", accenten weg.
export function normaliseer(tekst) {
  return String(tekst || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "");
}

// Aantal tikfouten tussen twee woorden (Levenshtein).
export function afstand(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

// "juist" | "bijna" (1 tikfout bij een lange naam: telt als juist) | "fout"
export function beoordeel(gok, naam) {
  const g = normaliseer(gok), n = normaliseer(naam);
  if (!g) return "fout";
  if (g === n) return "juist";
  if (n.length >= 6 && afstand(g, n) === 1) return "bijna";
  return "fout";
}

export const puntenVoorPoging = poging => SPEL.punten[poging - 1] ?? 0;   // poging = 1, 2, 3

// Posities van letters (geen spaties of streepjes) in de naam.
export const letterPosities = naam => [...naam].map((c, i) => (/\p{L}/u.test(c) ? i : -1)).filter(i => i >= 0);

// Welke letter wordt als volgende zichtbaar? Eerst de eerste letter, daarna willekeurig.
export function volgendeLetter(naam, zichtbaar, kies = Math.random) {
  const vrij = letterPosities(naam).filter(i => !zichtbaar.has(i));
  if (!vrij.length) return null;
  if (!zichtbaar.size && vrij[0] === 0) return 0;
  return vrij[Math.floor(kies() * vrij.length)];
}

// Kies de vogels voor één spel: willekeurig uit de pool, zonder dubbels.
export function kiesVogels(pool, aantal = SPEL.vogelsPerSpel, kies = Math.random) {
  const rest = [...pool];
  const uit = [];
  while (rest.length && uit.length < aantal) uit.push(rest.splice(Math.floor(kies() * rest.length), 1)[0]);
  return uit;
}
