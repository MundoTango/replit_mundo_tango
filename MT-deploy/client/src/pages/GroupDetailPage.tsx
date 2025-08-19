import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import DashboardLayout from '@/layouts/DashboardLayout';
import { 
  ArrowLeft, MapPin, Users, Globe, Lock, Calendar, MessageCircle, 
  Camera, Settings, UserPlus, Heart, Share2, MoreVertical, Flag,
  Image, Video, FileText, Link as LinkIcon, UserCheck, UserX,
  Star, Clock, Info, Home, Music, BookOpen, Trophy, Zap
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import '../styles/ttfiles.css';
import '../styles/mt-group.css';

export default function GroupDetailPage() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('about');

  // Fetch group details with members
  const { data: response, isLoading, error } = useQuery({
    queryKey: [`/api/groups/${slug}`],
    enabled: !!slug,
    retry: 2,
  });

  // Extract group data from API response
  const group = response?.data;
  
  // Check if user is member/admin
  const isMember = group?.members?.some(m => m.user.id === user?.id) || false;
  const isAdmin = group?.members?.some(m => m.user.id === user?.id && m.role === 'admin') || false;
  const memberRole = group?.members?.find(m => m.user.id === user?.id)?.role || 'member';

  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/user/join-group/${slug}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to join group');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Joined successfully!',
        description: `You are now a member of ${group?.name}`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${slug}`] });
    },
  });

  // Leave group mutation
  const leaveGroupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/user/leave-group/${slug}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to leave group');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Left group',
        description: `You have left ${group?.name}`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${slug}`] });
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!group) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">Group not found</h2>
          <p className="text-gray-600 mb-4">This group may have been removed or you don't have access.</p>
          <Button onClick={() => setLocation('/groups')}>Back to Groups</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* MT Group Header */}
        <div className="mt-group-header">
          {group.coverImage && (
            <img 
              src={group.coverImage} 
              alt={group.name}
              className="mt-group-cover"
            />
          )}
          
          <div className="mt-group-header-content">
            <button
              onClick={() => setLocation('/groups')}
              className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Groups
            </button>

            <div className="flex items-end gap-3">
              <div className="w-20 h-20 bg-white rounded-full border-4 border-white shadow-lg">
                {group.imageUrl ? (
                  <img src={group.imageUrl} alt={group.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                    {group.emoji || group.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold">{group.name}</h1>
                <div className="flex items-center gap-4 text-gray-600 text-sm mt-1">
                  <span className="flex items-center gap-1">
                    {group.privacy === 'public' ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    {group.privacy === 'public' ? 'Public' : 'Private'} Group
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {group.memberCount || 0} members
                  </span>
                  {group.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {group.city}{group.country ? `, ${group.country}` : ''}
                    </span>
                  )}
                </div>
              </div>

                <div className="flex gap-2">
                  {group.isMember ? (
                    <>
                      <Button
                        onClick={() => leaveGroupMutation.mutate()}
                        variant="outline"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        Leave Group
                      </Button>
                      {group.isAdmin && (
                        <Button
                          onClick={() => setLocation(`/groups/${slug}/edit`)}
                          className="bg-white text-gray-900 hover:bg-gray-100"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      onClick={() => joinGroupMutation.mutate()}
                      className="bg-white text-gray-900 hover:bg-gray-100"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Join Group
                    </Button>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Flag className="h-4 w-4 mr-2" />
                        Report
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {group.description && (
          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-gray-600">{group.description}</p>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="discussion">Discussion</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="discussion" className="space-y-4">
            {/* Create Post */}
            {group.isMember && (
              <Card className="p-4">
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarImage src="/api/placeholder/40/40" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <button className="w-full text-left px-4 py-2 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200">
                      Share something with the group...
                    </button>
                    <div className="flex gap-2 mt-2">
                      <Button variant="ghost" size="sm">
                        <Image className="h-4 w-4 mr-2" />
                        Photo
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="h-4 w-4 mr-2" />
                        Video
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Event
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Posts */}
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar>
                      <AvatarImage src={`/api/placeholder/40/40?${i}`} />
                      <AvatarFallback>M{i}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold">Member {i}</h4>
                      <p className="text-sm text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <p className="mb-4">
                    Just had an amazing practice session! Working on my ochos and feeling great progress. 
                    Who else is practicing today? 💃
                  </p>
                  <div className="flex items-center gap-4 text-gray-500">
                    <button className="flex items-center gap-1 hover:text-red-500">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">12</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-blue-500">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">5</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-green-500">
                      <Share2 className="h-4 w-4" />
                      <span className="text-sm">Share</span>
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="members">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`/api/placeholder/48/48?${i}`} />
                      <AvatarFallback>M{i}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold">Member {i}</h4>
                      <p className="text-sm text-gray-500">Joined 2 months ago</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events">
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No upcoming events</p>
              {group.isMember && (
                <Button className="mt-4">Create Event</Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="media">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                  <img 
                    src={`/api/placeholder/300/300?${i}`} 
                    alt={`Media ${i}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="about">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Group Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p>{new Date(group.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="capitalize">{group.type}</p>
                </div>
                {group.rules && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Group Rules</p>
                    <p className="whitespace-pre-wrap">{group.rules}</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}