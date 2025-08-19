import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Activity,
  Globe,
  Calendar,
  DollarSign,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Clock,
  Target,
  Zap,
  BarChart3,
  PieChartIcon,
  LineChartIcon,
  Download,
  RefreshCw,
  Info
} from "lucide-react";

// Color palette for charts
const COLORS = ['#38b2ac', '#06b6d4', '#3182ce', '#6366f1', '#8b5cf6', '#a855f8', '#ec4899', '#f43f5e'];

const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch analytics data
  const { data: analyticsData, refetch } = useQuery({
    queryKey: ['/api/analytics/dashboard', timeRange],
    staleTime: 5 * 60 * 1000, // 5 minutes
    queryFn: async () => {
      // Mock data for now - would be replaced with actual API call
      return {
        overview: {
          totalUsers: 15234,
          activeUsers: 3421,
          totalEvents: 892,
          totalPosts: 45678,
          avgSessionDuration: 12.5,
          bounceRate: 32.4,
          newUsers: 234,
          returningUsers: 3187
        },
        userGrowth: [
          { date: 'Mon', users: 1200, newUsers: 150 },
          { date: 'Tue', users: 1350, newUsers: 180 },
          { date: 'Wed', users: 1420, newUsers: 120 },
          { date: 'Thu', users: 1580, newUsers: 200 },
          { date: 'Fri', users: 1650, newUsers: 170 },
          { date: 'Sat', users: 1820, newUsers: 220 },
          { date: 'Sun', users: 1900, newUsers: 190 }
        ],
        contentEngagement: [
          { type: 'Posts', views: 23456, likes: 12345, comments: 3456, shares: 890 },
          { type: 'Events', views: 18234, likes: 8456, comments: 2134, shares: 567 },
          { type: 'Stories', views: 15678, likes: 7234, comments: 1890, shares: 456 },
          { type: 'Groups', views: 12345, likes: 5678, comments: 1234, shares: 345 }
        ],
        cityDistribution: [
          { city: 'Buenos Aires', users: 4532, percentage: 29.8 },
          { city: 'Paris', users: 2134, percentage: 14.0 },
          { city: 'Berlin', users: 1876, percentage: 12.3 },
          { city: 'New York', users: 1567, percentage: 10.3 },
          { city: 'Tokyo', users: 1234, percentage: 8.1 },
          { city: 'Others', users: 3891, percentage: 25.5 }
        ],
        deviceStats: [
          { device: 'Mobile', users: 9140, percentage: 60 },
          { device: 'Desktop', users: 4571, percentage: 30 },
          { device: 'Tablet', users: 1523, percentage: 10 }
        ],
        roleDistribution: [
          { role: 'Dancer', count: 8234 },
          { role: 'Teacher', count: 2345 },
          { role: 'Organizer', count: 1567 },
          { role: 'DJ', count: 890 },
          { role: 'Musician', count: 567 },
          { role: 'Other', count: 1631 }
        ]
      };
    }
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleExport = () => {
    // Export functionality would be implemented here
    console.log('Exporting analytics data...');
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">Platform insights and performance metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="glassmorphic-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{analyticsData?.overview.activeUsers.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">+12.5% from last period</p>
              </div>
              <div className="p-3 rounded-full bg-turquoise-100">
                <Users className="h-6 w-6 text-turquoise-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphic-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Session</p>
                <p className="text-2xl font-bold">{analyticsData?.overview.avgSessionDuration}m</p>
                <p className="text-xs text-green-600 mt-1">+8.3% from last period</p>
              </div>
              <div className="p-3 rounded-full bg-cyan-100">
                <Clock className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphic-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-2xl font-bold">{analyticsData?.overview.totalEvents}</p>
                <p className="text-xs text-green-600 mt-1">+23 this week</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphic-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Engagement Rate</p>
                <p className="text-2xl font-bold">67.8%</p>
                <p className="text-xs text-green-600 mt-1">+5.2% from last period</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* User Growth Chart */}
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-turquoise-500" />
                User Growth Trend
              </CardTitle>
              <CardDescription>
                Daily active users and new registrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData?.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#38b2ac" 
                    fill="#38b2ac" 
                    fillOpacity={0.3}
                    name="Active Users"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="newUsers" 
                    stroke="#06b6d4" 
                    fill="#06b6d4" 
                    fillOpacity={0.3}
                    name="New Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* City Distribution */}
            <Card className="glassmorphic-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-cyan-500" />
                  User Distribution by City
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analyticsData?.cityDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ city, percentage }) => `${city} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="users"
                    >
                      {analyticsData?.cityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Device Stats */}
            <Card className="glassmorphic-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  Device Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData?.deviceStats.map((device, index) => (
                    <div key={device.device} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{device.device}</span>
                        <span className="text-gray-600">{device.percentage}%</span>
                      </div>
                      <Progress 
                        value={device.percentage} 
                        className="h-2"
                        style={{ 
                          '--progress-color': COLORS[index % COLORS.length] 
                        } as React.CSSProperties}
                      />
                      <p className="text-xs text-gray-500">{device.users.toLocaleString()} users</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                User Analytics
              </CardTitle>
              <CardDescription>
                Deep dive into user behavior and demographics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-gradient-to-r from-turquoise-50 to-cyan-50">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600">New vs Returning</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-bold">
                        {analyticsData?.overview.newUsers}
                      </span>
                      <span className="text-gray-500">/</span>
                      <span className="text-xl font-bold">
                        {analyticsData?.overview.returningUsers}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-cyan-50 to-blue-50">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600">Bounce Rate</p>
                    <p className="text-2xl font-bold mt-1">
                      {analyticsData?.overview.bounceRate}%
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold mt-1">
                      {analyticsData?.overview.totalUsers.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Role Distribution */}
              <div>
                <h3 className="font-semibold mb-3">Users by Tango Role</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analyticsData?.roleDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="role" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="count" fill="#38b2ac">
                      {analyticsData?.roleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Content Engagement Metrics
              </CardTitle>
              <CardDescription>
                Performance of posts, events, stories, and groups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData?.contentEngagement}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="type" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="views" fill="#38b2ac" name="Views" />
                  <Bar dataKey="likes" fill="#06b6d4" name="Likes" />
                  <Bar dataKey="comments" fill="#3182ce" name="Comments" />
                  <Bar dataKey="shares" fill="#6366f1" name="Shares" />
                </BarChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <Eye className="h-8 w-8 text-turquoise-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Total Views</p>
                  <p className="text-xl font-bold">
                    {analyticsData?.contentEngagement.reduce((sum, item) => sum + item.views, 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Total Likes</p>
                  <p className="text-xl font-bold">
                    {analyticsData?.contentEngagement.reduce((sum, item) => sum + item.likes, 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <MessageSquare className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Total Comments</p>
                  <p className="text-xl font-bold">
                    {analyticsData?.contentEngagement.reduce((sum, item) => sum + item.comments, 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <Share2 className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Total Shares</p>
                  <p className="text-xl font-bold">
                    {analyticsData?.contentEngagement.reduce((sum, item) => sum + item.shares, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                System Performance
              </CardTitle>
              <CardDescription>
                Platform health and technical metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Performance Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <span className="text-sm">Page Load Time</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">2.1s</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <span className="text-sm">API Response Time</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">145ms</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <span className="text-sm">Cache Hit Rate</span>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">87%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <span className="text-sm">Error Rate</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">0.12%</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">System Health</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <span className="text-sm">Server Uptime</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">99.98%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <span className="text-sm">Database Health</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <span className="text-sm">Memory Usage</span>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">72%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <span className="text-sm">CPU Usage</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">45%</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-500" />
                Key Insights & Recommendations
              </CardTitle>
              <CardDescription>
                AI-powered insights to improve platform performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Growth Opportunity:</strong> Buenos Aires shows 45% higher engagement rates. Consider focusing marketing efforts in similar Latin American cities.
                  </AlertDescription>
                </Alert>

                <Alert className="border-blue-200 bg-blue-50">
                  <Users className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>User Behavior:</strong> Mobile users spend 3x more time on event pages. Optimize mobile event discovery experience.
                  </AlertDescription>
                </Alert>

                <Alert className="border-yellow-200 bg-yellow-50">
                  <Calendar className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Content Strategy:</strong> Posts with event mentions get 67% more engagement. Encourage users to link posts to events.
                  </AlertDescription>
                </Alert>

                <Alert className="border-purple-200 bg-purple-50">
                  <Heart className="h-4 w-4 text-purple-600" />
                  <AlertDescription className="text-purple-800">
                    <strong>Engagement Pattern:</strong> Teacher profiles receive 4x more views. Create featured teacher spotlights to boost engagement.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;