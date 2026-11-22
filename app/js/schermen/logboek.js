// Logboek: je dagboek met alle waarnemingen (per dag, met notities) en je lifelist.
import { esc, nr, datumTekst, zzKleur, sterren } from "../ui.js";
import { bewerkWaarneming } from "../waarneming-dialoog.js";

let tab = "dagboek"; // onthouden tussen schermwissels

export function logboekScherm(root, ctx) {
  const { status, vogels } = ctx;
  const alle = ctx.opslag.get().waarnemingen;
  const plaatsen = new Set(alle.map(w => w.plaats).filter(Boolean));

  root.innerHTML = `
    <h1 class="titel">Mijn logboek</h1>
    <section class="stats">
      <div><strong>${status.gespot.length}</strong><span>soorten</span></div>
      <div><strong>${alle.length}</strong><span>waarnemingen</span></div>
      <div><strong>${plaatsen.size}</strong><span>plaatsen</span></div>
      <div><strong>${Math.round((status.gespot.length / vogels.length) * 100)}%</strong><span>compleet</span></div>
    </section>
    <nav class="tabs" role="tablist">
      <button role="tab" class="${tab === "dagboek" ? "aan" : ""}" data-tab="dagboek">📓 Dagboek</button>
      <button role="tab" class="${tab === "lifelist" ? "aan" : ""}" data-tab="lifelist">⭐ Lifelist</button>
    </nav>
    <div id="tab-inhoud"></div>
  `;
  const doel = root.querySelector("#tab-inhoud");
  if (!alle.length) {
    doel.innerHTML = `<p class="leeg">Je logboek is nog leeg. Tik op de <strong>verrekijker</strong> als je een vogel ziet!</p>`;
  } else if (tab === "dagboek") {
    doel.innerHTML = dagboekHtml(ctx, alle);
  } else {
    doel.innerHTML = lifelistHtml(status);
  }
  root.querySelectorAll("[data-tab]").forEach(b => b.addEventListener("click", () => { tab = b.dataset.tab; logboekScherm(root, ctx); }));
  root.querySelectorAll("[data-bewerk]").forEach(b => b.addEventListener("click", () =>
    bewerkWaarneming(ctx, alle.find(w => w.id === b.dataset.bewerk))));
}

function dagKey(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dagboekHtml(ctx, alle) {
  const perVogel = new Map(ctx.vogels.map(v => [v.id, v]));
  // nieuwste eerst; bij dezelfde minuut: laatst toegevoegde eerst
  const gesorteerd = alle.map((w, i) => ({ w, i })).sort((a, b) => b.w.datum.localeCompare(a.w.datum) || b.i - a.i).map(x => x.w);
  const dagen = [];
  for (const w of gesorteerd) {
    const k = dagKey(w.datum);
    if (dagen.at(-1)?.k !== k) dagen.push({ k, datum: w.datum, items: [] });
    dagen.at(-1).items.push(w);
  }
  // welke waarneming was de eerste van die soort? → "Nieuw!"-label
  const eerste = new Set([...ctx.status.perVogel.values()].map(l => l[0].id));

  return `<ol class="dagboek">${dagen.map(d => {
    const plekken = [...new Set(d.items.map(w => w.plaats).filter(Boolean))];
    return `<li class="dag">
      <header class="dag-kop">
        <strong>${datumTekst(d.datum)}</strong>
        <span>${d.items.length} ${d.items.length === 1 ? "vogel" : "vogels"}${plekken.length ? " · " + esc(plekken.join(", ")) : ""}</span>
      </header>
      <ul class="dag-items">${d.items.map(w => {
        const v = perVogel.get(w.vogelId);
        if (!v) return "";
        const uur = new Date(w.datum).toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit" });
        return `<li style="--zz:${zzKleur(v.zeldzaamheid)}">
          <a href="#/vogel/${v.id}"><img src="${esc(v.sticker)}" alt="" loading="lazy"></a>
          <div class="item-tekst">
            <a href="#/vogel/${v.id}"><strong>${esc(v.naam)}</strong></a>
            ${eerste.has(w.id) ? `<span class="nieuw">Nieuw!</span>` : ""}
            <small>${uur}${w.plaats ? " · " + esc(w.plaats) : ""}</small>
            ${w.notitie ? `<p class="notitie">${esc(w.notitie)}</p>` : ""}
          </div>
          <button class="knop-mini" data-bewerk="${w.id}" aria-label="Bewerk ${esc(v.naam)}">✏️</button>
        </li>`;
      }).join("")}</ul>
    </li>`;
  }).join("")}</ol>`;
}

function lifelistHtml(status) {
  const rijen = status.gespot
    .map(v => ({ v, eerste: status.perVogel.get(v.id)[0], aantal: status.perVogel.get(v.id).length }))
    .sort((a, b) => b.eerste.datum.localeCompare(a.eerste.datum));
  return `<ol class="lifelist">
    ${rijen.map(({ v, eerste, aantal }, i) => `
      <li><a href="#/vogel/${v.id}" style="--zz:${zzKleur(v.zeldzaamheid)}">
        <span class="ll-nr">${rijen.length - i}</span>
        <img src="${esc(v.sticker)}" alt="" loading="lazy">
        <span class="ll-info"><strong>${esc(v.naam)}</strong> <span class="ll-sterren">${sterren(v.zeldzaamheid)}</span>
          <small>${datumTekst(eerste.datum)}${eerste.plaats ? " · " + esc(eerste.plaats) : ""}${aantal > 1 ? ` · ${aantal}× gezien` : ""}</small></span>
        <span class="ll-dex">${nr(v.nr)}</span>
      </a></li>`).join("")}
  </ol>`;
}
