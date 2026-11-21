// Venster om een waarneming toe te voegen of te bewerken:
// datum, plaats (met kaartje om de plek aan te duiden) en notitie.
import { esc, openModal } from "./ui.js";
import { haalPositie, plaatsnaam } from "./locatie.js";
import { kaartBeschikbaar, maakKaart, speldIcoon } from "./kaartlaag.js";

function naarLokaal(iso) {
  const d = iso ? new Date(iso) : new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

/**
 * @param vogel      object uit vogels.json
 * @param bestaande  bestaande waarneming (bewerken) of null (nieuwe)
 * @param opslaan    functie({ datum, plaats, notitie, lat, lon }) die het resultaat bewaart
 * @param titel/knop teksten bovenaan en op de bevestigknop
 * @param verwijder  optionele functie om de waarneming te verwijderen
 */
export function openWaarnemingDialoog({ vogel, bestaande = null, opslaan, titel, knop, verwijder }) {
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
        <div class="mini-kaart" id="mini-kaart" ${kaartBeschikbaar() ? "" : "hidden"}></div>
        <small class="gps-status">${kaartBeschikbaar() ? "Tik op de kaart om de plek aan te duiden." : ""}</small>

        <label for="w-notitie">Notitie</label>
        <textarea id="w-notitie" name="notitie" rows="3" maxlength="500" placeholder="Wat deed hij? Hoe was het weer? Met wie was je?">${esc(bestaande?.notitie)}</textarea>

        <button class="knop knop-groot" type="submit">${esc(knop)}</button>
        ${verwijder ? `<button class="knop knop-gevaar" type="button" id="wis">Verwijder deze waarneming</button>` : ""}
      </form>
    </div>`);

  const form = el.querySelector("form");
  const status = el.querySelector(".gps-status");
  let pos = bestaande?.lat != null ? { lat: bestaande.lat, lon: bestaande.lon } : null;
  let plaatsZelfGetypt = !!bestaande?.plaats;
  form.plaats.addEventListener("input", () => (plaatsZelfGetypt = form.plaats.value.trim() !== ""));

  // --- kaartje ---
  let kaart = null, speld = null;
  let kiesPlek = null; // (lat, lon) -> speld zetten + plaatsnaam opzoeken; alleen als de kaart geladen is
  if (kaartBeschikbaar()) {
    kaart = maakKaart(el.querySelector("#mini-kaart"), pos ? { center: [pos.lat, pos.lon], zoom: 14 } : {});
    const zetSpeld = (lat, lon, { centreer = false } = {}) => {
      pos = { lat, lon };
      if (!speld) {
        speld = window.L.marker([lat, lon], { draggable: true, icon: speldIcoon() }).addTo(kaart);
        speld.on("dragend", () => { const p = speld.getLatLng(); kiesPlek(p.lat, p.lng); });
      } else speld.setLatLng([lat, lon]);
      if (centreer) kaart.setView([lat, lon], Math.max(kaart.getZoom(), 14));
    };
    if (pos) zetSpeld(pos.lat, pos.lon);
    kaart.on("click", e => kiesPlek(e.latlng.lat, e.latlng.lng));
    kiesPlek = async (lat, lon, opties) => {
      zetSpeld(lat, lon, opties);
      status.textContent = "📍 Plek aangeduid";
      if (plaatsZelfGetypt) return;
      try {
        const naam = await plaatsnaam(lat, lon);
        if (naam && !plaatsZelfGetypt) form.plaats.value = naam;
      } catch { /* geen internet: plaats zelf typen */ }
    };
  }

  const zoekLocatie = async () => {
    status.textContent = "Locatie zoeken…";
    try {
      const p = await haalPositie();
      if (kiesPlek) await kiesPlek(p.lat, p.lon, { centreer: true });
      else {
        pos = p;
        if (!plaatsZelfGetypt) form.plaats.value = await plaatsnaam(p.lat, p.lon).catch(() => form.plaats.value);
      }
      status.textContent = "📍 Je huidige locatie";
    } catch {
      status.textContent = "Geen gps: tik op de kaart of typ de plaats.";
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
