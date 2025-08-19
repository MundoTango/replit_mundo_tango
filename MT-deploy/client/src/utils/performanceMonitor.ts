// Layer 21: Production Resilience Engineering - Performance Monitoring

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PerformanceThresholds {
  warning: number;
  critical: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private thresholds: Map<string, PerformanceThresholds> = new Map();
  
  constructor() {
    // Set default thresholds
    this.thresholds.set('LCP', { warning: 2500, critical: 4000 });
    this.thresholds.set('FID', { warning: 100, critical: 300 });
    this.thresholds.set('CLS', { warning: 0.1, critical: 0.25 });
    this.thresholds.set('FCP', { warning: 1800, critical: 3000 });
    this.thresholds.set('TTFB', { warning: 800, critical: 1800 });
  }

  // Initialize Core Web Vitals monitoring
  initializeWebVitals() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('LCP', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', lcpObserver);
    } catch (e) {
      console.warn('LCP observer not supported');
    }

    // First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.recordMetric('FID', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', fidObserver);
    } catch (e) {
      console.warn('FID observer not supported');
    }

    // Cumulative Layout Shift
    let clsValue = 0;
    let clsEntries: any[] = [];
    try {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsEntries.push(entry);
            clsValue += (entry as any).value;
          }
        }
        this.recordMetric('CLS', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('cls', clsObserver);
    } catch (e) {
      console.warn('CLS observer not supported');
    }
  }

  // Record a performance metric
  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    };

    this.metrics.push(metric);
    this.checkThresholds(name, value);
    
    // Send to analytics if available
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('Performance Metric', {
        props: {
          metric: name,
          value: Math.round(value),
          ...metadata
        }
      });
    }
  }

  // Check if metric exceeds thresholds
  private checkThresholds(name: string, value: number) {
    const threshold = this.thresholds.get(name);
    if (!threshold) return;

    if (value > threshold.critical) {
      console.error(`🚨 Critical performance issue: ${name} = ${value}ms (threshold: ${threshold.critical}ms)`);
      this.handlePerformanceIssue(name, value, 'critical');
    } else if (value > threshold.warning) {
      console.warn(`⚠️ Performance warning: ${name} = ${value}ms (threshold: ${threshold.warning}ms)`);
      this.handlePerformanceIssue(name, value, 'warning');
    }
  }

  // Handle performance issues
  private handlePerformanceIssue(metric: string, value: number, severity: 'warning' | 'critical') {
    // Log to monitoring service
    const issue = {
      metric,
      value,
      severity,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Store for later transmission if offline
    const issues = JSON.parse(localStorage.getItem('performanceIssues') || '[]');
    issues.push(issue);
    
    // Keep only last 50 issues
    if (issues.length > 50) {
      issues.shift();
    }
    
    localStorage.setItem('performanceIssues', JSON.stringify(issues));
  }

  // Get current metrics
  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return this.metrics;
  }

  // Get metric summary
  getMetricSummary(name: string) {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return null;

    const values = metrics.map(m => m.value);
    return {
      name,
      count: metrics.length,
      average: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      latest: values[values.length - 1]
    };
  }

  // Clean up observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Initialize on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    performanceMonitor.initializeWebVitals();
    
    // Record navigation timing
    const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navTiming) {
      performanceMonitor.recordMetric('TTFB', navTiming.responseStart - navTiming.requestStart);
      performanceMonitor.recordMetric('DOMContentLoaded', navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart);
      performanceMonitor.recordMetric('LoadComplete', navTiming.loadEventEnd - navTiming.loadEventStart);
    }
  });
}

// Export utilities for component-level monitoring
export function measureComponentRender(componentName: string) {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    performanceMonitor.recordMetric('ComponentRender', duration, { component: componentName });
    
    if (duration > 16) { // More than one frame
      console.warn(`Slow render detected: ${componentName} took ${duration.toFixed(2)}ms`);
    }
  };
}

export function measureApiCall(endpoint: string) {
  const startTime = performance.now();
  
  return {
    complete: (status: number) => {
      const duration = performance.now() - startTime;
      performanceMonitor.recordMetric('APICall', duration, { 
        endpoint, 
        status,
        slow: duration > 1000 
      });
    },
    error: (error: any) => {
      const duration = performance.now() - startTime;
      performanceMonitor.recordMetric('APIError', duration, { 
        endpoint, 
        error: error.message 
      });
    }
  };
}