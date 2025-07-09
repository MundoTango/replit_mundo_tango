import { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Calendar, Image, MapPin, UserPlus, Bell, BellOff } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

interface GroupDetail {
  id: number;
  name: string;
  slug: string;
  type: string;
  emoji: string;
  imageUrl?: string;
  description?: string;
  city?: string;
  country?: string;
  memberCount: number;
  eventCount?: number;
  isJoined: boolean;
  userRole?: string;
  isPublic: boolean;
  createdAt: string;
  members?: any[];
  recentEvents?: any[];
  recentMemories?: any[];
}

export default function GroupDetailPage() {
  const { slug } = useParams();
  const queryClient = useQueryClient();

  // Fetch group details
  const { data: group, isLoading } = useQuery({
    queryKey: [`/api/groups/${slug}`],
    enabled: !!slug,
  });

  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/groups/${slug}/join`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${slug}`] });
      toast({
        title: 'Success',
        description: 'You have joined the group!',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to join group',
        variant: 'destructive'
      });
    }
  });

  // Leave group mutation
  const leaveGroupMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/groups/${slug}/leave`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${slug}`] });
      toast({
        title: 'Success',
        description: 'You have left the group',
      });
    }
  });

  // Follow group mutation
  const followGroupMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/groups/${slug}/follow`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${slug}`] });
      toast({
        title: 'Success',
        description: 'You are now following this group!',
      });
    }
  });

  // Unfollow group mutation
  const unfollowGroupMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/groups/${slug}/unfollow`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${slug}`] });
      toast({
        title: 'Success',
        description: 'You have unfollowed this group',
      });
    }
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!group?.data) {
    return (
      <DashboardLayout>
        <Card className="max-w-md mx-auto mt-20">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Group not found</h2>
            <p className="text-muted-foreground mb-4">The group you're looking for doesn't exist.</p>
            <Link href="/groups">
              <Button>Back to Groups</Button>
            </Link>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const groupData = group.data as GroupDetail;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="relative h-64 rounded-xl overflow-hidden mb-8">
          <img 
            src={groupData.imageUrl || 'https://images.pexels.com/photos/1701194/pexels-photo-1701194.jpeg'} 
            alt={groupData.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <span className="text-5xl">{groupData.emoji}</span>
              {groupData.name}
            </h1>
            {groupData.city && (
              <p className="text-xl mt-2 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {groupData.city}, {groupData.country}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Members</p>
                      <p className="text-3xl font-bold">{groupData.memberCount || groupData.members?.length || 0}</p>
                    </div>
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Events</p>
                      <p className="text-3xl font-bold">{groupData.eventCount || groupData.recentEvents?.length || 0}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            {groupData.description && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-3">About</h2>
                  <p className="text-muted-foreground">{groupData.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  <p className="text-center text-muted-foreground py-8">
                    No recent activity to show
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Actions</h3>
                <div className="space-y-3">
                  {groupData.isJoined ? (
                    <Button 
                      onClick={() => leaveGroupMutation.mutate()}
                      disabled={leaveGroupMutation.isPending}
                      variant="outline"
                      className="w-full"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Leave Group
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => joinGroupMutation.mutate()}
                      disabled={joinGroupMutation.isPending}
                      className="w-full"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Join Group
                    </Button>
                  )}

                  {!groupData.isJoined && (
                    <Button 
                      onClick={() => followGroupMutation.mutate()}
                      disabled={followGroupMutation.isPending}
                      variant="outline"
                      className="w-full"
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Follow for Updates
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Group Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Group Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="capitalize">{groupData.type} Group</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Privacy</span>
                    <span>{groupData.isPublic ? 'Public' : 'Private'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>{new Date(groupData.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}