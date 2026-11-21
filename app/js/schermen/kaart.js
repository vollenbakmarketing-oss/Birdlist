// Kaart met al je waarnemingen, verbonden door een route in de volgorde waarin
// je ze zag (zoals een reisverslag). Onderaan een tijdlijn: tik om ernaartoe te vliegen.
import { KAART } from "../config.js";
import { esc, datumTekst, zzKleur } from "../ui.js";
import { kaartBeschikbaar, maakKaart, stickerIcoon } from "../kaartlaag.js";

let toonRoute = true;

export function kaartScherm(root, ctx) {
  const perVogel = new Map(ctx.vogels.map(v => [v.id, v]));
  const stappen = ctx.opslag.get().waarnemingen
    .filter(w => w.lat != null && perVogel.has(w.vogelId))
    .sort((a, b) => a.datum.localeCompare(b.datum));
  const zonderPlek = ctx.opslag.get().waarnemingen.length - stappen.length;

  if (!kaartBeschikbaar()) {
    root.innerHTML = `<p class="leeg">De kaart kon niet laden. Heb je internet?</p>`;
    return;
  }

  root.innerHTML = `
    <div class="kaart-scherm">
      <div class="wereldkaart" id="wereldkaart"></div>
      <div class="kaart-balk">
        <label class="schakel"><input type="checkbox" id="route" ${toonRoute ? "checked" : ""}> Toon mijn route</label>
        <span class="klein">${stappen.length} ${stappen.length === 1 ? "plek" : "plekken"}${zonderPlek ? ` · ${zonderPlek} zonder locatie` : ""}</span>
      </div>
      ${stappen.length ? `
      <ol class="tijdlijn" aria-label="Tijdlijn">
        ${stappen.map((w, i) => {
          const v = perVogel.get(w.vogelId);
          return `<li><button data-stap="${i}" style="--zz:${zzKleur(v.zeldzaamheid)}">
            <img src="${esc(v.sticker)}" alt="">
            <strong>${esc(v.naam)}</strong>
            <small>${datumTekst(w.datum)}</small>
          </button></li>`;
        }).join("")}
      </ol>` : `<p class="leeg">Nog geen plekken op je kaart. Duid bij het spotten aan waar je de vogel zag, dan verschijnt hij hier! 🗺️</p>`}
    </div>`;

  const kaart = maakKaart(root.querySelector("#wereldkaart"));
  const markers = stappen.map(w => {
    const v = perVogel.get(w.vogelId);
    return window.L.marker([w.lat, w.lon], { icon: stickerIcoon(v, { kleur: zzKleur(v.zeldzaamheid) }) })
      .addTo(kaart)
      .bindPopup(`
        <div class="popup">
          <strong>${esc(v.naam)}</strong><br>
          <small>${datumTekst(w.datum, { tijd: true })}${w.plaats ? "<br>📍 " + esc(w.plaats) : ""}</small>
          ${w.notitie ? `<p>${esc(w.notitie)}</p>` : ""}
          <a href="#/vogel/${v.id}">Bekijk kaartje →</a>
        </div>`);
  });

  const lijn = window.L.polyline(stappen.map(w => [w.lat, w.lon]), {
    color: KAART.routeKleur, weight: 3, dashArray: "6 8", opacity: 0.9,
  });
  if (toonRoute && stappen.length > 1) lijn.addTo(kaart);

  if (stappen.length === 1) kaart.setView([stappen[0].lat, stappen[0].lon], 13);
  else if (stappen.length > 1) kaart.fitBounds(stappen.map(w => [w.lat, w.lon]), { padding: [40, 40], maxZoom: 14 });

  root.querySelector("#route").addEventListener("change", e => {
    toonRoute = e.target.checked;
    if (toonRoute && stappen.length > 1) lijn.addTo(kaart); else lijn.remove();
  });
  root.querySelectorAll("[data-stap]").forEach(b => b.addEventListener("click", () => {
    const i = +b.dataset.stap;
    kaart.flyTo([stappen[i].lat, stappen[i].lon], Math.max(kaart.getZoom(), 14), { duration: 0.8 });
    markers[i].openPopup();
  }));
}
