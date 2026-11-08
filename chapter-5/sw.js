// Chapter 5 offline support. Code and data: network first (updates arrive at once), saved copy when offline.
// Page images never change: saved on first view and served from the saved copy afterwards.
const VERSION = 'ch5-v1';
const SHELL = ['./', 'index.html', 'app.js', 'style.css', 'lib/ink.js', 'lib/storage.js', 'manifest.webmanifest',
  'data/manifest.json', 'data/fields.json', 'data/questions.json',
  '../assets/brand/icon-192.png', '../assets/brand/apple-touch-icon.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('ch5-') && k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (/\/chapter-5\/assets\/page-\d+\.png$/.test(url.pathname)) {
    e.respondWith(caches.open(VERSION).then(async (c) => (await c.match(req)) || fetch(req).then((r) => { if (r.ok) c.put(req, r.clone()); return r; })));
    return;
  }
  e.respondWith(fetch(req).then((r) => { if (r.ok) caches.open(VERSION).then((c) => c.put(req, r.clone())); return r; })
    .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('index.html'))));
});
