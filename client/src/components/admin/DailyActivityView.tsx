import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Activity, CheckCircle2, AlertCircle, Code2, Users, Monitor, Smartphone, FileText } from 'lucide-react';
import { comprehensiveProjectData, ProjectItem } from '@/../../COMPREHENSIVE_PROJECT_DATA';
import JiraStyleItemDetailModal from './JiraStyleItemDetailModal';

interface ActivityItem {
  item: ProjectItem;
  type: 'created' | 'updated' | 'completed' | 'reviewed' | 'blocked';
  timestamp: Date;
  changes?: string[];
}

const DailyActivityView: React.FC = () => {
  const [selectedItem, setSelectedItem] = React.useState<ProjectItem | null>(null);

  // Mock today's activities - in production this would come from an API
  const todayActivities = useMemo<ActivityItem[]>(() => {
    const activities: ActivityItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Ensure data exists before accessing
    if (!comprehensiveProjectData || comprehensiveProjectData.length === 0) {
      return [];
    }

    // Simulate activities based on recent work
    const recentItems: { item: ProjectItem; type: ActivityItem['type']; changes?: string[] }[] = [];

    // Add Life CEO System activity
    if (comprehensiveProjectData[0]) {
      recentItems.push({
        item: comprehensiveProjectData[0],
        type: 'updated',
        changes: ['Added 23L Framework documentation', 'Enhanced project hierarchy visualization']
      });

      // Add Business Agent activity
      if (comprehensiveProjectData[0].children?.[0]?.children?.[0]) {
        recentItems.push({
          item: comprehensiveProjectData[0].children[0].children[0],
          type: 'reviewed',
          changes: ['Reviewed agent intelligence implementation', 'Validated memory system integration']
        });
      }
    }

    // Add Multi-step Registration activity
    if (comprehensiveProjectData[1]?.children?.[0]?.children?.[0]) {
      recentItems.push({
        item: comprehensiveProjectData[1].children[0].children[0],
        type: 'completed',
        changes: ['Fixed infinite re-render bug', 'Enhanced role selection UI']
      });
    }

    // Add Voice Processing activity
    if (comprehensiveProjectData[0]?.children?.[3]) {
      recentItems.push({
        item: comprehensiveProjectData[0].children[3],
        type: 'updated',
        changes: ['Enhanced audio processing pipeline', 'Added noise suppression']
      });
    }

    // Add TypeScript Infrastructure activity
    if (comprehensiveProjectData[2]?.children?.[2]) {
      recentItems.push({
        item: comprehensiveProjectData[2].children[2],
        type: 'completed',
        changes: ['Resolved all 83 TypeScript errors', 'Enhanced type safety']
      });
    }

    // Add timestamps
    recentItems.forEach((activity, index) => {
      const timestamp = new Date();
      timestamp.setHours(9 + index * 2, Math.floor(Math.random() * 60), 0, 0);
      activities.push({
        ...activity,
        timestamp
      });
    });

    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, []);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'created': return <Activity className="h-4 w-4 text-green-500" />;
      case 'updated': return <Code2 className="h-4 w-4 text-blue-500" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'reviewed': return <FileText className="h-4 w-4 text-purple-500" />;
      case 'blocked': return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'created': return 'bg-green-100 text-green-800';
      case 'updated': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'reviewed': return 'bg-purple-100 text-purple-800';
      case 'blocked': return 'bg-red-100 text-red-800';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const stats = useMemo(() => {
    const completed = todayActivities.filter(a => a.type === 'completed').length;
    const updated = todayActivities.filter(a => a.type === 'updated').length;
    const reviewed = todayActivities.filter(a => a.type === 'reviewed').length;
    const total = todayActivities.length;

    return { completed, updated, reviewed, total };
  }, [todayActivities]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Today's Activity</h2>
          <Badge className="bg-blue-100 text-blue-800">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-emerald-50">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {stats.completed} Completed
          </Badge>
          <Badge variant="outline" className="bg-blue-50">
            <Code2 className="h-3 w-3 mr-1" />
            {stats.updated} Updated
          </Badge>
          <Badge variant="outline" className="bg-purple-50">
            <FileText className="h-3 w-3 mr-1" />
            {stats.reviewed} Reviewed
          </Badge>
        </div>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayActivities.map((activity, index) => (
              <div 
                key={index} 
                className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedItem(activity.item)}
              >
                {/* Time */}
                <div className="flex-none text-sm text-gray-500 w-20">
                  {formatTime(activity.timestamp)}
                </div>

                {/* Activity Icon */}
                <div className="flex-none">
                  {getActivityIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{activity.item.title}</h4>
                      <p className="text-sm text-gray-600">{activity.item.description}</p>
                    </div>
                    <Badge className={getActivityColor(activity.type)}>
                      {activity.type}
                    </Badge>
                  </div>

                  {/* Changes */}
                  {activity.changes && activity.changes.length > 0 && (
                    <ul className="text-sm text-gray-600 space-y-1">
                      {activity.changes.map((change, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-gray-400 rounded-full" />
                          {change}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Progress */}
                  <div className="flex gap-4 items-center text-xs">
                    {activity.item.completion !== undefined && (
                      <div className="flex items-center gap-2">
                        <Monitor className="h-3 w-3 text-gray-500" />
                        <Progress value={activity.item.completion} className="h-1.5 w-16" />
                        <span className="text-gray-600">{activity.item.completion}%</span>
                      </div>
                    )}
                    {activity.item.mobileCompletion !== undefined && (
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-3 w-3 text-gray-500" />
                        <Progress value={activity.item.mobileCompletion} className="h-1.5 w-16" />
                        <span className="text-gray-600">{activity.item.mobileCompletion}%</span>
                      </div>
                    )}
                    {activity.item.team && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">{activity.item.team.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <JiraStyleItemDetailModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
};

export default DailyActivityView;