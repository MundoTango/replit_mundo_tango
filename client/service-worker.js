// SELF-DESTRUCT MODE - Service worker will unregister itself
// Remove this after cache issues are resolved
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    self.registration.unregister().then(() => {
      return self.clients.matchAll();
    }).then(clients => {
      clients.forEach(client => client.navigate(client.url));
    })
  );
});

// DISABLED - Original service worker code
/* 
// Life CEO Service Worker v4.0 - Updated January 9, 2025
// IMPORTANT: Cache version updated to v4 with network-first strategy
const CACHE_NAME = 'life-ceo-v4';
const urlsToCache = [
  '/',
  '/life-ceo',
  '/manifest.json',
  '/src/main.tsx',
  '/src/index.css'
];

// Install event - cache resources
self.addEventListener('install', event => {
  // Force the new service worker to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Force the service worker to control all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip API requests - always try network first
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Return offline response for API calls
          return new Response(
            JSON.stringify({ error: 'Offline - data will sync when reconnected' }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // For all other requests, try network first (to ensure fresh content)
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        // Clone the response for caching
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request);
      })
  );
});

// Background sync for offline voice recordings
self.addEventListener('sync', event => {
  if (event.tag === 'sync-voice-recordings') {
    event.waitUntil(syncVoiceRecordings());
  }
});

async function syncVoiceRecordings() {
  // Get pending voice recordings from IndexedDB
  const db = await openDB();
  const tx = db.transaction('pending_recordings', 'readonly');
  const recordings = await tx.objectStore('pending_recordings').getAll();
  
  for (const recording of recordings) {
    try {
      await fetch('/api/life-ceo/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recording)
      });
      
      // Remove synced recording
      const deleteTx = db.transaction('pending_recordings', 'readwrite');
      await deleteTx.objectStore('pending_recordings').delete(recording.id);
    } catch (error) {
      console.error('Failed to sync recording:', error);
    }
  }
}

// Helper to open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('life-ceo-db', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending_recordings')) {
        db.createObjectStore('pending_recordings', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}*/
