// Life CEO Advanced Performance Optimizations
import { queryClient } from './queryClient';

interface PerformanceConfig {
  enablePrefetch: boolean;
  enableLazyLoading: boolean;
  enableBundleOptimization: boolean;
  enableAdvancedCaching: boolean;
  cacheStrategy: 'aggressive' | 'balanced' | 'conservative';
}

class LifeCeoPerformanceOptimizer {
  // Add init method for compatibility
  public init() {
    // Already initialized in constructor
    return this;
  }
  private config: PerformanceConfig = {
    enablePrefetch: true,
    enableLazyLoading: true,
    enableBundleOptimization: true,
    enableAdvancedCaching: true,
    cacheStrategy: 'aggressive'
  };
  
  private observer: IntersectionObserver | null = null;
  private prefetchQueue = new Set<string>();
  private performanceMarks = new Map<string, number>();
  
  constructor() {
    this.initialize();
  }
  
  private initialize() {
    // Initialize intersection observer for lazy loading
    this.initializeLazyLoading();
    
    // Initialize route prefetching
    this.initializeRoutePrefetching();
    
    // Initialize performance monitoring
    this.initializePerformanceMonitoring();
    
    // Initialize advanced caching
    this.initializeAdvancedCaching();
    
    console.log('⚡ Life CEO Performance Optimizer initialized');
  }
  
