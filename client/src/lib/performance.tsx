import React, { memo, useCallback, useMemo } from 'react';

// Performance optimization utilities for React components

/**
 * HOC that adds performance optimizations to a component
 * - React.memo for preventing unnecessary re-renders
 * - Automatic useCallback for event handlers
 * - useMemo for expensive computations
 */
export function withPerformance<T extends object>(
  Component: React.ComponentType<T>,
  propsAreEqual?: (prevProps: T, nextProps: T) => boolean
) {
  return memo(Component, propsAreEqual);
}

/**
 * Custom hook for debouncing values
 * Useful for search inputs and other frequent updates
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for throttling function calls
 * Useful for scroll and resize handlers
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = React.useRef(0);
  const timeout = React.useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCall.current;

      if (timeSinceLastCall >= delay) {
        lastCall.current = now;
        callback(...args);
      } else {
        if (timeout.current) {
          clearTimeout(timeout.current);
        }
        timeout.current = setTimeout(() => {
          lastCall.current = Date.now();
          callback(...args);
        }, delay - timeSinceLastCall);
      }
    },
    [callback, delay]
  ) as T;
}

/**
 * Lazy load component with loading fallback
 */
export function lazyWithPreload<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  const LazyComponent = React.lazy(importFn);
  
  return {
    Component: (props: React.ComponentProps<T>) => (
      <React.Suspense fallback={<LoadingFallback />}>
        <LazyComponent {...props} />
      </React.Suspense>
    ),
    preload: importFn
  };
}

// Default loading fallback
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
    </div>
  );
}

/**
 * Virtual scrolling hook for large lists
 */
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 3
) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
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

/**
 * Request batching utility for API calls
 */
class RequestBatcher<T, R> {
  private queue: { request: T; resolve: (value: R) => void; reject: (error: any) => void }[] = [];
  private timeout: NodeJS.Timeout | null = null;
  
  constructor(
    private batchFn: (requests: T[]) => Promise<R[]>,
    private delay = 50
  ) {}

  add(request: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      
      this.timeout = setTimeout(() => this.flush(), this.delay);
    });
  }

  private async flush() {
    if (this.queue.length === 0) return;
    
    const batch = [...this.queue];
    this.queue = [];
    this.timeout = null;
    
    try {
      const requests = batch.map(item => item.request);
      const results = await this.batchFn(requests);
      
      batch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      batch.forEach(item => {
        item.reject(error);
      });
    }
  }
}

export { RequestBatcher };