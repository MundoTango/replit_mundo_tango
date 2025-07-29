import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Life CEO 44x21s Layer 7 - Proper React app loading with memory feed at "/" route
console.log('🚀 Life CEO - Starting React app with memory feed at root...');

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

const root = createRoot(rootElement);

try {
  root.render(<App />);
  console.log('✅ Life CEO - React app with routing mounted successfully');
} catch (error) {
  console.error('❌ Life CEO - React rendering failed:', error);
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : 'No stack trace available';
  
  // Direct HTML fallback if React completely fails
  rootElement.innerHTML = `
    <div style="padding: 2rem; font-family: system-ui; background: #fef2f2; min-height: 100vh;">
      <h1 style="color: #dc2626;">Life CEO - React Error Detected</h1>
      <p>React failed to render. Using HTML fallback.</p>
      <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Reload Application
      </button>
      <pre style="background: #1f2937; color: #f9fafb; padding: 1rem; margin-top: 1rem; border-radius: 4px; overflow: auto;">
Error: ${errorMessage}
Stack: ${errorStack || 'No stack trace available'}
      </pre>
    </div>
  `;
}
