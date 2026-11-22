// Instellingen, back-up en bronvermelding.
import { CREDITS, ZELDZAAMHEID, APP, KAART } from "../config.js";
import { esc, toast } from "../ui.js";

export function meerScherm(root, ctx) {
  const { opslag } = ctx;
  const s = opslag.get();
  root.innerHTML = `
    <h1 class="titel">Instellingen</h1>

    <section class="blok formulier">
      <h3>Mijn profiel</h3>
      <label>Mijn spotternaam<input id="naam" value="${esc(s.profiel.naam)}" maxlength="24" placeholder="bv. Arendsoog Lien"></label>
    </section>

    <section class="blok">
      <h3>Punten</h3>
      <ul class="punten-uitleg">
        ${Object.values(ZELDZAAMHEID).map(z => `<li style="--zz:${z.kleur}"><span class="zz-label">${z.label}</span> ${z.punten} punten</li>`).join("")}
      </ul>
      <p class="klein">Dezelfde vogel nog eens zien levert ook een paar punten op.</p>
    </section>

    <section class="blok">
      <h3>Back-up</h3>
      <p class="klein">Je lijst staat alleen op dit toestel. Maak af en toe een back-up!</p>
      <div class="acties">
        <button class="knop knop-licht" id="export">⬇️ Back-up downloaden</button>
        <label class="knop knop-licht">⬆️ Back-up terugzetten<input type="file" id="import" accept="application/json" hidden></label>
      </div>
    </section>

    <section class="blok formulier">
      <h3>Voor ouders & leerkrachten</h3>
      <label>Mapbox-sleutel voor de kaarten
        <input id="mapbox" type="password" value="${esc(s.instellingen.mapboxSleutel)}" placeholder="pk.…" autocomplete="off">
      </label>
      <p class="klein">${KAART.mapboxSleutel ? "Er is al een sleutel ingesteld in de app. Vul hier alleen iets in om hem te vervangen." : "Gratis te maken op"}
        <a href="https://account.mapbox.com" target="_blank" rel="noopener">account.mapbox.com</a> (de <em>Default public token</em>).</p>
      <label>eBird API-sleutel (optioneel)
        <input id="ebird" type="password" value="${esc(s.instellingen.ebirdSleutel)}" placeholder="Toont recente waarnemingen per vogel" autocomplete="off">
      </label>
      <p class="klein">Gratis aan te vragen op <a href="https://ebird.org/api/keygen" target="_blank" rel="noopener">ebird.org/api/keygen</a>. De sleutel blijft op dit toestel.</p>
      <p class="klein">${esc(APP.naam)} bewaart geen gegevens online. De locatie wordt alleen gebruikt om de plaatsnaam in te vullen (via OpenStreetMap) en wordt afgerond bewaard.</p>
      <button class="knop knop-gevaar" id="wis">Alles wissen</button>
    </section>

    <section class="blok klein">
      <h3>Bronnen</h3>
      ${Object.values(CREDITS).map(c => `<p><a href="${c.url}" target="_blank" rel="noopener">${esc(c.tekst)}</a></p>`).join("")}
    </section>
  `;

  root.querySelector("#naam").addEventListener("change", e => { opslag.zetProfiel({ naam: e.target.value.trim() }); toast("Naam bewaard"); });
  root.querySelector("#mapbox").addEventListener("change", e => { opslag.zetInstellingen({ mapboxSleutel: e.target.value.trim() }); toast("Mapbox-sleutel bewaard"); });
  root.querySelector("#ebird").addEventListener("change", e => { opslag.zetInstellingen({ ebirdSleutel: e.target.value.trim() }); toast("eBird-sleutel bewaard"); });
  root.querySelector("#export").addEventListener("click", () => {
    const blob = new Blob([opslag.exporteer()], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `dodo-diary-backup-${new Date().toISOString().slice(0, 10)}.json` });
    a.click();
    URL.revokeObjectURL(a.href);
  });
  root.querySelector("#import").addEventListener("change", async e => {
    const f = e.target.files[0];
    if (!f) return;
    try { opslag.importeer(await f.text()); toast("Back-up teruggezet!"); }
    catch (err) { alert("Dat lukte niet: " + err.message); }
  });
  root.querySelector("#wis").addEventListener("click", () => {
    if (confirm("Echt alles wissen? Je hele lijst verdwijnt.")) { opslag.wisAlles(); toast("Alles gewist"); }
  });
}
