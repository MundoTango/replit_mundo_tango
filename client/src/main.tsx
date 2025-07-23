import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// TEMPORARILY DISABLED SERVICE WORKER FOR DEBUGGING
console.log('Service worker registration disabled for debugging');

// Unregister all existing service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister();
      console.log('Unregistered service worker:', registration.scope);
    });
  });
  
  // Clear ALL caches
  caches.keys().then(cacheNames => {
    cacheNames.forEach(cacheName => {
      caches.delete(cacheName);
      console.log('Deleted cache:', cacheName);
    });
  });
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

const root = createRoot(rootElement);
root.render(<App />);
