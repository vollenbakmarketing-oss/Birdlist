// Startpunt: laadt de vogels, kiest het scherm op basis van de URL (#/...) en tekent de kop.
import { APP } from "./config.js";
import { opslag } from "./opslag.js";
import { berekenStatus } from "./spel.js";
import { esc } from "./ui.js";
import { vogeldex } from "./schermen/vogeldex.js";
import { vogelScherm } from "./schermen/vogel.js";
import { vangScherm } from "./schermen/vangen.js";
import { lijstScherm } from "./schermen/lijst.js";
import { badgesScherm } from "./schermen/badges.js";
import { meerScherm } from "./schermen/meer.js";

// Routes: "#/pad" -> functie(root, ctx, ...parameters)
const ROUTES = [
  [/^#?\/?$/, vogeldex],
  [/^#\/vogel\/([\w-]+)$/, vogelScherm],
  [/^#\/vangen$/, vangScherm],
  [/^#\/lijst$/, lijstScherm],
  [/^#\/badges$/, badgesScherm],
  [/^#\/meer$/, meerScherm],
];

const root = document.querySelector("#scherm");
let vogels = [];
let vorigeHash = null;

function ctx() {
  return { vogels, opslag, status: berekenStatus(vogels, opslag.get().waarnemingen) };
}

function tekenKop(c) {
  const { level, punten } = c.status;
  const naam = opslag.get().profiel.naam;
  document.querySelector("#kop").innerHTML = `
    <a href="#/" class="logo">${esc(APP.naam)}</a>
    <a href="#/badges" class="level" title="${level.volgend ? `Nog ${level.volgend.vanaf - punten} punten tot ${level.volgend.naam}` : "Hoogste level!"}">
      <span class="level-icoon">${level.icoon}</span>
      <span class="level-tekst"><strong>${esc(naam || level.naam)}</strong><small>${naam ? esc(level.naam) + " · " : ""}${punten} punten</small>
        <span class="level-balk"><span style="width:${Math.round(level.voortgang * 100)}%"></span></span></span>
    </a>`;
}

function render() {
  const hash = location.hash || "#/";
  const c = ctx();
  tekenKop(c);
  for (const [re, scherm] of ROUTES) {
    const m = hash.match(re);
    if (m) {
      scherm(root, c, ...m.slice(1));
      break;
    }
  }
  document.querySelectorAll(".onderbalk a").forEach(a => {
    const doel = a.getAttribute("href");
    a.classList.toggle("actief", doel === "#/" ? (hash === "#/" || hash.startsWith("#/vogel")) : hash.startsWith(doel));
  });
  if (hash !== vorigeHash) window.scrollTo(0, 0);
  vorigeHash = hash;
}

async function start() {
  try {
    vogels = await (await fetch("data/vogels.json")).json();
  } catch (e) {
    root.innerHTML = `<p class="leeg">Kon de vogels niet laden. Start de app via een webserver (zie README).</p>`;
    return;
  }
  window.addEventListener("hashchange", render);
  opslag.bijWijziging(render);
  render();
  if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(() => {});
}

start();
