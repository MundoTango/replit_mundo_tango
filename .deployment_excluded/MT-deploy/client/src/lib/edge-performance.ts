// Edge performance optimizations for <3s target
// 40x20s Layers 37-40: Final push

// 1. Implement Intersection Observer for lazy loading
export function setupIntersectionObserver() {
  const options = {
    root: null,
    rootMargin: '50px',
    threshold: 0.01
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const lazyElement = entry.target as HTMLElement;
        
        // Load images
        if (lazyElement.tagName === 'IMG') {
          const img = lazyElement as HTMLImageElement;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
        
        // Load components
        if (lazyElement.dataset.component) {
          lazyElement.classList.add('loaded');
          observer.unobserve(lazyElement);
        }
      }
    });
  }, options);

  // Observe all lazy elements
  document.querySelectorAll('[data-src], [data-component]').forEach(el => {
    observer.observe(el);
  });

  return observer;
}

// 2. Implement request coalescing
class RequestCoalescer {
  private pendingRequests = new Map<string, Promise<Response>>();
  private requestQueue: Array<() => void> = [];
  private processing = false;

  async coalesce(url: string, options?: RequestInit): Promise<Response> {
    const key = `${url}:${JSON.stringify(options)}`;
    
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    const promise = new Promise<Response>((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const response = await fetch(url, options);
          resolve(response.clone());
        } catch (error) {
          reject(error);
        }
      });
    });

    this.pendingRequests.set(key, promise);
    promise.finally(() => this.pendingRequests.delete(key));

    this.processQueue();
    return promise;
  }

  private async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.requestQueue.length > 0) {
      const batch = this.requestQueue.splice(0, 6); // Process 6 requests at a time
      await Promise.all(batch.map(fn => fn()));
      await new Promise(resolve => setTimeout(resolve, 16)); // Small delay between batches
    }

    this.processing = false;
  }
}

export const requestCoalescer = new RequestCoalescer();

// 3. Implement critical CSS extraction
export function extractCriticalCSS() {
  const criticalSelectors = [
    'body', 'html', '.app-container', '.dashboard-layout',
    '.sidebar', '.main-content', '.timeline', '.post-card',
    '.loading-spinner', '.error-message'
  ];

  const styleSheets = Array.from(document.styleSheets);
  const criticalRules: string[] = [];

  styleSheets.forEach(sheet => {
    try {
      const rules = Array.from(sheet.cssRules || []);
      rules.forEach(rule => {
        if (rule instanceof CSSStyleRule) {
          if (criticalSelectors.some(selector => rule.selectorText.includes(selector))) {
            criticalRules.push(rule.cssText);
          }
        }
      });
    } catch (e) {
      // Skip cross-origin stylesheets
    }
  });

  return criticalRules.join('\n');
}

// 4. Implement frame budget management
export class FrameBudgetManager {
  private tasks: Array<() => void> = [];
  private rafId: number | null = null;
  private deadline = 16; // 16ms for 60fps

  schedule(task: () => void) {
    this.tasks.push(task);
    this.startProcessing();
  }

  private startProcessing() {
    if (this.rafId !== null) return;
    
    this.rafId = requestAnimationFrame((timestamp) => {
      const deadline = timestamp + this.deadline;
      
      while (this.tasks.length > 0 && performance.now() < deadline) {
        const task = this.tasks.shift();
        if (task) task();
      }
      
      this.rafId = null;
      if (this.tasks.length > 0) {
        this.startProcessing();
      }
    });
  }
}

export const frameBudget = new FrameBudgetManager();

// 5. Initialize edge performance optimizations
export function initializeEdgePerformance() {
  console.log('⚡ Life CEO Edge Performance - Final push to <3s');
  
  // Setup lazy loading
  const observer = setupIntersectionObserver();
  
  // Defer non-critical JavaScript
  const scripts = document.querySelectorAll('script[data-defer]');
  scripts.forEach(script => {
    setTimeout(() => {
      const newScript = document.createElement('script');
      newScript.src = (script as HTMLScriptElement).src;
      document.body.appendChild(newScript);
    }, 2000);
  });
  
  // Extract and inline critical CSS
  requestIdleCallback(() => {
    const criticalCSS = extractCriticalCSS();
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    style.id = 'critical-css';
    document.head.insertBefore(style, document.head.firstChild);
  });
  
  // Preconnect to CDNs and APIs
  const preconnectUrls = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cdn.jsdelivr.net'
  ];
  
  preconnectUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
  
  console.log('✅ Edge performance optimizations applied');
  
  return { observer, requestCoalescer, frameBudget };
}