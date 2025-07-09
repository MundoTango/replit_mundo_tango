import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

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

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

const root = createRoot(rootElement);
root.render(<App />);
