// simples service worker para cache básico offline (adapte arquivos conforme necessário)
const CACHE_NAME = 'dual-infodose-v1';
const ASSETS = [
  './', // se servir como index.html
  './index.html',
  './manifest.json',
  // adicione assets críticos (icons, css, etc) aqui
];

// install
self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

// activate
self.addEventListener('activate', ev => {
  ev.waitUntil(self.clients.claim());
});

// fetch
self.addEventListener('fetch', ev => {
  // strategy: cache-first for app shell
  ev.respondWith(
    caches.match(ev.request).then(cached => {
      if(cached) return cached;
      return fetch(ev.request).then(resp => {
        // optional: cache new GET requests (only same-origin)
        if(ev.request.method === 'GET' && resp && resp.status === 200 && ev.request.url.startsWith(self.location.origin)){
          const respClone = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(ev.request, respClone));
        }
        return resp;
      }).catch(()=>caches.match('/index.html')); // fallback
    })
  );
});
