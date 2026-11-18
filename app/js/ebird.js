// Optionele koppeling met de eBird API 2.0 (https://documenter.getpostman.com/view/664302/S1ENwy59)
// Werkt alleen als in Instellingen een eBird API-sleutel is ingevuld.
// Let op: in een publieke versie hoort de sleutel op een server (proxy), niet in de browser.
import { APP } from "./config.js";

const BASIS = "https://api.ebird.org/v2";

async function vraag(pad, sleutel) {
  const r = await fetch(BASIS + pad, { headers: { "X-eBirdApiToken": sleutel } });
  if (r.status === 401 || r.status === 403) throw new Error("eBird-sleutel ongeldig");
  if (!r.ok) throw new Error("eBird gaf een fout (" + r.status + ")");
  return r.json();
}

// Recente waarnemingen van één soort: in de buurt (als lat/lon gekend) of in heel België.
export async function recenteWaarnemingen(code, sleutel, { lat, lon } = {}) {
  const pad = lat != null
    ? `/data/obs/geo/recent/${code}?lat=${lat}&lng=${lon}&dist=25&back=30&maxResults=5`
    : `/data/obs/${APP.land}/recent/${code}?back=30&maxResults=5`;
  return vraag(pad, sleutel);
}

export function soortPagina(code) {
  return `https://ebird.org/species/${code}?siteLanguage=nl`;
}
