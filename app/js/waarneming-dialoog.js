// Venster om een waarneming toe te voegen of te bewerken:
// datum, plaats (met satellietkaartje om de plek aan te duiden) en notitie.
// Het land wordt automatisch bepaald uit de plek (voor de reisbadges).
import { KAART } from "./config.js";
import { esc, openModal } from "./ui.js";
import { haalPositie, plaatsInfo } from "./locatie.js";
import { vlag } from "./landen.js";
import { kaartBeschikbaar, maakKaart, speldMarker } from "./kaartlaag.js";

function naarLokaal(iso) {
  const d = iso ? new Date(iso) : new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

/**
 * @param vogel      object uit vogels.json
 * @param bestaande  bestaande waarneming (bewerken) of null (nieuwe)
 * @param opslaan    functie({ datum, plaats, notitie, lat, lon, land, landNaam }) die het resultaat bewaart
 * @param titel/knop teksten bovenaan en op de bevestigknop
 * @param verwijder  optionele functie om de waarneming te verwijderen
 */
export function openWaarnemingDialoog({ vogel, bestaande = null, opslaan, titel, knop, verwijder }) {
  const metKaart = kaartBeschikbaar();
  let kaart = null;
  const { el, sluit } = openModal(`
    <div class="vang">
      <img class="vang-beeld" src="${esc(vogel.sticker)}" alt="${esc(vogel.naam)}">
      <h2>${esc(titel)}</h2>
      <form class="formulier">
        <label for="w-datum">Wanneer?</label>
        <input id="w-datum" type="datetime-local" name="datum" value="${naarLokaal(bestaande?.datum)}" max="${naarLokaal()}" required>

        <label for="w-plaats">Waar?</label>
        <span class="rij">
          <input id="w-plaats" name="plaats" value="${esc(bestaande?.plaats)}" placeholder="bv. Gent, Citadelpark" autocomplete="off">
          <button type="button" class="knop-mini" id="gps" title="Gebruik mijn locatie">📍 Hier</button>
        </span>
        ${metKaart ? `<div class="mini-kaart" id="mini-kaart"></div>` : ""}
        <small class="gps-status">${metKaart ? "Tik op de kaart om de plek aan te duiden." : ""}</small>

        <label for="w-notitie">Notitie</label>
        <textarea id="w-notitie" name="notitie" rows="3" maxlength="500" placeholder="Wat deed hij? Hoe was het weer? Met wie was je?">${esc(bestaande?.notitie)}</textarea>

        <button class="knop knop-groot" type="submit">${esc(knop)}</button>
        ${verwijder ? `<button class="knop knop-gevaar" type="button" id="wis">Verwijder deze waarneming</button>` : ""}
      </form>
    </div>`, { bijSluiten: () => kaart?.remove() });

  const form = el.querySelector("form");
  const status = el.querySelector(".gps-status");
  let pos = bestaande?.lat != null ? { lat: bestaande.lat, lon: bestaande.lon } : null;
  let land = bestaande?.land ? { land: bestaande.land, landNaam: bestaande.landNaam } : null;
  let plaatsZelfGetypt = !!bestaande?.plaats;
  form.plaats.addEventListener("input", () => (plaatsZelfGetypt = form.plaats.value.trim() !== ""));

  const toonStatus = tekst => { status.textContent = tekst + (land?.land ? ` · ${vlag(land.land)} ${land.landNaam || ""}` : ""); };

  // Plaatsnaam en land opzoeken bij een nieuwe plek.
  const zoekPlaats = async (lat, lon) => {
    try {
      const info = await plaatsInfo(lat, lon);
      land = info.land ? { land: info.land, landNaam: info.landNaam } : null;
      if (info.plaats && !plaatsZelfGetypt) form.plaats.value = info.plaats;
      toonStatus("📍 Plek aangeduid");
    } catch { /* geen internet: plaats zelf typen */ }
  };

  // --- satellietkaartje om de plek te kiezen ---
  let speld = null;
  const zetSpeld = (lat, lon, { centreer = false } = {}) => {
    pos = { lat, lon };
    if (!kaart) return;
    if (!speld) {
      speld = speldMarker().setLngLat([lon, lat]).addTo(kaart);
      speld.on("dragend", () => { const p = speld.getLngLat(); kiesPlek(p.lat, p.lng); });
    } else speld.setLngLat([lon, lat]);
    if (centreer) kaart.flyTo({ center: [lon, lat], zoom: Math.max(kaart.getZoom(), 15), duration: 1200 });
  };
  const kiesPlek = (lat, lon, opties) => { zetSpeld(lat, lon, opties); toonStatus("📍 Plek aangeduid"); return zoekPlaats(lat, lon); };

  if (metKaart) {
    try {
      kaart = maakKaart(el.querySelector("#mini-kaart"), {
        stijl: KAART.kiesStijl, scherm: false,
        ...(pos ? { center: [pos.lat, pos.lon], zoom: 15 } : {}),
      });
      if (pos) zetSpeld(pos.lat, pos.lon);
      kaart.on("click", e => kiesPlek(e.lngLat.lat, e.lngLat.lng));
    } catch {
      el.querySelector("#mini-kaart")?.remove();
      kaart = null;
    }
  }
  if (bestaande) toonStatus(pos ? "📍 Plek aangeduid" : "Nog geen plek aangeduid");

  const zoekLocatie = async () => {
    status.textContent = "Locatie zoeken…";
    try {
      const p = await haalPositie();
      zetSpeld(p.lat, p.lon, { centreer: true });
      toonStatus("📍 Je huidige locatie");
      await zoekPlaats(p.lat, p.lon);
      toonStatus("📍 Je huidige locatie");
    } catch {
      status.textContent = kaart ? "Geen gps: tik op de kaart of typ de plaats." : "Geen gps: typ de plaats.";
    }
  };
  el.querySelector("#gps").addEventListener("click", zoekLocatie);
  if (!bestaande) zoekLocatie();

  el.querySelector("#wis")?.addEventListener("click", () => {
    if (confirm("Deze waarneming verwijderen?")) { verwijder(); sluit(); }
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    sluit();
    opslaan({
      datum: new Date(form.datum.value).toISOString(),
      plaats: form.plaats.value.trim(),
      notitie: form.notitie.value.trim(),
      lat: pos?.lat ?? null,
      lon: pos?.lon ?? null,
      land: pos ? land?.land ?? null : null,
      landNaam: pos ? land?.landNaam ?? null : null,
    });
  });
}

// Snelkoppeling: een bestaande waarneming bewerken.
export function bewerkWaarneming(ctx, w) {
  const vogel = ctx.vogels.find(v => v.id === w.vogelId);
  if (!vogel) return;
  openWaarnemingDialoog({
    vogel, bestaande: w,
    titel: `${vogel.naam} bewerken`,
    knop: "💾 Opslaan",
    opslaan: wijziging => ctx.opslag.wijzigWaarneming(w.id, wijziging),
    verwijder: () => ctx.opslag.verwijderWaarneming(w.id),
  });
}
