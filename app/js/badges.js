// =====================================================================
//  BADGES — voeg er gerust zelf toe.
//  Elke badge heeft een `voorwaarde(s)` die true teruggeeft als hij verdiend is.
//  `s` bevat:
//    s.gespot        -> lijst van gespotte vogels (objecten uit vogels.json)
//    s.waarnemingen  -> alle waarnemingen { vogelId, datum, plaats, ... }
//    s.aantal(filter)-> aantal gespotte soorten dat aan `filter(vogel)` voldoet
//    s.landen        -> Map van landcodes ("be") naar landnamen ("België")
//    s.continenten   -> Set van continentcodes ("EU", "AF", ... zie landen.js)
//    s.spel          -> { rondes, beste, perfect, geraden } van "Raad de vogel"
//  `groep` bepaalt onder welke titel de badge staat op het badgesscherm.
// =====================================================================
import { CONTINENTEN } from "./landen.js";

const continentBadges = Object.entries(CONTINENTEN).map(([code, c]) => ({
  id: "continent-" + code, groep: "reizen", icoon: c.icoon, naam: c.naam,
  uitleg: `Spot een vogel in ${c.naam}.`, voorwaarde: s => s.continenten.has(code),
}));

export const BADGES = [
  { id: "eerste",     icoon: "🎉", naam: "Eerste spot",       uitleg: "Spot je eerste vogel.",                 voorwaarde: s => s.gespot.length >= 1 },
  { id: "vijf",       icoon: "🖐️", naam: "High five",           uitleg: "Spot 5 verschillende vogels.",          voorwaarde: s => s.gespot.length >= 5 },
  { id: "tien",       icoon: "🔟", naam: "Tien op tien",         uitleg: "Spot 10 verschillende vogels.",         voorwaarde: s => s.gespot.length >= 10 },
  { id: "vijfentwintig", icoon: "🏅", naam: "Echte spotter",    uitleg: "Spot 25 verschillende vogels.",         voorwaarde: s => s.gespot.length >= 25 },
  { id: "vijftig",    icoon: "🏆", naam: "Vogelkampioen",        uitleg: "Spot 50 verschillende vogels.",         voorwaarde: s => s.gespot.length >= 50 },
  { id: "tuin",       icoon: "🏡", naam: "Tuinkenner",           uitleg: "Spot 8 vogels uit tuin & park.",        voorwaarde: s => s.aantal(v => v.groep === "tuin") >= 8 },
  { id: "water",      icoon: "💧", naam: "Waterrat",             uitleg: "Spot 5 watervogels.",                   voorwaarde: s => s.aantal(v => v.groep === "water") >= 5 },
  { id: "bos",        icoon: "🌳", naam: "Boswachter",           uitleg: "Spot 5 bosvogels.",                     voorwaarde: s => s.aantal(v => v.groep === "bos") >= 5 },
  { id: "roofvogel",  icoon: "🦅", naam: "Roofvogelradar",       uitleg: "Spot je eerste roofvogel.",             voorwaarde: s => s.aantal(v => v.groep === "roofvogel") >= 1 },
  { id: "uil",        icoon: "🦉", naam: "Nachtwacht",           uitleg: "Spot je eerste uil.",                   voorwaarde: s => s.aantal(v => v.groep === "uil") >= 1 },
  { id: "specht",     icoon: "🪵", naam: "Tok tok tok",          uitleg: "Spot 2 spechten.",                      voorwaarde: s => s.aantal(v => /specht/i.test(v.naam)) >= 2 },
  { id: "zeldzaam",   icoon: "💎", naam: "Schattenjager",        uitleg: "Spot een zeldzame vogel (of zeldzamer).", voorwaarde: s => s.aantal(v => ["zeldzaam", "heel zeldzaam", "legendarisch"].includes(v.zeldzaamheid)) >= 1 },
  { id: "legende",    icoon: "🌟", naam: "Legende!",             uitleg: "Spot een legendarische vogel.",         voorwaarde: s => s.aantal(v => v.zeldzaamheid === "legendarisch") >= 1 },
  { id: "vroeg",      icoon: "🌅", naam: "Vroege vogel",         uitleg: "Zie een vogel voor 8 uur 's ochtends.", voorwaarde: s => s.waarnemingen.some(w => new Date(w.datum).getHours() < 8) },
  { id: "reiziger",   icoon: "🥾", naam: "Op pad",               uitleg: "Spot vogels op 3 verschillende plaatsen.", voorwaarde: s => new Set(s.waarnemingen.map(w => (w.plaats || "").trim().toLowerCase()).filter(Boolean)).size >= 3 },
  { id: "zomer",      icoon: "☀️", naam: "Zomergasten",          uitleg: "Spot 3 zomergasten.",                   voorwaarde: s => s.aantal(v => v.trek === "zomergast") >= 3 },

  // --- Reizen: landen en continenten ---
  { id: "land-1",  groep: "reizen", icoon: "📍", naam: "Eerste land",     uitleg: "Spot een vogel in een land.",            voorwaarde: s => s.landen.size >= 1 },
  { id: "land-2",  groep: "reizen", icoon: "🧳", naam: "Over de grens",   uitleg: "Spot vogels in 2 landen.",               voorwaarde: s => s.landen.size >= 2 },
  { id: "land-5",  groep: "reizen", icoon: "✈️", naam: "Globetrotter",    uitleg: "Spot vogels in 5 landen.",               voorwaarde: s => s.landen.size >= 5 },
  { id: "land-10", groep: "reizen", icoon: "🛫", naam: "Wereldburger",  uitleg: "Spot vogels in 10 landen.",voorwaarde: s => s.landen.size >= 10 },
  { id: "land-25", groep: "reizen", icoon: "🧭", naam: "Trekvogel",       uitleg: "Spot vogels in 25 landen.",              voorwaarde: s => s.landen.size >= 25 },
  ...continentBadges,
  { id: "continent-3",   groep: "reizen", icoon: "🌍", naam: "Drie werelddelen", uitleg: "Spot vogels op 3 continenten.",   voorwaarde: s => s.continenten.size >= 3 },
  { id: "continent-alle", groep: "reizen", icoon: "🌐", naam: "Wereldspotter", uitleg: "Spot vogels op alle 7 continenten.", voorwaarde: s => s.continenten.size >= 7 },

  // --- Spel: Raad de vogel ---
  { id: "spel-1",       groep: "spel", icoon: "🎮", naam: "Speelvogel",      uitleg: "Speel Raad de vogel.",                    voorwaarde: s => s.spel.rondes >= 1 },
  { id: "spel-perfect", groep: "spel", icoon: "🎯", naam: "Raak!",           uitleg: "Raad alle vogels van een spel in één keer.", voorwaarde: s => s.spel.perfect >= 1 },
  { id: "spel-50",      groep: "spel", icoon: "🧠", naam: "Vogelbrein",      uitleg: "Raad in totaal 50 vogels.",               voorwaarde: s => s.spel.geraden >= 50 },
];

// Titels van de groepen op het badgesscherm (badges zonder groep staan onder "spotten").
export const BADGE_GROEPEN = {
  spotten: "Spotten",
  reizen: "Reizen",
  spel: "Raad de vogel",
};
