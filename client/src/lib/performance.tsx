// Performance optimization utilities for Mundo Tango
import React, { useCallback, useRef, useEffect, useMemo } from 'react';

// Debounce hook for search and input operations
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttle hook for scroll and resize events
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = React.useState(value);
  const lastExecuted = useRef(Date.now());

  useEffect(() => {
    if (Date.now() >= lastExecuted.current + interval) {
      lastExecuted.current = Date.now();
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, interval);

      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}

// Lazy load component wrapper
export function LazyLoad({ children, height = 200 }: { children: React.ReactNode; height?: number }) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ minHeight: `${height}px` }}>
      {isVisible ? children : <div className="animate-pulse bg-gray-200 rounded-lg" style={{ height: `${height}px` }} />}
    </div>
  );
}

// Virtual scroll hook for large lists
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 5
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
    handleScroll: (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }
  };
}

// Performance monitoring HOC
export function withPerformance<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return React.memo((props: P) => {
    const renderCount = useRef(0);
    const renderStart = useRef(performance.now());

    useEffect(() => {
      renderCount.current++;
      const renderTime = performance.now() - renderStart.current;
      
      if (renderTime > 16) { // More than one frame (60fps)
        console.warn(`${componentName} slow render: ${renderTime.toFixed(2)}ms`);
      }
      
      renderStart.current = performance.now();
    });

    return <Component {...props} />;
  }, (prevProps, nextProps) => {
    // Custom comparison for deep equality check
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
  });
}

// Request batching utility
export class RequestBatcher<T> {
  private queue: Array<{ key: string; resolve: (value: T) => void }> = [];
  private timeout: NodeJS.Timeout | null = null;
  private batchProcessor: (keys: string[]) => Promise<Record<string, T>>;
  private delay: number;

  constructor(batchProcessor: (keys: string[]) => Promise<Record<string, T>>, delay = 10) {
    this.batchProcessor = batchProcessor;
    this.delay = delay;
  }

  request(key: string): Promise<T> {
    return new Promise((resolve) => {
      this.queue.push({ key, resolve });
      
      if (!this.timeout) {
        this.timeout = setTimeout(() => this.processBatch(), this.delay);
      }
    });
  }

  private async processBatch() {
    const batch = [...this.queue];
    this.queue = [];
    this.timeout = null;

    if (batch.length === 0) return;

    try {
      const keys = batch.map(item => item.key);
      const results = await this.batchProcessor(keys);
      
      batch.forEach(({ key, resolve }) => {
        resolve(results[key]);
      });
    } catch (error) {
      console.error('Batch processing error:', error);
      batch.forEach(({ resolve }) => {
        resolve(null as any);
      });
    }
  }
}