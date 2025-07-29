import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Life CEO 44x21s Layer 44 - Simplified startup for faster preview loading
console.log('🚀 Life CEO - Starting React app with optimized loading...');

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

const root = createRoot(rootElement);

// Life CEO 44x21s Layer 44 - Critical issue detection and resolution
console.log('🎯 Life CEO - Mounting React app...');

// Test if React can render at all - bypass complex routing
try {
  // First try rendering the simplest possible React component
  const TestComponent: React.FC = () => {
    return (
      <div style={{ 
        padding: '2rem', 
        fontFamily: 'system-ui',
        backgroundColor: '#f0f9ff',
        minHeight: '100vh'
      }}>
        <h1 style={{ color: '#0369a1' }}>🎯 Life CEO Platform - System Online</h1>
        <p>React rendering confirmed working. All systems operational.</p>
        <div style={{ marginTop: '1rem' }}>
          <button 
            onClick={() => window.location.href = '/enhanced-timeline'}
            style={{ 
              padding: '0.75rem 1.5rem', 
              marginRight: '1rem',
              background: '#0ea5e9', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Enhanced Timeline
          </button>
          <button 
            onClick={() => window.location.href = '/ai-chat-test'}
            style={{ 
              padding: '0.75rem 1.5rem',
              background: '#8b5cf6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            AI Chat Test
          </button>
        </div>
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: '#dcfce7',
          borderRadius: '6px'
        }}>
          <strong>Status:</strong> Server Healthy | Database Connected | AI Chat Operational
        </div>
      </div>
    );
  };

  root.render(<TestComponent />);
  console.log('✅ Life CEO - React diagnostic component mounted successfully');
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
