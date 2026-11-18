// Badges en levels.
import { LEVELS } from "../config.js";
import { esc } from "../ui.js";

export function badgesScherm(root, ctx) {
  const { status } = ctx;
  const behaald = status.badges.filter(b => b.behaald).length;
  root.innerHTML = `
    <h1 class="titel">Badges <small>${behaald}/${status.badges.length}</small></h1>
    <ul class="badges">
      ${status.badges.map(b => `
        <li class="${b.behaald ? "behaald" : "op-slot"}">
          <span class="badge-icoon">${b.behaald ? b.icoon : "🔒"}</span>
          <strong>${esc(b.naam)}</strong><small>${esc(b.uitleg)}</small>
        </li>`).join("")}
    </ul>
    <h2 class="titel">Levels</h2>
    <ol class="levels">
      ${LEVELS.map((l, i) => `
        <li class="${i + 1 === status.level.nummer ? "huidig" : i + 1 < status.level.nummer ? "gehaald" : ""}">
          <span>${l.icoon}</span><strong>${esc(l.naam)}</strong><small>${l.vanaf} punten</small>
        </li>`).join("")}
    </ol>
  `;
}
