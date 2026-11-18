// Kleine hulpfuncties voor de schermen.
import { ZELDZAAMHEID, GROEPEN } from "./config.js";

export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const nr = n => "#" + String(n).padStart(3, "0");

export const sterren = zz => "★".repeat(ZELDZAAMHEID[zz]?.sterren ?? 0);

export const zzKleur = zz => ZELDZAAMHEID[zz]?.kleur ?? "#888";

export const groepIcoon = g => GROEPEN[g]?.icoon ?? "🐦";

export function bereik([a, b], eenheid = "cm") {
  return a === b ? `${a} ${eenheid}` : `${a}–${b} ${eenheid}`;
}

export function datumTekst(iso, { tijd = false } = {}) {
  const d = new Date(iso);
  const opts = { day: "numeric", month: "long", year: "numeric" };
  if (tijd) Object.assign(opts, { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("nl-BE", opts);
}

// "Zo groot als ..." — maakt cm concreet voor kinderen. Pas gerust aan.
export function vergelijkLengte(cm) {
  const lijst = [
    [11, "een theelepel"],
    [16, "een balpen"],
    [22, "een potlood"],
    [30, "een schoolliniaal"],
    [45, "een kat (zonder staart)"],
    [70, "een tennisracket"],
    [105, "een gitaar"],
    [Infinity, "een kind van 8 jaar"],
  ];
  return lijst.find(([max]) => cm <= max)[1];
}

export function vergelijkSpanwijdte(cm) {
  if (cm >= 200) return "breder dan een volwassene met gespreide armen!";
  if (cm >= 130) return "ongeveer zo breed als jouw gespreide armen!";
  if (cm >= 60) return "zo breed als een schooltas of meer";
  return "past op een A4-blad";
}

export function html(str) {
  const t = document.createElement("template");
  t.innerHTML = str.trim();
  return t.content;
}

export function toast(tekst) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = tekst;
  document.body.append(t);
  setTimeout(() => t.classList.add("weg"), 2200);
  setTimeout(() => t.remove(), 2700);
}

// Modaal venster. Geeft een functie terug om het te sluiten.
export function openModal(inhoudHtml, { klasse = "" } = {}) {
  const m = document.createElement("div");
  m.className = "modal-achtergrond";
  m.innerHTML = `<div class="modal ${klasse}" role="dialog" aria-modal="true"><button class="modal-sluit" aria-label="Sluiten">✕</button>${inhoudHtml}</div>`;
  const sluit = () => { m.classList.add("weg"); setTimeout(() => m.remove(), 200); document.removeEventListener("keydown", esc_); };
  const esc_ = e => { if (e.key === "Escape") sluit(); };
  m.addEventListener("click", e => { if (e.target === m || e.target.closest(".modal-sluit")) sluit(); });
  document.addEventListener("keydown", esc_);
  document.body.append(m);
  return { el: m.querySelector(".modal"), sluit };
}
