// Mundo Tango Service Worker v11.0 - January 16, 2025
// CRITICAL FIX: Network-first strategy to prevent old UI from being cached
const CACHE_NAME = 'mundo-tango-v11';
const urlsToCache = [
  // Only cache essential offline assets
  '/offline.html',
  '/manifest.json'
];

// Install event - minimal caching
self.addEventListener('install', event => {
  // Force immediate activation
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Installing new version');
        // Only cache offline fallback page
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - aggressively clean ALL old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete ALL caches, even current one, to ensure fresh content
          console.log('Service Worker: Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('Service Worker: All caches cleared, claiming clients');
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - ALWAYS try network first
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    // Always try network first
    fetch(event.request)
      .then(response => {
        // Return fresh network response
        return response;
      })
      .catch(error => {
        // Only if network completely fails, show offline page
        console.error('Network request failed:', error);
        
        // For API requests, return error JSON
        if (event.request.url.includes('/api/')) {
          return new Response(
            JSON.stringify({ error: 'Network unavailable' }),
            { 
              status: 503,
              headers: { 'Content-Type': 'application/json' } 
            }
          );
        }
        
        // For page requests, show offline page if available
        return caches.match('/offline.html').then(response => {
          if (response) {
            return response;
          }
          
          // If no offline page, return error response
          return new Response('Network error', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// Periodically check for updates
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});