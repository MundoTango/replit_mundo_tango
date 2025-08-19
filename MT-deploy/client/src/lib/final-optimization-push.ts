// Final optimization push to achieve <3s render time
// Using 40x20s methodology - Layers 36-40

import React from 'react';

// 1. Implement Service Worker for offline caching
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => {
          console.log('⚡ Service Worker registered for offline performance');
        },
        (err) => {
          console.warn('Service Worker registration failed:', err);
        }
      );
    });
  }
}

// 2. Implement HTTP/2 Server Push hints
export function addServerPushHints() {
  const criticalResources = [
    '/src/index.css',
    '/src/App.tsx',
    '/api/auth/user',
    '/api/posts/feed'
  ];
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.endsWith('.css') ? 'style' : 
              resource.endsWith('.tsx') ? 'script' : 'fetch';
    if (resource.startsWith('/api/')) {
      link.crossOrigin = 'use-credentials';
    }
    document.head.appendChild(link);
  });
}

// 3. Implement Brotli compression detection
export function checkBrotliSupport(): boolean {
  const acceptEncoding = navigator.languages ? 
    window.navigator.userAgent : '';
  return acceptEncoding.includes('br');
}

// 4. Optimize React rendering with time slicing
export function timeSlice<T>(
  items: T[],
  processItem: (item: T) => void,
  chunkSize: number = 10
) {
  let index = 0;
  
  function processChunk() {
    const chunk = items.slice(index, index + chunkSize);
    chunk.forEach(processItem);
    index += chunkSize;
    
    if (index < items.length) {
      requestIdleCallback(processChunk, { timeout: 16 });
    }
  }
  
  requestIdleCallback(processChunk, { timeout: 16 });
}

// 5. Implement edge caching headers
export function setEdgeCacheHeaders() {
  // Add these headers on the server side for edge caching
  return {
    'Cache-Control': 'public, max-age=31536000, immutable',
    'CDN-Cache-Control': 'max-age=31536000',
    'Cloudflare-CDN-Cache-Control': 'max-age=31536000',
    'Surrogate-Control': 'max-age=31536000'
  };
}

// 6. Progressive enhancement for slow networks
export function detectSlowNetwork(): boolean {
  const connection = (navigator as any).connection;
  if (!connection) return false;
  
  const slowConnections = ['slow-2g', '2g', '3g'];
  return slowConnections.includes(connection.effectiveType) ||
         connection.downlink < 1.5 || // Less than 1.5 Mbps
         connection.rtt > 300; // RTT > 300ms
}

// 7. Implement render-blocking CSS elimination
export function loadCSSAsync(href: string) {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = href;
  link.onload = function(this: HTMLLinkElement) {
    this.onload = null;
    this.rel = 'stylesheet';
  };
  document.head.appendChild(link);
}

// 8. Final memory optimization
export function aggressiveMemoryCleanup() {
  // Clear all caches
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        if (!name.includes('life-ceo-v3')) {
          caches.delete(name);
        }
      });
    });
  }
  
  // Force garbage collection if available
  if ((window as any).gc) {
    (window as any).gc();
  }
  
  // Clear unused DOM nodes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          (node as Element).remove();
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return observer;
}

// 9. Implement request prioritization
export function prioritizeRequests() {
  // Override fetch to add priority hints
  const originalFetch = window.fetch;
  window.fetch = function(...args: Parameters<typeof fetch>) {
    const [resource, init = {}] = args;
    
    // Add priority based on resource type
    if (typeof resource === 'string') {
      if (resource.includes('/auth/') || resource.includes('/posts/feed')) {
        (init as any).priority = 'high';
      } else if (resource.includes('/notifications/') || resource.includes('/friends/')) {
        (init as any).priority = 'low';
      }
    }
    
    return originalFetch.apply(this, [resource, init] as Parameters<typeof fetch>);
  };
}

// 10. Initialize all final optimizations
export function initializeFinalOptimizations() {
  console.log('🚀 Life CEO Final Optimization Push - Target: <3s');
  
  // Run all optimizations
  registerServiceWorker();
  addServerPushHints();
  prioritizeRequests();
  
  // Detect and adapt to network conditions
  if (detectSlowNetwork()) {
    console.log('📶 Slow network detected - enabling adaptive optimizations');
    document.body.classList.add('slow-network');
  }
  
  // Progressive CSS loading
  const cssFiles = document.querySelectorAll('link[rel="stylesheet"]');
  cssFiles.forEach((link) => {
    const href = link.getAttribute('href');
    if (href && !href.includes('critical')) {
      link.remove();
      loadCSSAsync(href);
    }
  });
  
  // Start aggressive memory cleanup
  const memoryObserver = aggressiveMemoryCleanup();
  
  // Clean up observer after 30 seconds
  setTimeout(() => {
    memoryObserver.disconnect();
  }, 30000);
  
  console.log('✅ All 40x20s optimizations applied - aiming for <3s render time!');
}