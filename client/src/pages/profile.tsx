import React, { useState, useEffect } from 'react';
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
import { UserPhotosGallery } from '@/components/profile/UserPhotosGallery';
import { UserVideosGallery } from '@/components/profile/UserVideosGallery';
import { UserFriendsList } from '@/components/profile/UserFriendsList';
import { UserEventsList } from '@/components/profile/UserEventsList';

// Phase 5: Production Hardening imports
import ProfileErrorBoundary from '@/components/profile/ProfileErrorBoundary';
import { withRetry, withTimeout } from '@/utils/retryLogic';
import { measureComponentRender, measureApiCall } from '@/utils/performanceMonitor';
import { 
  ProfileHeaderFallback, 
  PostsFallback, 
  TravelDetailsFallback,
  EventsFallback,
  PhotosFallback,
  VideosFallback,
  FriendsFallback,
  ExperienceFallback,
  GuestProfileFallback,
  OfflineIndicator,
  NetworkErrorRetry
} from '@/components/profile/ProfileFallbacks';

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('posts');
  const [showMemoryPostModal, setShowMemoryPostModal] = useState(false);

  // Track component performance
  useEffect(() => {
    const stopMeasure = measureComponentRender('Profile');
    return () => stopMeasure();
  }, []);

  // Check online status
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch user posts with retry logic
  const { data: postsData, isLoading: postsLoading, error: postsError } = useQuery({
    queryKey: ['/api/user/posts', user?.id],
    queryFn: async () => {
      const tracker = measureApiCall('/api/user/posts');
      try {
        const response = await withRetry(
          () => withTimeout(
            () => fetch(`/api/user/posts`, { credentials: 'include' }),
            5000 // 5 second timeout
          )
        );
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        tracker.complete(response.status);
        return result.data || [];
      } catch (error) {
        tracker.error(error);
        throw error;
      }
    },
    enabled: !!user?.id,
    retry: false // We handle retry ourselves
  });

  // Fetch user stats with retry logic
  const { data: statsData, error: statsError } = useQuery({
    queryKey: ['/api/user/stats', user?.id],
    queryFn: async () => {
      const tracker = measureApiCall('/api/user/stats');
      try {
        const response = await withRetry(
          () => withTimeout(
            () => fetch(`/api/user/stats`, { credentials: 'include' }),
            5000
          )
        );
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        tracker.complete(response.status);
        return result.data || {};
      } catch (error) {
        tracker.error(error);
        throw error;
      }
    },
    enabled: !!user?.id,
    retry: false
  });

  // Fetch guest profile with retry logic
  const { data: guestProfile, isLoading: guestProfileLoading, error: guestProfileError } = useQuery({
    queryKey: ['/api/guest-profiles', user?.id],
    queryFn: async () => {
      const tracker = measureApiCall('/api/guest-profiles');
      try {
        const response = await withRetry(
          () => withTimeout(
            () => fetch(`/api/guest-profiles`, { credentials: 'include' }),
            5000
          )
        );
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        tracker.complete(response.status);
        return result.data;
      } catch (error) {
        tracker.error(error);
        throw error;
      }
    },
    enabled: !!user?.id && activeTab === 'guest-profile',
    retry: false
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
    <ProfileErrorBoundary>
      <DashboardLayout>
        {/* Offline Indicator */}
        {!isOnline && <OfflineIndicator />}
        
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Profile Header with Fallback */}
          {statsError ? (
            <ProfileHeaderFallback />
          ) : (
            <EnhancedProfileHeader
              user={user}
              stats={statsData}
              isOwnProfile={true}
              onEditProfile={handleEditProfile}
            />
          )}

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
                {postsError ? (
                  <NetworkErrorRetry onRetry={() => queryClient.invalidateQueries({ queryKey: ['/api/user/posts'] })} />
                ) : postsLoading ? (
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
                <EventsFallback />
              </TabsContent>

              <TabsContent value="travel" className="space-y-4">
                <TravelDetailsComponent 
                  userId={user?.id || 0} 
                  isOwnProfile={true} 
                />
              </TabsContent>

              <TabsContent value="photos" className="space-y-4">
                <UserPhotosGallery userId={user?.id || 0} isOwnProfile={true} />
              </TabsContent>

              <TabsContent value="videos" className="space-y-4">
                <UserVideosGallery userId={user?.id || 0} isOwnProfile={true} />
              </TabsContent>

              <TabsContent value="friends" className="space-y-4">
                <UserFriendsList userId={user?.id || 0} isOwnProfile={true} />
              </TabsContent>

              <TabsContent value="experience" className="space-y-4">
                <UserEventsList userId={user?.id || 0} isOwnProfile={true} />
              </TabsContent>

              <TabsContent value="guest-profile" className="space-y-4">
                {guestProfileError ? (
                  <NetworkErrorRetry onRetry={() => queryClient.invalidateQueries({ queryKey: ['/api/guest-profiles'] })} />
                ) : guestProfileLoading ? (
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
    </ProfileErrorBoundary>
  );
}