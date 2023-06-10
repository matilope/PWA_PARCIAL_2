const CACHE_NAME = 'Pelitra-v1';
const IMAGES_CACHE = [
    '/imagenes/result/draw.png',
    '/imagenes/result/loser.png',
    '/imagenes/result/winner.png',
    'imagenes/list/no-list.png'
];

importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

const addResourcesToCache = async (resources) => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(resources);
    self.skipWaiting();
};

self.addEventListener('install', (e) => {
    e.waitUntil(
        addResourcesToCache(IMAGES_CACHE)
    );
});

self.addEventListener('message', (e) => {
    if (e.data && e.data.type == "SKIP_WAITING") {
        self.skipWaiting();
    }
});

workbox.routing.registerRoute(
    new RegExp('/*'),
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: CACHE_NAME
    })
);
