# Dodo Diary 🦤

Een vogellogboek voor kinderen van 8 tot 14 jaar. Op een leuke, laagdrempelige manier houd je
je waarnemingen en je *lifelist* bij. Zie je een vogel? Tik op **SPOT**, zoek hem op en tik
**Dit was hem!** De app onthoudt de soort, de datum, de plaats en je notitie. Al je
waarnemingen verschijnen op een **satellietkaart** die start als wereldbol, verbonden door je route,
zoals in een reisverslag. Met het spel **Raad de vogel** leer je de vogels beter kennen.

Elke soort heeft een digitaal **vogelkaartje** met de 3 belangrijkste kenmerken om hem te
herkennen, plus groep, zeldzaamheid, grootte, spanwijdte, trekgedrag, een leuk weetje en het geluid.

Dit is een **proof of concept** (POC): 68 Belgische soorten, alles in het Nederlands.

## Starten

Je hebt alleen [Node.js](https://nodejs.org) (versie 18 of hoger) nodig, geen installatie van pakketten:

```bash
npm start            # → http://localhost:8080
npm test             # controleert vogels.json en de spelregels
```

Elke andere webserver werkt ook: de map `app/` is een statische website
(GitHub Pages, Netlify, je eigen hosting…). Open `index.html` niet rechtstreeks als
bestand: browsers laten dan de vogeldata niet laden.

Op een gsm kan je de app via het browsermenu op je **startscherm** zetten (PWA). Daarna
werkt hij ook offline, bijvoorbeeld in het bos.

## Wat zit erin?

- **Vogels**: alle soorten met een nummer. Vogels die je nog niet spotte, zie je als silhouet met `???`.
- **SPOT**: zoek op naam, of filter op leefgebied en grootte als je de naam niet weet.
  De datum en de plaats (via gps) worden automatisch ingevuld. Op een kaartje duid je de
  plek aan of verbeter je ze, en je kan meteen een notitie schrijven.
- **Kaart** (Mapbox, satelliet): de kaart start als draaiende wereldbol en vliegt dan naar je
  waarnemingen. Elke waarneming staat erop met de sticker van de vogel, verbonden door een stippellijn
  in de volgorde waarin je ze zag. Onderaan staat een tijdlijn: tik erop om naar die plek te vliegen.
- **Raad de vogel** (knop op de kaart): een spel zoals Birdle. Je ziet een vogel en typt de naam.
  Je hebt 3 kansen, en na elke foute poging wordt er een letter zichtbaar. In één keer juist levert
  30 punten op, daarna 20, daarna 10. Je speelt met de vogels die je spotte en met je **wensvogels**.
- **Wil ik zien**: kies bij SPOT een vogel en tik op **⭐ Wil ik zien** in plaats van *Dit was hem!*.
  Hij staat dan als **wensvogel** in je overzicht, in het blauw, en gaat mee in Raad de vogel.
  Spot je hem later echt, dan verdwijnt hij van je wenslijst: wens vervuld!
- **Logboek**: een dagboek met al je waarnemingen per dag, met je notities. Tik op ✏️ om
  datum, plaats, plek op de kaart of notitie achteraf aan te passen. Er is ook een lifelist.
- **Vogelkaartje** met een kleur en sterren per zeldzaamheid. Legendarische vogels krijgen een gouden rand.
- **Punten en levels**: van 🥚 Eitje tot 🦅 Arendsoog. Zeldzamere vogels leveren meer punten op.
- **33 badges** in drie groepen:
  - *Spotten*, zoals Roofvogelradar, Vroege vogel en Schattenjager.
  - *Reizen*: 1, 2, 5, 10 en 25 landen, een badge per continent, 3 continenten en alle 7 continenten.
    Het land wordt automatisch bepaald uit de plek die je aanduidt.
  - *Raad de vogel*.
- **Back-up**: de gegevens staan alleen op het toestel, dus je kan een back-up downloaden en terugzetten.
- **eBird** (optioneel): met een API-sleutel zie je per vogel waar hij de laatste 30 dagen in de buurt gezien is.

## De kaart instellen (Mapbox)

De kaarten gebruiken Mapbox. Daarvoor is een gratis sleutel nodig; tot 50.000 keer een kaart
laden per maand is gratis.

1. Maak een account op <https://account.mapbox.com/auth/signup/>.
2. Ga naar **Tokens** en maak een nieuwe token. Vul bij **URL restrictions** het adres van je app
   in, bv. `https://vollenbakmarketing-oss.github.io/Birdlist/`. Zo kan niemand anders je sleutel gebruiken.
3. Kopieer de token (begint met `pk.`) en zet hem in `app/js/config.js` bij `mapboxSleutel`.
   Om snel te testen kan je hem ook in de app plakken bij ⚙️ Instellingen.

Zonder sleutel werkt de app gewoon verder: alleen de kaarten worden niet getoond.

## Zelf aanpassen

Alles wat je vaak wil aanpassen, staat in een paar bestanden:

| Wat wil je aanpassen?                                        | Bestand                    |
|--------------------------------------------------------------|----------------------------|
| Vogels: namen, kenmerken, weetjes, zeldzaamheid, maten, geluid | `app/data/vogels.json`   |
| Appnaam, Mapbox-sleutel en kaartstijl, spelregels, punten, levels | `app/js/config.js`   |
| Landen per continent                                         | `app/js/landen.js`         |
| Badges (en hun voorwaarden)                                  | `app/js/badges.js`         |
| Kleuren, lettertypes, look & feel                            | `app/css/stijl.css` (variabelen bovenaan) |
| "Zo lang als een potlood"-vergelijkingen                     | `app/js/ui.js`             |
| Het kaartje zelf                                             | `app/js/kaart.js`          |

Na een aanpassing: herlaad de pagina. Draai `npm test` om te controleren of `vogels.json` nog klopt.
Als de app al op gsm's geïnstalleerd is: verhoog `VERSIE` in `app/sw.js`.

### Een vogel in `vogels.json`

```json
{
  "nr": 35,                          // nummer in het overzicht
  "id": "Alcedo_atthis",             // = naam van de sticker, niet wijzigen
  "naam": "IJsvogel",
  "wetenschappelijk": "Alcedo atthis",
  "groep": "water",                  // tuin | bos | water | akker | roofvogel | uil
  "zeldzaamheid": "zeldzaam",        // gewoon | vrij gewoon | zeldzaam | heel zeldzaam | legendarisch
  "weetje": "Duikt pijlsnel …",
  "kenmerken": ["Knalblauwe rug", "Oranje buik", "Lange, puntige snavel"],  // precies 3
  "lengteCm": [16, 17],
  "spanwijdteCm": [24, 26],
  "trek": "standvogel",              // standvogel | zomergast | wintergast | doortrekker | deels
  "iucn": "LC",
  "ebird": "comkin1",                // eBird-soortcode
  "geluid": null,                    // bv. "XC123456" (xeno-canto) of een url naar een mp3
  "sticker": "stickers/Alcedo_atthis.webp"
}
```

### Vogels toevoegen

```bash
npm run vogel -- "Certhia brachydactyla" "Turdus pilaris"
```

Dit haalt de Nederlandse naam, de eBird-code, de IUCN-status en de sticker op uit de
[huashu-bird-sticker](https://github.com/alchaincyf/huashu-bird-sticker)-dataset. Vul daarna in
`vogels.json` de velden met `TODO` aan: groep, zeldzaamheid, weetje, de 3 kenmerken en eventueel de maten.

### Zeldzaamheid laten berekenen met eBird

```bash
EBIRD_API_KEY=jouwsleutel npm run zeldzaamheid               # toont een voorstel
EBIRD_API_KEY=jouwsleutel npm run zeldzaamheid -- --schrijf  # past vogels.json aan
```

Het script telt op hoeveel plaatsen in België elke soort de laatste 30 dagen op eBird gemeld is.
Dat hangt af van het seizoen: een zomergast zoals de gierzwaluw scoort in de winter 0. De
zeldzaamheden in de POC zijn daarom met de hand ingesteld ("hoe makkelijk ziet een kind
deze vogel in België?"). Gebruik het script als hulpmiddel, niet blind.
Een gratis sleutel vraag je aan op <https://ebird.org/api/keygen>.

### Geluiden toevoegen (xeno-canto)

```bash
XC_API_KEY=jouwsleutel npm run geluiden
```

Dit zoekt voor elke vogel een opname van goede kwaliteit, bij voorkeur uit België, en bewaart
het opnamenummer en de bronvermelding in `vogels.json`. Zolang een vogel geen geluid heeft,
toont het kaartje een knop naar de soortpagina op xeno-canto.org.

## Structuur

```
app/                    de website (statisch)
  index.html
  css/stijl.css
  data/vogels.json      ← de vogels
  stickers/             ← afbeeldingen (480 px, webp)
  js/
    config.js           ← spelregels, labels, kleuren
    badges.js           ← badges
    main.js             router + kop
    opslag.js           lokale opslag (localStorage)
    spel.js             punten, levels, badges berekenen
    kaartje.js          het vogelkaartje
    kaartlaag.js        hulpjes voor de kaarten (Mapbox GL)
    raden.js            spelregels van Raad de vogel
    landen.js           landen → continenten, vlaggetjes
    waarneming-dialoog.js  venster om een waarneming toe te voegen of te bewerken
    locatie.js          gps + plaatsnaam (OpenStreetMap)
    ebird.js            eBird API
    ui.js               hulpfuncties
    schermen/           één bestand per scherm
  sw.js                 offline-ondersteuning
scripts/                beheerscripts (Node, geen afhankelijkheden)
tests/                  npm test
```

Er is geen framework en geen build-stap: gewone JavaScript-modules. De enige externe
bibliotheek is [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/) voor de kaarten. Wil je later naar
accounts en cloudopslag? Dan vervang je alleen `app/js/opslag.js`.

## Privacy

- Geen accounts, geen tracking. Alles blijft in de browser van het toestel.
- De locatie wordt alleen gebruikt om de plaatsnaam in te vullen (via OpenStreetMap Nominatim)
  en wordt afgerond tot ongeveer 100 m bewaard.
- De eBird-sleutel staat in de browser. Dat is prima voor een POC, maar in een publieke
  versie hoort die op een kleine server (proxy).

## Ideeën voor de volgende stap

- Foto toevoegen bij een waarneming
- Uitstapjes: waarnemingen groeperen per wandeling of reis, met een eigen kaart
- Alle ~450 Belgische soorten, met zeldzaamheid per seizoen via eBird
- Geluiden en een quiz ("Welke vogel hoor je?")
- Klas- en gezinsmodus: lijsten delen en vergelijken (vraagt accounts en ouderlijke toestemming, GDPR)

## Bronnen en licenties

- **Vogelillustraties**: [huashu-bird-sticker](https://github.com/alchaincyf/huashu-bird-sticker) door Huashu,
  [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). De stickers zijn met AI gemaakt en
  verkleind naar 480 px. De naamsvermelding staat op elk kaartje en in de app onder *Meer*.
- **Soortdata** (Nederlandse namen, eBird-codes, IUCN): dezelfde dataset (MIT), gebaseerd op AviList v2026 en IOC.
- **Waarnemingen**: [eBird](https://ebird.org), Cornell Lab of Ornithology.
- **Kaarten**: [Mapbox](https://www.mapbox.com/about/maps/) (satellietbeelden). Plaatsnamen en
  landen: [OpenStreetMap](https://www.openstreetmap.org/copyright) (Nominatim).
- **Geluiden**: [xeno-canto](https://xeno-canto.org), Creative Commons volgens de opname.
- **Weetjes, maten en trekgedrag**: zelf samengesteld voor deze POC. Laat ze nakijken door
  iemand van Natuurpunt of een vogelwerkgroep voor je ze publiceert.
