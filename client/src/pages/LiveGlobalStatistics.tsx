import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  Heart, 
  MapPin, 
  TrendingUp,
  Activity,
  Globe,
  UserCheck,
  FileText
} from "lucide-react";
import DashboardLayout from '@/layouts/DashboardLayout';

interface Statistics {
  users: {
    total_users: number;
    new_users_24h: number;
    new_users_7d: number;
    new_users_30d: number;
    active_users: number;
    verified_users: number;
  };
  roles: Array<{
    role_name: string;
    user_count: number;
  }>;
  content: {
    total_posts: number;
    total_memories: number;
    active_stories: number;
    total_comments: number;
    total_likes: number;
    new_posts_24h: number;
    new_memories_24h: number;
  };
  events: {
    total_events: number;
    upcoming_events: number;
    events_next_7d: number;
    events_next_30d: number;
    total_rsvps_going: number;
    total_rsvps_interested: number;
  };
  groups: {
    total_groups: number;
    total_group_members: number;
    avg_members_per_group: number;
  };
  topCities: Array<{
    city: string;
    state: string;
    country: string;
    user_count: number;
    event_count: number;
    group_count: number;
  }>;
  timestamp: string;
}

export default function LiveGlobalStatistics() {
  const [isConnected, setIsConnected] = useState(false);
  const [liveStats, setLiveStats] = useState<Statistics | null>(null);

  // Fetch initial statistics
  const { data: stats, isLoading, error } = useQuery<{ success: boolean; data: Statistics }>({
    queryKey: ['/api/statistics/dashboard'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('Statistics WebSocket connected');
      setIsConnected(true);
      socket.send(JSON.stringify({ type: 'subscribe', channel: 'statistics' }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'statistics_update') {
          setLiveStats(data.data);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    socket.onclose = () => {
      console.log('Statistics WebSocket disconnected');
      setIsConnected(false);
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  const statistics = liveStats || stats?.data;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !statistics) {
    return (
      <DashboardLayout>
        <div className="text-center text-red-500 p-8">
          Failed to load statistics
        </div>
      </DashboardLayout>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toString() || '0';
  };

  const getGrowthPercentage = (newCount: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((newCount / total) * 100);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
              Live Global Statistics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Real-time platform metrics and insights
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "secondary"} className="gap-1">
              <Activity className={`h-3 w-3 ${isConnected ? 'animate-pulse' : ''}`} />
              {isConnected ? 'Live' : 'Offline'}
            </Badge>
            <span className="text-sm text-gray-500">
              Last updated: {new Date(statistics.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(statistics.users.total_users)}</div>
              <p className="text-xs text-muted-foreground">
                +{statistics.users.new_users_24h} new today
              </p>
              <Progress 
                value={getGrowthPercentage(statistics.users.new_users_7d, statistics.users.total_users)} 
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(statistics.users.active_users)}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((statistics.users.active_users / statistics.users.total_users) * 100)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(statistics.users.verified_users)}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((statistics.users.verified_users / statistics.users.total_users) * 100)}% verified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(statistics.groups.total_groups)}</div>
              <p className="text-xs text-muted-foreground">
                ~{Math.round(statistics.groups.avg_members_per_group)} members avg
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Content & Engagement */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Content Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Posts</span>
                <div className="text-right">
                  <span className="text-2xl font-bold">{formatNumber(statistics.content.total_posts)}</span>
                  <span className="text-xs text-muted-foreground ml-2">+{statistics.content.new_posts_24h} today</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Memories</span>
                <div className="text-right">
                  <span className="text-2xl font-bold">{formatNumber(statistics.content.total_memories)}</span>
                  <span className="text-xs text-muted-foreground ml-2">+{statistics.content.new_memories_24h} today</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Active Stories</span>
                <span className="text-2xl font-bold">{formatNumber(statistics.content.active_stories)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Engagement</span>
                <div className="text-right">
                  <span className="text-lg">
                    <Heart className="inline h-4 w-4 text-red-500 mr-1" />
                    {formatNumber(statistics.content.total_likes)}
                    <MessageSquare className="inline h-4 w-4 text-blue-500 ml-3 mr-1" />
                    {formatNumber(statistics.content.total_comments)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Events</span>
                <span className="text-2xl font-bold">{formatNumber(statistics.events.total_events)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Upcoming Events</span>
                <span className="text-2xl font-bold">{formatNumber(statistics.events.upcoming_events)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Next 7 Days</span>
                <span className="text-lg font-semibold">{statistics.events.events_next_7d}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total RSVPs</span>
                <div className="text-right">
                  <Badge variant="default" className="mr-2">
                    Going: {formatNumber(statistics.events.total_rsvps_going)}
                  </Badge>
                  <Badge variant="secondary">
                    Interested: {formatNumber(statistics.events.total_rsvps_interested)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Community Role Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {statistics.roles.map((role) => (
                <div key={role.role_name} className="text-center">
                  <div className="text-2xl font-bold">{formatNumber(role.user_count)}</div>
                  <div className="text-sm text-muted-foreground capitalize">{role.role_name}s</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Cities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Top Cities by Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statistics.topCities.slice(0, 5).map((city, index) => (
                <div key={`${city.city}-${city.country}`} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-muted-foreground">#{index + 1}</span>
                    <div>
                      <div className="font-semibold flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {city.city}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {city.state ? `${city.state}, ` : ''}{city.country}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{formatNumber(city.user_count)} users</div>
                    <div className="text-sm text-muted-foreground">
                      {city.event_count} events • {city.group_count} groups
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}