// Aggressive optimization techniques for final performance push
// 40x20s Framework - Phase 3: <3 second target

// 1. Preconnect to critical domains
export function setupResourceHints() {
  const hints = [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
    { rel: 'preconnect', href: 'https://maps.googleapis.com' },
  ];

  hints.forEach(hint => {
    const link = document.createElement('link');
    link.rel = hint.rel;
    link.href = hint.href;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

// 2. Intersection Observer for lazy loading images
export function setupLazyImages() {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });

  // Observe all images with data-src
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// 3. Defer non-critical CSS
export function deferNonCriticalCSS() {
  const nonCriticalStyles = document.querySelectorAll('link[data-critical="false"]');
  nonCriticalStyles.forEach(link => {
    const newLink = link.cloneNode() as HTMLLinkElement;
    newLink.media = 'print';
    newLink.onload = function() {
      newLink.media = 'all';
    };
    link.parentNode?.replaceChild(newLink, link);
  });
}

// 4. Optimize React reconciliation
export function optimizeReactUpdates() {
  // Batch multiple setState calls
  if (typeof window !== 'undefined' && (window as any).React) {
    const React = (window as any).React;
    
    // Enable concurrent features
    React.unstable_batchedUpdates = React.unstable_batchedUpdates || ((fn: Function) => fn());
  }
}

// 5. Remove unused CSS classes
export function removeUnusedCSS() {
  // This would typically be done at build time
  // But we can remove some known unused classes
  const stylesheets = Array.from(document.styleSheets);
  
  stylesheets.forEach(sheet => {
    try {
      const rules = Array.from(sheet.cssRules || []);
      rules.forEach((rule, index) => {
        if (rule instanceof CSSStyleRule) {
          // Remove animation classes if reduced motion is preferred
          if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            if (rule.selectorText?.includes('animate-')) {
              sheet.deleteRule(index);
            }
          }
        }
      });
    } catch (e) {
      // Cross-origin stylesheets will throw
    }
  });
}

// 6. Progressive image loading
export function setupProgressiveImages() {
  const images = document.querySelectorAll('img[data-progressive]');
  
  images.forEach(img => {
    const fullImage = new Image();
    const imgElement = img as HTMLImageElement;
    
    fullImage.onload = function() {
      imgElement.src = fullImage.src;
      imgElement.classList.add('loaded');
    };
    
    if (imgElement.dataset.src) {
      fullImage.src = imgElement.dataset.src;
    }
  });
}

// Initialize all optimizations
export function initializeAggressiveOptimizations() {
  if (typeof window === 'undefined') return;
  
  // Run immediately
  setupResourceHints();
  optimizeReactUpdates();
  
  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupLazyImages();
      deferNonCriticalCSS();
      setupProgressiveImages();
    });
  } else {
    setupLazyImages();
    deferNonCriticalCSS();
    setupProgressiveImages();
  }
  
  // Run after everything is loaded
  window.addEventListener('load', () => {
    removeUnusedCSS();
  });
}