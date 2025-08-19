// ESA 44x21 Performance Optimization Module
// Comprehensive performance enhancements for Mundo Tango

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private cacheStore = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  
  static getInstance(): PerformanceOptimizer {
    if (!this.instance) {
      this.instance = new PerformanceOptimizer();
    }
    return this.instance;
  }

  constructor() {
    this.initializeOptimizations();
  }

  private initializeOptimizations() {
    // 1. Enable aggressive caching
    this.enableAggressiveCaching();
    
    // 2. Optimize images with lazy loading
    this.enableImageLazyLoading();
    
    // 3. Prefetch critical resources
    this.prefetchCriticalResources();
    
    // 4. Enable request deduplication
    this.enableRequestDeduplication();
    
    // 5. Optimize memory usage
    this.optimizeMemoryUsage();
  }

  private enableAggressiveCaching() {
    // Cache API responses
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      
      // Skip caching for POST/PUT/DELETE
      if (init?.method && ['POST', 'PUT', 'DELETE'].includes(init.method)) {
        return originalFetch(input, init);
      }
      
      // Check cache first
      const cached = this.getFromCache(url);
      if (cached) {
        return new Response(JSON.stringify(cached), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Fetch and cache
      const response = await originalFetch(input, init);
      if (response.ok && url.includes('/api/')) {
        const clone = response.clone();
        const data = await clone.json();
        this.setCache(url, data);
      }
      
      return response;
    };
  }

  private enableImageLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      // Observe all images with data-src
      document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('img[data-src]').forEach(img => {
          imageObserver.observe(img);
        });
      });
    }
  }

  private prefetchCriticalResources() {
    // Prefetch critical API endpoints
    const criticalEndpoints = [
      '/api/auth/user',
      '/api/posts/feed',
      '/api/notifications/count',
      '/api/events/feed'
    ];
    
    criticalEndpoints.forEach(endpoint => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = endpoint;
      document.head.appendChild(link);
    });
  }

  private enableRequestDeduplication() {
    const pendingRequests = new Map<string, Promise<any>>();
    
    const originalQueryFn = (window as any).__queryClient?.defaultOptions?.queries?.queryFn;
    if (originalQueryFn) {
      (window as any).__queryClient.defaultOptions.queries.queryFn = async ({ queryKey }: any) => {
        const key = JSON.stringify(queryKey);
        
        // Return pending request if exists
        if (pendingRequests.has(key)) {
          return pendingRequests.get(key);
        }
        
        // Create new request
        const promise = originalQueryFn({ queryKey });
        pendingRequests.set(key, promise);
        
        try {
          const result = await promise;
          return result;
        } finally {
          pendingRequests.delete(key);
        }
      };
    }
  }

  private optimizeMemoryUsage() {
    // Garbage collection helper
    setInterval(() => {
      // Clear old cache entries
      const now = Date.now();
      for (const [key, value] of this.cacheStore.entries()) {
        if (now - value.timestamp > this.CACHE_TTL) {
          this.cacheStore.delete(key);
        }
      }
      
      // Force garbage collection if available
      if ((window as any).gc) {
        (window as any).gc();
      }
    }, 60000); // Every minute
  }

  getFromCache(key: string): any {
    const cached = this.cacheStore.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  setCache(key: string, data: any) {
    this.cacheStore.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Resource hints for better performance
  static addResourceHints() {
    const hints = [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
      { rel: 'dns-prefetch', href: 'https://api.pexels.com' },
      { rel: 'dns-prefetch', href: 'https://nominatim.openstreetmap.org' }
    ];
    
    hints.forEach(hint => {
      const link = document.createElement('link');
      Object.entries(hint).forEach(([key, value]) => {
        if (key === 'crossorigin' && value === true) {
          link.setAttribute('crossorigin', '');
        } else {
          link.setAttribute(key, value as string);
        }
      });
      document.head.appendChild(link);
    });
  }
}

// Initialize performance optimizations
export const performanceOptimizer = PerformanceOptimizer.getInstance();

// Add resource hints on load
if (typeof window !== 'undefined') {
  PerformanceOptimizer.addResourceHints();
}