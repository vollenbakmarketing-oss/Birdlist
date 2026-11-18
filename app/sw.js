// Service worker: maakt de app offline bruikbaar (handig in het bos zonder bereik).
// Verhoog VERSIE als je bestanden aanpast, zodat toestellen de nieuwe versie ophalen.
const VERSIE = "vogeldex-v1";

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSIE).then(c => c.addAll([
    "./", "index.html", "css/stijl.css", "data/vogels.json", "manifest.webmanifest", "icoon.svg",
  ])));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSIE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// Eigen bestanden: eerst netwerk (altijd vers), anders cache. Externe API's: niet cachen.
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(r => { const kopie = r.clone(); caches.open(VERSIE).then(c => c.put(e.request, kopie)); return r; })
      .catch(() => caches.match(e.request)),
  );
});
