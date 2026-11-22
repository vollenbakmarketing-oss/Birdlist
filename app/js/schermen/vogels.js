// Overzicht van alle vogels. Nog niet gespotte vogels staan er als silhouet.
import { GROEPEN } from "../config.js";
import { esc, nr, sterren, zzKleur } from "../ui.js";

let filter = "alle"; // onthouden tussen schermwissels

export function vogelsScherm(root, ctx) {
  const { vogels, status } = ctx;
  const wishlist = new Set(ctx.opslag.get().wishlist);
  const chips = [["alle", "Alle"], ["gespot", "✓ Gespot"], ["nog", "Nog te spotten"], ["wishlist", `⭐ Wil ik zien (${wishlist.size})`],
    ...Object.entries(GROEPEN).map(([k, g]) => [k, `${g.icoon} ${g.label}`])];

  const zicht = vogels.filter(v => {
    const heb = status.perVogel.has(v.id);
    if (filter === "gespot") return heb;
    if (filter === "nog") return !heb;
    if (filter === "wishlist") return wishlist.has(v.id);
    if (filter in GROEPEN) return v.groep === filter;
    return true;
  });

  root.innerHTML = `
    <section class="dex-kop">
      <div class="teller"><strong>${status.gespot.length}</strong> / ${vogels.length}<span>gespot${wishlist.size ? ` · ⭐ ${wishlist.size} wensvogel${wishlist.size === 1 ? "" : "s"}` : ""}</span></div>
      <div class="balk"><div style="width:${(status.gespot.length / vogels.length) * 100}%"></div></div>
    </section>
    <nav class="chips" aria-label="Filter">
      ${chips.map(([k, l]) => `<button class="chip ${k === filter ? "aan" : ""}" data-f="${k}">${l}</button>`).join("")}
    </nav>
    <ul class="raster">
      ${zicht.map(v => {
        const heb = status.perVogel.has(v.id);
        const wens = !heb && wishlist.has(v.id);   // wensvogel: wel zichtbaar, in een eigen kleur
        return `<li>
          <a class="tegel ${heb ? "" : wens ? "wens" : "verborgen"}" href="#/vogel/${v.id}" style="--zz:${zzKleur(v.zeldzaamheid)}">
            <span class="tegel-nr">${nr(v.nr)}</span>
            ${wens ? `<span class="tegel-wens">⭐ Wil ik zien</span>` : ""}
            <img src="${esc(v.sticker)}" alt="${heb || wens ? esc(v.naam) : "Nog niet gespot"}" loading="lazy">
            <span class="tegel-naam">${heb || wens ? esc(v.naam) : "???"}</span>
            <span class="tegel-sterren">${sterren(v.zeldzaamheid)}</span>
          </a></li>`;
      }).join("")}
    </ul>
    ${zicht.length === 0 ? `<p class="leeg">${filter === "wishlist"
      ? "Nog geen wensvogels. Tik op SPOT, kies een vogel en tik op ⭐ Wil ik zien."
      : "Nog niets hier. Ga naar buiten en spot je eerste vogel! 🔭"}</p>` : ""}
  `;
  root.querySelectorAll(".chip").forEach(c => c.addEventListener("click", () => { filter = c.dataset.f; vogelsScherm(root, ctx); }));
}
