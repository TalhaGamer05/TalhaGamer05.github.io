const CACHE_NAME = 'weather-dashboard-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './istatistikler.html',
  './hakkimizda.html',
  './iletisim.html',
  './galeri.html',
  './nasil-yapildi.html',
  './style.css',
  './webgl.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
});
