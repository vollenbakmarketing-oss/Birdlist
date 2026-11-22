// Locatie ophalen via de gps van het toestel en omzetten naar een plaatsnaam en land
// met OpenStreetMap (Nominatim). Alleen op het niveau van gemeente/dorp.

export function haalPositie() {
  return new Promise((ok, nok) => {
    if (!navigator.geolocation) return nok(new Error("Geen gps beschikbaar"));
    navigator.geolocation.getCurrentPosition(
      p => ok({ lat: p.coords.latitude, lon: p.coords.longitude }),
      e => nok(e),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  });
}

// Geeft { plaats, land, landNaam } terug, bv. { plaats: "Citadelpark, Gent", land: "be", landNaam: "België" }.
export async function plaatsInfo(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=14&accept-language=nl&lat=${lat}&lon=${lon}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("Plaatsnaam niet gevonden");
  const d = await r.json();
  const a = d.address || {};
  const deel = a.suburb || a.village || a.hamlet || a.neighbourhood;
  const gemeente = a.town || a.city || a.municipality || a.village || a.county || a.state;
  return {
    plaats: [deel !== gemeente ? deel : null, gemeente].filter(Boolean).join(", ") || d.name || "",
    land: (a.country_code || "").toLowerCase() || null,
    landNaam: a.country || null,
  };
}
