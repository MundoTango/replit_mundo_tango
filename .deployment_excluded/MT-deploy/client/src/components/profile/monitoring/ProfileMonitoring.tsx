import React, { useState, useEffect } from 'react';
import { Monitor, AlertTriangle, Bell, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MonitoringMetrics {
  uptime: number;
  errorRate: number;
  avgResponseTime: number;
  activeAlerts: number;
  lastIncident: Date | null;
  apdex: number;
}

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export const ProfileMonitoring: React.FC<{ userId: number }> = ({ userId }) => {
  const [metrics, setMetrics] = useState<MonitoringMetrics>({
    uptime: 99.95,
    errorRate: 0.12,
    avgResponseTime: 142,
    activeAlerts: 2,
    lastIncident: new Date(Date.now() - 24 * 60 * 60 * 1000),
    apdex: 0.94
  });

  const [alerts] = useState<Alert[]>([
    {
      id: '1',
      severity: 'warning',
      message: 'High memory usage detected (82%)',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      resolved: false
    },
    {
      id: '2',
      severity: 'info',
      message: 'Database query optimization recommended',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      resolved: false
    }
  ]);

  const [performanceData] = useState([
    { time: '00:00', responseTime: 120, errorRate: 0.1 },
    { time: '04:00', responseTime: 115, errorRate: 0.08 },
    { time: '08:00', responseTime: 145, errorRate: 0.15 },
    { time: '12:00', responseTime: 180, errorRate: 0.2 },
    { time: '16:00', responseTime: 165, errorRate: 0.18 },
    { time: '20:00', responseTime: 140, errorRate: 0.12 },
    { time: '24:00', responseTime: 125, errorRate: 0.1 }
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    return <AlertTriangle className={`w-4 h-4 ${
      severity === 'critical' ? 'text-red-600' :
      severity === 'warning' ? 'text-yellow-600' : 'text-blue-600'
    }`} />;
  };

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-indigo-600" />
            Profile System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.uptime}%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.avgResponseTime}ms</div>
              <div className="text-sm text-gray-600">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{metrics.errorRate}%</div>
              <div className="text-sm text-gray-600">Error Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.apdex}</div>
              <div className="text-sm text-gray-600">Apdex Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Active Alerts
            </div>
            <Badge variant="secondary">{alerts.filter(a => !a.resolved).length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.filter(a => !a.resolved).map(alert => (
              <Alert key={alert.id} className={getSeverityColor(alert.severity)}>
                <div className="flex items-start gap-3">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <AlertDescription className="font-medium">
                      {alert.message}
                    </AlertDescription>
                    <div className="text-xs mt-1 opacity-70">
                      {alert.timestamp.toLocaleString()}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {alert.severity}
                  </Badge>
                </div>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="responseTime" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.3}
                name="Response Time (ms)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Error Rate Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Error Rate Trend (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="errorRate" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Error Rate (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monitoring Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Monitoring Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Alert Threshold</span>
              <span className="text-sm text-gray-600">Error rate &gt; 1%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Check Interval</span>
              <span className="text-sm text-gray-600">Every 30 seconds</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Alert Channels</span>
              <span className="text-sm text-gray-600">Email, Slack, PagerDuty</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Data Retention</span>
              <span className="text-sm text-gray-600">90 days</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};