import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/layouts/DashboardLayout';
import EnhancedProfileHeader from '@/components/profile/EnhancedProfileHeader';
import StoryHighlights from '@/components/profile/StoryHighlights';
import ProfileHead from '@/components/profile/ProfileHead';
import PostCard from '@/components/feed/post-card';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { GuestProfileDisplay } from '@/components/GuestProfile/GuestProfileDisplay';
import { Camera, Video, Users, Calendar, Star, UserCheck, Globe, PenLine } from 'lucide-react';
import { TravelDetailsComponent } from '@/components/profile/TravelDetailsComponent';
import { ProfileMemoryPostModal } from '@/components/profile/ProfileMemoryPostModal';

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('posts');
  const [showMemoryPostModal, setShowMemoryPostModal] = useState(false);

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

  // Fetch guest profile
  const { data: guestProfile, isLoading: guestProfileLoading } = useQuery({
    queryKey: ['/api/guest-profiles', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/guest-profiles`, {
        credentials: 'include'
      });
      const result = await response.json();
      return result.data;
    },
    enabled: !!user?.id && activeTab === 'guest-profile'
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
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Profile Header */}
        <EnhancedProfileHeader
          user={user}
          stats={statsData}
          isOwnProfile={true}
          onEditProfile={handleEditProfile}
        />

        {/* Story Highlights */}
        <div className="bg-white px-4 md:px-8">
          <StoryHighlights
            isOwnProfile={true}
            onAddHighlight={() => {
              toast({
                title: "Story Highlights",
                description: "Story highlight functionality coming soon."
              });
            }}
          />
        </div>

        {/* Profile Content Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
              <TabsTrigger 
                value="posts" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-turquoise-500 rounded-none px-6 py-4"
              >
                <span className="font-medium">Posts</span>
              </TabsTrigger>
              <TabsTrigger 
                value="events" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-turquoise-500 rounded-none px-6 py-4"
              >
                <Calendar className="mr-2 h-4 w-4" />
                <span className="font-medium">Events</span>
              </TabsTrigger>
              <TabsTrigger 
                value="travel" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-turquoise-500 rounded-none px-6 py-4"
              >
                <Globe className="mr-2 h-4 w-4" />
                <span className="font-medium">Travel</span>
              </TabsTrigger>
              <TabsTrigger 
                value="photos" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-turquoise-500 rounded-none px-6 py-4"
              >
                <Camera className="mr-2 h-4 w-4" />
                <span className="font-medium">Photos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="videos" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-turquoise-500 rounded-none px-6 py-4"
              >
                <Video className="mr-2 h-4 w-4" />
                <span className="font-medium">Videos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="friends" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-turquoise-500 rounded-none px-6 py-4"
              >
                <Users className="mr-2 h-4 w-4" />
                <span className="font-medium">Friends</span>
              </TabsTrigger>
              <TabsTrigger 
                value="experience" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-turquoise-500 rounded-none px-6 py-4"
              >
                <Star className="mr-2 h-4 w-4" />
                <span className="font-medium">Experience</span>
              </TabsTrigger>
              <TabsTrigger 
                value="guest-profile" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-turquoise-500 rounded-none px-6 py-4"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                <span className="font-medium">Guest Profile</span>
              </TabsTrigger>
            </TabsList>
            <div className="p-6">
              <TabsContent value="posts" className="space-y-4">
                {/* Memory Post Button */}
                <div className="flex justify-end mb-4">
                  <button 
                    onClick={() => setShowMemoryPostModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-turquoise-400 to-cyan-500 text-white rounded-lg hover:shadow-lg transform transition-all hover:-translate-y-0.5"
                  >
                    <PenLine className="w-4 h-4" />
                    Post a Memory
                  </button>
                </div>
                {postsLoading ? (
                  <div className="grid gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="glassmorphic-card">
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
                  <Card className="glassmorphic-card">
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
                <Card className="glassmorphic-card">
                  <CardContent className="p-12 text-center">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Tango Events</h3>
                    <p className="text-gray-600">
                      Your upcoming milongas, workshops, and events will appear here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="travel" className="space-y-4">
                <TravelDetailsComponent 
                  userId={user?.id || 0} 
                  isOwnProfile={true} 
                />
              </TabsContent>

              <TabsContent value="photos" className="space-y-4">
                <Card className="glassmorphic-card">
                  <CardContent className="p-12 text-center">
                    <Camera className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Photo Gallery</h3>
                    <p className="text-gray-600">
                      Your tango photos will appear here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="videos" className="space-y-4">
                <Card className="glassmorphic-card">
                  <CardContent className="p-12 text-center">
                    <Video className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Video Showcase</h3>
                    <p className="text-gray-600">
                      Your tango videos and performances will appear here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="friends" className="space-y-4">
                <Card className="glassmorphic-card">
                  <CardContent className="p-12 text-center">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Friends & Connections</h3>
                    <p className="text-gray-600">
                      Your tango friends and dance partners will appear here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="experience" className="space-y-4">
                <Card className="glassmorphic-card">
                  <CardContent className="p-12 text-center">
                    <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Tango Experience</h3>
                    <p className="text-gray-600">
                      Your tango journey, achievements, and milestones will appear here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="guest-profile" className="space-y-4">
                {guestProfileLoading ? (
                  <Card className="glassmorphic-card">
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ) : guestProfile ? (
                  <GuestProfileDisplay 
                    profile={guestProfile} 
                    isOwnProfile={true}
                  />
                ) : (
                  <Card className="glassmorphic-card">
                    <CardContent className="p-12 text-center">
                      <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Guest Profile</h3>
                      <p className="text-gray-600 mb-4">
                        Create your guest profile to start browsing and requesting stays with hosts.
                      </p>
                      <a href="/guest-onboarding" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700">
                        Create Guest Profile
                      </a>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
      
      {/* Memory Post Modal */}
      <ProfileMemoryPostModal
        isOpen={showMemoryPostModal}
        onClose={() => setShowMemoryPostModal(false)}
        onMemoryCreated={() => {
          setShowMemoryPostModal(false);
          queryClient.invalidateQueries({ queryKey: ['/api/user/posts'] });
          toast({
            title: "Memory Posted!",
            description: "Your memory has been shared successfully.",
          });
        }}
      />
    </DashboardLayout>
  );
}