const CACHE_NAME = 'object-detection-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/components/object-detection.js',
  // Add other assets you want to cache
  'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs', // TensorFlow.js library
  'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd' // COCO-SSD model
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});