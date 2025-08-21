import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Trophy, 
  Target, 
  Heart, 
  Star, 
  Users,
  MapPin,
  Calendar,
  TrendingUp,
  Award,
  Sparkles,
  Eye
} from 'lucide-react';

interface ProfileEngagementFeaturesProps {
  user: any;
  statsData: any;
}

export const ProfileEngagementFeatures: React.FC<ProfileEngagementFeaturesProps> = ({ user, statsData }) => {
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);

  // Engagement features that make profiles more fun and interactive
  const engagementFeatures = [
    {
      id: 'achievements',
      title: '🏆 Tango Achievements',
      description: 'Unlock badges as you participate in the community',
      component: (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'First Steps', icon: '👶', unlocked: true, description: 'Joined Mundo Tango', progress: 100 },
            { name: 'Social Butterfly', icon: '🦋', unlocked: true, description: '5+ friends added', progress: 100 },
            { name: 'Event Enthusiast', icon: '🎉', unlocked: false, description: 'Attend 10 events', progress: 60 },
            { name: 'Tango Master', icon: '🎩', unlocked: false, description: 'Complete profile 100%', progress: 85 },
          ].map((achievement) => (
            <div 
              key={achievement.name}
              className={`p-3 rounded-lg border-2 text-center transition-all hover:scale-105 ${
                achievement.unlocked 
                  ? 'bg-gradient-to-br from-turquoise-50 to-cyan-50 border-turquoise-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className={`text-2xl mb-2 ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                {achievement.icon}
              </div>
              <div className={`text-xs font-medium ${achievement.unlocked ? 'text-turquoise-700' : 'text-gray-500'}`}>
                {achievement.name}
              </div>
              {/* Progress bar for achievements */}
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    achievement.unlocked 
                      ? 'bg-gradient-to-r from-turquoise-400 to-cyan-500' 
                      : 'bg-gradient-to-r from-gray-300 to-gray-400'
                  }`}
                  style={{ width: `${achievement.progress}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {achievement.progress}% complete
              </div>
              {achievement.unlocked && (
                <Badge className="mt-1 text-xs bg-green-100 text-green-700">Unlocked</Badge>
              )}
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'challenges',
      title: '🎯 Monthly Challenges',
      description: 'Complete challenges to earn points and rewards',
      component: (
        <div className="space-y-3">
          {[
            { name: 'Memory Master', progress: 3, total: 5, points: 100, description: 'Post 5 tango memories this month' },
            { name: 'Community Builder', progress: 2, total: 3, points: 150, description: 'Invite 3 new friends' },
            { name: 'Event Explorer', progress: 1, total: 2, points: 200, description: 'Attend 2 different events' },
          ].map((challenge) => (
            <div 
              key={challenge.name}
              className="p-4 bg-white/70 rounded-lg border border-gray-200 hover:border-turquoise-300 transition-colors cursor-pointer"
              onClick={() => setSelectedChallenge(selectedChallenge === challenge.name ? null : challenge.name)}
            >
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900">{challenge.name}</h5>
                <Badge variant="outline" className="bg-turquoise-50 text-turquoise-700 border-turquoise-200">
                  +{challenge.points} pts
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-turquoise-400 to-cyan-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {challenge.progress}/{challenge.total} completed
                  </div>
                </div>
                <Button size="sm" variant="outline" className="border-turquoise-200 text-turquoise-700 hover:bg-turquoise-50">
                  {challenge.progress === challenge.total ? 'Claim' : 'Continue'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'streaks',
      title: '🔥 Activity Streaks',
      description: 'Keep your momentum going with daily engagement',
      component: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Daily Check-in', current: 7, best: 15, icon: Star, color: 'text-yellow-500' },
            { name: 'Memory Posts', current: 3, best: 12, icon: Sparkles, color: 'text-purple-500' },
            { name: 'Friend Interactions', current: 5, best: 8, icon: Users, color: 'text-blue-500' },
          ].map((streak) => (
            <div key={streak.name} className="text-center p-4 bg-white/50 rounded-lg border border-gray-200">
              <streak.icon className={`w-8 h-8 mx-auto mb-2 ${streak.color}`} />
              <div className="text-2xl font-bold text-gray-900">{streak.current}</div>
              <div className="text-xs text-gray-600">{streak.name}</div>
              <div className="text-xs text-gray-500 mt-1">Best: {streak.best} days</div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'social-impact',
      title: '🌟 Community Impact',
      description: 'See how your participation helps grow the tango community',
      component: (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'People Inspired', value: statsData?.friendsCount * 3 || 15, icon: Heart, color: 'text-red-500' },
            { label: 'Events Supported', value: statsData?.eventsAttended || 8, icon: Calendar, color: 'text-blue-500' },
            { label: 'Memories Shared', value: statsData?.postsCount || 12, icon: Sparkles, color: 'text-purple-500' },
            { label: 'Impact Score', value: '4.8/5', icon: TrendingUp, color: 'text-green-500' },
          ].map((metric) => (
            <div key={metric.label} className="text-center p-4 bg-white/50 rounded-lg border border-gray-200">
              <metric.icon className={`w-6 h-6 mx-auto mb-2 ${metric.color}`} />
              <div className="text-xl font-bold text-gray-900">{metric.value}</div>
              <div className="text-xs text-gray-600">{metric.label}</div>
            </div>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {engagementFeatures.map((feature) => (
        <Card key={feature.id} className="glassmorphic-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="border-turquoise-200 text-turquoise-700 hover:bg-turquoise-50"
              >
                View All
              </Button>
            </div>
            {feature.component}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};