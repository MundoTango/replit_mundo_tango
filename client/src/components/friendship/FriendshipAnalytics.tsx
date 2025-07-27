import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Card } from '@/components/ui/card';
import { TrendingUp, Users, Calendar, Music, MapPin, Heart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface FriendshipAnalyticsProps {
  userId: number;
}

export function FriendshipAnalytics({ userId }: FriendshipAnalyticsProps) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/friendship/analytics', userId],
    queryFn: async () => {
      const response = await fetch(`/api/friendship/analytics/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    }
  });

  const colors = {
    turquoise: '#38b2ac',
    cyan: '#06b6d4',
    blue: '#3182ce',
    purple: '#8b5cf6',
    pink: '#ec4899',
    orange: '#f97316'
  };

  const pieColors = Object.values(colors);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6 glassmorphic-card">
            <Skeleton className="h-[300px] w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 glassmorphic-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Friends</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
                {analytics.totalFriends || 0}
              </p>
            </div>
            <Users className="w-8 h-8 text-turquoise-500" />
          </div>
        </Card>

        <Card className="p-4 glassmorphic-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Dance Partners</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-rose-500 bg-clip-text text-transparent">
                {analytics.uniqueDancePartners || 0}
              </p>
            </div>
            <Music className="w-8 h-8 text-pink-500" />
          </div>
        </Card>

        <Card className="p-4 glassmorphic-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cities Connected</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                {analytics.citiesConnected || 0}
              </p>
            </div>
            <MapPin className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4 glassmorphic-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Closeness</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent">
                {analytics.avgClosenessScore?.toFixed(1) || 0}%
              </p>
            </div>
            <Heart className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Friendship Growth Over Time */}
        <Card className="p-6 glassmorphic-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-turquoise-500" />
            Friendship Growth
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.friendshipGrowth || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255,255,255,0.9)', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="friends" 
                stroke={colors.turquoise} 
                strokeWidth={3}
                dot={{ fill: colors.turquoise, strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="dancePartners" 
                stroke={colors.pink} 
                strokeWidth={3}
                dot={{ fill: colors.pink, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Dance Styles Distribution */}
        <Card className="p-6 glassmorphic-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Music className="w-5 h-5 text-pink-500" />
            Dance Styles with Friends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.danceStyleDistribution || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {(analytics.danceStyleDistribution || []).map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Interaction Frequency */}
        <Card className="p-6 glassmorphic-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Interaction Frequency
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.interactionFrequency || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255,255,255,0.9)', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="interactions" fill={colors.cyan} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Friendship Strength Heatmap */}
        <Card className="p-6 glassmorphic-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-purple-500" />
            Top Friends by Closeness
          </h3>
          <div className="space-y-3">
            {(analytics.topFriendsByCloseness || []).slice(0, 5).map((friend: any, index: number) => (
              <div key={friend.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-turquoise-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{friend.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {friend.danceCount} dances • {friend.sharedEvents} events
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-turquoise-400 to-cyan-500 h-2 rounded-full"
                      style={{ width: `${friend.closenessScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{friend.closenessScore}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Geographical Distribution */}
      <Card className="p-6 glassmorphic-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-500" />
          Friends Around the World
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(analytics.friendsByCity || []).map((city: any) => (
            <div key={city.name} className="text-center">
              <div className="text-2xl font-bold text-turquoise-600">{city.count}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{city.name}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}