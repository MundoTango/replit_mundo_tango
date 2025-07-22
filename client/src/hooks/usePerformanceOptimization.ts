import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

// Custom hook for optimizing heavy computations
export function useOptimizedComputation<T>(
  computation: () => T,
  dependencies: any[]
): T {
  return useMemo(() => computation(), dependencies);
}

// Custom hook for optimizing callbacks
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: any[]
): T {
  return useCallback(callback, dependencies);
}

// Custom hook for lazy loading with intersection observer
export function useLazyLoad(threshold = 0.1) {
  const { ref, inView } = useInView({
    threshold,
    triggerOnce: true
  });
  
  return { ref, isVisible: inView };
}

// Custom hook for request deduplication
export function useRequestDeduplication<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 5000 // 5 seconds default
) {
  const cache = useRef<Map<string, { data: T; timestamp: number }>>(new Map());
  
  const fetchData = useCallback(async () => {
    const cached = cache.current.get(key);
    const now = Date.now();
    
    if (cached && now - cached.timestamp < ttl) {
      return cached.data;
    }
    
    const data = await fetcher();
    cache.current.set(key, { data, timestamp: now });
    
    // Clean up old entries
    setTimeout(() => {
      cache.current.delete(key);
    }, ttl);
    
    return data;
  }, [key, fetcher, ttl]);
  
  return fetchData;
}

// Custom hook for batch API requests
export function useBatchRequests<T>(
  batchSize = 10,
  delay = 100
) {
  const queue = useRef<Array<{
    request: () => Promise<T>;
    resolve: (value: T) => void;
    reject: (error: any) => void;
  }>>([]);
  
  const timer = useRef<NodeJS.Timeout | null>(null);
  
  const processBatch = useCallback(async () => {
    const batch = queue.current.splice(0, batchSize);
    
    const results = await Promise.allSettled(
      batch.map(item => item.request())
    );
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        batch[index].resolve(result.value);
      } else {
        batch[index].reject(result.reason);
      }
    });
  }, [batchSize]);
  
  const addRequest = useCallback((request: () => Promise<T>) => {
    return new Promise<T>((resolve, reject) => {
      queue.current.push({ request, resolve, reject });
      
      if (timer.current) {
        clearTimeout(timer.current);
      }
      
      timer.current = setTimeout(() => {
        processBatch();
      }, delay);
    });
  }, [delay, processBatch]);
  
  return addRequest;
}

// Custom hook for image preloading
export function useImagePreloader(urls: string[]) {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    let isMounted = true;
    
    const preloadImages = async () => {
      const promises = urls.map(url => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });
      });
      
      try {
        await Promise.all(promises);
        if (isMounted) {
          setLoaded(true);
        }
      } catch (error) {
        console.error('Failed to preload images:', error);
      }
    };
    
    preloadImages();
    
    return () => {
      isMounted = false;
    };
  }, [urls]);
  
  return loaded;
}