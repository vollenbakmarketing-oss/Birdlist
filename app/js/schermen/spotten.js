// Spotten: zoek de vogel die je zag, vul datum/plaats/notitie in en log hem!
import { GROEPEN, ZELDZAAMHEID, PUNTEN_HERHAALDE_WAARNEMING } from "../config.js";
import { esc, nr, zzKleur, openModal, toast } from "../ui.js";
import { kaartHtml, koppelGeluid } from "../kaartje.js";
import { berekenStatus } from "../spel.js";
import { openWaarnemingDialoog } from "../waarneming-dialoog.js";

const GROOTTES = {
  klein:  { label: "Klein (mus)",         test: v => v.lengteCm[1] <= 16 },
  middel: { label: "Middel (merel)",      test: v => v.lengteCm[1] > 16 && v.lengteCm[1] <= 30 },
  groot:  { label: "Groot (duif/kraai)",  test: v => v.lengteCm[1] > 30 && v.lengteCm[1] <= 60 },
  reus:   { label: "Heel groot (reiger)", test: v => v.lengteCm[1] > 60 },
};

const keuze = { zoek: "", groep: null, grootte: null };

export function spotScherm(root, ctx) {
  root.innerHTML = `
    <h1 class="titel">Welke vogel heb je gespot?</h1>
    <input class="zoek" type="search" placeholder="Typ een naam, bv. merel…" value="${esc(keuze.zoek)}" autocomplete="off" aria-label="Zoek een vogel">
    <p class="hulp">Weet je de naam niet? Kies waar en hoe groot:</p>
    <nav class="chips">${Object.entries(GROEPEN).map(([k, g]) => `<button class="chip ${keuze.groep === k ? "aan" : ""}" data-g="${k}">${g.icoon} ${g.label}</button>`).join("")}</nav>
    <nav class="chips">${Object.entries(GROOTTES).map(([k, g]) => `<button class="chip ${keuze.grootte === k ? "aan" : ""}" data-s="${k}">${g.label}</button>`).join("")}</nav>
    <ul class="zoeklijst"></ul>
  `;
  const lijst = root.querySelector(".zoeklijst");
  const vul = () => {
    const q = keuze.zoek.trim().toLowerCase();
    const res = ctx.vogels.filter(v =>
      (!q || v.naam.toLowerCase().includes(q) || v.wetenschappelijk.toLowerCase().includes(q)) &&
      (!keuze.groep || v.groep === keuze.groep) &&
      (!keuze.grootte || GROOTTES[keuze.grootte].test(v)));
    lijst.innerHTML = res.map(v => `
      <li><button class="zoek-item" data-id="${v.id}" style="--zz:${zzKleur(v.zeldzaamheid)}">
        <img src="${esc(v.sticker)}" alt="" loading="lazy">
        <span><strong>${esc(v.naam)}</strong><small>${esc((v.kenmerken || []).slice(0, 2).join(" · "))}</small></span>
        ${ctx.status.perVogel.has(v.id) ? `<span class="vinkje" title="Al gespot">✓</span>`
          : ctx.opslag.opWishlist(v.id) ? `<span class="vinkje wens-ster" title="Op je wenslijst">⭐</span>` : ""}
      </button></li>`).join("") || `<li class="leeg">Geen vogel gevonden. Probeer een andere naam of filter.</li>`;
    lijst.querySelectorAll(".zoek-item").forEach(b => b.addEventListener("click", () =>
      openSpotDialoog(ctx, ctx.vogels.find(v => v.id === b.dataset.id))));
  };
  root.querySelector(".zoek").addEventListener("input", e => { keuze.zoek = e.target.value; vul(); });
  root.querySelectorAll("[data-g]").forEach(c => c.addEventListener("click", () => { keuze.groep = keuze.groep === c.dataset.g ? null : c.dataset.g; spotScherm(root, ctx); }));
  root.querySelectorAll("[data-s]").forEach(c => c.addEventListener("click", () => { keuze.grootte = keuze.grootte === c.dataset.s ? null : c.dataset.s; spotScherm(root, ctx); }));
  vul();
}

// Nieuwe waarneming loggen.
export function openSpotDialoog(ctx, vogel) {
  const al = ctx.status.perVogel.has(vogel.id);
  const wens = ctx.opslag.opWishlist(vogel.id);
  openWaarnemingDialoog({
    vogel,
    titel: al ? `Weer een ${vogel.naam}!` : `${vogel.naam} gespot?`,
    knop: "✅ Dit was hem!",
    // Nog niet gespot? Dan kan je hem ook op je wenslijst zetten.
    extraKnop: al ? null : {
      tekst: wens ? "⭐ Staat op je wenslijst" : "⭐ Wil ik zien",
      aan: wens,
      actie: () => {
        ctx.opslag.wisselWishlist(vogel.id);
        toast(wens ? `${vogel.naam} staat niet meer op je wenslijst.` : `⭐ ${vogel.naam} staat op je wenslijst! Hij gaat mee in Raad de vogel.`);
      },
    },
    opslaan: gegevens => {
      const voor = berekenStatus(ctx.vogels, ctx.opslag.get().waarnemingen, ctx.opslag.get().spel);
      ctx.opslag.voegWaarnemingToe({ vogelId: vogel.id, ...gegevens });
      const na = berekenStatus(ctx.vogels, ctx.opslag.get().waarnemingen, ctx.opslag.get().spel);
      const nieuweBadges = na.badges.filter(b => b.behaald && !voor.badges.find(x => x.id === b.id)?.behaald);
      if (al) toast(`+${PUNTEN_HERHAALDE_WAARNEMING} punten! ${nieuweBadges.length ? `Nieuwe badge: ${nieuweBadges[0].icoon} ${nieuweBadges[0].naam}` : "Staat in je logboek."}`);
      else feest(vogel, voor, na, wens);
    },
  });
}

// --- Feestje bij een nieuwe soort -------------------------------------------
function feest(vogel, voor, na, wasWens = false) {
  const zz = ZELDZAAMHEID[vogel.zeldzaamheid];
  const nieuweBadges = na.badges.filter(b => b.behaald && !voor.badges.find(x => x.id === b.id)?.behaald);
  const levelOp = na.level.nummer > voor.level.nummer;

  const { el, sluit } = openModal(`
    <div class="feest" style="--zz:${zz.kleur}">
      <div class="confetti" aria-hidden="true">${"🎉✨🪶⭐".repeat(6).split("").map((c, i) => `<span style="--i:${i}">${c}</span>`).join("")}</div>
      <p class="feest-titel">${wasWens ? "Wens vervuld!" : "Nieuw in je lijst!"}</p>
      <div class="flip">${kaartHtml(vogel, { compact: true })}</div>
      <p class="feest-punten">+${zz.punten} punten</p>
      ${levelOp ? `<p class="feest-level">${na.level.icoon} Level omhoog! Je bent nu <strong>${na.level.naam}</strong></p>` : ""}
      ${nieuweBadges.map(b => `<p class="feest-badge">${b.icoon} Nieuwe badge: <strong>${esc(b.naam)}</strong></p>`).join("")}
      <button class="knop knop-groot" id="bekijk">Bekijk mijn kaartje</button>
    </div>`, { klasse: "modal-feest" });
  koppelGeluid(el);
  el.querySelector("#bekijk").addEventListener("click", () => { sluit(); location.hash = `#/vogel/${vogel.id}`; });
}
