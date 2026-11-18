// Lifelist: alle soorten in de volgorde waarin je ze voor het eerst zag.
import { esc, nr, datumTekst, zzKleur, sterren } from "../ui.js";

export function lijstScherm(root, ctx) {
  const { status, vogels } = ctx;
  const rijen = status.gevangen
    .map(v => ({ v, eerste: status.perVogel.get(v.id)[0], aantal: status.perVogel.get(v.id).length }))
    .sort((a, b) => b.eerste.datum.localeCompare(a.eerste.datum));
  const plaatsen = new Set(ctx.opslag.get().waarnemingen.map(w => w.plaats).filter(Boolean));

  root.innerHTML = `
    <h1 class="titel">Mijn lifelist</h1>
    <section class="stats">
      <div><strong>${status.gevangen.length}</strong><span>soorten</span></div>
      <div><strong>${ctx.opslag.get().waarnemingen.length}</strong><span>waarnemingen</span></div>
      <div><strong>${plaatsen.size}</strong><span>plaatsen</span></div>
      <div><strong>${Math.round((status.gevangen.length / vogels.length) * 100)}%</strong><span>compleet</span></div>
    </section>
    ${rijen.length ? `<ol class="lifelist">
      ${rijen.map(({ v, eerste, aantal }, i) => `
        <li><a href="#/vogel/${v.id}" style="--zz:${zzKleur(v.zeldzaamheid)}">
          <span class="ll-nr">${rijen.length - i}</span>
          <img src="${esc(v.sticker)}" alt="" loading="lazy">
          <span class="ll-info"><strong>${esc(v.naam)}</strong> <span class="ll-sterren">${sterren(v.zeldzaamheid)}</span>
            <small>${datumTekst(eerste.datum)}${eerste.plaats ? " · " + esc(eerste.plaats) : ""}${aantal > 1 ? ` · ${aantal}× gezien` : ""}</small></span>
          <span class="ll-dex">${nr(v.nr)}</span>
        </a></li>`).join("")}
    </ol>` : `<p class="leeg">Je lijst is nog leeg. Tik op <strong>＋ Vang</strong> als je een vogel ziet!</p>`}
  `;
}
