/* 오프라인 캐시: 페이지와 내용 파일은 최신을 먼저 받고, 안 되면 저장본을 보여줘요 */
const CACHE = "rba-note-16";
const CORE = ["./", "./index.html", "./payload.json?v=16", "./manifest.json", "./icons/icon-192.png", "./icons/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const same = req.url.indexOf(self.location.origin) === 0;
  if (req.mode === "navigate" || (same && req.url.indexOf("payload.json") > -1)) {
    e.respondWith(fetch(req, { cache: "no-cache" }).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match("./index.html"))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    const copy = res.clone(); caches.open(CACHE).then(c => { try { c.put(req, copy); } catch (err) {} }); return res;
  })));
});