  // Global lazy loading for all images
  private initializeLazyLoading() {
    if (!this.config.enableLazyLoading) return;
    
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            this.loadImage(img);
            this.observer?.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px 0px', // Start loading 50px before visible
        threshold: 0.01
      }
    );
    
    // Apply to existing images
    this.applyLazyLoadingToImages();
    
    // Watch for new images
    this.watchForNewImages();
  }
  
  private loadImage(img: HTMLImageElement) {
    const src = img.getAttribute('data-src');
    if (src) {
      // Create a new image to preload
      const tempImg = new Image();
      tempImg.onload = () => {
        img.src = src;
        img.classList.add('loaded');
        img.removeAttribute('data-src');
      };
      tempImg.src = src;
    }
  }
  
  private applyLazyLoadingToImages() {
    document.querySelectorAll('img[data-src]').forEach(img => {
      this.observer?.observe(img);
    });
  }
  
  private watchForNewImages() {
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) {
            // Check if it's an image
            if (node.tagName === 'IMG' && node.hasAttribute('data-src')) {
              this.observer?.observe(node);
            }
            // Check for images in children
            node.querySelectorAll('img[data-src]').forEach(img => {
              this.observer?.observe(img);
            });
          }
        });
      });
    });
    
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Intelligent route prefetching
  private initializeRoutePrefetching() {
    if (!this.config.enablePrefetch) return;
    
    // Listen for link hovers
    document.addEventListener('mouseover', (e) => {
      const link = (e.target as HTMLElement).closest('a');
      if (link && link.href && link.href.startsWith(window.location.origin)) {
        const path = new URL(link.href).pathname;
        this.prefetchRoute(path);
      }
    });
    
    // Prefetch common routes based on user patterns
    this.prefetchCommonRoutes();
  }
  
  private async prefetchRoute(path: string) {
    if (this.prefetchQueue.has(path)) return;
    this.prefetchQueue.add(path);
    
    // Prefetch data for the route
    const routeDataMap: Record<string, string[]> = {
      '/moments': ['/api/memories', '/api/posts/feed'],
      '/profile': ['/api/user', '/api/user/profile'],
      '/enhanced-timeline': ['/api/memories', '/api/posts/feed'],
      '/groups': ['/api/groups', '/api/user/groups']
    };
    
    const endpoints = routeDataMap[path];
    if (endpoints) {
      endpoints.forEach(endpoint => {
        queryClient.prefetchQuery({
          queryKey: [endpoint],
          staleTime: 5 * 60 * 1000 // 5 minutes
        });
      });
    }
  }
  
  private prefetchCommonRoutes() {
    // Prefetch top 3 most visited routes
    const commonRoutes = ['/moments', '/enhanced-timeline', '/profile'];
    setTimeout(() => {
      commonRoutes.forEach(route => this.prefetchRoute(route));
    }, 2000); // Wait 2 seconds after page load
  }
  
  // Performance monitoring
  private initializePerformanceMonitoring() {
    // Monitor page load performance
    if ('PerformanceObserver' in window) {
      try {
        // Navigation timing
        const navigationObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            const navEntry = entry as PerformanceNavigationTiming;
            this.reportPerformanceMetrics({
              pageLoadTime: navEntry.loadEventEnd - navEntry.fetchStart,
              connectTime: navEntry.connectEnd - navEntry.connectStart,
              renderTime: navEntry.domComplete - navEntry.domInteractive,
              url: navEntry.name,
              timestamp: Date.now()
            });
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        
        // Long tasks monitoring
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.duration > 50) {
              console.warn(`Long task detected: ${entry.duration}ms`);
            }
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.log('Performance monitoring setup skipped');
      }
    }
  }
  
  private async reportPerformanceMetrics(metrics: any) {
    try {
      await fetch('/api/performance/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics),
        credentials: 'include'
      });
    } catch (error) {
      console.error('Failed to report performance metrics:', error);
    }
  }
  
  // Advanced caching strategies
  private initializeAdvancedCaching() {
    if (!this.config.enableAdvancedCaching) return;
    
    // Set up service worker for advanced caching
    if ('serviceWorker' in navigator) {
      this.setupAdvancedServiceWorker();
    }
    
    // Configure query client for aggressive caching
    if (this.config.cacheStrategy === 'aggressive') {
      queryClient.setDefaultOptions({
        queries: {
          staleTime: 10 * 60 * 1000, // 10 minutes
          gcTime: 30 * 60 * 1000, // 30 minutes
          refetchOnWindowFocus: false,
          refetchOnReconnect: false
        }
      });
    }
  }
  
  private async setupAdvancedServiceWorker() {
    // Service worker is already set up, but we can send it configuration
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_CONFIG',
        config: {
          strategy: this.config.cacheStrategy,
          routes: {
            '/api/posts/feed': { ttl: 300000 }, // 5 minutes
            '/api/memories': { ttl: 300000 },
            '/api/user': { ttl: 600000 }, // 10 minutes
            '/api/groups': { ttl: 900000 } // 15 minutes
          }
        }
      });
    }
  }
  
  // Bundle optimization monitoring
  public async analyzeBundleSize() {
    if (!this.config.enableBundleOptimization) return;
    
    // Get all loaded scripts
    const scripts = Array.from(document.scripts);
    const bundleInfo = await Promise.all(
      scripts
        .filter(script => script.src)
        .map(async script => {
          try {
            const response = await fetch(script.src);
            const size = response.headers.get('content-length');
            return {
              url: script.src,
              size: size ? parseInt(size) : 0
            };
          } catch {
            return null;
          }
        })
    );
    
    const totalSize = bundleInfo
      .filter(Boolean)
      .reduce((total, info) => total + (info?.size || 0), 0);
    
    console.log(`📦 Total bundle size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    
    // Provide optimization suggestions
    if (totalSize > 5 * 1024 * 1024) {
      console.warn('Bundle size exceeds 5MB. Consider:');
      console.warn('- Code splitting for large components');
      console.warn('- Lazy loading routes');
      console.warn('- Tree shaking unused imports');
      console.warn('- Optimizing images and assets');
    }
  }
  
  // Performance marks for measuring operations
  public mark(name: string) {
    this.performanceMarks.set(name, performance.now());
  }
  
  public measure(name: string): number | null {
    const start = this.performanceMarks.get(name);
    if (!start) return null;
    
    const duration = performance.now() - start;
    this.performanceMarks.delete(name);
    return duration;
  }
  
  // Get performance report
  public async getPerformanceReport() {
    const response = await fetch('/api/performance/report', {
      credentials: 'include'
    });
    return response.json();
  }
}

// Export singleton instance
export const lifeCeoPerformance = new LifeCeoPerformanceOptimizer();