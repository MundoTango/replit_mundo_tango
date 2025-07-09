import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  Globe, 
  Calendar,
  Music,
  MapPin,
  Trophy,
  Heart,
  Star,
  Clock,
  Activity,
  Zap,
  Target,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface GlobalStats {
  totalUsers: number;
  activeUsers: number;
  totalEvents: number;
  totalCommunities: number;
  totalPosts: number;
  totalFriendships: number;
  topCities: { city: string; users: number; events: number }[];
  topDancers: { name: string; username: string; followers: number; roles: string[] }[];
  eventTrends: { month: string; count: number }[];
  userGrowth: { month: string; newUsers: number }[];
  popularRoles: { role: string; count: number; percentage: number }[];
  engagementMetrics: {
    avgPostsPerUser: number;
    avgEventsAttended: number;
    avgFriendsPerUser: number;
    activePercentage: number;
  };
}

export default function GlobalStatistics() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  
  // Mock data for demonstration
  const mockStats: GlobalStats = {
    totalUsers: 12847,
    activeUsers: 8234,
    totalEvents: 3456,
    totalCommunities: 234,
    totalPosts: 45678,
    totalFriendships: 34567,
    topCities: [
      { city: 'Buenos Aires, Argentina', users: 3456, events: 892 },
      { city: 'Paris, France', users: 1234, events: 345 },
      { city: 'Berlin, Germany', users: 987, events: 267 },
      { city: 'New York, USA', users: 876, events: 234 },
      { city: 'Tokyo, Japan', users: 654, events: 178 }
    ],
    topDancers: [
      { name: 'Maria Rodriguez', username: 'maria_tango', followers: 2345, roles: ['dancer', 'teacher'] },
      { name: 'Carlos Mendez', username: 'carlos_milonga', followers: 1987, roles: ['organizer', 'dancer'] },
      { name: 'Ana Silva', username: 'ana_tango_dj', followers: 1654, roles: ['dj', 'dancer'] },
      { name: 'Diego Martinez', username: 'diego_performer', followers: 1432, roles: ['performer', 'teacher'] },
      { name: 'Sofia Fernandez', username: 'sofia_tango', followers: 1234, roles: ['dancer', 'organizer'] }
    ],
    eventTrends: [
      { month: 'Jan', count: 245 },
      { month: 'Feb', count: 287 },
      { month: 'Mar', count: 312 },
      { month: 'Apr', count: 298 },
      { month: 'May', count: 356 },
      { month: 'Jun', count: 402 }
    ],
    userGrowth: [
      { month: 'Jan', newUsers: 456 },
      { month: 'Feb', newUsers: 523 },
      { month: 'Mar', newUsers: 612 },
      { month: 'Apr', newUsers: 587 },
      { month: 'May', newUsers: 698 },
      { month: 'Jun', newUsers: 754 }
    ],
    popularRoles: [
      { role: 'Dancer', count: 9876, percentage: 76.8 },
      { role: 'Teacher', count: 1234, percentage: 9.6 },
      { role: 'Organizer', count: 876, percentage: 6.8 },
      { role: 'DJ', count: 456, percentage: 3.5 },
      { role: 'Performer', count: 405, percentage: 3.3 }
    ],
    engagementMetrics: {
      avgPostsPerUser: 3.5,
      avgEventsAttended: 4.2,
      avgFriendsPerUser: 12.7,
      activePercentage: 64.1
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getGrowthPercentage = (current: number, previous: number) => {
    const growth = ((current - previous) / previous) * 100;
    return growth.toFixed(1);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Global Tango Statistics</h1>
              <p className="text-gray-600 mt-2">Comprehensive overview of the worldwide tango community</p>
            </div>
            <div className="flex gap-2">
              {['week', 'month', 'year', 'all'].map(period => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                  className={selectedPeriod === period 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0' 
                    : ''}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(mockStats.totalUsers)}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    +12.3%
                  </p>
                </div>
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(mockStats.activeUsers)}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    +8.7%
                  </p>
                </div>
                <Activity className="w-8 h-8 text-emerald-600" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-r from-purple-50 to-violet-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(mockStats.totalEvents)}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    +15.4%
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-violet-600" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-r from-pink-50 to-rose-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Communities</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(mockStats.totalCommunities)}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    +6.2%
                  </p>
                </div>
                <Globe className="w-8 h-8 text-rose-600" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Posts</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(mockStats.totalPosts)}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    +23.8%
                  </p>
                </div>
                <Zap className="w-8 h-8 text-amber-600" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-r from-cyan-50 to-teal-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Friendships</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(mockStats.totalFriendships)}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    +18.5%
                  </p>
                </div>
                <Heart className="w-8 h-8 text-teal-600" />
              </div>
            </Card>
          </div>
        </div>

        {/* Tabs for different statistics */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cities">Cities</TabsTrigger>
            <TabsTrigger value="dancers">Top Dancers</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth Chart */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  User Growth
                </h3>
                <div className="space-y-3">
                  {mockStats.userGrowth.map((month, index) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{month.month}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                            style={{ width: `${(month.newUsers / 800) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-12 text-right">
                          {month.newUsers}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Role Distribution */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-purple-600" />
                  Role Distribution
                </h3>
                <div className="space-y-3">
                  {mockStats.popularRoles.map((role) => (
                    <div key={role.role} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{role.role}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                            style={{ width: `${role.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-12 text-right">
                          {role.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Engagement Metrics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-indigo-600">{mockStats.engagementMetrics.avgPostsPerUser}</p>
                  <p className="text-sm text-gray-600 mt-1">Avg Posts/User</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{mockStats.engagementMetrics.avgEventsAttended}</p>
                  <p className="text-sm text-gray-600 mt-1">Avg Events/User</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-pink-600">{mockStats.engagementMetrics.avgFriendsPerUser}</p>
                  <p className="text-sm text-gray-600 mt-1">Avg Friends/User</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{mockStats.engagementMetrics.activePercentage}%</p>
                  <p className="text-sm text-gray-600 mt-1">Active Users</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Cities Tab */}
          <TabsContent value="cities" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                Top Tango Cities Worldwide
              </h3>
              <div className="space-y-4">
                {mockStats.topCities.map((city, index) => (
                  <div key={city.city} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                        ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-400' : 
                          index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                          index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                          'bg-gradient-to-r from-indigo-400 to-purple-400'}`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{city.city}</p>
                        <p className="text-sm text-gray-600">
                          {formatNumber(city.users)} dancers • {city.events} events
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-indigo-600">{((city.users / mockStats.totalUsers) * 100).toFixed(1)}%</p>
                      <p className="text-xs text-gray-600">of total users</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Top Dancers Tab */}
          <TabsContent value="dancers" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Most Followed Dancers
              </h3>
              <div className="space-y-4">
                {mockStats.topDancers.map((dancer, index) => (
                  <div key={dancer.username} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                        ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-400' : 
                          index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                          index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                          'bg-gradient-to-r from-indigo-400 to-purple-400'}`}>
                        {dancer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{dancer.name}</p>
                        <p className="text-sm text-gray-600">@{dancer.username}</p>
                        <div className="flex gap-2 mt-1">
                          {dancer.roles.map(role => (
                            <span key={role} className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-indigo-600">{formatNumber(dancer.followers)}</p>
                      <p className="text-xs text-gray-600">followers</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Event Trends
              </h3>
              <div className="space-y-4">
                {mockStats.eventTrends.map((month) => (
                  <div key={month.month} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 w-12">{month.month}</span>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-6">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-6 rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${(month.count / 450) * 100}%` }}
                        >
                          <span className="text-xs text-white font-medium">{month.count}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Patterns</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-indigo-600" />
                      <span className="text-sm font-medium text-gray-700">Peak Activity</span>
                    </div>
                    <span className="text-sm font-bold text-indigo-600">9 PM - 12 AM</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">Most Active Day</span>
                    </div>
                    <span className="text-sm font-bold text-purple-600">Saturday</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-pink-600" />
                      <span className="text-sm font-medium text-gray-700">Avg Session</span>
                    </div>
                    <span className="text-sm font-bold text-pink-600">23 minutes</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Performance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Avg Likes/Post</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">24.5</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Avg Event Attendance</span>
                    </div>
                    <span className="text-sm font-bold text-blue-600">67.3%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-amber-600" />
                      <span className="text-sm font-medium text-gray-700">User Satisfaction</span>
                    </div>
                    <span className="text-sm font-bold text-amber-600">4.8/5.0</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}