import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Activity, 
  Zap, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Server,
  Database,
  Wifi,
  HardDrive,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface PerformanceMetrics {
  cls: number[];
  lcp: number[];
  fid: number[];
}

interface ApiPerformance {
  singleCall: number;
  parallelCalls: number;
  cachePerformance: number;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cls: [],
    lcp: [],
    fid: []
  });
  const [apiPerformance, setApiPerformance] = useState<ApiPerformance>({
    singleCall: 0,
    parallelCalls: 0,
    cachePerformance: 0
  });
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Collect Core Web Vitals
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      // CLS Observer
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            setMetrics(prev => ({
              ...prev,
              cls: [...prev.cls, (entry as any).value]
            }));
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // LCP Observer
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        setMetrics(prev => ({
          ...prev,
          lcp: [...prev.lcp, lastEntry.startTime]
        }));
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // FID (using first-input)
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'first-input') {
            setMetrics(prev => ({
              ...prev,
              fid: [...prev.fid, (entry as any).processingStart - entry.startTime]
            }));
          }
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      return () => {
        clsObserver.disconnect();
        lcpObserver.disconnect();
        fidObserver.disconnect();
      };
    }
  }, []);

  // Run API performance tests
  const runPerformanceTests = async () => {
    setIsRunningTests(true);
    
    try {
      // Single API call test
      const singleStart = performance.now();
      await fetch('/api/posts/feed');
      const singleEnd = performance.now();
      
      // Parallel API calls test
      const parallelStart = performance.now();
      await Promise.all([
        fetch('/api/posts/feed'),
        fetch('/api/notifications/count'),
        fetch('/api/events/sidebar')
      ]);
      const parallelEnd = performance.now();
      
      // Cache performance test
      const cacheStart = performance.now();
      await fetch('/api/posts/feed'); // Should be cached
      const cacheEnd = performance.now();
      
      setApiPerformance({
        singleCall: singleEnd - singleStart,
        parallelCalls: parallelEnd - parallelStart,
        cachePerformance: cacheEnd - cacheStart
      });
    } catch (error) {
      console.error('Performance test error:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  // Calculate averages
  const avgCLS = metrics.cls.length > 0 
    ? metrics.cls.reduce((a, b) => a + b, 0) / metrics.cls.length 
    : 0;
  const avgLCP = metrics.lcp.length > 0 
    ? metrics.lcp[metrics.lcp.length - 1] 
    : 0;
  const avgFID = metrics.fid.length > 0 
    ? metrics.fid.reduce((a, b) => a + b, 0) / metrics.fid.length 
    : 0;

  // Get performance ratings
  const getCLSRating = (cls: number) => {
    if (cls <= 0.1) return { status: 'Good', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (cls <= 0.25) return { status: 'Needs Improvement', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { status: 'Poor', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const getLCPRating = (lcp: number) => {
    if (lcp <= 2500) return { status: 'Good', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (lcp <= 4000) return { status: 'Needs Improvement', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { status: 'Poor', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const getFIDRating = (fid: number) => {
    if (fid <= 100) return { status: 'Good', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (fid <= 300) return { status: 'Needs Improvement', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { status: 'Poor', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const clsRating = getCLSRating(avgCLS);
  const lcpRating = getLCPRating(avgLCP);
  const fidRating = getFIDRating(avgFID);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Activity className="w-7 h-7 text-turquoise-600" />
            Performance Monitor
          </h2>
          <p className="text-gray-600 mt-1">Real-time performance metrics and optimization tracking</p>
        </div>
        <Button 
          onClick={runPerformanceTests}
          disabled={isRunningTests}
          className="bg-gradient-to-r from-turquoise-600 to-blue-600 text-white hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
        >
          {isRunningTests ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Run Performance Tests
            </>
          )}
        </Button>
      </div>

      {/* Core Web Vitals */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-turquoise-600" />
          Core Web Vitals
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LCP Card */}
          <Card className="border-turquoise-200 hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-gray-700">
                Largest Contentful Paint (LCP)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {avgLCP > 0 ? `${(avgLCP / 1000).toFixed(2)}s` : '--'}
              </div>
              <Badge className={`${lcpRating.bgColor} ${lcpRating.color} border-0`}>
                {avgLCP > 0 ? lcpRating.status : 'Measuring...'}
              </Badge>
              <div className="text-xs text-gray-500 mt-2">
                Target: &lt; 2.5s
              </div>
              <Progress 
                value={Math.min((2500 / avgLCP) * 100, 100)} 
                className="mt-3 h-2"
              />
            </CardContent>
          </Card>

          {/* CLS Card */}
          <Card className="border-turquoise-200 hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-gray-700">
                Cumulative Layout Shift (CLS)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {avgCLS > 0 ? avgCLS.toFixed(4) : '--'}
              </div>
              <Badge className={`${clsRating.bgColor} ${clsRating.color} border-0`}>
                {avgCLS > 0 ? clsRating.status : 'Measuring...'}
              </Badge>
              <div className="text-xs text-gray-500 mt-2">
                Target: &lt; 0.1
              </div>
              <Progress 
                value={Math.min((0.1 / avgCLS) * 100, 100)} 
                className="mt-3 h-2"
              />
            </CardContent>
          </Card>

          {/* FID Card */}
          <Card className="border-turquoise-200 hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-gray-700">
                First Input Delay (FID)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {avgFID > 0 ? `${avgFID.toFixed(0)}ms` : '--'}
              </div>
              <Badge className={`${fidRating.bgColor} ${fidRating.color} border-0`}>
                {avgFID > 0 ? fidRating.status : 'Measuring...'}
              </Badge>
              <div className="text-xs text-gray-500 mt-2">
                Target: &lt; 100ms
              </div>
              <Progress 
                value={Math.min((100 / avgFID) * 100, 100)} 
                className="mt-3 h-2"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* API Performance */}
      {apiPerformance.singleCall > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-turquoise-600" />
            API Performance Tests
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-turquoise-50 to-blue-50 border-turquoise-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium text-gray-700 flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-turquoise-600" />
                  Single API Call
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {apiPerformance.singleCall.toFixed(2)}ms
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  /api/posts/feed endpoint
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium text-gray-700 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  Parallel API Calls (3)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {apiPerformance.parallelCalls.toFixed(2)}ms
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Batched requests
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-50 to-teal-50 border-cyan-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium text-gray-700 flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-600" />
                  Cache Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {apiPerformance.cachePerformance.toFixed(2)}ms
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Second call (should be faster)
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Active Optimizations */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Active Optimizations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Frontend Optimizations */}
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="text-base font-medium text-gray-700">
                Frontend Optimizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">React Query caching (5min stale time)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Request batching</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Image lazy loading</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Smart prefetching</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">WebSocket optimization</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Backend Optimizations */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-base font-medium text-gray-700">
                Backend Optimizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Request batching</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Response compression</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Database query optimization</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Redis caching layer</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Connection pooling</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Performance Tips */}
      <Card className="border-turquoise-200 bg-gradient-to-br from-turquoise-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-base font-medium text-gray-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-turquoise-600" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-700">
            <p>• Current LCP of {(avgLCP / 1000).toFixed(2)}s {avgLCP > 2500 ? 'needs improvement' : 'is excellent'}. Optimize largest images and ensure critical resources load early.</p>
            <p>• CLS score of {avgCLS.toFixed(4)} {avgCLS > 0.1 ? 'indicates layout instability' : 'shows great visual stability'}. Reserve space for dynamic content.</p>
            <p>• FID of {avgFID.toFixed(0)}ms {avgFID > 100 ? 'could be improved' : 'provides excellent interactivity'}. Consider code splitting for better responsiveness.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;