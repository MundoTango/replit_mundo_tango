import React, { useState } from 'react';
import { TrendingUp, Users, MessageSquare, BarChart, Target, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AreaChart, Area, BarChart as RechartsBarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PostLaunchMetrics {
  adoptionRate: number;
  userSatisfaction: number;
  performanceScore: number;
  featureUsage: { feature: string; usage: number }[];
  userFeedback: { type: 'positive' | 'negative' | 'neutral'; count: number }[];
  optimizationsSuggested: number;
  optimizationsApplied: number;
}

export const ProfilePostLaunch: React.FC<{ userId: number }> = ({ userId }) => {
  const [metrics] = useState<PostLaunchMetrics>({
    adoptionRate: 87,
    userSatisfaction: 4.2,
    performanceScore: 95,
    featureUsage: [
      { feature: 'Travel Details', usage: 92 },
      { feature: 'Memory Posts', usage: 78 },
      { feature: 'Event Integration', usage: 85 },
      { feature: 'Guest Profile', usage: 65 },
      { feature: 'Photo Gallery', usage: 88 }
    ],
    userFeedback: [
      { type: 'positive', count: 342 },
      { type: 'neutral', count: 89 },
      { type: 'negative', count: 12 }
    ],
    optimizationsSuggested: 15,
    optimizationsApplied: 11
  });

  const [growthData] = useState([
    { week: 'Week 1', users: 1200, engagement: 65 },
    { week: 'Week 2', users: 2100, engagement: 72 },
    { week: 'Week 3', users: 3400, engagement: 78 },
    { week: 'Week 4', users: 4800, engagement: 82 },
    { week: 'Week 5', users: 6200, engagement: 85 },
    { week: 'Week 6', users: 7500, engagement: 87 }
  ]);

  const [performanceImprovement] = useState([
    { metric: 'Page Load Time', before: 2.1, after: 0.8 },
    { metric: 'API Response', before: 180, after: 45 },
    { metric: 'Memory Usage', before: 450, after: 320 },
    { metric: 'Bundle Size', before: 1200, after: 780 }
  ]);

  const totalFeedback = metrics.userFeedback.reduce((sum, item) => sum + item.count, 0);
  const positiveFeedbackPercent = ((metrics.userFeedback[0].count / totalFeedback) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Post-Launch Overview */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-indigo-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Post-Launch Optimization Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/70 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{metrics.adoptionRate}%</div>
              <div className="text-sm text-gray-600">Adoption Rate</div>
            </div>
            <div className="text-center p-4 bg-white/70 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{metrics.userSatisfaction}/5</div>
              <div className="text-sm text-gray-600">User Satisfaction</div>
            </div>
            <div className="text-center p-4 bg-white/70 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{metrics.performanceScore}%</div>
              <div className="text-sm text-gray-600">Performance Score</div>
            </div>
            <div className="text-center p-4 bg-white/70 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">{positiveFeedbackPercent}%</div>
              <div className="text-sm text-gray-600">Positive Feedback</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Growth Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Growth & Engagement Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users">
            <TabsList>
              <TabsTrigger value="users">User Growth</TabsTrigger>
              <TabsTrigger value="engagement">Engagement Rate</TabsTrigger>
            </TabsList>
            <TabsContent value="users" className="mt-4">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="engagement" className="mt-4">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="engagement" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Feature Usage Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Usage Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.featureUsage.map((feature, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{feature.feature}</span>
                  <span className="text-sm text-gray-600">{feature.usage}%</span>
                </div>
                <Progress value={feature.usage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Feedback Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            User Feedback Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <RechartsBarChart data={metrics.userFeedback}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" />
            </RechartsBarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium">Positive Feedback</span>
              <Badge className="bg-green-100 text-green-800">{metrics.userFeedback[0].count}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Neutral Feedback</span>
              <Badge className="bg-gray-100 text-gray-800">{metrics.userFeedback[1].count}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="font-medium">Negative Feedback</span>
              <Badge className="bg-red-100 text-red-800">{metrics.userFeedback[2].count}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Improvements */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Improvements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceImprovement.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{item.metric}</div>
                  <div className="text-sm text-gray-600">
                    {item.before}ms → {item.after}ms
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {((1 - item.after / item.before) * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600">Improvement</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Optimization Status</span>
            <Badge variant="secondary">
              {metrics.optimizationsApplied}/{metrics.optimizationsSuggested} Applied
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress 
            value={(metrics.optimizationsApplied / metrics.optimizationsSuggested) * 100} 
            className="h-4 mb-4"
          />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-green-600" />
              <span className="text-sm">Database query optimization</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-green-600" />
              <span className="text-sm">Image lazy loading implemented</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-green-600" />
              <span className="text-sm">Component code splitting</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-yellow-600" />
              <span className="text-sm">CDN edge caching (in progress)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle>Recommended Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge className="bg-green-600 mt-0.5">1</Badge>
              <div>
                <div className="font-medium">Enhance Guest Profile Adoption</div>
                <div className="text-sm text-gray-600">Current usage at 65% - implement onboarding tutorial</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="bg-green-600 mt-0.5">2</Badge>
              <div>
                <div className="font-medium">Optimize Memory Post Creation</div>
                <div className="text-sm text-gray-600">Users report friction in the posting flow</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="bg-green-600 mt-0.5">3</Badge>
              <div>
                <div className="font-medium">Implement A/B Testing Framework</div>
                <div className="text-sm text-gray-600">Test new features with small user groups first</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};