/* Visitors Prep service worker.
   Change VERSION whenever you upload new files so phones pick up the update. */
const VERSION = "visitors-prep-v2";
const BASE = "/Visitor-Task-List/";
const SHELL = [
  "", "index.html", "manifest.json", "config.js",
  "icon-192.png", "icon-512.png", "icon-maskable-192.png", "icon-maskable-512.png",
  "apple-touch-icon.png", "favicon-32.png"
].map(f => BASE + f);

self.addEventListener("install", event => {
  // Each file is saved on its own, so one missing file can't stop the app installing.
  event.waitUntil(
    caches.open(VERSION)
      .then(c => Promise.allSettled(SHELL.map(u => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("visitors-prep-") && k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(req, fallback){
  const cache = await caches.open(VERSION);
  try{
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  }catch(_){
    return (await cache.match(req, {ignoreSearch:true})) ||
           (fallback && (await cache.match(fallback) || await cache.match(BASE))) ||
           Response.error();
  }
}

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
  const ours = url.origin === location.origin && url.pathname.startsWith(BASE);

  if (req.mode === "navigate" && ours){ event.respondWith(networkFirst(req, BASE + "index.html")); return; }
  if (ours && url.pathname.endsWith("/config.js")){ event.respondWith(networkFirst(req)); return; }
  if (ours || url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com"){
    event.respondWith(cacheFirst(req));
  }
  // Anything else (the shared list in Supabase) goes straight to the internet.
});
