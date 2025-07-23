import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// LIFE CEO 40x20s DEBUG: Phase 1 - Initial Load Check
console.log('🚀 Life CEO Debug 1: main.tsx loaded');

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

console.log('🚀 Life CEO Debug 2: About to get root element');

const rootElement = document.getElementById("root");
console.log('🚀 Life CEO Debug 3: Root element:', rootElement);

if (!rootElement) {
  console.error('❌ Life CEO Debug: Root element not found!');
  // Add fallback to create root element
  const body = document.body;
  const newRoot = document.createElement('div');
  newRoot.id = 'root';
  newRoot.innerHTML = '<h1 style="color: red;">Life CEO Debug: Had to create root element!</h1>';
  body.appendChild(newRoot);
  throw new Error("Failed to find the root element");
}

console.log('🚀 Life CEO Debug 4: About to create React root');

try {
  const root = createRoot(rootElement);
  console.log('🚀 Life CEO Debug 5: React root created:', root);
  
  console.log('🚀 Life CEO Debug 6: About to render App');
  root.render(<App />);
  console.log('🚀 Life CEO Debug 7: App render called successfully');
} catch (error) {
  console.error('❌ Life CEO Debug: Error in React mounting:', error);
  rootElement.innerHTML = `
    <div style="padding: 40px; background: #ff6b6b; color: white;">
      <h1>Life CEO Debug: React Failed to Mount</h1>
      <pre>${error}</pre>
    </div>
  `;
}
