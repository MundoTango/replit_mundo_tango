import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { CacheMonitor } from "./utils/cache-monitor";

// Initialize cache monitoring
const monitor = CacheMonitor.getInstance();

// Register service worker and clear old caches
if ('serviceWorker' in navigator) {
  // Register the service worker
  navigator.serviceWorker.register('/service-worker.js')
    .then(registration => {
      console.log('Service Worker registered with scope:', registration.scope);
      
      // Force update check
      registration.update();
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated') {
            console.log('New service worker activated');
            // Clear old caches after new worker is active
            caches.keys().then(cacheNames => {
              const oldCaches = cacheNames.filter(name => 
                name.startsWith('life-ceo-') && name !== 'life-ceo-v3'
              );
              Promise.all(oldCaches.map(name => {
                console.log('Deleting old cache:', name);
                return caches.delete(name);
              }));
            });
          }
        });
      });
    })
    .catch(error => {
      console.error('Service Worker registration failed:', error);
    });

  // Clear theme from localStorage if it's causing issues
  const currentTheme = localStorage.getItem('life-ceo-theme');
  if (currentTheme && currentTheme !== 'mundo-tango') {
    localStorage.removeItem('life-ceo-theme');
    console.log('Cleared old theme from localStorage');
  }
}

// Start cache monitoring
monitor.startMonitoring();

// Log cache status on startup
monitor.checkCacheStatus().then(status => {
  console.log('Cache status:', status);
  if (!status.isValid) {
    console.warn('Cache version mismatch detected. Update available.');
  }
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

const root = createRoot(rootElement);
root.render(<App />);
