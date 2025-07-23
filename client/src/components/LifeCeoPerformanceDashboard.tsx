import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Activity, Zap, TrendingUp, Server, Database, Clock } from 'lucide-react';
import { SentryErrorTester } from './life-ceo/SentryErrorTester';

interface PerformanceMetrics {
  responseTime: number;
  cacheHitRate: number;
  activeUsers: number;
  memoryUsage: number;
  databaseConnections: number;
  slowQueries: string[];
}

interface PerformanceReport {
  metrics: PerformanceMetrics;
  optimizationsApplied: number;
  recommendations: string[];
  prediction: string;
}

export function LifeCeoPerformanceDashboard() {
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>({});
  
  // Fetch performance report from Life CEO service
  const { data: report, isLoading } = useQuery<PerformanceReport>({
    queryKey: ['/api/performance/report'],
    refetchInterval: 30000, // Update every 30 seconds
  });

  // Real-time performance monitoring
  useEffect(() => {
    const measureRealTimePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByName('first-contentful-paint')[0];
      
      setRealTimeMetrics({
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
        firstContentfulPaint: paint?.startTime,
        totalBlockingTime: calculateTotalBlockingTime(),
      });
    };

    measureRealTimePerformance();
    const interval = setInterval(measureRealTimePerformance, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const calculateTotalBlockingTime = () => {
    const longTasks = performance.getEntriesByType('longtask');
    return longTasks.reduce((total, task) => total + Math.max(0, task.duration - 50), 0);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const getCacheHitRateColor = (rate: number) => {
    if (rate >= 0.9) return 'text-green-600';
    if (rate >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getResponseTimeColor = (time: number) => {
    if (time <= 100) return 'text-green-600';
    if (time <= 300) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-turquoise-500 to-cyan-600 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Life CEO Performance Dashboard</h1>
        <p className="text-turquoise-100">
          AI-powered performance optimization making your site up to 70% faster
        </p>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glassmorphic-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              First Paint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realTimeMetrics.firstContentfulPaint?.toFixed(0) || '—'} ms
            </div>
            <p className="text-sm text-gray-600">Time to first visible content</p>
          </CardContent>
        </Card>

        <Card className="glassmorphic-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              DOM Loaded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realTimeMetrics.domContentLoaded?.toFixed(0) || '—'} ms
            </div>
            <p className="text-sm text-gray-600">DOM interactive time</p>
          </CardContent>
        </Card>

        <Card className="glassmorphic-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              Blocking Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realTimeMetrics.totalBlockingTime?.toFixed(0) || '—'} ms
            </div>
            <p className="text-sm text-gray-600">Total main thread blocking</p>
          </CardContent>
        </Card>
      </div>

      {/* Life CEO Metrics */}
      {report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glassmorphic-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getResponseTimeColor(report.metrics.responseTime)}`}>
                  {report.metrics.responseTime.toFixed(0)} ms
                </div>
                <Progress 
                  value={Math.max(0, 100 - (report.metrics.responseTime / 5))} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card className="glassmorphic-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Cache Hit Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getCacheHitRateColor(report.metrics.cacheHitRate)}`}>
                  {(report.metrics.cacheHitRate * 100).toFixed(1)}%
                </div>
                <Progress 
                  value={report.metrics.cacheHitRate * 100} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card className="glassmorphic-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {report.metrics.activeUsers}
                </div>
                <p className="text-sm text-gray-600">Currently online</p>
              </CardContent>
            </Card>

            <Card className="glassmorphic-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(report.metrics.memoryUsage * 100).toFixed(1)}%
                </div>
                <Progress 
                  value={report.metrics.memoryUsage * 100} 
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>

          {/* AI Predictions */}
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle>Life CEO AI Predictions</CardTitle>
              <CardDescription>
                Load pattern: {report.prediction}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Optimizations Applied</span>
                  <span className="font-bold text-green-600">{report.optimizationsApplied}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Database Connections</span>
                  <span className="font-bold">{report.metrics.databaseConnections}/100</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {report.recommendations.length > 0 && (
            <Card className="glassmorphic-card">
              <CardHeader>
                <CardTitle>AI Performance Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Zap className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Slow Queries */}
          {report.metrics.slowQueries.length > 0 && (
            <Card className="glassmorphic-card border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Slow Queries Detected</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {report.metrics.slowQueries.slice(0, 5).map((query, index) => (
                    <li key={index} className="text-xs font-mono text-gray-600 truncate">
                      {query}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          
          {/* 40x20s Sentry Error Testing */}
          <div className="mt-6">
            <SentryErrorTester />
          </div>
        </>
      )}
    </div>
  );
}