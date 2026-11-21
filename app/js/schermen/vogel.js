// Detailscherm van één vogel: het kaartje, je waarnemingen (bewerkbaar), kaart en eBird.
import { kaartHtml, koppelGeluid } from "../kaartje.js";
import { esc, datumTekst, zzKleur } from "../ui.js";
import { recenteWaarnemingen, soortPagina } from "../ebird.js";
import { openSpotDialoog } from "./spotten.js";
import { bewerkWaarneming } from "../waarneming-dialoog.js";
import { kaartBeschikbaar, maakKaart, stickerIcoon } from "../kaartlaag.js";

export function vogelScherm(root, ctx, id) {
  const v = ctx.vogels.find(x => x.id === id);
  if (!v) { root.innerHTML = `<p class="leeg">Deze vogel bestaat niet (meer).</p>`; return; }
  const lijst = ctx.status.perVogel.get(id) || [];
  const heb = lijst.length > 0;
  const metPlek = lijst.filter(w => w.lat != null);
  let onthuld = heb;

  const teken = () => {
    root.innerHTML = `
      <a class="terug" href="#/">← Alle vogels</a>
      ${kaartHtml(v, { eerste: lijst[0], verborgen: !onthuld })}
      <div class="acties">
        ${!onthuld ? `<button class="knop knop-licht" id="onthul">👀 Wie is het? (spieken)</button>` : ""}
        <button class="knop knop-groot" id="spot">${heb ? "🔭 Ik zag hem nog eens!" : "🔭 Ik heb hem gespot!"}</button>
      </div>

      ${heb ? `
      <section class="blok">
        <h3>Mijn waarnemingen (${lijst.length})</h3>
        ${metPlek.length && kaartBeschikbaar() ? `<div class="vogel-kaart" id="vogel-kaart"></div>` : ""}
        <ul class="waarnemingen">
          ${[...lijst].reverse().map(w => `
            <li>
              <div class="w-tekst"><strong>${datumTekst(w.datum, { tijd: true })}</strong>
                <span>📍 ${esc(w.plaats || "Onbekende plaats")}</span>
                ${w.notitie ? `<p class="notitie">${esc(w.notitie)}</p>` : `<button class="link-knop" data-bewerk="${w.id}">+ notitie toevoegen</button>`}
              </div>
              <button class="knop-mini" data-bewerk="${w.id}" aria-label="Bewerk deze waarneming">✏️</button>
            </li>`).join("")}
        </ul>
      </section>` : ""}

      ${onthuld && v.ebird ? `
      <section class="blok" id="ebird">
        <h3>Recent gezien door vogelaars</h3>
        <div id="ebird-inhoud">${ctx.opslag.get().instellingen.ebirdSleutel
          ? `<p class="klein">Laden…</p>`
          : `<p class="klein">Vul een eBird-sleutel in bij <a href="#/meer">Instellingen</a> om te zien waar deze vogel de laatste tijd gezien is.</p>`}</div>
        <p class="klein"><a href="${soortPagina(v.ebird)}" target="_blank" rel="noopener">Meer over deze vogel op eBird →</a></p>
      </section>` : ""}
    `;

    koppelGeluid(root);
    root.querySelector("#onthul")?.addEventListener("click", () => { onthuld = true; teken(); });
    root.querySelector("#spot").addEventListener("click", () => openSpotDialoog(ctx, v));
    root.querySelectorAll("[data-bewerk]").forEach(b => b.addEventListener("click", () =>
      bewerkWaarneming(ctx, lijst.find(w => w.id === b.dataset.bewerk))));

    const kaartEl = root.querySelector("#vogel-kaart");
    if (kaartEl) {
      const kaart = maakKaart(kaartEl, { scrollWheelZoom: false });
      const punten = metPlek.map(w => {
        window.L.marker([w.lat, w.lon], { icon: stickerIcoon(v, { kleur: zzKleur(v.zeldzaamheid), grootte: 38 }) })
          .addTo(kaart).bindPopup(`<strong>${datumTekst(w.datum)}</strong><br>${esc(w.plaats || "")}`);
        return [w.lat, w.lon];
      });
      if (punten.length === 1) kaart.setView(punten[0], 13);
      else kaart.fitBounds(punten, { padding: [30, 30], maxZoom: 14 });
    }

    if (onthuld) laadEbird(root, ctx, v, lijst.at(-1));
  };
  teken();
}

async function laadEbird(root, ctx, v, laatste) {
  const sleutel = ctx.opslag.get().instellingen.ebirdSleutel;
  const doel = root.querySelector("#ebird-inhoud");
  if (!sleutel || !doel || !v.ebird) return;
  try {
    const obs = await recenteWaarnemingen(v.ebird, sleutel, laatste?.lat != null ? { lat: laatste.lat, lon: laatste.lon } : {});
    doel.innerHTML = obs.length
      ? `<ul class="ebird-lijst">${obs.map(o => `<li><strong>${esc(o.locName)}</strong><span>${datumTekst(o.obsDt)}${o.howMany ? ` · ${o.howMany}×` : ""}</span></li>`).join("")}</ul>`
      : `<p class="klein">De laatste 30 dagen niet gemeld${laatste?.lat != null ? " in de buurt" : " in België"}. Een echte uitdaging!</p>`;
  } catch (e) {
    doel.innerHTML = `<p class="klein">Kon eBird niet bereiken: ${esc(e.message)}</p>`;
  }
}
