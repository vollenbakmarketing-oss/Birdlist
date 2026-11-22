// Wereldkaart (satelliet) met al je waarnemingen, verbonden door een route in de volgorde
// waarin je ze zag. Start als draaiende wereldbol en vliegt dan naar je plekken.
// Onderaan een tijdlijn: tik om ernaartoe te vliegen. Rechtsboven: het spel "Raad de vogel".
import { esc, datumTekst, zzKleur } from "../ui.js";
import { kaartBeschikbaar, maakKaart, stickerMarker, popup, tekenRoute, grenzen } from "../kaartlaag.js";

let toonRoute = true;

export function kaartScherm(root, ctx) {
  const perVogel = new Map(ctx.vogels.map(v => [v.id, v]));
  const stappen = ctx.opslag.get().waarnemingen
    .filter(w => w.lat != null && perVogel.has(w.vogelId))
    .sort((a, b) => a.datum.localeCompare(b.datum));
  const zonderPlek = ctx.opslag.get().waarnemingen.length - stappen.length;
  const spelKnop = `<a class="spel-knop" href="#/spel">🎮 Raad de vogel</a>`;

  if (!kaartBeschikbaar()) {
    root.innerHTML = `
      <div class="blok geen-kaart">
        <h2>🌍 De kaart is nog niet ingesteld</h2>
        <p>Voor de satellietkaart is een gratis Mapbox-sleutel nodig. Vraag een volwassene om hem in te stellen:</p>
        <ol>
          <li>Maak een gratis account op <a href="https://account.mapbox.com/auth/signup/" target="_blank" rel="noopener">mapbox.com</a>.</li>
          <li>Kopieer je <strong>Default public token</strong> (begint met <code>pk.</code>).</li>
          <li>Plak hem bij <a href="#/meer">Instellingen</a>.</li>
        </ol>
        ${typeof window.mapboxgl === "undefined" ? `<p class="klein">Of je hebt geen internet: de kaart heeft verbinding nodig.</p>` : ""}
      </div>
      <div class="acties">${spelKnop}</div>`;
    return;
  }

  root.innerHTML = `
    <div class="kaart-scherm">
      <div class="wereldkaart-houder">
        <div class="wereldkaart" id="wereldkaart"></div>
        ${spelKnop}
      </div>
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

  // Start als wereldbol boven je waarnemingen (of boven België).
  const midden = stappen.length
    ? [stappen.reduce((s, w) => s + w.lat, 0) / stappen.length, stappen.reduce((s, w) => s + w.lon, 0) / stappen.length]
    : undefined;
  const kaart = maakKaart(root.querySelector("#wereldkaart"), { center: midden, zoom: 1.2 });

  const markers = stappen.map(w => {
    const v = perVogel.get(w.vogelId);
    return stickerMarker(v, { kleur: zzKleur(v.zeldzaamheid) })
      .setLngLat([w.lon, w.lat])
      .setPopup(popup(`
        <div class="popup">
          <strong>${esc(v.naam)}</strong><br>
          <small>${datumTekst(w.datum, { tijd: true })}${w.plaats ? "<br>📍 " + esc(w.plaats) : ""}</small>
          ${w.notitie ? `<p>${esc(w.notitie)}</p>` : ""}
          <a href="#/vogel/${v.id}">Bekijk kaartje →</a>
        </div>`))
      .addTo(kaart);
  });

  const punten = stappen.map(w => [w.lat, w.lon]);
  const zetRoute = punten.length > 1 ? tekenRoute(kaart, punten, toonRoute) : () => {};

  // Na het laden: van de wereldbol naar je plekken vliegen.
  kaart.once("load", () => {
    if (!punten.length) return;
    setTimeout(() => {
      if (punten.length === 1) kaart.flyTo({ center: [punten[0][1], punten[0][0]], zoom: 12, duration: 3500, essential: true });
      else kaart.fitBounds(grenzen(punten), { padding: 60, maxZoom: 13, duration: 3500, essential: true });
    }, 600);
  });

  root.querySelector("#route").addEventListener("change", e => { toonRoute = e.target.checked; zetRoute(toonRoute); });
  root.querySelectorAll("[data-stap]").forEach(b => b.addEventListener("click", () => {
    const i = +b.dataset.stap;
    markers.forEach(m => m.getPopup()?.isOpen() && m.togglePopup());
    kaart.flyTo({ center: [stappen[i].lon, stappen[i].lat], zoom: Math.max(kaart.getZoom(), 14), duration: 1500, essential: true });
    kaart.once("moveend", () => { if (!markers[i].getPopup().isOpen()) markers[i].togglePopup(); });
  }));
}
