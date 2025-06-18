const CACHE_NAME = 'enzo-app-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add paths to critical icons, e.g.,
  '/icons/android-chrome-192x192.png',
  '/icons/android-chrome-512x512.png'
  // If you know the names of your main JS/CSS bundles from Vite's build output (they are often hashed),
  // you can add them here too for better offline performance, e.g.,
  // '/assets/index-XXXXXXXX.js',
  // '/assets/index-YYYYYYYY.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Opened cache:', CACHE_NAME);
        // Add all URLs to cache, log if any specific one fails
        return Promise.all(
          URLS_TO_CACHE.map(url => {
            return cache.add(url).catch(err => {
              console.error(`[Service Worker] Failed to cache URL: ${url}`, err);
              // It's okay if some non-critical ones fail, but core ones should succeed.
            });
          })
        );
      })
      .catch(err => {
        console.error('[Service Worker] Failed to open cache during install:', err);
      })
  );
  self.skipWaiting(); // Force the waiting service worker to become the active service worker
});

self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests for caching purposes
  if (event.request.method !== 'GET') {
    // For non-GET requests, just pass through to the network.
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache - fetch from network
        return fetch(event.request).then(
          (networkResponse) => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              // 'basic' type indicates same-origin requests. We don't want to cache opaque responses (cross-origin without CORS)
              return networkResponse;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
          console.error('[Service Worker] Fetch failed for:', event.request.url, error);
          // Optionally, you could return a custom offline page here if the request is for a document
          // For example: if (event.request.mode === 'navigate') return caches.match('/offline.html');
          throw error; // Re-throw to let the browser handle the network error display
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Take control of all open clients once activated
});