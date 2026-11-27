const CACHE_NAME = 'agy-reports-v5';
self.addEventListener('install', event => {
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve()))
    )).then(() => clients.claim())
  );
});
self.addEventListener('fetch', event => {
  const reqUrl = (event.request && event.request.url) ? event.request.url.toLowerCase() : '';
  if (event.request.method !== 'GET' || reqUrl.endsWith('.mp3') || event.request.headers.get('range')) {
    return;
  }
  event.respondWith(
    fetch(event.request, { cache: 'no-cache' })
      .then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone)).catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
