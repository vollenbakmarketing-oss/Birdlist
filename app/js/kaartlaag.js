// Hulpfuncties voor kaarten (Leaflet, geladen in index.html als globale `L`).
import { KAART } from "./config.js";
import { esc } from "./ui.js";

export const kaartBeschikbaar = () => typeof window.L !== "undefined";

export function maakKaart(el, { center = KAART.start, zoom = KAART.startZoom, ...opties } = {}) {
  const L = window.L;
  const kaart = L.map(el, { zoomControl: true, attributionControl: true, ...opties }).setView(center, zoom);
  L.tileLayer(KAART.tegels, { maxZoom: 19, attribution: KAART.bron }).addTo(kaart);
  // Kaarten in een venster of verborgen scherm moeten hun maat opnieuw meten.
  setTimeout(() => kaart.invalidateSize(), 60);
  return kaart;
}

// Rond markeertje met de sticker van de vogel erin.
export function stickerIcoon(vogel, { kleur = "#1f5f3f", grootte = 46 } = {}) {
  return window.L.divIcon({
    className: "sticker-pin",
    html: `<span style="--pin:${kleur};width:${grootte}px;height:${grootte}px"><img src="${esc(vogel.sticker)}" alt=""></span>`,
    iconSize: [grootte, grootte],
    iconAnchor: [grootte / 2, grootte / 2],
    popupAnchor: [0, -grootte / 2],
  });
}

export function speldIcoon() {
  return window.L.divIcon({ className: "speld-pin", html: "<span>📍</span>", iconSize: [36, 36], iconAnchor: [18, 34] });
}
