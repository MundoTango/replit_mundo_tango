import React, { useState, useEffect } from 'react';
import { Activity, Zap, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LoadTestMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  concurrentUsers: number;
  cpuUsage: number;
  memoryUsage: number;
  p95Latency: number;
  p99Latency: number;
}

export const ProfileLoadTesting: React.FC<{ userId: number }> = ({ userId }) => {
  const [metrics, setMetrics] = useState<LoadTestMetrics>({
    responseTime: 45,
    throughput: 1200,
    errorRate: 0.1,
    concurrentUsers: 500,
    cpuUsage: 35,
    memoryUsage: 62,
    p95Latency: 120,
    p99Latency: 250
  });

  const [performanceHistory, setPerformanceHistory] = useState([
    { time: '00:00', responseTime: 40, throughput: 1100 },
    { time: '00:05', responseTime: 45, throughput: 1200 },
    { time: '00:10', responseTime: 42, throughput: 1150 },
    { time: '00:15', responseTime: 48, throughput: 1250 },
    { time: '00:20', responseTime: 43, throughput: 1180 },
    { time: '00:25', responseTime: 46, throughput: 1220 }
  ]);

  // Simulate load testing metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        responseTime: Math.max(20, prev.responseTime + (Math.random() - 0.5) * 10),
        throughput: Math.max(800, prev.throughput + (Math.random() - 0.5) * 100),
        errorRate: Math.max(0, Math.min(5, prev.errorRate + (Math.random() - 0.5) * 0.5)),
        concurrentUsers: Math.max(100, prev.concurrentUsers + Math.floor((Math.random() - 0.5) * 50)),
        cpuUsage: Math.max(10, Math.min(90, prev.cpuUsage + (Math.random() - 0.5) * 5)),
        memoryUsage: Math.max(30, Math.min(85, prev.memoryUsage + (Math.random() - 0.5) * 3)),
        p95Latency: Math.max(50, prev.p95Latency + (Math.random() - 0.5) * 20),
        p99Latency: Math.max(100, prev.p99Latency + (Math.random() - 0.5) * 30)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getPerformanceGrade = () => {
    if (metrics.responseTime < 50 && metrics.errorRate < 0.5) return 'A+';
    if (metrics.responseTime < 100 && metrics.errorRate < 1) return 'A';
    if (metrics.responseTime < 200 && metrics.errorRate < 2) return 'B';
    return 'C';
  };

  return (
    <div className="space-y-6">
      {/* Load Test Status */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Profile Load Testing Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{metrics.responseTime.toFixed(0)}ms</div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{metrics.throughput}</div>
              <div className="text-sm text-gray-600">Requests/sec</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{metrics.errorRate.toFixed(2)}%</div>
              <div className="text-sm text-gray-600">Error Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Grade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Performance Grade</span>
            <Badge className={`text-2xl px-4 py-2 ${
              getPerformanceGrade() === 'A+' ? 'bg-green-600' :
              getPerformanceGrade() === 'A' ? 'bg-green-500' :
              getPerformanceGrade() === 'B' ? 'bg-yellow-500' : 'bg-orange-500'
            }`}>
              {getPerformanceGrade()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">CPU Usage</span>
              <span className="text-sm font-medium">{metrics.cpuUsage}%</span>
            </div>
            <Progress value={metrics.cpuUsage} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Memory Usage</span>
              <span className="text-sm font-medium">{metrics.memoryUsage}%</span>
            </div>
            <Progress value={metrics.memoryUsage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Response Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Response Time Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={performanceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="responseTime" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Latency Percentiles */}
      <Card>
        <CardHeader>
          <CardTitle>Latency Percentiles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{metrics.p95Latency}ms</div>
              <div className="text-sm text-gray-600">95th Percentile</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{metrics.p99Latency}ms</div>
              <div className="text-sm text-gray-600">99th Percentile</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Load Test Recommendations */}
      {metrics.errorRate > 1 && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <div className="font-medium text-yellow-800">Performance Alert</div>
              <div className="text-sm text-yellow-700 mt-1">
                Error rate is above 1%. Consider optimizing database queries and implementing caching.
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};