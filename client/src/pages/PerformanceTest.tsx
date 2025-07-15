import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { Activity, Zap, Globe, Database, Check, X, AlertTriangle } from 'lucide-react';
import { performanceOptimizations } from '@/lib/performance-optimizations';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'poor';
  threshold: { good: number; warning: number };
}

export default function PerformanceTest() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  // Get performance metrics from our monitor
  useEffect(() => {
    if (performanceOptimizations?.perfMonitor) {
      const updateMetrics = () => {
        const rawMetrics = performanceOptimizations.perfMonitor.getMetrics();
        
        const formattedMetrics: PerformanceMetric[] = [];
        
        // LCP (Largest Contentful Paint)
        if (rawMetrics.lcp?.length > 0) {
          const lcpValue = rawMetrics.lcp[rawMetrics.lcp.length - 1];
          formattedMetrics.push({
            name: 'Largest Contentful Paint (LCP)',
            value: lcpValue,
            unit: 'ms',
            status: lcpValue < 2500 ? 'good' : lcpValue < 4000 ? 'warning' : 'poor',
            threshold: { good: 2500, warning: 4000 }
          });
        }
        
        // CLS (Cumulative Layout Shift)
        if (rawMetrics.cls?.length > 0) {
          const clsValue = rawMetrics.cls[rawMetrics.cls.length - 1];
          formattedMetrics.push({
            name: 'Cumulative Layout Shift (CLS)',
            value: clsValue,
            unit: '',
            status: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'warning' : 'poor',
            threshold: { good: 0.1, warning: 0.25 }
          });
        }
        
        // FID (First Input Delay)
        if (rawMetrics.fid?.length > 0) {
          const fidValue = rawMetrics.fid[rawMetrics.fid.length - 1];
          formattedMetrics.push({
            name: 'First Input Delay (FID)',
            value: fidValue,
            unit: 'ms',
            status: fidValue < 100 ? 'good' : fidValue < 300 ? 'warning' : 'poor',
            threshold: { good: 100, warning: 300 }
          });
        }
        
        setMetrics(formattedMetrics);
      };
      
      updateMetrics();
      const interval = setInterval(updateMetrics, 1000);
      return () => clearInterval(interval);
    }
  }, []);

  // Test API performance
  const runPerformanceTests = async () => {
    setIsRunning(true);
    const results = [];
    
    // Test 1: Single API call
    const singleStart = performance.now();
    try {
      await fetch('/api/auth/user', { credentials: 'include' });
      const singleEnd = performance.now();
      results.push({
        test: 'Single API Call',
        time: singleEnd - singleStart,
        status: 'success'
      });
    } catch (error) {
      results.push({
        test: 'Single API Call',
        time: 0,
        status: 'error',
        error: error.message
      });
    }
    
    // Test 2: Parallel API calls
    const parallelStart = performance.now();
    try {
      await Promise.all([
        fetch('/api/posts/feed', { credentials: 'include' }),
        fetch('/api/events/sidebar', { credentials: 'include' }),
        fetch('/api/notifications/count', { credentials: 'include' })
      ]);
      const parallelEnd = performance.now();
      results.push({
        test: 'Parallel API Calls (3)',
        time: parallelEnd - parallelStart,
        status: 'success'
      });
    } catch (error) {
      results.push({
        test: 'Parallel API Calls (3)',
        time: 0,
        status: 'error',
        error: error.message
      });
    }
    
    // Test 3: Cache performance
    const cacheStart = performance.now();
    try {
      // First call (should cache)
      await fetch('/api/tenants/user', { credentials: 'include' });
      // Second call (should be cached)
      const cache2Start = performance.now();
      await fetch('/api/tenants/user', { credentials: 'include' });
      const cacheEnd = performance.now();
      results.push({
        test: 'Cache Performance',
        time: cacheEnd - cache2Start,
        status: 'success',
        note: 'Second call should be faster'
      });
    } catch (error) {
      results.push({
        test: 'Cache Performance',
        time: 0,
        status: 'error',
        error: error.message
      });
    }
    
    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'poor':
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'poor':
      case 'error':
        return 'text-red-500';
      default:
        return '';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Performance Testing Dashboard</h1>
      
      {/* Core Web Vitals */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Core Web Vitals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.length === 0 ? (
            <p className="text-muted-foreground">Collecting metrics...</p>
          ) : (
            <div className="space-y-4">
              {metrics.map((metric) => (
                <div key={metric.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{metric.name}</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(metric.status)}
                      <span className={`text-sm font-mono ${getStatusColor(metric.status)}`}>
                        {metric.value.toFixed(metric.unit === '' ? 4 : 0)}{metric.unit}
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={(metric.value / metric.threshold.warning) * 100} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Good: &lt;{metric.threshold.good}{metric.unit}</span>
                    <span>Warning: &lt;{metric.threshold.warning}{metric.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Performance Tests */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            API Performance Tests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runPerformanceTests} 
            disabled={isRunning}
            className="mb-4"
          >
            {isRunning ? 'Running Tests...' : 'Run Performance Tests'}
          </Button>
          
          {testResults.length > 0 && (
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.test}</span>
                  </div>
                  <div className="text-right">
                    {result.status === 'success' ? (
                      <>
                        <span className="font-mono">{result.time.toFixed(2)}ms</span>
                        {result.note && (
                          <p className="text-xs text-muted-foreground">{result.note}</p>
                        )}
                      </>
                    ) : (
                      <span className="text-red-500 text-sm">{result.error}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optimization Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Active Optimizations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Frontend Optimizations</h3>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-500" />
                  React Query caching (5min stale time)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-500" />
                  Image lazy loading
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-500" />
                  Smart prefetching
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-500" />
                  WebSocket optimization
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Backend Optimizations</h3>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-500" />
                  Request batching
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-500" />
                  Database indexes
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-500" />
                  Compression middleware
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-green-500" />
                  Error handling
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}