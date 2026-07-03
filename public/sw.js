// SecPlus Quest Service Worker
// Caches the app shell and today's session data for offline use.

const CACHE_NAME = "secplus-quest-v1";

const APP_SHELL = [
  "/",
  "/quiz",
  "/flashcards",
  "/library",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Skip chrome-extension and non-http requests
  if (!url.protocol.startsWith("http")) return;

  // Never cache auth pages — stale responses break magic-link flows
  if (url.pathname === "/login" || url.pathname.startsWith("/auth/")) return;

  // Never cache API routes — auth tokens and data must always be fresh
  if (url.pathname.startsWith("/api/")) return;

  // For navigation requests: network-first, fall back to cache.
  // Normalize the cache key to pathname only so query-param variants
  // (e.g. ?skipOnboarding=true, RSC ?_rsc=… params) don't create
  // separate cache entries for the same page.
  if (event.request.mode === "navigate") {
    const normalizedUrl = url.origin + url.pathname;
    const cacheKey = new Request(normalizedUrl);
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(cacheKey, clone));
          return response;
        })
        .catch(() => caches.match(cacheKey).then((r) => r || caches.match("/")))
    );
    return;
  }

  // For static assets: cache-first
  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
    )
  );
});

// ── Web Push: study reminders ──────────────────────────────────────────────
// Added handlers only; the install/activate/fetch caching logic above is
// intentionally left untouched.

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {};
  }
  const title = payload.title || "SecPlus Quest";
  const body = payload.body || "Time to study.";
  const url = payload.url || "/";
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  // Constrain to a same-origin path — never let a push payload open an
  // attacker-controlled URL (defense-in-depth open-redirect guard).
  let targetUrl = "/";
  try {
    const raw = (event.notification.data && event.notification.data.url) || "/";
    const parsed = new URL(raw, self.location.origin);
    targetUrl = parsed.origin === self.location.origin ? parsed.pathname : "/";
  } catch {
    targetUrl = "/";
  }
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          const clientUrl = new URL(client.url);
          if (clientUrl.pathname === targetUrl && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
