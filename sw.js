/* Visitors Prep service worker.
   Change VERSION whenever you upload new files so phones pick up the update. */
const VERSION = "visitors-prep-v1";
const SHELL = [
  "./",
  "index.html",
  "manifest.json",
  "config.js",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-192.png",
  "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png",
  "icons/favicon-32.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network first, falling back to the saved copy when offline.
async function networkFirst(req, fallback){
  const cache = await caches.open(VERSION);
  try{
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  }catch(_){
    return (await cache.match(req, {ignoreSearch:true})) || (fallback && await cache.match(fallback)) || Response.error();
  }
}

// Saved copy first, refreshed in the background.
async function cacheFirst(req){
  const cache = await caches.open(VERSION);
  const hit = await cache.match(req);
  const net = fetch(req).then(res => {
    if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
    return res;
  }).catch(() => null);
  return hit || (await net) || Response.error();
}

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // The page itself and its settings: always try for the latest.
  if (req.mode === "navigate"){ event.respondWith(networkFirst(req, "index.html")); return; }
  if (url.origin === location.origin && url.pathname.endsWith("/config.js")){ event.respondWith(networkFirst(req)); return; }

  // Icons, manifest and fonts.
  if (url.origin === location.origin ||
      url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com"){
    event.respondWith(cacheFirst(req));
    return;
  }
  // Everything else (the shared list in Supabase) goes straight to the internet.
});
