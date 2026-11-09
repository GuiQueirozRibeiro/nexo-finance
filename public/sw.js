const CACHE_NAME = 'nexo-finance-shell-v1';
const STATIC_ASSETS = [
  '/',
  '/app',
  '/arquitetura',
  '/manifest.webmanifest',
  '/EXIMIA-FAVICON1.png',
  '/EXIMIA-FAVICON2.png',
  '/EXIMIA-LOGO5-C.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/')) return;

  // Cache-first para imagens/fontes/manifest; Network-first com fallback para navegação
  if (
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.ttf') ||
    url.pathname.endsWith('.webmanifest')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request)),
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/app'))),
  );
});
