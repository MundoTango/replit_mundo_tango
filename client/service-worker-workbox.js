// Import Workbox libraries
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

// Check if Workbox loaded successfully
if (!workbox) {
  console.error('Workbox failed to load');
} else {
  console.log('Workbox loaded successfully');
  
  // Configure Workbox
  workbox.setConfig({ debug: true });
  
  // Precaching - for build assets
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);
  
  // Network First Strategy for API calls - ALWAYS get fresh data
  workbox.routing.registerRoute(
    // Match all API routes
    ({ url }) => url.pathname.startsWith('/api/'),
    new workbox.strategies.NetworkFirst({
      cacheName: 'api-cache',
      networkTimeoutSeconds: 5,
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
          purgeOnQuotaError: true
        }),
        {
          // Custom plugin to add timestamp to cached responses
          cachedResponseWillBeUsed: async ({ cachedResponse, request, cacheName }) => {
            if (cachedResponse) {
              const age = Date.now() - cachedResponse.headers.get('workbox-timestamp');
              // Force refresh if cache is older than 30 seconds for critical endpoints
              if (request.url.includes('/api/groups') || 
                  request.url.includes('/api/auth/user') ||
                  request.url.includes('/api/notifications')) {
                if (age > 30000) { // 30 seconds
                  return null; // Force network request
                }
              }
            }
            return cachedResponse;
          },
          // Add timestamp when caching response
          requestWillFetch: async ({ request }) => {
            const newRequest = request.clone();
            return newRequest;
          },
          fetchDidSucceed: async ({ response }) => {
            const clonedResponse = response.clone();
            const headers = new Headers(clonedResponse.headers);
            headers.set('workbox-timestamp', Date.now().toString());
            
            return new Response(clonedResponse.body, {
              status: clonedResponse.status,
              statusText: clonedResponse.statusText,
              headers
            });
          }
        }
      ]
    })
  );
  
  // Stale While Revalidate for images and assets
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'images-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          purgeOnQuotaError: true
        })
      ]
    })
  );
  
  // Cache First for fonts and static assets
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'font' || 
                     request.url.includes('/static/'),
    new workbox.strategies.CacheFirst({
      cacheName: 'static-resources',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        })
      ]
    })
  );
  
  // Network Only for authentication endpoints
  workbox.routing.registerRoute(
    ({ url }) => url.pathname.includes('/auth') || 
                 url.pathname.includes('/login') ||
                 url.pathname.includes('/logout'),
    new workbox.strategies.NetworkOnly()
  );
  
  // Skip waiting and claim clients
  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  });
  
  self.addEventListener('activate', event => {
    // Clean up old caches
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Delete any non-workbox caches
            if (!cacheName.includes('workbox-')) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }).then(() => {
        // Take control of all clients immediately
        return clients.claim();
      })
    );
  });
  
  // Handle offline
  workbox.routing.setCatchHandler(({ event }) => {
    switch (event.request.destination) {
      case 'document':
        return caches.match('/offline.html') || 
               new Response('Offline - Please check your connection', {
                 headers: { 'Content-Type': 'text/html' }
               });
      case 'image':
        return new Response('', {
          headers: { 'Content-Type': 'image/svg+xml' }
        });
      default:
        return Response.error();
    }
  });
}

// Version tracking for updates
const CACHE_VERSION = 'v1.0.0';
console.log('Service Worker Version:', CACHE_VERSION);