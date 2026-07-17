const CACHE_NAME = 'musify-v2';
const ASSETS = [
  './',
  './index.html',
  './login.html',
  './signup.html',
  './manifest.json',
  './favicon.ico',
  './css/style.css',
  './css/variables.css',
  './css/base.css',
  './css/utility.css',
  './css/components/sidebar.css',
  './css/components/header.css',
  './css/components/cards.css',
  './css/components/playbar.css',
  './css/components/popups.css',
  './css/components/loader.css',
  './css/auth/auth.css',
  './js/app.js',
  './js/auth-app.js',
  './js/modules/api.js',
  './js/modules/audio.js',
  './js/modules/auth-core.js',
  './js/modules/config.js',
  './js/modules/search.js',
  './js/modules/state.js',
  './js/modules/storage.js',
  './js/modules/ui.js',
  './js/modules/utils.js',
  './img/musify-icon.svg',
  './img/logo.svg',
  './img/playlist.svg',
  './img/home.svg',
  './img/search.svg',
  './img/music.svg'
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use cache.addAll with catch to prevent install failure if some resource is temporarily missing
      return cache.addAll(ASSETS).catch(err => {
        console.warn('Pre-caching some assets failed: ', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Skip caching for API requests or backend requests
  if (url.origin !== self.location.origin || url.pathname.includes('/api/') || url.pathname.includes('/login') || url.pathname.includes('/signup')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Cache-first for static local assets
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });
        return networkResponse;
      });
    }).catch(() => {
      // Offline fallback
      if (e.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
