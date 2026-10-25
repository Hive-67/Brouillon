/* NolanGame — mode hors ligne du store (les jeux, eux, s'ouvrent en ligne). */
const C = 'nolangame-v4';
const F = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(F)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});

/* Réseau d'abord : la dernière version du store s'affiche toujours. Hors ligne : la copie gardée. */
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r).then(res => {
      const cp = res.clone();
      caches.open(C).then(c => c.put(r, cp));
      return res;
    }).catch(() => caches.match(r).then(m => m || caches.match('index.html')))
  );
});
