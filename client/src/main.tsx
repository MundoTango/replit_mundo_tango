import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register service worker with updated cache version
if ('serviceWorker' in navigator) {
  // Unregister old service worker and register Workbox
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      if (registration.active && registration.active.scriptURL.includes('/service-worker.js')) {
        registration.unregister();
        console.log('Unregistered old service worker');
      }
    });
  });
  
  // Register the Workbox service worker
  navigator.serviceWorker.register('/service-worker-workbox.js')
    .then(registration => {
      console.log('Workbox Service Worker registered with scope:', registration.scope);
      
      // Force update check every 30 seconds
      setInterval(() => {
        registration.update();
      }, 30000);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              console.log('New Workbox service worker installed, will activate on reload');
              // Show update notification
              const event = new CustomEvent('sw-update-available');
              window.dispatchEvent(event);
              
              // Force the new service worker to activate immediately
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        }
      });
    })
    .catch(error => {
      console.error('Workbox Service Worker registration failed:', error);
    });

  // Clear ALL caches on startup to force refresh
  caches.keys().then(cacheNames => {
    cacheNames.forEach(cacheName => {
      // Delete ALL caches that don't include v4-mt-ocean-theme
      if (!cacheName.includes('v4-mt-ocean-theme')) {
        caches.delete(cacheName);
        console.log('Deleted old cache:', cacheName);
      }
    });
  });

  // Clear theme from localStorage if it's causing issues
  const currentTheme = localStorage.getItem('life-ceo-theme');
  if (currentTheme && currentTheme !== 'mundo-tango') {
    localStorage.removeItem('life-ceo-theme');
    console.log('Cleared old theme from localStorage');
  }
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

const root = createRoot(rootElement);
root.render(<App />);
