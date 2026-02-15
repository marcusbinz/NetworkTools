const CACHE_NAME = 'network-tools-v53';
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
    './css/whois-lookup.css',
    './css/port-referenz.css',
    './css/ipv6-rechner.css',
    './css/blacklist-check.css',
    './css/passwort-gen.css',
    './css/mein-netzwerk.css',
    './css/ping-test.css',
    './js/app.js',
    './js/ip-rechner.js',
    './js/mx-lookup.js',
    './js/dns-lookup.js',
    './js/whois-lookup.js',
    './js/port-referenz.js',
    './js/ipv6-rechner.js',
    './js/blacklist-check.js',
    './js/passwort-gen.js',
    './js/mein-netzwerk.js',
    './js/ping-test.js',
    './css/netzwerk-wiki.css',
    './js/netzwerk-wiki.js',
    './css/email-header.css',
    './js/email-header.js'
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

// Listen for skip-waiting message from app
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Fetch: network-first for version.json, cache-first for everything else
self.addEventListener('fetch', event => {
    if (event.request.url.includes('version.json')) {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
        return;
    }
    event.respondWith(
        caches.match(event.request).then(cached => cached || fetch(event.request))
    );
});





























