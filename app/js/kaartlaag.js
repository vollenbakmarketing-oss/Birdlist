// Hulpfuncties voor kaarten met Mapbox GL JS (geladen in index.html als globale `mapboxgl`).
// Let op: Mapbox gebruikt [lengte, breedte] (lon, lat); de rest van de app [breedte, lengte].
import { KAART } from "./config.js";
import { opslag } from "./opslag.js";
import { esc } from "./ui.js";

export const mapboxSleutel = () => (opslag.get().instellingen.mapboxSleutel || KAART.mapboxSleutel || "").trim();
export const kaartBeschikbaar = () => typeof window.mapboxgl !== "undefined" && mapboxSleutel() !== "";

// Kaarten van het huidige scherm; worden opgeruimd als je van scherm wisselt.
const schermKaarten = new Set();
export function ruimSchermKaartenOp() {
  schermKaarten.forEach(k => { try { k.remove(); } catch { /* al weg */ } });
  schermKaarten.clear();
}

/**
 * @param el        element waarin de kaart komt
 * @param stijl     Mapbox-stijl (standaard de satellietkaart)
 * @param center    [breedte, lengte]
 * @param zoom      zoomniveau (0 = hele wereld)
 * @param scherm    true = opruimen bij schermwissel (false voor kaarten in een venster)
 */
export function maakKaart(el, { stijl = KAART.wereldStijl, center = KAART.start, zoom = KAART.startZoom, scherm = true, ...opties } = {}) {
  const mapboxgl = window.mapboxgl;
  mapboxgl.accessToken = mapboxSleutel();
  const kaart = new mapboxgl.Map({
    container: el,
    style: stijl,
    center: [center[1], center[0]],
    zoom,
    projection: "globe",
    attributionControl: false,
    cooperativeGestures: false,
    ...opties,
  });
  kaart.addControl(new mapboxgl.AttributionControl({ compact: true }));
  kaart.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-left");
  // Ruimte rond de wereldbol: donkerblauw met een zachte gloed.
  kaart.on("style.load", () => {
    kaart.setFog({
      color: "rgb(186, 210, 235)", "high-color": "rgb(36, 92, 223)", "horizon-blend": 0.02,
      "space-color": "rgb(11, 11, 25)", "star-intensity": 0.6,
    });
  });
  if (scherm) schermKaarten.add(kaart);
  return kaart;
}

// Rond markeertje met de sticker van de vogel erin.
export function stickerMarker(vogel, { kleur = "#1f5f3f", grootte = 46 } = {}) {
  const el = document.createElement("div");
  el.className = "sticker-pin";
  el.innerHTML = `<span style="--pin:${kleur};width:${grootte}px;height:${grootte}px"><img src="${esc(vogel.sticker)}" alt="${esc(vogel.naam)}"></span>`;
  return new window.mapboxgl.Marker({ element: el, anchor: "center" });
}

export function speldMarker() {
  const el = document.createElement("div");
  el.className = "speld-pin";
  el.innerHTML = "<span>📍</span>";
  return new window.mapboxgl.Marker({ element: el, anchor: "bottom", draggable: true });
}

export function popup(html) {
  return new window.mapboxgl.Popup({ offset: 26, closeButton: true, maxWidth: "240px" }).setHTML(html);
}

// Stippellijn tussen punten ([[lat, lon], ...]) in de volgorde waarin je ze zag.
export function tekenRoute(kaart, punten, zichtbaar = true) {
  const data = { type: "Feature", geometry: { type: "LineString", coordinates: punten.map(([lat, lon]) => [lon, lat]) } };
  const voegToe = () => {
    if (kaart.getSource("route")) return;
    kaart.addSource("route", { type: "geojson", data });
    kaart.addLayer({
      id: "route", type: "line", source: "route",
      layout: { "line-join": "round", "line-cap": "round", visibility: zichtbaar ? "visible" : "none" },
      paint: { "line-color": KAART.routeKleur, "line-width": 3, "line-dasharray": [1.5, 2], "line-opacity": 0.95 },
    });
  };
  if (kaart.isStyleLoaded()) voegToe(); else kaart.on("style.load", voegToe);
  return zichtbaar_ => { if (kaart.getLayer("route")) kaart.setLayoutProperty("route", "visibility", zichtbaar_ ? "visible" : "none"); };
}

// Grenzen rond een lijst punten ([[lat, lon], ...]) in Mapbox-formaat.
export function grenzen(punten) {
  const b = new window.mapboxgl.LngLatBounds();
  punten.forEach(([lat, lon]) => b.extend([lon, lat]));
  return b;
}
