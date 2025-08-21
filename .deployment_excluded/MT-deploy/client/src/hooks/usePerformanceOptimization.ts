import { useEffect, useCallback, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

// Life CEO Performance Optimization Hook
export function usePerformanceOptimization() {
  const observersRef = useRef<Map<string, IntersectionObserver>>(new Map());

  // Lazy load images with intersection observer
  const lazyLoadImage = useCallback((imgElement: HTMLImageElement) => {
    if (!imgElement.dataset.src) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px'
    });

    observer.observe(imgElement);
    observersRef.current.set(imgElement.dataset.src, observer);
  }, []);

  // Preload critical resources
  const preloadResource = useCallback((url: string, type: 'image' | 'script' | 'style') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    switch (type) {
      case 'image':
        link.as = 'image';
        break;
      case 'script':
        link.as = 'script';
        break;
      case 'style':
        link.as = 'style';
        break;
    }
    
    document.head.appendChild(link);
  }, []);

  // Defer non-critical scripts
  const deferScript = useCallback((src: string) => {
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  // Optimize animations based on device performance
  const optimizeAnimations = useCallback(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      document.body.classList.add('reduce-motion');
    }

    // Disable animations on low-end devices
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
      document.body.classList.add('low-performance-mode');
    }
  }, []);

  // Resource hints for faster DNS resolution
  const addResourceHints = useCallback(() => {
    const hints = [
      { rel: 'dns-prefetch', href: '//api.mundotango.life' },
      { rel: 'preconnect', href: '//api.mundotango.life' },
      { rel: 'dns-prefetch', href: '//images.pexels.com' },
      { rel: 'preconnect', href: '//images.pexels.com' },
    ];

    hints.forEach(hint => {
      const link = document.createElement('link');
      link.rel = hint.rel;
      link.href = hint.href;
      document.head.appendChild(link);
    });
  }, []);

  // Performance monitoring
  const measurePerformance = useCallback(() => {
    if ('performance' in window && 'measure' in window.performance) {
      // Measure page load time
      window.addEventListener('load', () => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        const connectTime = perfData.responseEnd - perfData.requestStart;
        const renderTime = perfData.domComplete - perfData.domLoading;

        console.log('Life CEO Performance Metrics:', {
          pageLoadTime: `${pageLoadTime}ms`,
          connectTime: `${connectTime}ms`,
          renderTime: `${renderTime}ms`,
          totalResources: window.performance.getEntriesByType('resource').length
        });

        // Send metrics to Life CEO Performance Service
        fetch('/api/performance/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pageLoadTime,
            connectTime,
            renderTime,
            url: window.location.pathname,
            timestamp: new Date().toISOString()
          })
        }).catch(() => {}); // Silent fail
      });
    }
  }, []);

  // Initialize optimizations
  useEffect(() => {
    optimizeAnimations();
    addResourceHints();
    measurePerformance();

    // Cleanup
    return () => {
      observersRef.current.forEach(observer => observer.disconnect());
      observersRef.current.clear();
    };
  }, [optimizeAnimations, addResourceHints, measurePerformance]);

  return {
    lazyLoadImage,
    preloadResource,
    deferScript
  };
}

// Hook for lazy loading components
export function useLazyComponent(threshold = 0.1) {
  const { ref, inView, entry } = useInView({
    threshold,
    triggerOnce: true
  });

  return { ref, shouldLoad: inView, entry };
}

// Hook for performance-optimized data fetching
export function useOptimizedFetch<T>(
  url: string,
  options?: RequestInit,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController>();

  const fetchData = useCallback(async () => {
    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...options,
        signal: abortControllerRef.current.signal,
        headers: {
          ...options?.headers,
          'X-Request-Priority': 'high' // Life CEO priority header
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [url, ...dependencies]);

  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Performance optimization utilities
export const performanceUtils = {
  // Debounce function for search and input handlers
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function for scroll and resize handlers
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Request idle callback wrapper
  requestIdleCallback: (callback: () => void) => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(callback);
    } else {
      setTimeout(callback, 1);
    }
  }
};