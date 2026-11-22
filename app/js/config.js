// =====================================================================
//  CONFIGURATIE — pas hier namen, kleuren, punten en levels aan.
//  De vogels zelf staan in  data/vogels.json
//  De badges staan in       js/badges.js
// =====================================================================

export const APP = {
  naam: "Dodo Diary",
  slogan: "Jouw vogellogboek",
  land: "BE",            // eBird-regiocode voor live waarnemingen
  opslagSleutel: "dododiary.v1",
  oudeOpslagSleutels: ["vogeldex.v1"],   // gegevens van vroegere versies worden overgenomen
};

// Kaarten (Mapbox). Een gratis publieke sleutel ("pk.…") maak je op https://account.mapbox.com
// Zet hem hieronder, of vul hem in bij Instellingen in de app (dat wint van deze waarde).
// Beperk de sleutel in je Mapbox-account tot het adres van je app (bv. https://jouwnaam.github.io).
export const KAART = {
  mapboxSleutel: "",
  wereldStijl: "mapbox://styles/mapbox/satellite-v9",          // grote kaart: puur satelliet
  kiesStijl: "mapbox://styles/mapbox/satellite-streets-v12",   // plek kiezen: satelliet met straatnamen
  start: [50.64, 4.67],   // [breedte, lengte] = midden van België
  startZoom: 6.5,
  routeKleur: "#f2a541",
};

// Spel "Raad de vogel"
export const SPEL = {
  vogelsPerSpel: 5,
  pogingen: 3,
  punten: [30, 20, 10],   // punten bij juist in poging 1, 2 of 3
};

// Zeldzaamheid: volgorde = van gewoon naar zeldzaam.
// `punten` krijg je de eerste keer dat je de vogel spot.
export const ZELDZAAMHEID = {
  "gewoon":        { label: "Gewoon",        sterren: 1, punten: 10,  kleur: "#6aa84f" },
  "vrij gewoon":   { label: "Vrij gewoon",   sterren: 2, punten: 20,  kleur: "#3d85c6" },
  "zeldzaam":      { label: "Zeldzaam",      sterren: 3, punten: 50,  kleur: "#8e5bd6" },
  "heel zeldzaam": { label: "Heel zeldzaam", sterren: 4, punten: 100, kleur: "#e06c1f" },
  "legendarisch":  { label: "Legendarisch",  sterren: 5, punten: 250, kleur: "#d4a017" },
};

// Punten voor elke extra waarneming van een vogel die je al hebt.
export const PUNTEN_HERHAALDE_WAARNEMING = 2;

// Groepen (filter + "soort" op het kaartje).
export const GROEPEN = {
  tuin:      { label: "Tuin & park",   icoon: "🏡" },
  bos:       { label: "Bos",           icoon: "🌳" },
  water:     { label: "Water",         icoon: "💧" },
  akker:     { label: "Akker & weide", icoon: "🌾" },
  roofvogel: { label: "Roofvogel",     icoon: "🦅" },
  uil:       { label: "Uil",           icoon: "🦉" },
};

// Trekgedrag zoals je het in België ziet.
export const TREK = {
  standvogel:  { label: "Standvogel",  uitleg: "Blijft het hele jaar in België." },
  zomergast:   { label: "Zomergast",   uitleg: "Komt in de lente naar België om te broeden en vertrekt in de herfst naar het zuiden." },
  wintergast:  { label: "Wintergast",  uitleg: "Komt in de winter uit het koude noorden naar België." },
  doortrekker: { label: "Doortrekker", uitleg: "Vliegt in de lente en de herfst over België op weg naar elders." },
  deels:       { label: "Deels trekvogel", uitleg: "Sommige blijven hier, andere trekken weg. In de winter komen er ook vogels uit het noorden bij." },
};

// IUCN Rode Lijst (wereldwijde bedreiging).
export const IUCN = {
  LC: "Niet bedreigd", NT: "Gevoelig", VU: "Kwetsbaar", EN: "Bedreigd", CR: "Ernstig bedreigd",
};

// Levels: vanaf hoeveel punten je deze rang krijgt.
export const LEVELS = [
  { vanaf: 0,    naam: "Eitje",        icoon: "🥚" },
  { vanaf: 30,   naam: "Kuiken",       icoon: "🐣" },
  { vanaf: 80,   naam: "Nestjong",     icoon: "🐥" },
  { vanaf: 160,  naam: "Uitvlieger",   icoon: "🐦" },
  { vanaf: 300,  naam: "Vogelspotter", icoon: "🔭" },
  { vanaf: 500,  naam: "Vogelkenner",  icoon: "📗" },
  { vanaf: 800,  naam: "Vogelexpert",  icoon: "🎓" },
  { vanaf: 1200, naam: "Arendsoog",    icoon: "🦅" },
];

// Bronvermelding (verplicht voor de stickers: CC BY 4.0).
export const CREDITS = {
  stickers: {
    tekst: "Vogelillustraties: huashu-bird-sticker (Huashu), CC BY 4.0. De illustraties zijn met AI gemaakt.",
    url: "https://github.com/alchaincyf/huashu-bird-sticker",
  },
  ebird: { tekst: "Waarnemingen: eBird (Cornell Lab of Ornithology)", url: "https://ebird.org" },
  geluid: { tekst: "Geluiden: xeno-canto.org", url: "https://xeno-canto.org" },
  kaart: { tekst: "Kaarten: Mapbox, satellietbeelden van Maxar en anderen", url: "https://www.mapbox.com/about/maps/" },
  plaatsnamen: { tekst: "Plaatsnamen: OpenStreetMap (Nominatim)", url: "https://www.openstreetmap.org/copyright" },
};
