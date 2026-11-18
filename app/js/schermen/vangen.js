// Vangen: zoek de vogel die je zag, vul datum/plaats in en vang hem!
import { GROEPEN, ZELDZAAMHEID, PUNTEN_HERHAALDE_WAARNEMING } from "../config.js";
import { esc, nr, zzKleur, openModal, toast } from "../ui.js";
import { kaartHtml, koppelGeluid } from "../kaart.js";
import { haalPositie, plaatsnaam } from "../locatie.js";
import { berekenStatus } from "../spel.js";

const GROOTTES = {
  klein:  { label: "Klein (mus)",        test: v => v.lengteCm[1] <= 16 },
  middel: { label: "Middel (merel)",     test: v => v.lengteCm[1] > 16 && v.lengteCm[1] <= 30 },
  groot:  { label: "Groot (duif/kraai)", test: v => v.lengteCm[1] > 30 && v.lengteCm[1] <= 60 },
  reus:   { label: "Heel groot (reiger)", test: v => v.lengteCm[1] > 60 },
};

const keuze = { zoek: "", groep: null, grootte: null };

export function vangScherm(root, ctx) {
  root.innerHTML = `
    <h1 class="titel">Welke vogel zag je?</h1>
    <input class="zoek" type="search" placeholder="Typ een naam, bv. merel…" value="${esc(keuze.zoek)}" autocomplete="off">
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
        <span><strong>${esc(v.naam)}</strong><small>${nr(v.nr)} · ${esc(ZELDZAAMHEID[v.zeldzaamheid].label)}</small></span>
        ${ctx.status.perVogel.has(v.id) ? `<span class="vinkje" title="Al gevangen">✓</span>` : ""}
      </button></li>`).join("") || `<li class="leeg">Geen vogel gevonden. Probeer een andere naam of filter.</li>`;
    lijst.querySelectorAll(".zoek-item").forEach(b => b.addEventListener("click", () =>
      openVangDialoog(ctx, ctx.vogels.find(v => v.id === b.dataset.id))));
  };
  root.querySelector(".zoek").addEventListener("input", e => { keuze.zoek = e.target.value; vul(); });
  root.querySelectorAll("[data-g]").forEach(c => c.addEventListener("click", () => { keuze.groep = keuze.groep === c.dataset.g ? null : c.dataset.g; vangScherm(root, ctx); }));
  root.querySelectorAll("[data-s]").forEach(c => c.addEventListener("click", () => { keuze.grootte = keuze.grootte === c.dataset.s ? null : c.dataset.s; vangScherm(root, ctx); }));
  vul();
}

// --- Dialoog: datum, plaats, notitie --------------------------------------
function lokaleNu() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function openVangDialoog(ctx, vogel) {
  const al = ctx.status.perVogel.has(vogel.id);
  const { el, sluit } = openModal(`
    <div class="vang">
      <img class="vang-beeld" src="${esc(vogel.sticker)}" alt="${esc(vogel.naam)}">
      <h2>${al ? "Nog eens gezien:" : "Vang de"} ${esc(vogel.naam)}!</h2>
      <form class="formulier">
        <label>Wanneer?<input type="datetime-local" name="datum" value="${lokaleNu()}" max="${lokaleNu()}" required></label>
        <label>Waar?
          <span class="rij"><input name="plaats" placeholder="bv. Gent, Citadelpark" autocomplete="off">
          <button type="button" class="knop-mini" id="gps" title="Gebruik mijn locatie">📍</button></span>
          <small class="gps-status"></small>
        </label>
        <label>Notitie (mag leeg)<input name="notitie" maxlength="140" placeholder="bv. zat op het voederhuisje"></label>
        <button class="knop knop-groot" type="submit">${al ? "🔭 Opslaan" : "🎯 Gevangen!"}</button>
      </form>
    </div>`);

  const form = el.querySelector("form");
  const status = el.querySelector(".gps-status");
  let pos = null;

  const zoekLocatie = async () => {
    status.textContent = "Locatie zoeken…";
    try {
      pos = await haalPositie();
      status.textContent = "📍 Locatie gevonden";
      try {
        const naam = await plaatsnaam(pos.lat, pos.lon);
        if (naam && !form.plaats.value) form.plaats.value = naam;
      } catch { status.textContent = "📍 Locatie bewaard (plaatsnaam zelf invullen)"; }
    } catch {
      status.textContent = "Geen locatie: typ zelf de plaats.";
    }
  };
  el.querySelector("#gps").addEventListener("click", zoekLocatie);
  zoekLocatie();

  form.addEventListener("submit", e => {
    e.preventDefault();
    const voor = ctx.status;
    const datum = new Date(form.datum.value).toISOString();
    ctx.opslag.voegWaarnemingToe({
      vogelId: vogel.id, datum, plaats: form.plaats.value.trim(), notitie: form.notitie.value.trim(),
      lat: pos?.lat, lon: pos?.lon,
    });
    sluit();
    const na = berekenStatus(ctx.vogels, ctx.opslag.get().waarnemingen);
    if (al) toast(`+${PUNTEN_HERHAALDE_WAARNEMING} punten! Weer een ${vogel.naam} gezien.`);
    else feest(ctx, vogel, voor, na);
  });
}

// --- Feestje na een nieuwe vangst -----------------------------------------
function feest(ctx, vogel, voor, na) {
  const zz = ZELDZAAMHEID[vogel.zeldzaamheid];
  const nieuweBadges = na.badges.filter(b => b.behaald && !voor.badges.find(x => x.id === b.id)?.behaald);
  const levelOp = na.level.nummer > voor.level.nummer;

  const { el, sluit } = openModal(`
    <div class="feest" style="--zz:${zz.kleur}">
      <div class="confetti" aria-hidden="true">${"🎉✨🪶⭐".repeat(6).split("").map((c, i) => `<span style="--i:${i}">${c}</span>`).join("")}</div>
      <p class="feest-titel">Gevangen!</p>
      <div class="flip">${kaartHtml(vogel, { compact: true })}</div>
      <p class="feest-punten">+${zz.punten} punten</p>
      ${levelOp ? `<p class="feest-level">${na.level.icoon} Level omhoog! Je bent nu <strong>${na.level.naam}</strong></p>` : ""}
      ${nieuweBadges.map(b => `<p class="feest-badge">${b.icoon} Nieuwe badge: <strong>${esc(b.naam)}</strong></p>`).join("")}
      <button class="knop knop-groot" id="bekijk">Bekijk mijn kaartje</button>
    </div>`, { klasse: "modal-feest" });
  koppelGeluid(el);
  el.querySelector("#bekijk").addEventListener("click", () => { sluit(); location.hash = `#/vogel/${vogel.id}`; });
}
