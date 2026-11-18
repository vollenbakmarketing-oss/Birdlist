// =====================================================================
//  BADGES — voeg er gerust zelf toe.
//  Elke badge heeft een `voorwaarde(s)` die true teruggeeft als hij verdiend is.
//  `s` bevat:
//    s.gevangen      -> lijst van gevangen vogels (objecten uit vogels.json)
//    s.waarnemingen  -> alle waarnemingen { vogelId, datum, plaats, ... }
//    s.aantal(filter)-> aantal gevangen soorten dat aan `filter(vogel)` voldoet
// =====================================================================

export const BADGES = [
  { id: "eerste",     icoon: "🎉", naam: "Eerste vangst",       uitleg: "Vang je eerste vogel.",                 voorwaarde: s => s.gevangen.length >= 1 },
  { id: "vijf",       icoon: "🖐️", naam: "High five",           uitleg: "Vang 5 verschillende vogels.",          voorwaarde: s => s.gevangen.length >= 5 },
  { id: "tien",       icoon: "🔟", naam: "Tien op tien",         uitleg: "Vang 10 verschillende vogels.",         voorwaarde: s => s.gevangen.length >= 10 },
  { id: "vijfentwintig", icoon: "🏅", naam: "Echte spotter",    uitleg: "Vang 25 verschillende vogels.",         voorwaarde: s => s.gevangen.length >= 25 },
  { id: "vijftig",    icoon: "🏆", naam: "Vogelkampioen",        uitleg: "Vang 50 verschillende vogels.",         voorwaarde: s => s.gevangen.length >= 50 },
  { id: "tuin",       icoon: "🏡", naam: "Tuinkenner",           uitleg: "Vang 8 vogels uit tuin & park.",        voorwaarde: s => s.aantal(v => v.groep === "tuin") >= 8 },
  { id: "water",      icoon: "💧", naam: "Waterrat",             uitleg: "Vang 5 watervogels.",                   voorwaarde: s => s.aantal(v => v.groep === "water") >= 5 },
  { id: "bos",        icoon: "🌳", naam: "Boswachter",           uitleg: "Vang 5 bosvogels.",                     voorwaarde: s => s.aantal(v => v.groep === "bos") >= 5 },
  { id: "roofvogel",  icoon: "🦅", naam: "Roofvogelradar",       uitleg: "Vang je eerste roofvogel.",             voorwaarde: s => s.aantal(v => v.groep === "roofvogel") >= 1 },
  { id: "uil",        icoon: "🦉", naam: "Nachtwacht",           uitleg: "Vang je eerste uil.",                   voorwaarde: s => s.aantal(v => v.groep === "uil") >= 1 },
  { id: "specht",     icoon: "🪵", naam: "Tok tok tok",          uitleg: "Vang 2 spechten.",                      voorwaarde: s => s.aantal(v => /specht/i.test(v.naam)) >= 2 },
  { id: "zeldzaam",   icoon: "💎", naam: "Schattenjager",        uitleg: "Vang een zeldzame vogel (of zeldzamer).", voorwaarde: s => s.aantal(v => ["zeldzaam", "heel zeldzaam", "legendarisch"].includes(v.zeldzaamheid)) >= 1 },
  { id: "legende",    icoon: "🌟", naam: "Legende!",             uitleg: "Vang een legendarische vogel.",         voorwaarde: s => s.aantal(v => v.zeldzaamheid === "legendarisch") >= 1 },
  { id: "vroeg",      icoon: "🌅", naam: "Vroege vogel",         uitleg: "Zie een vogel voor 8 uur 's ochtends.", voorwaarde: s => s.waarnemingen.some(w => new Date(w.datum).getHours() < 8) },
  { id: "reiziger",   icoon: "🗺️", naam: "Op pad",               uitleg: "Spot vogels op 3 verschillende plaatsen.", voorwaarde: s => new Set(s.waarnemingen.map(w => (w.plaats || "").trim().toLowerCase()).filter(Boolean)).size >= 3 },
  { id: "zomer",      icoon: "☀️", naam: "Zomergasten",          uitleg: "Vang 3 zomergasten.",                   voorwaarde: s => s.aantal(v => v.trek === "zomergast") >= 3 },
];
