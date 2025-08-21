import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart3, 
  Users, 
  Activity,
  Database,
  Clock,
  Zap,
  Globe,
  Smartphone,
  Monitor,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download
} from 'lucide-react';
import { format, subDays } from 'date-fns';

interface SystemStats {
  users: {
    total: number;
    active: number;
    newToday: number;
    growth: number;
  };
  memories: {
    total: number;
    todayCreated: number;
    withConsent: number;
    avgTrustLevel: number;
  };
  events: {
    total: number;
    upcoming: number;
    rsvps: number;
    avgAttendance: number;
  };
  performance: {
    avgResponseTime: number;
    uptime: number;
    errorRate: number;
    activeConnections: number;
  };
  engagement: {
    dailyActiveUsers: number;
    avgSessionDuration: number;
    postCreated: number;
    interactions: number;
  };
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  topLocations: Array<{
    country: string;
    users: number;
    percentage: number;
  }>;
}

export default function SystemStatsPanel() {
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [refreshing, setRefreshing] = useState(false);

  // Mock system statistics for demonstration
  const mockStats: SystemStats = {
    users: {
      total: 1247,
      active: 892,
      newToday: 18,
      growth: 12.3
    },
    memories: {
      total: 3892,
      todayCreated: 47,
      withConsent: 2341,
      avgTrustLevel: 3.2
    },
    events: {
      total: 156,
      upcoming: 23,
      rsvps: 1834,
      avgAttendance: 78.5
    },
    performance: {
      avgResponseTime: 187,
      uptime: 99.2,
      errorRate: 0.12,
      activeConnections: 423
    },
    engagement: {
      dailyActiveUsers: 287,
      avgSessionDuration: 42.5,
      postCreated: 123,
      interactions: 2847
    },
    deviceBreakdown: {
      mobile: 65,
      desktop: 28,
      tablet: 7
    },
    topLocations: [
      { country: 'Argentina', users: 287, percentage: 23.0 },
      { country: 'United States', users: 189, percentage: 15.2 },
      { country: 'Spain', users: 156, percentage: 12.5 },
      { country: 'Italy', users: 134, percentage: 10.7 },
      { country: 'Brazil', users: 98, percentage: 7.9 }
    ]
  };

  const refreshStats = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  };

  const exportStats = () => {
    const statsData = {
      generatedAt: new Date().toISOString(),
      timeRange,
      ...mockStats
    };
    
    const blob = new Blob([JSON.stringify(statsData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-stats-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'blue' }: any) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={`p-3 bg-${color}-100 rounded-xl`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{trendValue}%</span>
            </div>
          )}
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-600">{subtitle}</div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48 rounded-xl border-gray-200">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={refreshStats}
            disabled={refreshing}
            variant="outline"
            className="rounded-xl border-gray-200 hover:bg-indigo-50 hover:border-indigo-300"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Button
          onClick={exportStats}
          variant="outline"
          className="rounded-xl border-gray-200 hover:bg-indigo-50 hover:border-indigo-300"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* User Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={mockStats.users.total.toLocaleString()}
            subtitle="Registered members"
            icon={Users}
            trend="up"
            trendValue={mockStats.users.growth}
            color="blue"
          />
          <StatCard
            title="Active Users"
            value={mockStats.users.active.toLocaleString()}
            subtitle="Currently active"
            icon={Activity}
            color="green"
          />
          <StatCard
            title="New Today"
            value={mockStats.users.newToday}
            subtitle="New registrations"
            icon={TrendingUp}
            color="purple"
          />
          <StatCard
            title="Daily Active"
            value={mockStats.engagement.dailyActiveUsers}
            subtitle="Active in last 24h"
            icon={Zap}
            color="orange"
          />
        </div>
      </div>

      {/* Content Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="Total Memories"
            value={mockStats.memories.total.toLocaleString()}
            subtitle="Created memories"
            icon={Database}
            color="indigo"
          />
          <StatCard
            title="Today's Memories"
            value={mockStats.memories.todayCreated}
            subtitle="Created today"
            icon={Clock}
            color="pink"
          />
          <StatCard
            title="With Consent"
            value={mockStats.memories.withConsent.toLocaleString()}
            subtitle="Approved for sharing"
            icon={Activity}
            color="green"
          />
          <StatCard
            title="Avg Trust Level"
            value={mockStats.memories.avgTrustLevel.toFixed(1)}
            subtitle="Out of 5"
            icon={BarChart3}
            color="blue"
          />
        </div>
      </div>

      {/* Performance Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="Response Time"
            value={`${mockStats.performance.avgResponseTime}ms`}
            subtitle="Average response"
            icon={Zap}
            color="green"
          />
          <StatCard
            title="Uptime"
            value={`${mockStats.performance.uptime}%`}
            subtitle="System availability"
            icon={Activity}
            color="blue"
          />
          <StatCard
            title="Error Rate"
            value={`${mockStats.performance.errorRate}%`}
            subtitle="Request errors"
            icon={TrendingDown}
            color="red"
          />
          <StatCard
            title="Active Connections"
            value={mockStats.performance.activeConnections}
            subtitle="Real-time connections"
            icon={Globe}
            color="purple"
          />
        </div>
      </div>

      {/* Device and Location Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-indigo-600" />
              Device Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">Mobile</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${mockStats.deviceBreakdown.mobile}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-10 text-right">{mockStats.deviceBreakdown.mobile}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">Desktop</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${mockStats.deviceBreakdown.desktop}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-10 text-right">{mockStats.deviceBreakdown.desktop}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-600 rounded-sm"></div>
                  <span className="text-sm font-medium">Tablet</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full" 
                      style={{ width: `${mockStats.deviceBreakdown.tablet}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-10 text-right">{mockStats.deviceBreakdown.tablet}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Locations */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              Top Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockStats.topLocations.map((location, index) => (
                <div key={location.country} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium">{location.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${location.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{location.users}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="Session Duration"
            value={`${mockStats.engagement.avgSessionDuration}min`}
            subtitle="Average session"
            icon={Clock}
            color="purple"
          />
          <StatCard
            title="Posts Created"
            value={mockStats.engagement.postCreated}
            subtitle="Today"
            icon={Database}
            color="green"
          />
          <StatCard
            title="Interactions"
            value={mockStats.engagement.interactions.toLocaleString()}
            subtitle="Likes, comments, shares"
            icon={Activity}
            color="pink"
          />
          <StatCard
            title="Event RSVPs"
            value={mockStats.events.rsvps.toLocaleString()}
            subtitle="Total confirmations"
            icon={Users}
            color="orange"
          />
        </div>
      </div>
    </div>
  );
}