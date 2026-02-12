const CACHE_NAME = "rohan-v2";
const STATIC_ASSETS = ["/", "/history", "/login", "/signup", "/offline.html"];

// Install: cache the app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: network-first for API, cache-first for static
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never cache API routes or Firebase calls
  if (url.pathname.startsWith("/api/") || url.hostname.includes("firebase")) {
    return;
  }

  // Network-first for navigation (HTML pages), offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("/offline.html"))
        )
    );
    return;
  }

  // Cache-first for static assets (JS, CSS, fonts, images)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});

// Handle offline queue messages from the app
const offlineQueue = [];

self.addEventListener("message", (event) => {
  if (event.data?.type === "QUEUE_EXTRACTION") {
    offlineQueue.push(event.data.payload);
  }

  if (event.data?.type === "GET_QUEUE") {
    event.ports[0].postMessage({ queue: offlineQueue });
  }

  if (event.data?.type === "CLEAR_QUEUE") {
    offlineQueue.length = 0;
  }
});
