import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/layouts/DashboardLayout';
import ProfileHead from '@/components/profile/ProfileHead';
import PostCard from '@/components/feed/post-card';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('posts');

  // Fetch user posts
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['/api/user/posts', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/user/posts`, {
        credentials: 'include'
      });
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!user?.id
  });

  // Fetch user stats
  const { data: statsData } = useQuery({
    queryKey: ['/api/user/stats', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/user/stats`, {
        credentials: 'include'
      });
      const result = await response.json();
      return result.data || {};
    },
    enabled: !!user?.id
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleEditProfile = () => {
    toast({
      title: "Edit Profile",
      description: "Profile editing functionality coming soon.",
    });
  };

  const handleAddTravelDetails = () => {
    toast({
      title: "Travel Details",
      description: "Travel details functionality coming soon.",
    });
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Profile Head Component */}
        <ProfileHead
          user={user}
          stats={statsData}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onEditProfile={handleEditProfile}
          onAddTravelDetails={handleAddTravelDetails}
        />

        {/* Profile Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="posts" className="space-y-4">
            {postsLoading ? (
              <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : postsData?.length > 0 ? (
              <div className="space-y-4">
                {postsData.map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600">
                    Start sharing your tango journey by creating your first post.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardContent className="p-12 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Events</h3>
                <p className="text-gray-600">
                  Your tango events and RSVPs will appear here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="followers" className="space-y-4">
            <Card>
              <CardContent className="p-12 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Followers</h3>
                <p className="text-gray-600">
                  Your followers and connections will appear here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="following" className="space-y-4">
            <Card>
              <CardContent className="p-12 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Following</h3>
                <p className="text-gray-600">
                  People you follow will appear here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            <Card>
              <CardContent className="p-12 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Media</h3>
                <p className="text-gray-600">
                  Your photos and videos will appear here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experience" className="space-y-4">
            <Card>
              <CardContent className="p-12 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Experience</h3>
                <p className="text-gray-600">
                  Your tango experience and achievements will appear here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}