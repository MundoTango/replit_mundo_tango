import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Life CEO 44x21s Layer 44 - Simplified startup for faster preview loading
console.log('🚀 Life CEO - Starting React app with optimized loading...');

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

const root = createRoot(rootElement);

// Life CEO 44x21s Layer 21 - Error boundary wrapper
try {
  console.log('🎯 Life CEO - Mounting React app...');
  root.render(<App />);
  console.log('✅ Life CEO - React app mounted successfully');
} catch (error) {
  console.error('❌ Life CEO - React app failed to mount:', error);
  // Fallback UI
  rootElement.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui;">
      <div style="text-align: center; padding: 2rem; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0;">
        <h2 style="color: #1e293b; margin-bottom: 1rem;">Life CEO Loading...</h2>
        <p style="color: #64748b;">Initializing the platform...</p>
        <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Retry
        </button>
      </div>
    </div>
  `;
}
