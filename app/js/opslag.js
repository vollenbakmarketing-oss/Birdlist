// Alles wordt lokaal in de browser bewaard (localStorage). Geen account, geen server.
// Wil je later accounts/cloud? Vervang dan enkel dit bestand: de rest van de app
// gebruikt alleen de functies hieronder.
import { APP } from "./config.js";

const LEEG = { versie: 1, profiel: { naam: "" }, instellingen: { ebirdSleutel: "" }, waarnemingen: [] };

function lees() {
  try {
    let ruw = localStorage.getItem(APP.opslagSleutel);
    // gegevens van een vroegere versie van de app overnemen
    for (const oud of APP.oudeOpslagSleutels || []) {
      if (ruw) break;
      ruw = localStorage.getItem(oud);
    }
    if (!ruw) return structuredClone(LEEG);
    const d = JSON.parse(ruw);
    return { ...structuredClone(LEEG), ...d, profiel: { ...LEEG.profiel, ...d.profiel }, instellingen: { ...LEEG.instellingen, ...d.instellingen } };
  } catch {
    return structuredClone(LEEG);
  }
}

let staat = lees();
const luisteraars = new Set();

function bewaar() {
  try { localStorage.setItem(APP.opslagSleutel, JSON.stringify(staat)); } catch { /* privé-venster: dan blijft het in het geheugen */ }
  luisteraars.forEach(f => f(staat));
}

// afgerond tot ~100 m: genoeg voor een herinnering, niet exact het huisadres
const rond = x => (x == null || Number.isNaN(x) ? null : Math.round(x * 1000) / 1000);

export const opslag = {
  get: () => staat,
  bijWijziging: f => luisteraars.add(f),

  voegWaarnemingToe({ vogelId, datum, plaats, lat, lon, notitie }) {
    const w = {
      id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())),
      vogelId, datum, plaats: plaats || "", notitie: notitie || "",
      lat: rond(lat), lon: rond(lon),
    };
    staat.waarnemingen.push(w);
    bewaar();
    return w;
  },
  // Pas datum, plaats, locatie en/of notitie van een bestaande waarneming aan.
  wijzigWaarneming(id, wijziging) {
    staat.waarnemingen = staat.waarnemingen.map(w => {
      if (w.id !== id) return w;
      const n = { ...w, ...wijziging };
      if ("lat" in wijziging) n.lat = rond(wijziging.lat);
      if ("lon" in wijziging) n.lon = rond(wijziging.lon);
      return n;
    });
    bewaar();
  },
  verwijderWaarneming(id) {
    staat.waarnemingen = staat.waarnemingen.filter(w => w.id !== id);
    bewaar();
  },
  zetProfiel(p) { staat.profiel = { ...staat.profiel, ...p }; bewaar(); },
  zetInstellingen(i) { staat.instellingen = { ...staat.instellingen, ...i }; bewaar(); },

  exporteer() {
    // sleutels niet mee exporteren
    const { instellingen, ...rest } = staat;
    return JSON.stringify(rest, null, 2);
  },
  importeer(tekst) {
    const d = JSON.parse(tekst);
    if (!Array.isArray(d.waarnemingen)) throw new Error("Dit is geen Dodo Diary-back-up.");
    staat = { ...staat, profiel: d.profiel || staat.profiel, waarnemingen: d.waarnemingen };
    bewaar();
  },
  wisAlles() { staat = structuredClone(LEEG); bewaar(); },
};
