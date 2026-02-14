const CACHE_NAME = 'network-tools-v4';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './favicon.svg',
    './icon-192.png',
    './icon-512.png',
    './css/shared.css',
    './css/ip-rechner.css',
    './css/mx-lookup.css',
    './css/dns-lookup.css',
    './js/app.js',
    './js/ip-rechner.js',
    './js/mx-lookup.js',
    './js/dns-lookup.js'
];

// Install: cache all assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch: cache-first strategy
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cached => cached || fetch(event.request))
    );
});
