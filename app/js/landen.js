// Landen en continenten voor de reisbadges.
// Het land van een waarneming komt uit OpenStreetMap (landcode, bv. "be").
// Hier zoeken we het continent op. Midden-Amerika en de Caraïben tellen als Noord-Amerika,
// Rusland en Turkije als Europa (zoals de meeste vogelgidsen).

export const CONTINENTEN = {
  EU: { naam: "Europa",        icoon: "🏰" },
  AF: { naam: "Afrika",        icoon: "🦒" },
  AS: { naam: "Azië",          icoon: "🐼" },
  NA: { naam: "Noord-Amerika", icoon: "🦅" },
  SA: { naam: "Zuid-Amerika",  icoon: "🦜" },
  OC: { naam: "Oceanië",       icoon: "🦘" },
  AN: { naam: "Antarctica",    icoon: "🐧" },
};

const PER_CONTINENT = {
  EU: "ad al at ax ba be bg by ch cy cz de dk ee es fi fo fr gb gg gi gr hr hu ie im is it je li lt lu lv mc md me mk mt nl no pl pt ro rs ru se si sj sk sm tr ua va xk",
  AF: "ao bf bi bj bw cd cf cg ci cm cv dj dz eg eh er et ga gh gm gn gq gw ke km lr ls ly ma mg ml mr mu mw mz na ne ng re rw sc sd sh sl sn so ss st sz td tg tn tz ug yt za zm zw",
  AS: "ae af am az bd bh bn bt cn ge hk id il in iq ir jo jp kg kh kp kr kw kz la lb lk mm mn mo mv my np om ph pk ps qa sa sg sy th tj tl tm tw uz vn ye",
  NA: "ag ai aw bb bl bm bq bs bz ca cr cu cw dm do gd gl gp gt hn ht jm kn ky lc mf mq ms mx ni pa pm pr sv sx tc tt us vc vg vi",
  SA: "ar bo br cl co ec fk gf gy pe py sr uy ve",
  OC: "as au ck fj fm gu ki mh mp nc nf nr nu nz pf pg pn pw sb tk to tv um vu wf ws",
  AN: "aq bv gs hm tf",
};

const CONTINENT_VAN = {};
for (const [c, lijst] of Object.entries(PER_CONTINENT)) for (const l of lijst.split(" ")) CONTINENT_VAN[l] = c;

export const continentVan = landcode => CONTINENT_VAN[(landcode || "").toLowerCase()] || null;

// 🇧🇪 uit "be"
export function vlag(landcode) {
  if (!/^[a-z]{2}$/i.test(landcode || "")) return "🏳️";
  return String.fromCodePoint(...landcode.toUpperCase().split("").map(c => 0x1f1e6 + c.charCodeAt(0) - 65));
}
