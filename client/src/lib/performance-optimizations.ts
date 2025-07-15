// Performance Optimizations Implementation - January 15, 2025
// Using 23L Framework for comprehensive performance improvements

import { queryClient } from '@/lib/queryClient';
import { RequestBatcher } from './performance';

// ==============================
// Layer 1-4: Foundation & UX
// ==============================

// 1. Fix unhandled promise rejections globally
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // Prevent the default behavior
    event.preventDefault();
  });
}

// 2. Optimize React Query default settings
queryClient.setDefaultOptions({
  queries: {
    // Cache data for 5 minutes by default
    staleTime: 5 * 60 * 1000,
    // Keep cache for 10 minutes
    gcTime: 10 * 60 * 1000,
    // Retry failed requests only once
    retry: 1,
    // Don't refetch on window focus by default
    refetchOnWindowFocus: false,
    // Don't refetch on reconnect
    refetchOnReconnect: 'always',
  },
  mutations: {
    // Retry mutations once on failure
    retry: 1,
  },
});

// ==============================
// Layer 5-8: Architecture & API
// ==============================

// 3. API Request Batching for multiple endpoints
export const apiBatcher = {
  // Batch user-related requests
  userBatcher: new RequestBatcher<string, any>(
    async (userIds: string[]) => {
      const response = await fetch('/api/users/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds }),
        credentials: 'include',
      });
      return response.json();
    },
    50 // 50ms delay for batching
  ),

  // Batch notification requests
  notificationBatcher: new RequestBatcher<string, any>(
    async (types: string[]) => {
      const response = await fetch('/api/notifications/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ types }),
        credentials: 'include',
      });
      return response.json();
    },
    100 // 100ms delay for notifications
  ),
};

// 4. Preload critical data on app initialization
export async function preloadCriticalData() {
  // Preload user data
  queryClient.prefetchQuery({
    queryKey: ['/api/auth/user'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Preload frequently accessed data
  const criticalEndpoints = [
    '/api/tenants/user',
    '/api/notifications/count',
    '/api/friends/requests/count',
  ];

  await Promise.all(
    criticalEndpoints.map(endpoint =>
      queryClient.prefetchQuery({
        queryKey: [endpoint],
        staleTime: 5 * 60 * 1000,
      })
    )
  );
}

// ==============================
// Layer 9-12: Operational
// ==============================

// 5. Image loading optimization
export function optimizeImageLoading() {
  if ('loading' in HTMLImageElement.prototype) {
    // Native lazy loading support
    const images = document.querySelectorAll('img[data-lazy]');
    images.forEach(img => {
      img.setAttribute('loading', 'lazy');
    });
  } else {
    // Fallback to Intersection Observer
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-lazy]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

// 6. WebSocket connection optimization
export class OptimizedWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageQueue: any[] = [];
  
  constructor(private url: string) {
    this.connect();
  }

  private connect() {
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        // Send queued messages
        while (this.messageQueue.length > 0) {
          const message = this.messageQueue.shift();
          this.send(message);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000); // Max 30s
        this.connect();
      }, this.reconnectDelay);
    }
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      // Queue message for when connection is restored
      this.messageQueue.push(data);
    }
  }

  close() {
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
    this.ws?.close();
  }
}

// ==============================
// Layer 13-16: AI & Intelligence
// ==============================

// 7. Intelligent prefetching based on user behavior
export class SmartPrefetcher {
  private routePatterns: Map<string, string[]> = new Map();
  
