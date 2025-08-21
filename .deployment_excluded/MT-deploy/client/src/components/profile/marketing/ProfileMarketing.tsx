import React, { useState } from 'react';
import { Megaphone, Users, Target, TrendingUp, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MarketingMetrics {
  socialReach: number;
  engagementRate: number;
  conversionRate: number;
  activePromotions: number;
  influencerScore: number;
  shareCount: number;
}

interface CampaignData {
  name: string;
  impressions: number;
  clicks: number;
  conversions: number;
}

export const ProfileMarketing: React.FC<{ userId: number }> = ({ userId }) => {
  const [metrics] = useState<MarketingMetrics>({
    socialReach: 25400,
    engagementRate: 4.2,
    conversionRate: 2.8,
    activePromotions: 3,
    influencerScore: 82,
    shareCount: 342
  });

  const [campaigns] = useState<CampaignData[]>([
    { name: 'Summer Tango Festival', impressions: 12000, clicks: 480, conversions: 24 },
    { name: 'Profile Launch Campaign', impressions: 8500, clicks: 340, conversions: 17 },
    { name: 'Social Media Boost', impressions: 4900, clicks: 245, conversions: 12 }
  ]);

  const [socialChannels] = useState([
    { name: 'Instagram', value: 45, color: '#E4405F' },
    { name: 'Facebook', value: 30, color: '#1877F2' },
    { name: 'Twitter', value: 15, color: '#1DA1F2' },
    { name: 'LinkedIn', value: 10, color: '#0A66C2' }
  ]);

  const [engagementTrend] = useState([
    { day: 'Mon', rate: 3.8 },
    { day: 'Tue', rate: 4.1 },
    { day: 'Wed', rate: 4.5 },
    { day: 'Thu', rate: 4.2 },
    { day: 'Fri', rate: 4.8 },
    { day: 'Sat', rate: 5.1 },
    { day: 'Sun', rate: 4.7 }
  ]);

  return (
    <div className="space-y-6">
      {/* Marketing Overview */}
      <Card className="border-pink-200 bg-gradient-to-br from-pink-50/50 to-purple-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-pink-600" />
            Profile Marketing Preparation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/70 rounded-lg">
              <Users className="w-8 h-8 text-pink-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{metrics.socialReach.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Social Reach</div>
            </div>
            <div className="text-center p-4 bg-white/70 rounded-lg">
              <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{metrics.engagementRate}%</div>
              <div className="text-sm text-gray-600">Engagement Rate</div>
            </div>
            <div className="text-center p-4 bg-white/70 rounded-lg">
              <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{metrics.conversionRate}%</div>
              <div className="text-sm text-gray-600">Conversion Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Influencer Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Influencer Score</span>
            <Badge className="text-lg px-3 py-1" variant="secondary">
              {metrics.influencerScore}/100
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={metrics.influencerScore} className="h-4 mb-4" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Profile Completeness</div>
              <div className="font-medium">95%</div>
            </div>
            <div>
              <div className="text-gray-600">Content Quality</div>
              <div className="font-medium">88%</div>
            </div>
            <div>
              <div className="text-gray-600">Audience Growth</div>
              <div className="font-medium">+12% monthly</div>
            </div>
            <div>
              <div className="text-gray-600">Share Count</div>
              <div className="font-medium">{metrics.shareCount}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Channel Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Social Channel Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={socialChannels}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {socialChannels.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Engagement Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Engagement Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={engagementTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="#ec4899" 
                strokeWidth={2}
                dot={{ fill: '#ec4899' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Active Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Active Campaigns</span>
            <Badge>{metrics.activePromotions} Active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{campaign.name}</h4>
                  <Button size="sm" variant="outline">
                    <Share2 className="w-3 h-3 mr-1" />
                    Share
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <div className="text-gray-600">Impressions</div>
                    <div className="font-medium">{campaign.impressions.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Clicks</div>
                    <div className="font-medium">{campaign.clicks}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">CTR</div>
                    <div className="font-medium">{((campaign.clicks / campaign.impressions) * 100).toFixed(2)}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Marketing Assets */}
      <Card>
        <CardHeader>
          <CardTitle>Marketing Assets Ready</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium">Profile Banner Images</span>
              <Badge className="bg-green-100 text-green-800">Ready</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium">Social Media Templates</span>
              <Badge className="bg-green-100 text-green-800">Ready</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium">Profile Description SEO</span>
              <Badge className="bg-green-100 text-green-800">Optimized</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="font-medium">Video Introduction</span>
              <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};