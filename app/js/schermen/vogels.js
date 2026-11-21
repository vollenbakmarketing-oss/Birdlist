// Overzicht van alle vogels. Nog niet gespotte vogels staan er als silhouet.
import { GROEPEN } from "../config.js";
import { esc, nr, sterren, zzKleur } from "../ui.js";

let filter = "alle"; // onthouden tussen schermwissels

export function vogelsScherm(root, ctx) {
  const { vogels, status } = ctx;
  const chips = [["alle", "Alle"], ["gespot", "✓ Gespot"], ["nog", "Nog te spotten"],
    ...Object.entries(GROEPEN).map(([k, g]) => [k, `${g.icoon} ${g.label}`])];

  const zicht = vogels.filter(v => {
    const heb = status.perVogel.has(v.id);
    if (filter === "gespot") return heb;
    if (filter === "nog") return !heb;
    if (filter in GROEPEN) return v.groep === filter;
    return true;
  });

  root.innerHTML = `
    <section class="dex-kop">
      <div class="teller"><strong>${status.gespot.length}</strong> / ${vogels.length}<span>gespot</span></div>
      <div class="balk"><div style="width:${(status.gespot.length / vogels.length) * 100}%"></div></div>
    </section>
    <nav class="chips" aria-label="Filter">
      ${chips.map(([k, l]) => `<button class="chip ${k === filter ? "aan" : ""}" data-f="${k}">${l}</button>`).join("")}
    </nav>
    <ul class="raster">
      ${zicht.map(v => {
        const heb = status.perVogel.has(v.id);
        return `<li>
          <a class="tegel ${heb ? "" : "verborgen"}" href="#/vogel/${v.id}" style="--zz:${zzKleur(v.zeldzaamheid)}">
            <span class="tegel-nr">${nr(v.nr)}</span>
            <img src="${esc(v.sticker)}" alt="${heb ? esc(v.naam) : "Nog niet gespot"}" loading="lazy">
            <span class="tegel-naam">${heb ? esc(v.naam) : "???"}</span>
            <span class="tegel-sterren">${sterren(v.zeldzaamheid)}</span>
          </a></li>`;
      }).join("")}
    </ul>
    ${zicht.length === 0 ? `<p class="leeg">Nog niets hier. Ga naar buiten en spot je eerste vogel! 🔭</p>` : ""}
  `;
  root.querySelectorAll(".chip").forEach(c => c.addEventListener("click", () => { filter = c.dataset.f; vogelsScherm(root, ctx); }));
}
