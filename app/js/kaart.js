// Het digitale vogelkaartje (zoals een ruilkaart).
import { ZELDZAAMHEID, GROEPEN, TREK, IUCN, CREDITS } from "./config.js";
import { esc, nr, sterren, bereik, vergelijkLengte, vergelijkSpanwijdte, datumTekst } from "./ui.js";

export function geluidUrl(vogel) {
  const g = vogel.geluid;
  if (!g) return null;
  if (/^https?:/.test(g)) return g;
  const id = String(g).replace(/^XC/i, "");
  return `https://xeno-canto.org/${id}/download`;
}

export function xenoCantoPagina(vogel) {
  return `https://xeno-canto.org/species/${vogel.wetenschappelijk.replace(" ", "-")}`;
}

/**
 * @param vogel     object uit vogels.json
 * @param eerste    eerste waarneming (of null als nog niet gevangen)
 * @param verborgen true = silhouet tonen (nog niet gevangen)
 * @param compact   true = zonder details (voor het feestscherm)
 */
export function kaartHtml(vogel, { eerste = null, verborgen = false, compact = false } = {}) {
  const zz = ZELDZAAMHEID[vogel.zeldzaamheid] || {};
  const groep = GROEPEN[vogel.groep] || {};
  const trek = TREK[vogel.trek] || {};
  const naam = verborgen ? "???" : esc(vogel.naam);
  const geluid = geluidUrl(vogel);

  return `
  <article class="kaart zz-${esc(vogel.zeldzaamheid.replace(" ", "-"))} ${verborgen ? "verborgen" : ""} ${compact ? "compact" : ""}" style="--zz:${zz.kleur}">
    <header class="kaart-kop">
      <span class="kaart-nr">${nr(vogel.nr)}</span>
      <h2 class="kaart-naam">${naam}</h2>
      <span class="kaart-sterren" title="${esc(zz.label)}">${sterren(vogel.zeldzaamheid)}</span>
    </header>

    <div class="kaart-beeld">
      <img src="${esc(vogel.sticker)}" alt="${verborgen ? "Silhouet van een onbekende vogel" : esc(vogel.naam)}" loading="lazy">
      <span class="kaart-groep">${groep.icoon || ""} ${esc(groep.label || "")}</span>
    </div>

    <p class="kaart-latijn">${verborgen ? "&nbsp;" : `<i>${esc(vogel.wetenschappelijk)}</i>`}</p>

    <dl class="kaart-stats">
      <div><dt>Zeldzaamheid</dt><dd><span class="zz-label">${esc(zz.label)}</span></dd></div>
      <div><dt>Grootte</dt><dd>${bereik(vogel.lengteCm)}<small>zo lang als ${vergelijkLengte(vogel.lengteCm[1])}</small></dd></div>
      <div><dt>Spanwijdte</dt><dd>${bereik(vogel.spanwijdteCm)}<small>${vergelijkSpanwijdte(vogel.spanwijdteCm[1])}</small></dd></div>
      <div><dt>Trekgedrag</dt><dd>${esc(trek.label)}<small>${esc(trek.uitleg)}</small></dd></div>
      ${vogel.iucn ? `<div><dt>Wereldwijd</dt><dd>${esc(IUCN[vogel.iucn] || vogel.iucn)}</dd></div>` : ""}
    </dl>

    ${verborgen ? `
      <div class="kaart-weetje slot"><strong>🔒 Wist je dat?</strong><p>Vang deze vogel om zijn geheim te ontdekken.</p></div>
    ` : `
      <div class="kaart-weetje"><strong>💡 Wist je dat?</strong><p>${esc(vogel.weetje)}</p></div>
      <div class="kaart-geluid">
        ${geluid
          ? `<button class="knop geluid-knop" data-geluid="${esc(geluid)}">🔊 Luister</button>`
          : `<a class="knop knop-licht" href="${xenoCantoPagina(vogel)}" target="_blank" rel="noopener">🔊 Luister op xeno-canto</a>`}
        ${geluid && vogel.geluidBron ? `<p class="kaart-credit">Geluid: ${esc(vogel.geluidBron)}</p>` : ""}
      </div>
    `}

    ${eerste ? `<footer class="kaart-voet">Gevangen op ${datumTekst(eerste.datum)}${eerste.plaats ? ` in ${esc(eerste.plaats)}` : ""}</footer>` : ""}
    <p class="kaart-credit"><a href="${CREDITS.stickers.url}" target="_blank" rel="noopener">Illustratie: huashu-bird-sticker, CC BY 4.0</a></p>
  </article>`;
}

// Eén audio-speler voor de hele app.
let speler;
export function koppelGeluid(root) {
  root.querySelectorAll(".geluid-knop").forEach(k => k.addEventListener("click", () => {
    if (speler && !speler.paused && speler.dataset.src === k.dataset.geluid) { speler.pause(); k.textContent = "🔊 Luister"; return; }
    speler?.pause();
    speler = new Audio(k.dataset.geluid);
    speler.dataset.src = k.dataset.geluid;
    k.textContent = "⏸ Stop";
    speler.addEventListener("ended", () => (k.textContent = "🔊 Luister"));
    speler.play().catch(() => { k.textContent = "🔊 Geluid niet beschikbaar"; });
  }));
}
