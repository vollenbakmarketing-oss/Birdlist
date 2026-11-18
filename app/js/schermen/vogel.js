// Detailscherm van één vogel: het kaartje, je waarnemingen en (optioneel) eBird.
import { kaartHtml, koppelGeluid } from "../kaart.js";
import { esc, datumTekst } from "../ui.js";
import { recenteWaarnemingen, soortPagina } from "../ebird.js";
import { openVangDialoog } from "./vangen.js";

export function vogelScherm(root, ctx, id) {
  const v = ctx.vogels.find(x => x.id === id);
  if (!v) { root.innerHTML = `<p class="leeg">Deze vogel bestaat niet (meer).</p>`; return; }
  const lijst = ctx.status.perVogel.get(id) || [];
  const heb = lijst.length > 0;
  let onthuld = heb;

  const teken = () => {
    root.innerHTML = `
      <a class="terug" href="#/">← Vogeldex</a>
      ${kaartHtml(v, { eerste: lijst[0], verborgen: !onthuld })}
      <div class="acties">
        ${!onthuld ? `<button class="knop knop-licht" id="onthul">👀 Wie is het? (spieken)</button>` : ""}
        <button class="knop knop-groot" id="vang">${heb ? "🔭 Ik zag hem nog eens!" : "🎯 Ik heb hem gezien!"}</button>
      </div>

      ${heb ? `
      <section class="blok">
        <h3>Mijn waarnemingen (${lijst.length})</h3>
        <ul class="waarnemingen">
          ${[...lijst].reverse().map(w => `
            <li><div><strong>${datumTekst(w.datum, { tijd: true })}</strong><br>
              <span>${esc(w.plaats || "Onbekende plaats")}</span>
              ${w.notitie ? `<em>“${esc(w.notitie)}”</em>` : ""}</div>
              <button class="knop-mini" data-wis="${w.id}" aria-label="Verwijder">🗑</button></li>`).join("")}
        </ul>
      </section>` : ""}

      ${onthuld && v.ebird ? `
      <section class="blok" id="ebird">
        <h3>Recent gezien door vogelaars</h3>
        <div id="ebird-inhoud">${ctx.opslag.get().instellingen.ebirdSleutel
          ? `<p class="klein">Laden…</p>`
          : `<p class="klein">Vul een eBird-sleutel in bij <a href="#/meer">Meer</a> om te zien waar deze vogel de laatste tijd gezien is.</p>`}</div>
        <p class="klein"><a href="${soortPagina(v.ebird)}" target="_blank" rel="noopener">Meer over deze vogel op eBird →</a></p>
      </section>` : ""}
    `;

    koppelGeluid(root);
    root.querySelector("#onthul")?.addEventListener("click", () => { onthuld = true; teken(); });
    root.querySelector("#vang").addEventListener("click", () => openVangDialoog(ctx, v));
    root.querySelectorAll("[data-wis]").forEach(b => b.addEventListener("click", () => {
      if (confirm("Deze waarneming verwijderen?")) ctx.opslag.verwijderWaarneming(b.dataset.wis);
    }));
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
