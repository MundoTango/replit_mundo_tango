import React, { useState, useEffect } from 'react';
import { Radio, Globe, Users, Activity, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface LiveMetrics {
  status: 'live' | 'preparing' | 'offline';
  activeUsers: number;
  requestsPerSecond: number;
  errorRate: number;
  deploymentProgress: number;
  regions: { name: string; status: 'active' | 'pending'; latency: number }[];
}

export const ProfileGoLive: React.FC<{ userId: number }> = ({ userId }) => {
  const [metrics, setMetrics] = useState<LiveMetrics>({
    status: 'live',
    activeUsers: 1245,
    requestsPerSecond: 342,
    errorRate: 0.05,
    deploymentProgress: 100,
    regions: [
      { name: 'US East', status: 'active', latency: 32 },
      { name: 'US West', status: 'active', latency: 45 },
      { name: 'Europe', status: 'active', latency: 58 },
      { name: 'Asia Pacific', status: 'active', latency: 72 },
      { name: 'South America', status: 'active', latency: 85 }
    ]
  });

  const [timeline] = useState([
    { time: '00:00', event: 'Deployment initiated', status: 'complete' },
    { time: '00:02', event: 'Database migrations complete', status: 'complete' },
    { time: '00:05', event: 'CDN cache cleared', status: 'complete' },
    { time: '00:08', event: 'Health checks passing', status: 'complete' },
    { time: '00:10', event: 'Traffic routing updated', status: 'complete' },
    { time: '00:12', event: 'Profile system live', status: 'complete' }
  ]);

  // Simulate real-time metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        activeUsers: Math.max(500, prev.activeUsers + Math.floor((Math.random() - 0.3) * 100)),
        requestsPerSecond: Math.max(100, prev.requestsPerSecond + Math.floor((Math.random() - 0.5) * 50)),
        errorRate: Math.max(0, Math.min(1, prev.errorRate + (Math.random() - 0.5) * 0.1))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (metrics.status === 'live') return 'text-green-600';
    if (metrics.status === 'preparing') return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBg = () => {
    if (metrics.status === 'live') return 'bg-green-50 border-green-200';
    if (metrics.status === 'preparing') return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Live Status */}
      <Card className={`border-2 ${getStatusBg()}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className={`w-5 h-5 ${getStatusColor()} ${metrics.status === 'live' ? 'animate-pulse' : ''}`} />
              Profile System Status
            </div>
            <Badge className={`text-lg px-4 py-2 ${
              metrics.status === 'live' ? 'bg-green-600' :
              metrics.status === 'preparing' ? 'bg-yellow-600' : 'bg-red-600'
            }`}>
              {metrics.status === 'live' ? '🟢 LIVE' :
               metrics.status === 'preparing' ? '🟡 PREPARING' : '🔴 OFFLINE'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white/70 rounded-lg">
              <Users className="w-6 h-6 text-blue-500 mx-auto mb-1" />
              <div className="text-2xl font-bold">{metrics.activeUsers.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div className="text-center p-3 bg-white/70 rounded-lg">
              <Activity className="w-6 h-6 text-green-500 mx-auto mb-1" />
              <div className="text-2xl font-bold">{metrics.requestsPerSecond}</div>
              <div className="text-sm text-gray-600">Requests/sec</div>
            </div>
            <div className="text-center p-3 bg-white/70 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-1" />
              <div className="text-2xl font-bold">{metrics.errorRate.toFixed(2)}%</div>
              <div className="text-sm text-gray-600">Error Rate</div>
            </div>
            <div className="text-center p-3 bg-white/70 rounded-lg">
              <Globe className="w-6 h-6 text-purple-500 mx-auto mb-1" />
              <div className="text-2xl font-bold">{metrics.regions.filter(r => r.status === 'active').length}</div>
              <div className="text-sm text-gray-600">Active Regions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Progress */}
      {metrics.deploymentProgress < 100 && (
        <Card>
          <CardHeader>
            <CardTitle>Deployment Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={metrics.deploymentProgress} className="h-4 mb-2" />
            <div className="text-sm text-gray-600 text-center">
              {metrics.deploymentProgress}% Complete
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regional Status */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Deployment Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.regions.map((region, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Globe className={`w-4 h-4 ${region.status === 'active' ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="font-medium">{region.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{region.latency}ms</span>
                  <Badge className={region.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                    {region.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Go-Live Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Go-Live Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {timeline.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-16 text-sm text-gray-600">{item.time}</div>
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium">{item.event}</div>
                </div>
                <Badge className="bg-green-100 text-green-800">Complete</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Live Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline">
              View Live Metrics Dashboard
            </Button>
            <Button variant="outline">
              Check System Health
            </Button>
            <Button variant="outline">
              Scale Resources
            </Button>
            <Button variant="outline">
              Emergency Rollback
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Success Alert */}
      {metrics.status === 'live' && metrics.errorRate < 0.1 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <div className="font-medium text-green-800">Profile System Operating Normally</div>
            <div className="text-sm text-green-700 mt-1">
              All systems are functioning within expected parameters. Error rate is minimal at {metrics.errorRate.toFixed(2)}%.
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};