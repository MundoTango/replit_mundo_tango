// Critical Path Optimization for <3s render time
// 40x20s Methodology - Targeted approach

import React from 'react';

// 1. Optimize initial render path
export function optimizeCriticalRenderPath() {
  // Remove render-blocking resources
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
  stylesheets.forEach(link => {
    if (!link.href.includes('index.css')) {
      link.media = 'print';
      link.onload = function() { 
        (this as HTMLLinkElement).media = 'all'; 
      };
    }
  });

  // Defer non-critical scripts
  const scripts = document.querySelectorAll('script:not([async]):not([defer])');
  scripts.forEach(script => {
    if (!script.src.includes('main') && !script.src.includes('App')) {
      script.setAttribute('defer', 'true');
    }
  });
}

// 2. Implement progressive hydration
export function useProgressiveHydration<T extends React.ComponentType<any>>(
  Component: T,
  fallback?: React.ReactNode
) {
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    // Hydrate after initial paint
    requestIdleCallback(() => {
      setIsHydrated(true);
    }, { timeout: 1000 });
  }, []);

  if (!isHydrated && fallback) {
    return fallback as React.ReactElement;
  }

  return Component as T;
}

// 3. Optimize React rendering
export function optimizeReactRendering() {
  // Enable concurrent features
  if ('startTransition' in React) {
    // Wrap non-urgent updates
    const originalSetState = React.Component.prototype.setState;
    React.Component.prototype.setState = function(...args: any[]) {
      const [state, callback] = args;
      if (this.constructor.name !== 'App' && this.constructor.name !== 'Router') {
        React.startTransition(() => {
          originalSetState.call(this, state, callback);
        });
      } else {
        originalSetState.call(this, state, callback);
      }
    };
  }
}

// 4. Implement resource hints
export function addResourceHints() {
  const hints = [
    { rel: 'dns-prefetch', href: '//18b562b7-65d8-4db8-8480-61e8ab9b1db1-00-145w1q6sp1kov.kirk.replit.dev' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' }
  ];

  hints.forEach(hint => {
    const link = document.createElement('link');
    link.rel = hint.rel;
    link.href = hint.href;
    if (hint.crossOrigin) {
      link.crossOrigin = hint.crossOrigin;
    }
    document.head.appendChild(link);
  });
}

// 5. Optimize first contentful paint
export function optimizeFirstPaint() {
  // Inline critical CSS
  const criticalCSS = `
    body { margin: 0; font-family: -apple-system, system-ui, sans-serif; }
    .loading-spinner { display: flex; justify-content: center; align-items: center; height: 100vh; }
    .app-container { min-height: 100vh; background: #f5f5f5; }
    .dashboard-layout { display: flex; }
    .sidebar { width: 240px; background: white; }
    .main-content { flex: 1; padding: 20px; }
  `;

  const style = document.createElement('style');
  style.textContent = criticalCSS;
  style.id = 'critical-css-inline';
  document.head.insertBefore(style, document.head.firstChild);
}

// 6. Implement smart prefetching
export function setupSmartPrefetch() {
  // Prefetch on hover
  document.addEventListener('mouseover', (e) => {
    const link = (e.target as Element).closest('a');
    if (link && link.href && !link.dataset.prefetched) {
      const url = new URL(link.href);
      if (url.origin === window.location.origin) {
        const prefetchLink = document.createElement('link');
        prefetchLink.rel = 'prefetch';
        prefetchLink.href = url.pathname;
        document.head.appendChild(prefetchLink);
        link.dataset.prefetched = 'true';
      }
    }
  });
}

// 7. Initialize all critical path optimizations
export function initializeCriticalPathOptimizations() {
  console.log('🎯 Life CEO Critical Path Optimization - Target: <3s');

  // Run optimizations in order of importance
  optimizeFirstPaint();
  addResourceHints();
  optimizeCriticalRenderPath();
  optimizeReactRendering();
  setupSmartPrefetch();

  // Measure impact
  const measurePerformance = () => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const renderTime = perfData.loadEventEnd - perfData.fetchStart;
    console.log(`⚡ Render time after optimizations: ${renderTime.toFixed(0)}ms`);
    
    if (renderTime < 3000) {
      console.log('🎉 SUCCESS! Achieved <3s render time!');
    }
  };

  if (document.readyState === 'complete') {
    measurePerformance();
  } else {
    window.addEventListener('load', measurePerformance);
  }
}