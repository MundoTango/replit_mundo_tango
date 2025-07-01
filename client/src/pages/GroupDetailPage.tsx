import React, { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, MapPin, Users, Heart, MessageCircle, Share, UserPlus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import EnhancedPostItem from '@/components/moments/EnhancedPostItem';
import DashboardLayout from '../layouts/DashboardLayout';

interface GroupMember {
  id: number;
  name: string;
  username: string;
  profileImage?: string;
  role: string;
  joinedAt: string;
}

interface GroupEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  attendeeCount: number;
  organizer: {
    name: string;
    avatar?: string;
  };
}

interface GroupMemory {
  id: number;
  content: string;
  author: {
    name: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
  images?: string[];
}

interface GroupDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  city: string;
  country: string;
  memberCount: number;
  isPrivate: boolean;
  coverImage?: string;
  imageUrl?: string; // City photo URL for backward compatibility
  emoji: string;
  isJoined: boolean;
  userRole?: string;
  members: GroupMember[];
  recentEvents: GroupEvent[];
  recentMemories: GroupMemory[];
}

const GroupDetailPage: React.FC = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: groupData, isLoading } = useQuery<{ data: GroupDetail }>({
    queryKey: ['/api/groups', slug],
    queryFn: async () => {
      const response = await fetch(`/api/groups/${slug}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch group details');
      }
      return response.json();
    },
    enabled: !!slug
  });

  const joinGroupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/user/join-group/${slug}`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to join group');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You've joined the group successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/groups', slug] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to join group. Please try again.",
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!groupData?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Group not found</h2>
          <p className="text-gray-600">The group you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const group = groupData.data;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Banner with City Photo */}
      <div className="relative h-80 bg-gradient-to-r from-pink-500 to-purple-600 overflow-hidden">
        {(group.coverImage || group.imageUrl) && (
          <img
            src={group.coverImage || group.imageUrl}
            alt={group.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        
        {/* City Name Overlay at Top */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          <div className="text-center">
            <h2 className="text-5xl font-bold text-white drop-shadow-2xl tracking-wide">
              {group.city}
            </h2>
            <p className="text-xl text-white/90 drop-shadow-lg mt-2 font-medium">
              {group.country}
            </p>
          </div>
        </div>
        
        {/* Group Info at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-lg">
                {group.emoji || '🏙️'}
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold drop-shadow-lg">{group.name}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{group.memberCount} members</span>
                  </div>
                  {group.isPrivate && (
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      Private
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="memories">Memories</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center space-x-3">
              {group.isJoined ? (
                <div className="flex items-center space-x-2">
                  <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                    ✓ Member
                  </Badge>
                  {group.userRole && (
                    <Badge variant="outline">{group.userRole}</Badge>
                  )}
                </div>
              ) : (
                <Button
                  onClick={() => joinGroupMutation.mutate()}
                  disabled={joinGroupMutation.isPending}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {group.isPrivate ? 'Request to Join' : 'Join Group'}
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="overview" className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">About</h3>
              <p className="text-gray-600 leading-relaxed">
                {group.description}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{group.memberCount}</div>
                <div className="text-sm text-gray-600">Members</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <Calendar className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{group.recentEvents?.length || 0}</div>
                <div className="text-sm text-gray-600">Upcoming Events</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <MessageCircle className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{group.recentMemories?.length || 0}</div>
                <div className="text-sm text-gray-600">Recent Memories</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="events">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-6">Upcoming Events</h3>
              {group.recentEvents?.length > 0 ? (
                <div className="space-y-4">
                  {group.recentEvents.map((event) => (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{event.title}</h4>
                          <p className="text-gray-600 text-sm mt-1">{event.description}</p>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{event.attendeeCount} attending</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Event
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No upcoming events</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="members">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-6">Members ({group.memberCount})</h3>
              {group.members?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {member.profileImage ? (
                          <img src={member.profileImage} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          member.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                        <p className="text-xs text-gray-500 truncate">@{member.username}</p>
                        <Badge variant="outline" className="text-xs mt-1">{member.role}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No members to display</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="memories">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-6">Recent Memories</h3>
              {group.recentMemories?.length > 0 ? (
                <div className="space-y-6">
                  {group.recentMemories.map((memory) => {
                    const transformedPost = {
                      id: memory.id,
                      content: memory.content,
                      imageUrl: memory.images?.[0] || null,
                      videoUrl: null,
                      userId: memory.author.username,
                      createdAt: memory.createdAt,
                      user: {
                        name: memory.author.name,
                        username: memory.author.username,
                        profileImage: memory.author.avatar
                      },
                      likes: memory.likes || 0,
                      comments: memory.comments || 0,
                      isLiked: false,
                      hashtags: [],
                      location: null,
                      hasConsent: true,
                      mentions: [],
                      emotionTags: []
                    };
                    
                    return (
                      <EnhancedPostItem 
                        key={memory.id} 
                        post={transformedPost}
                        onLike={(postId: number) => {
                          console.log('Liked memory:', postId);
                        }}
                        onShare={(post: any) => {
                          console.log('Shared memory:', post);
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No memories shared yet</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </DashboardLayout>
  );
};

export default GroupDetailPage;