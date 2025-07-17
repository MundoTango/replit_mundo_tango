import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Activity, CheckCircle2, Code2, FileText, AlertCircle, Monitor, Smartphone, Users, RefreshCw } from 'lucide-react';
import { JiraStyleItemDetailModal } from './JiraStyleItemDetailModal';
import { ProjectItem } from '@/data/comprehensive-project-data';
import { comprehensiveProjectData } from '@/data/comprehensive-project-data';
import { apiRequest } from '@/lib/queryClient';

interface DailyActivity {
  id: string;
  project_id: string;
  project_title: string; // Changed from project_name to match database field
  activity_type: 'created' | 'updated' | 'completed' | 'reviewed' | 'blocked';
  description: string;
  changes?: string[]; // Direct field instead of metadata.changes
  metadata: any;
  timestamp: string;
  created_at?: string;
}

interface ActivityItem {
  item: ProjectItem;
  type: 'created' | 'updated' | 'completed' | 'reviewed' | 'blocked';
  timestamp: Date;
  changes?: string[];
  rawData?: DailyActivity;
}

function DailyActivityView() {
  const [selectedItem, setSelectedItem] = useState<ProjectItem | null>(null);
  // Default to today's date - ensure it's today in local timezone
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  const [selectedDate, setSelectedDate] = useState(today);

  // Fetch daily activities from API - no date filtering, show all activities
  const { data: apiActivities = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/daily-activities'], // Remove date from cache key
    queryFn: async () => {
      const response = await apiRequest(
        'GET',
        `/api/daily-activities` // API returns all activities
      );
      const result = await response.json();
      // The API returns { success: true, data: [...] }
      return result.data || [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Convert API activities and merge with project data
  const todayActivities = useMemo(() => {
    const activities: ActivityItem[] = [];
    
    // Filter activities to only show selected date
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    const filteredActivities = apiActivities.filter((activity: DailyActivity) => {
      const activityDate = new Date(activity.timestamp).toISOString().split('T')[0];
      return activityDate === selectedDateStr;
    });
    


    // Process API activities
    filteredActivities.forEach((activity: DailyActivity) => {
      // Try to find matching project item from comprehensive data
      let projectItem: ProjectItem | undefined;
      
      // Search through project data to find matching item
      comprehensiveProjectData.forEach(section => {
        if (projectItem) return;
        
        const searchInChildren = (items: ProjectItem[]) => {
          items.forEach(item => {
            if (item.id === activity.project_id || item.title === activity.project_title) {
              projectItem = item;
              return;
            }
            if (item.children) {
              searchInChildren(item.children);
            }
          });
        };
        
        if (section.id === activity.project_id || section.title === activity.project_title) {
          projectItem = section;
        } else if (section.children) {
          searchInChildren(section.children);
        }
      });

      // Create activity item
      activities.push({
        item: projectItem || {
          id: activity.project_id,
          title: activity.project_title,
          description: activity.description,
          type: 'Feature',
          status: 'In Progress',
          completion: 50,
          priority: 'Medium',
          team: []
        },
        type: activity.activity_type,
        timestamp: new Date(activity.timestamp),
        changes: activity.changes || (activity.metadata?.changes) || [activity.description],
        rawData: activity
      });
    });

    // Remove duplicates based on project_id and description
    const uniqueActivities = new Map<string, ActivityItem>();
    activities.forEach(activity => {
      const key = `${activity.item.id}-${activity.item.description}`;
      if (!uniqueActivities.has(key)) {
        uniqueActivities.set(key, activity);
      }
    });

    // Convert back to array and sort by timestamp
    const dedupedActivities = Array.from(uniqueActivities.values());
    dedupedActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return dedupedActivities;
  }, [apiActivities, selectedDate]);

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
          <h2 className="text-2xl font-bold">Daily Activity</h2>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => {
              const newDate = new Date(e.target.value + 'T00:00:00');
              setSelectedDate(newDate);
            }}
            className="px-3 py-1 border rounded-md text-sm"
          />
          <Badge className="bg-blue-100 text-blue-800">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Badge>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
            title="Refresh activities"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
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
            {isLoading && <span className="text-sm font-normal text-gray-500">(Loading...)</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto" />
                <p className="text-gray-500">Loading activities...</p>
              </div>
            </div>
          ) : todayActivities.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <Activity className="h-8 w-8 text-gray-400 mx-auto" />
                <p className="text-gray-500">No activities recorded for this date</p>
                <p className="text-sm text-gray-400">Activities will appear here as you work on projects</p>
              </div>
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {selectedItem && (
        <JiraStyleItemDetailModal
          selectedItem={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

export default DailyActivityView;