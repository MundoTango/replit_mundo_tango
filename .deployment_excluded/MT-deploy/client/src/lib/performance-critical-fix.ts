// 40x20s Critical Performance Fix for Mundo Tango
// Target: Reduce render time from 11.3s to <3s

import React from 'react';
import { queryClient } from './queryClient';

// 1. Debounce utility to prevent excessive API calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 2. Throttle utility for scroll and resize events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 3. Virtual scrolling hook for long lists
export function useVirtualScroll(items: any[], itemHeight: number, containerHeight: number) {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }
  };
}

// 4. Lazy component loader with loading state
export function lazyWithPreload<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  const Component = React.lazy(factory);
  (Component as any).preload = factory;
  return Component;
}

// 5. Performance monitoring
export function measureComponentPerformance(componentName: string) {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (renderTime > 100) {
      console.warn(`⚠️ ${componentName} took ${renderTime.toFixed(2)}ms to render`);
    }
  };
}

// 6. Memory cleanup hook
export function useMemoryCleanup(deps: React.DependencyList = []) {
  React.useEffect(() => {
    return () => {
      // Cancel all pending requests
      queryClient.cancelQueries();
      
      // Clear any timers
      const highestTimeoutId = setTimeout(() => {}, 0);
      for (let i = 0; i < highestTimeoutId; i++) {
        clearTimeout(i);
      }
    };
  }, deps);
}

// 7. Optimized image loading
interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  className?: string;
}

export function OptimizedImage({ src, alt, className, ...props }: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);
  
  React.useEffect(() => {
    if (!src) return;
    
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setIsLoaded(true);
      if (imgRef.current) {
        imgRef.current.src = src;
      }
    };
    
    img.onerror = () => {
      setIsError(true);
    };
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);
  
  if (isError) {
    return React.createElement('div', {
      className: `${className} bg-gray-200 flex items-center justify-center`
    }, 'Failed to load');
  }
  
  return React.createElement('img', {
    ref: imgRef,
    alt: alt,
    className: `${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    ...props
  });
}

// 8. Batch API requests
class RequestBatcher {
  private queue: Map<string, Promise<any>> = new Map();
  private timeout: NodeJS.Timeout | null = null;
  
  async batch<T>(key: string, request: () => Promise<T>): Promise<T> {
    if (this.queue.has(key)) {
      return this.queue.get(key) as Promise<T>;
    }
    
    const promise = request();
    this.queue.set(key, promise);
    
    // Clear from queue after resolution
    promise.finally(() => {
      setTimeout(() => this.queue.delete(key), 100);
    });
    
    return promise;
  }
}

export const requestBatcher = new RequestBatcher();

// 9. Prevent unnecessary re-renders
export const memo = <P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
) => {
  return React.memo(Component, propsAreEqual);
};

// 10. Performance context for global optimizations
export const PerformanceContext = React.createContext({
  isSlowDevice: false,
  reduceAnimations: false,
  enableVirtualScrolling: true
});

export function usePerformanceMode() {
  return React.useContext(PerformanceContext);
}

// Auto-detect slow devices
export function detectSlowDevice(): boolean {
  // Check for low memory
  const memory = (navigator as any).deviceMemory;
  if (memory && memory < 4) return true;
  
  // Check for slow CPU (hardwareConcurrency)
  const cores = navigator.hardwareConcurrency;
  if (cores && cores < 4) return true;
  
  // Check connection speed
  const connection = (navigator as any).connection;
  if (connection && connection.effectiveType && connection.effectiveType < '4g') return true;
  
  return false;
}

// 11. Prefetch critical data for performance
export function prefetchCriticalData() {
  // Prefetch user data
  fetch('/api/auth/user', { credentials: 'include' })
    .then(res => res.json())
    .catch(() => {});
    
  // Prefetch initial feed data
  fetch('/api/posts/feed?limit=20', { credentials: 'include' })
    .then(res => res.json())
    .catch(() => {});
    
  // Prefetch events
  fetch('/api/events/sidebar', { credentials: 'include' })
    .then(res => res.json())
    .catch(() => {});
}

export default {
  debounce,
  throttle,
  useVirtualScroll,
  lazyWithPreload,
  measureComponentPerformance,
  useMemoryCleanup,
  OptimizedImage,
  requestBatcher,
  memo,
  detectSlowDevice
};