  constructor() {
    // Track navigation patterns
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', this.trackNavigation.bind(this));
    }
  }

  private trackNavigation() {
    const currentPath = window.location.pathname;
    const previousPath = document.referrer ? new URL(document.referrer).pathname : null;
    
    if (previousPath) {
      const patterns = this.routePatterns.get(previousPath) || [];
      patterns.push(currentPath);
      this.routePatterns.set(previousPath, patterns);
      
      // Prefetch likely next routes
      this.prefetchLikelyRoutes(currentPath);
    }
  }

  private prefetchLikelyRoutes(currentPath: string) {
    const likelyNext = this.routePatterns.get(currentPath) || [];
    const topRoutes = this.getMostFrequent(likelyNext, 3);
    
    topRoutes.forEach(route => {
      // Prefetch data for likely next routes
      const routeQueries = this.getQueriesForRoute(route);
      routeQueries.forEach(queryKey => {
        queryClient.prefetchQuery({
          queryKey: [queryKey],
          staleTime: 5 * 60 * 1000,
        });
      });
    });
  }

  private getMostFrequent(arr: string[], n: number): string[] {
    const frequency: Record<string, number> = {};
    arr.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, n)
      .map(([route]) => route);
  }

  private getQueriesForRoute(route: string): string[] {
    // Map routes to their likely API calls
    const routeQueryMap: Record<string, string[]> = {
      '/enhanced-timeline': ['/api/posts/feed', '/api/memories'],
      '/groups': ['/api/groups'],
      '/events': ['/api/events/feed'],
      '/friends': ['/api/friends'],
      '/profile': ['/api/users/profile'],
    };
    
    return routeQueryMap[route] || [];
  }
}

// ==============================
// Layer 17-20: Human-Centric
// ==============================

// 8. Perceived performance improvements
export function improvePerceivedPerformance() {
  // Add skeleton screens for loading states
  document.addEventListener('DOMContentLoaded', () => {
    // Show skeleton screens immediately
    const loadingContainers = document.querySelectorAll('[data-skeleton]');
    loadingContainers.forEach(container => {
      container.classList.add('skeleton-loading');
    });
  });

  // Progressive image loading
  const images = document.querySelectorAll('img[data-src]');
  images.forEach(img => {
    const imgElement = img as HTMLImageElement;
    // Load low-quality placeholder first
    if (imgElement.dataset.placeholder) {
      imgElement.src = imgElement.dataset.placeholder;
    }
    // Then load full image
    const fullImage = new Image();
    fullImage.onload = () => {
      imgElement.src = fullImage.src;
      imgElement.classList.add('loaded');
    };
    fullImage.src = imgElement.dataset.src || '';
  });
}

// ==============================
// Layer 21-23: Production Engineering
// ==============================

// 9. Performance monitoring
export class PerformanceMonitor {
  private metrics: Record<string, number[]> = {};
  
  constructor() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Monitor Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('lcp', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Monitor First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          this.recordMetric('fid', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Monitor Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsScore = 0;
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        });
        this.recordMetric('cls', clsScore);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  private recordMetric(name: string, value: number) {
    if (!this.metrics[name]) {
      this.metrics[name] = [];
    }
    this.metrics[name].push(value);
    
    // Send to analytics after collecting enough data
    if (this.metrics[name].length >= 10) {
      this.sendMetrics(name, this.metrics[name]);
      this.metrics[name] = [];
    }
  }

  private sendMetrics(name: string, values: number[]) {
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).plausible) {
      (window as any).plausible('Performance', {
        props: { metric: name, avg: average, max, min }
      });
    }
  }

  getMetrics() {
    return this.metrics;
  }
}

// 10. Initialize all optimizations
export function initializePerformanceOptimizations() {
  // Start performance monitoring
  const perfMonitor = new PerformanceMonitor();
  
  // Initialize smart prefetcher
  const prefetcher = new SmartPrefetcher();
  
  // Optimize images
  optimizeImageLoading();
  
  // Improve perceived performance
  improvePerceivedPerformance();
  
  // Preload critical data
  preloadCriticalData().catch(console.error);
  
  // Log performance metrics periodically
  if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
      console.log('Performance Metrics:', perfMonitor.getMetrics());
    }, 30000); // Every 30 seconds in dev
  }
  
  return {
    perfMonitor,
    prefetcher,
    apiBatcher,
  };
}

// Export singleton instance
export const performanceOptimizations = typeof window !== 'undefined' 
  ? initializePerformanceOptimizations() 
  : null;