import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { CacheMonitor } from "./utils/cache-monitor";

// Initialize cache monitoring
const monitor = CacheMonitor.getInstance();

// Force service worker update and clear old caches
if ('serviceWorker' in navigator) {
  // Check for service worker updates
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.update();
    });
  });

  // Clear all old caches
  caches.keys().then(cacheNames => {
    cacheNames.forEach(cacheName => {
      if (cacheName.startsWith('life-ceo-v1')) {
        caches.delete(cacheName);
        console.log('Cleared old cache:', cacheName);
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
