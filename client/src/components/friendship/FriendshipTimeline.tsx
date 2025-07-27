import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Music, Heart, MessageCircle, Camera, Users, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface TimelineEvent {
  id: string;
  type: 'dance' | 'message' | 'event' | 'post' | 'became_friends' | 'photo' | 'milestone';
  title: string;
  description?: string;
  date: Date;
  location?: string;
  metadata?: {
    eventId?: number;
    postId?: number;
    photoUrl?: string;
    danceRating?: number;
    songName?: string;
    milestoneType?: string;
  };
  icon: React.FC<{ className?: string }>;
  color: string;
}

interface FriendshipTimelineProps {
  friendId: number;
  friendName: string;
  friendImage?: string;
}

export function FriendshipTimeline({ friendId, friendName, friendImage }: FriendshipTimelineProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const { data: timeline, isLoading } = useQuery({
    queryKey: ['/api/friendship/timeline', friendId],
    queryFn: async () => {
      const response = await fetch(`/api/friendship/timeline/${friendId}`);
      if (!response.ok) throw new Error('Failed to fetch timeline');
      return response.json();
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/friendship/stats', friendId],
    queryFn: async () => {
      const response = await fetch(`/api/friendship/stats/${friendId}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    }
  });

  const getEventIcon = (type: string) => {
    const icons = {
      dance: Music,
      message: MessageCircle,
      event: Calendar,
      post: Camera,
      became_friends: Users,
      photo: Camera,
      milestone: Award
    };
    return icons[type as keyof typeof icons] || Calendar;
  };

  const getEventColor = (type: string) => {
    const colors = {
      dance: 'from-pink-400 to-rose-500',
      message: 'from-blue-400 to-indigo-500',
      event: 'from-green-400 to-emerald-500',
      post: 'from-purple-400 to-violet-500',
      became_friends: 'from-turquoise-400 to-cyan-500',
      photo: 'from-amber-400 to-orange-500',
      milestone: 'from-red-400 to-pink-500'
    };
    return colors[type as keyof typeof colors] || 'from-gray-400 to-gray-500';
  };

  const filteredTimeline = timeline?.events?.filter((event: TimelineEvent) => 
    selectedFilter === 'all' || event.type === selectedFilter
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card className="p-6 glassmorphic-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={friendImage} alt={friendName} />
              <AvatarFallback>{friendName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
                {friendName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Friends since {stats?.friendsSince ? format(new Date(stats.friendsSince), 'MMMM yyyy') : 'recently'}
              </p>
            </div>
          </div>
          
          {stats && (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-turquoise-600">{stats.totalDances || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Dances</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-cyan-600">{stats.sharedEvents || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Events</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.totalInteractions || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Interactions</div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Filter Tabs */}
      <Tabs value={selectedFilter} onValueChange={setSelectedFilter} className="w-full">
        <TabsList className="grid grid-cols-7 w-full glassmorphic-card">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="dance">Dances</TabsTrigger>
          <TabsTrigger value="event">Events</TabsTrigger>
          <TabsTrigger value="message">Messages</TabsTrigger>
          <TabsTrigger value="post">Posts</TabsTrigger>
          <TabsTrigger value="photo">Photos</TabsTrigger>
          <TabsTrigger value="milestone">Milestones</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-turquoise-400 to-cyan-500 opacity-30" />

        {/* Timeline Events */}
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-20 w-full rounded-lg" />
                </div>
              </div>
            ))
          ) : filteredTimeline.length === 0 ? (
            <Card className="p-8 text-center glassmorphic-card">
              <p className="text-gray-500 dark:text-gray-400">
                No {selectedFilter === 'all' ? 'activities' : selectedFilter} recorded yet
              </p>
            </Card>
          ) : (
            filteredTimeline.map((event: TimelineEvent, index: number) => {
              const Icon = getEventIcon(event.type);
              const color = getEventColor(event.type);
              
              return (
                <div key={event.id} className="relative flex gap-4">
                  {/* Timeline Icon */}
                  <div className={`
                    relative z-10 w-16 h-16 rounded-full flex items-center justify-center
                    bg-gradient-to-r ${color} shadow-lg
                    transform transition-transform hover:scale-110
                  `}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Event Card */}
                  <Card className={`
                    flex-1 p-4 glassmorphic-card hover:shadow-xl transition-shadow
                    ${index === 0 ? 'border-2 border-turquoise-400/50' : ''}
                  `}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        {event.location && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </p>
                        )}
                      </div>
                      <time className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(event.date), 'MMM d, yyyy')}
                      </time>
                    </div>

                    {event.description && (
                      <p className="text-gray-700 dark:text-gray-300 mb-2">{event.description}</p>
                    )}

                    {/* Event-specific content */}
                    {event.type === 'dance' && event.metadata?.danceRating && (
                      <div className="flex items-center gap-2 mt-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Heart
                            key={i}
                            className={`w-4 h-4 ${
                              i < (event.metadata?.danceRating || 0)
                                ? 'text-red-500 fill-red-500' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        {event.metadata.songName && (
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                            • {event.metadata.songName}
                          </span>
                        )}
                      </div>
                    )}

                    {event.metadata?.photoUrl && (
                      <img 
                        src={event.metadata.photoUrl} 
                        alt={event.title}
                        className="mt-3 rounded-lg w-full max-w-xs object-cover"
                      />
                    )}

                    {event.type === 'milestone' && event.metadata?.milestoneType && (
                      <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-amber-400 to-orange-500 text-white">
                        <Award className="w-3 h-3 mr-1" />
                        {event.metadata.milestoneType}
                      </div>
                    )}
                  </Card>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}