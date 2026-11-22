// Spel "Raad de vogel": oefen met vogels die je al spotte en met je wishlist.
import { SPEL } from "../config.js";
import { esc } from "../ui.js";
import { beoordeel, puntenVoorPoging, volgendeLetter, kiesVogels } from "../raden.js";

let spel = null; // lopend spel (blijft bewaard als je even van scherm wisselt)

function pool(ctx) {
  const ids = new Set([...ctx.status.perVogel.keys(), ...ctx.opslag.get().wishlist]);
  return ctx.vogels.filter(v => ids.has(v.id));
}

export function radenScherm(root, ctx) {
  if (!spel) startScherm(root, ctx);
  else if (spel.klaar) eindScherm(root, ctx);
  else vraagScherm(root, ctx);
}

function startScherm(root, ctx) {
  const p = pool(ctx);
  const gespot = ctx.status.gespot.length, wish = ctx.opslag.get().wishlist.length;
  const s = ctx.opslag.get().spel;
  root.innerHTML = `
    <a class="terug" href="#/kaart">← Kaart</a>
    <section class="raad-start blok">
      <p class="raad-logo">🎮</p>
      <h1 class="titel">Raad de vogel</h1>
      <p>Je ziet een vogel. Typ zijn naam! Je hebt <strong>${SPEL.pogingen} kansen</strong>.
         Fout? Dan wordt er een letter zichtbaar.</p>
      <ul class="raad-punten">
        ${SPEL.punten.map((p, i) => `<li><strong>${p}</strong> punten in poging ${i + 1}</li>`).join("")}
      </ul>
      <p class="klein">Je oefent met de ${gespot} ${gespot === 1 ? "vogel" : "vogels"} die je spotte${wish ? ` en ${wish} van je wishlist ⭐` : ""}.</p>
      ${p.length
        ? `<button class="knop knop-groot" id="start">Start</button>`
        : `<p class="leeg">Nog geen vogels om mee te oefenen. Spot een vogel, of zet er een op je ⭐ wishlist via <a href="#/">Vogels</a>.</p>`}
      ${s.rondes ? `<p class="klein">Al ${s.rondes}× gespeeld · beste score ${s.beste} · ${s.geraden} vogels geraden</p>` : ""}
    </section>`;
  root.querySelector("#start")?.addEventListener("click", () => {
    const vogels = kiesVogels(p);
    spel = { vogels, index: 0, score: 0, geraden: 0, perfect: true, ...nieuweVraag() };
    radenScherm(root, ctx);
  });
}

const nieuweVraag = () => ({ poging: 1, zichtbaar: new Set(), fout: [], uitslag: null });

function vakjes(naam, zichtbaar, alles) {
  return [...naam].map((c, i) => {
    if (c === " ") return `<span class="vak spatie"></span>`;
    if (!/\p{L}/u.test(c)) return `<span class="vak teken">${esc(c)}</span>`;
    const toon = alles || zichtbaar.has(i);
    return `<span class="vak ${toon ? "open" : ""} ${zichtbaar.has(i) ? "hint" : ""}">${toon ? esc(c.toUpperCase()) : ""}</span>`;
  }).join("");
}

