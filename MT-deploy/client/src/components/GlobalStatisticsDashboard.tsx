import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MapPin, 
  Calendar, 
  Link2, 
  Users2, 
  FileText,
  Building2,
  TrendingUp,
  Activity,
  Clock
} from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { cn } from '@/lib/utils';

interface GlobalStats {
  global?: {
    totalUsers: number;
    activeCities: number;
    totalEvents: number;
    totalConnections: number;
    totalGroups: number;
    totalMemories: number;
    activeTenants: number;
  };
  tenant?: {
    totalUsers: number;
    activeCities: number;
    totalEvents: number;
    totalConnections: number;
    totalGroups: number;
    totalMemories: number;
  };
  topCities: Array<{
    name: string;
    country: string;
    userCount: number;
  }>;
}

interface RealtimeStats {
  last24Hours: {
    newUsers: number;
    newEvents: number;
    newPosts: number;
    activeUsers: number;
  };
  timestamp: string;
}

export function GlobalStatisticsDashboard() {
  const { currentTenant } = useTenant();
  const [realtimeData, setRealtimeData] = useState<RealtimeStats | null>(null);
  
  const { data: stats, isLoading } = useQuery<GlobalStats>({
    queryKey: ['/api/statistics/global', currentTenant?.id],
    queryFn: async () => {
      const headers: any = {};
      if (currentTenant) {
        headers['x-tenant-id'] = currentTenant.id;
      }
      const response = await fetch('/api/statistics/global', { headers });
      if (!response.ok) throw new Error('Failed to fetch statistics');
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });
  
  // Fetch realtime stats
  useEffect(() => {
    const fetchRealtimeStats = async () => {
      try {
        const response = await fetch('/api/statistics/realtime');
        if (response.ok) {
          const result = await response.json();
          setRealtimeData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch realtime stats:', error);
      }
    };
    
    fetchRealtimeStats();
    const interval = setInterval(fetchRealtimeStats, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const displayStats = currentTenant ? stats?.tenant : stats?.global;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {currentTenant ? `${currentTenant.name} Statistics` : 'Global Platform Statistics'}
        </h2>
        <p className="text-muted-foreground">
          {currentTenant 
            ? `Real-time metrics for ${currentTenant.name} community`
            : 'Platform-wide metrics across all communities'
          }
        </p>
      </div>
      
      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayStats?.totalUsers.toLocaleString() || 0}
            </div>
            {realtimeData && (
              <p className="text-xs text-muted-foreground">
                +{realtimeData.last24Hours.newUsers} today
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cities</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayStats?.activeCities || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Worldwide presence
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayStats?.totalEvents.toLocaleString() || 0}
            </div>
            {realtimeData && (
              <p className="text-xs text-muted-foreground">
                +{realtimeData.last24Hours.newEvents} today
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connections</CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayStats?.totalConnections.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              User relationships
            </p>
          </CardContent>
        </Card>
        
        {!currentTenant && stats?.global && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.global.activeTenants || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Communities
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Activity Tabs */}
      <Tabs defaultValue="cities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cities">Top Cities</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Cities by User Count</CardTitle>
              <CardDescription>
                Most active locations in the {currentTenant ? 'community' : 'platform'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.topCities.map((city, index) => (
                  <div key={`${city.name}-${city.country}`} className="flex items-center">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            {index + 1}. {city.name}, {city.country}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {city.userCount.toLocaleString()} users
                        </p>
                      </div>
                      <Progress 
                        value={(city.userCount / (stats.topCities[0]?.userCount || 1)) * 100} 
                        className="h-2 mt-2"
                      />
                    </div>
                  </div>
                ))}
                {(!stats?.topCities || stats.topCities.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No city data available yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>24-Hour Activity</CardTitle>
              <CardDescription>
                Platform activity in the last 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              {realtimeData ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center space-x-4">
                    <Activity className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Active Users</p>
                      <p className="text-2xl font-bold">
                        {realtimeData.last24Hours.activeUsers}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">New Posts</p>
                      <p className="text-2xl font-bold">
                        {realtimeData.last24Hours.newPosts}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Users className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium">New Users</p>
                      <p className="text-2xl font-bold">
                        {realtimeData.last24Hours.newUsers}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Calendar className="h-8 w-8 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">New Events</p>
                      <p className="text-2xl font-bold">
                        {realtimeData.last24Hours.newEvents}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Loading real-time activity data...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}