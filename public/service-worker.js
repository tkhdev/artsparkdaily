const CACHE_NAME = "image-cache-v1";
const MAX_CACHE_ITEMS = 50;

// Helper to clean old entries if cache grows beyond limit
async function trimCache(cache) {
  const keys = await cache.keys();
  if (keys.length > MAX_CACHE_ITEMS) {
    // Delete oldest entries until size is under limit
    const itemsToDelete = keys.length - MAX_CACHE_ITEMS;
    for (let i = 0; i < itemsToDelete; i++) {
      await cache.delete(keys[i]);
    }
  }
}

self.addEventListener("install", (event) => {
  // Activate immediately after installation
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Claim clients immediately so SW starts controlling pages ASAP
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only handle image requests
  if (request.destination === "image") {
    // Only cache HTTP and HTTPS requests (skip chrome-extension, data, etc.)
    if (!request.url.startsWith('http://') && !request.url.startsWith('https://')) {
      // Do nothing special, just let the request pass through normally
      return;
    }

    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          // Return cached image
          return cachedResponse;
        }
        try {
          const response = await fetch(request);
          // Cache the new image (if valid response)
          if (
            response &&
            response.status === 200 &&
            response.type === "basic"
          ) {
            await cache.put(request, response.clone());
            // Trim cache if too big
            trimCache(cache);
          }
          return response;
        } catch (err) {
          // Network request failed, optionally respond with fallback image
          // return caches.match('/fallback-image.png');
          return new Response(null, {
            status: 504,
            statusText: "Network error"
          });
        }
      })
    );
  }
});