function vraagScherm(root, ctx) {
  const v = spel.vogels[spel.index];
  const u = spel.uitslag;
  const hartjes = Array.from({ length: SPEL.pogingen }, (_, i) => (i < SPEL.pogingen - spel.fout.length ? "❤️" : "🤍")).join("");

  root.innerHTML = `
    <div class="raad">
      <div class="raad-kop">
        <span>Vogel ${spel.index + 1}/${spel.vogels.length}</span>
        <span class="hartjes" aria-label="${SPEL.pogingen - spel.fout.length} kansen over">${hartjes}</span>
        <span><strong>${spel.score}</strong> punten</span>
      </div>
      <div class="raad-beeld ${u ? "" : "zweef"}"><img src="${esc(v.sticker)}" alt="Welke vogel is dit?"></div>
      <div class="naam-vakjes ${u?.juist === false ? "verloren" : ""}" aria-hidden="true">${vakjes(v.naam, spel.zichtbaar, !!u)}</div>
      <p class="klein midden">${[...v.naam].filter(c => /\p{L}/u.test(c)).length} letters${v.naam.includes(" ") ? `, ${v.naam.split(" ").length} woorden` : ""}</p>

      ${u ? `
        <div class="raad-uitslag ${u.juist ? "goed" : "slecht"}">
          <p class="groot">${u.juist ? `🎉 Juist! +${u.punten} punten` : "😢 Helaas!"}</p>
          <p>${u.juist ? (u.bijna ? `Bijna perfect gespeld: het is de <strong>${esc(v.naam)}</strong>.` : `Het is de <strong>${esc(v.naam)}</strong>.`) : `Het was de <strong>${esc(v.naam)}</strong>.`}</p>
          <div class="kaart-kenmerken"><strong>🔎 Zo herken je hem</strong><ol>${v.kenmerken.map(k => `<li>${esc(k)}</li>`).join("")}</ol></div>
          <button class="knop knop-groot" id="verder">${spel.index + 1 < spel.vogels.length ? "Volgende vogel →" : "Bekijk je score"}</button>
        </div>` : `
        <form class="raad-form" autocomplete="off">
          <input id="gok" name="gok" placeholder="Typ de naam…" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Naam van de vogel" required>
          <button class="knop knop-groot" type="submit">Raad!</button>
        </form>
        ${spel.fout.length ? `<p class="raad-fout">Niet ${spel.fout.map(f => `<s>${esc(f)}</s>`).join(", niet ")}. Er staat een letter extra klaar!</p>` : ""}
      `}
    </div>`;

  if (u) {
    root.querySelector("#verder").addEventListener("click", () => {
      spel.index++;
      if (spel.index >= spel.vogels.length) {
        spel.klaar = true;
        ctx.opslag.bewaarSpel({ score: spel.score, geraden: spel.geraden, perfect: spel.perfect });
      } else Object.assign(spel, nieuweVraag());
      radenScherm(root, ctx);
    });
    return;
  }

  const form = root.querySelector(".raad-form");
  const invoer = form.gok;
  invoer.focus();
  form.addEventListener("submit", e => {
    e.preventDefault();
    const gok = invoer.value.trim();
    if (!gok) return;
    const oordeel = beoordeel(gok, v.naam);
    if (oordeel !== "fout") {
      const punten = puntenVoorPoging(spel.poging);
      spel.score += punten;
      spel.geraden++;
      if (spel.poging > 1) spel.perfect = false;
      spel.uitslag = { juist: true, punten, bijna: oordeel === "bijna" };
    } else if (spel.poging >= SPEL.pogingen) {
      spel.fout.push(gok);
      spel.perfect = false;
      spel.uitslag = { juist: false, punten: 0 };
    } else {
      spel.fout.push(gok);
      spel.poging++;
      const i = volgendeLetter(v.naam, spel.zichtbaar);
      if (i != null) spel.zichtbaar.add(i);
      root.querySelector(".naam-vakjes")?.classList.add("schud");
    }
    setTimeout(() => radenScherm(root, ctx), oordeel === "fout" && !spel.uitslag ? 350 : 0);
  });
}

function eindScherm(root, ctx) {
  const max = spel.vogels.length * SPEL.punten[0];
  const sterren = spel.score >= max ? 3 : spel.score >= max * 0.6 ? 2 : spel.score > 0 ? 1 : 0;
  root.innerHTML = `
    <section class="raad-start blok">
      <p class="raad-logo">${["😅", "⭐", "⭐⭐", "⭐⭐⭐"][sterren]}</p>
      <h1 class="titel">${spel.perfect ? "Perfect gespeeld!" : sterren >= 2 ? "Goed gedaan!" : "Blijven oefenen!"}</h1>
      <p class="groot"><strong>${spel.score}</strong> van ${max} punten</p>
      <p>${spel.geraden} van ${spel.vogels.length} vogels geraden.</p>
      <ul class="raad-overzicht">${spel.vogels.map(v => `<li><a href="#/vogel/${v.id}"><img src="${esc(v.sticker)}" alt="">${esc(v.naam)}</a></li>`).join("")}</ul>
      <div class="acties">
        <button class="knop knop-groot" id="opnieuw">Nog een keer</button>
        <a class="knop knop-licht" href="#/kaart">Terug naar de kaart</a>
      </div>
    </section>`;
  root.querySelector("#opnieuw").addEventListener("click", () => { spel = null; radenScherm(root, ctx); root.querySelector("#start")?.click(); });
  root.querySelectorAll("a").forEach(a => a.addEventListener("click", () => { spel = null; }));
}
