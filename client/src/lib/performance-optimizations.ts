// Performance optimization utilities for Mundo Tango

// Debounce utility for reducing API calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for rate limiting
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Lazy load images with intersection observer
export function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-lazy]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.lazy || '';
          img.removeAttribute('data-lazy');
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for older browsers
    images.forEach(img => {
      const imgElement = img as HTMLImageElement;
      imgElement.src = imgElement.dataset.lazy || '';
    });
  }
}

// Preload critical resources
export function preloadCriticalResources(resources: string[]) {
  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    
    // Determine resource type
    if (resource.endsWith('.css')) {
      link.as = 'style';
    } else if (resource.endsWith('.js')) {
      link.as = 'script';
    } else if (resource.match(/\.(jpg|jpeg|png|webp|gif)$/)) {
      link.as = 'image';
    } else if (resource.match(/\.(woff|woff2|ttf|otf)$/)) {
      link.as = 'font';
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
  });
}

// Request idle callback polyfill
export const requestIdleCallback = 
  window.requestIdleCallback ||
  function (cb: IdleRequestCallback) {
    const start = Date.now();
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
      } as IdleDeadline);
    }, 1);
  };

// Cancel idle callback polyfill
export const cancelIdleCallback = 
  window.cancelIdleCallback ||
  function (id: number) {
    clearTimeout(id);
  };

// Defer non-critical tasks
export function deferTask(task: () => void) {
  requestIdleCallback(task, { timeout: 2000 });
}

// Performance monitoring
export function measurePerformance(name: string, fn: () => void | Promise<void>) {
  const startTime = performance.now();
  const result = fn();
  
  if (result instanceof Promise) {
    return result.finally(() => {
      const endTime = performance.now();
      console.log(`[Performance] ${name} took ${(endTime - startTime).toFixed(2)}ms`);
    });
  } else {
    const endTime = performance.now();
    console.log(`[Performance] ${name} took ${(endTime - startTime).toFixed(2)}ms`);
    return result;
  }
}

// Cache API responses in memory
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function getCachedResponse(key: string): any | null {
  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  apiCache.delete(key);
  return null;
}

export function setCachedResponse(key: string, data: any) {
  apiCache.set(key, { data, timestamp: Date.now() });
  
  // Clean up old entries
  if (apiCache.size > 100) {
    const oldestKey = Array.from(apiCache.keys())[0];
    apiCache.delete(oldestKey);
  }
}

// Batch API requests
class RequestBatcher<T> {
  private queue: Array<{ key: string; resolve: (value: T) => void; reject: (error: any) => void }> = [];
  private timeout: NodeJS.Timeout | null = null;
  
  constructor(
    private batchProcessor: (keys: string[]) => Promise<Map<string, T>>,
    private delay: number = 10
  ) {}
  
  request(key: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ key, resolve, reject });
      
      if (this.timeout) clearTimeout(this.timeout);
      this.timeout = setTimeout(() => this.processBatch(), this.delay);
    });
  }
  
  private async processBatch() {
    const batch = [...this.queue];
    this.queue = [];
    
    try {
      const results = await this.batchProcessor(batch.map(item => item.key));
      batch.forEach(({ key, resolve, reject }) => {
        const result = results.get(key);
        if (result !== undefined) {
          resolve(result);
        } else {
          reject(new Error(`No result for key: ${key}`));
        }
      });
    } catch (error) {
      batch.forEach(({ reject }) => reject(error));
    }
  }
}

export { RequestBatcher };