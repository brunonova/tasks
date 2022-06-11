importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js");

const cacheName = "tasks-cache";
const { routing, strategies } = workbox;

routing.registerRoute(
  () => true,
  new strategies.StaleWhileRevalidate({cacheName}),
);

const invalidateOldCache = async () => {
  const keys = await caches.keys();
  const isOldCache = (key) => key !== cacheName;
  const oldKeys = keys.filter(isOldCache);

  return Promise.all(oldKeys.map((key) => caches.delete(key)));
};

self.addEventListener("activate", (e) => e.waitUntil(invalidateOldCache()));