// Memory optimization utilities for deployment
export class MemoryOptimizer {
  private static instance: MemoryOptimizer;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private performanceObserver: PerformanceObserver | null = null;

  static getInstance(): MemoryOptimizer {
    if (!MemoryOptimizer.instance) {
      MemoryOptimizer.instance = new MemoryOptimizer();
    }
    return MemoryOptimizer.instance;
  }

  initialize() {
    // Start memory monitoring and cleanup
    this.startMemoryCleanup();
    this.monitorPerformance();
    
    // Optimize for build process
    if (import.meta.env.VITE_BUILD_OPTIMIZE) {
      this.optimizeForBuild();
    }
  }

  private startMemoryCleanup() {
    // Cleanup unused objects every 30 seconds
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 30000);
  }

  private performCleanup() {
    try {
      // Clear stale query cache entries
      if ((window as any).queryClient) {
        (window as any).queryClient.getQueryCache().clear();
      }

      // Clear console logs to reduce memory
      if (console.clear && import.meta.env.PROD) {
        console.clear();
      }

      // Force garbage collection if available
      if (window.gc && typeof window.gc === 'function') {
        window.gc();
      }

      console.log('🧹 Memory cleanup completed');
    } catch (error) {
      console.warn('Memory cleanup failed:', error);
    }
  }

  private monitorPerformance() {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          // Monitor long tasks that could cause memory issues
          if (entry.entryType === 'longtask' && entry.duration > 50) {
            console.warn(`⚠️ Long task detected: ${entry.duration}ms`);
          }
        });
      });

      try {
        this.performanceObserver.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        console.warn('Performance observer not supported');
      }
    }
  }

  private optimizeForBuild() {
    // Disable heavy features during build
    if (typeof window !== 'undefined') {
      // Disable analytics during build
      (window as any).__DISABLE_ANALYTICS__ = true;
      
      // Reduce animation complexity
      document.documentElement.style.setProperty('--animation-duration', '0ms');
      
      // Disable non-essential features
      (window as any).__BUILD_MODE__ = true;
    }
  }

  // Bundle size optimization
  static async loadComponentWhenNeeded<T>(
    loader: () => Promise<{ default: T }>
  ): Promise<T> {
    try {
      const module = await loader();
      return module.default;
    } catch (error) {
      console.error('Failed to load component:', error);
      throw error;
    }
  }

  // Cleanup when component unmounts or app closes
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
  }
}

// Global memory optimization
export const initializeMemoryOptimization = () => {
  const optimizer = MemoryOptimizer.getInstance();
  optimizer.initialize();

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    optimizer.destroy();
  });

  return optimizer;
};

// Utility for reducing bundle size
export const createOptimizedImport = (importPath: string) => {
  return () => import(/* webpackChunkName: "dynamic-chunk" */ importPath);
};