// Badges (per groep), je landen en continenten, en de levels.
import { LEVELS } from "../config.js";
import { BADGE_GROEPEN } from "../badges.js";
import { CONTINENTEN, continentVan, vlag } from "../landen.js";
import { esc } from "../ui.js";

export function badgesScherm(root, ctx) {
  const { status } = ctx;
  const behaald = status.badges.filter(b => b.behaald).length;
  const landen = [...status.landen.entries()].sort((a, b) => a[1].localeCompare(b[1], "nl"));

  const badgeLijst = lijst => `<ul class="badges">
    ${lijst.map(b => `
      <li class="${b.behaald ? "behaald" : "op-slot"}">
        <span class="badge-icoon">${b.behaald ? b.icoon : "🔒"}</span>
        <strong>${esc(b.naam)}</strong><small>${esc(b.uitleg)}</small>
      </li>`).join("")}
  </ul>`;

  root.innerHTML = `
    <h1 class="titel">Badges <small>${behaald}/${status.badges.length}</small></h1>

    ${Object.entries(BADGE_GROEPEN).map(([groep, titel]) => {
      const lijst = status.badges.filter(b => (b.groep || "spotten") === groep);
      return `<h2 class="subtitel">${esc(titel)} <small>${lijst.filter(b => b.behaald).length}/${lijst.length}</small></h2>
        ${groep === "reizen" ? `
        <div class="blok landen">
          <p><strong>${landen.length}</strong> ${landen.length === 1 ? "land" : "landen"} ·
             <strong>${status.continenten.size}</strong>/7 continenten</p>
          ${landen.length
            ? `<ul class="landen-lijst">${landen.map(([code, naam]) =>
                `<li title="${esc(CONTINENTEN[continentVan(code)]?.naam || "")}">${vlag(code)} ${esc(naam)}</li>`).join("")}</ul>`
            : `<p class="klein">Duid bij het spotten de plek aan op de kaart. Dan weet Dodo Diary in welk land je was.</p>`}
        </div>` : ""}
        ${badgeLijst(lijst)}`;
    }).join("")}

    <h2 class="subtitel">Levels</h2>
    <ol class="levels">
      ${LEVELS.map((l, i) => `
        <li class="${i + 1 === status.level.nummer ? "huidig" : i + 1 < status.level.nummer ? "gehaald" : ""}">
          <span>${l.icoon}</span><strong>${esc(l.naam)}</strong><small>${l.vanaf} punten</small>
        </li>`).join("")}
    </ol>
  `;
}
