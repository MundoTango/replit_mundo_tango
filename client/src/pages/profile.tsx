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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { GuestProfileDisplay } from '@/components/GuestProfile/GuestProfileDisplay';
import { Camera, Video, Users, Calendar, Star, UserCheck, Globe, PenLine, UserCircle } from 'lucide-react';
import { TravelDetailsComponent } from '@/components/profile/TravelDetailsComponent';
import { ProfileMemoryPostModal } from '@/components/profile/ProfileMemoryPostModal';
import { UserPhotosGallery } from '@/components/profile/UserPhotosGallery';
import { UserVideosGallery } from '@/components/profile/UserVideosGallery';
import { UserFriendsList } from '@/components/profile/UserFriendsList';
import { UserEventsList } from '@/components/profile/UserEventsList';
import { ProfileAboutSection } from '@/components/profile/ProfileAboutSection';

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
  const [activeTab, setActiveTab] = useState('about');
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

        {/* Story Highlights - REMOVED per user request */}

        {/* Profile Content Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
              <TabsTrigger 
                value="about" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-turquoise-500 rounded-none px-6 py-4"
              >
                <UserCircle className="mr-2 h-4 w-4" />
                <span className="font-medium">About</span>
              </TabsTrigger>
              <TabsTrigger 
                value="posts" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-turquoise-500 rounded-none px-6 py-4"
              >
                <span className="font-medium">Memories</span>
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
              <TabsContent value="about" className="space-y-4">
                <ProfileAboutSection 
                  user={user} 
                  isOwnProfile={true}
                  currentUserId={user?.id}
                  isFriend={false}
                />
              </TabsContent>
              
              <TabsContent value="posts" className="space-y-4">
                {/* Brief About Section */}
                <Card className="glassmorphic-card mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">About</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setActiveTab('about')}
                        className="text-turquoise-600 hover:text-turquoise-700"
                      >
                        See more
                      </Button>
                    </div>
                    <p className="text-gray-600 line-clamp-3">
                      {user?.bio || "Welcome to my Mundo Tango profile! I'm passionate about tango and connecting with dancers worldwide."}
                    </p>
                  </CardContent>
                </Card>

                {/* Brief Travel Section */}
                <Card className="glassmorphic-card mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">Travel</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setActiveTab('travel')}
                        className="text-turquoise-600 hover:text-turquoise-700"
                      >
                        See more
                      </Button>
                    </div>
                    <p className="text-gray-600">
                      {user?.city ? `Currently in ${user.city}${user.country ? `, ${user.country}` : ''}` : "Location not specified"}
                    </p>
                  </CardContent>
                </Card>

                {/* Brief Friends Section */}
                <Card className="glassmorphic-card mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">Friends</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setActiveTab('friends')}
                        className="text-turquoise-600 hover:text-turquoise-700"
                      >
                        See more
                      </Button>
                    </div>
                    <p className="text-gray-600">
                      {statsData?.friendsCount ? `${statsData.friendsCount} friends in the tango community` : "Building connections in the tango community"}
                    </p>
                  </CardContent>
                </Card>
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
                {/* Enhanced Events Section */}
                <Card className="glassmorphic-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
                        Tango Events
                      </h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-turquoise-200 text-turquoise-700 hover:bg-turquoise-50"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Create Event
                      </Button>
                    </div>
                    
                    {/* Event Categories */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card className="bg-gradient-to-br from-turquoise-50 to-cyan-50 border-turquoise-200">
                        <CardContent className="p-4 text-center">
                          <Calendar className="w-8 h-8 mx-auto text-turquoise-600 mb-2" />
                          <h4 className="font-semibold text-turquoise-800">Upcoming Events</h4>
                          <p className="text-turquoise-600 text-sm">{statsData?.eventsCount || 0} events</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
                        <CardContent className="p-4 text-center">
                          <Users className="w-8 h-8 mx-auto text-cyan-600 mb-2" />
                          <h4 className="font-semibold text-cyan-800">Hosting</h4>
                          <p className="text-cyan-600 text-sm">{statsData?.hostingCount || 0} events</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-blue-50 to-turquoise-50 border-blue-200">
                        <CardContent className="p-4 text-center">
                          <Star className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                          <h4 className="font-semibold text-blue-800">Attended</h4>
                          <p className="text-blue-600 text-sm">{statsData?.attendedCount || 0} events</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Event List Placeholder */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800">Recent Events</h4>
                      <div className="text-center p-8 bg-gradient-to-br from-turquoise-50/50 to-cyan-50/50 rounded-lg border-2 border-dashed border-turquoise-200">
                        <Calendar className="w-12 h-12 mx-auto text-turquoise-400 mb-4" />
                        <h5 className="text-lg font-medium text-turquoise-700 mb-2">No events yet</h5>
                        <p className="text-turquoise-600 text-sm mb-4">
                          Start attending milongas, workshops, and festivals to see them here.
                        </p>
                        <Button 
                          className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white"
                          onClick={() => setActiveTab('about')}
                        >
                          Explore Events
                        </Button>
                      </div>
                    </div>
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
                <UserPhotosGallery userId={user?.id || 0} isOwnProfile={true} />
              </TabsContent>

              <TabsContent value="videos" className="space-y-4">
                <UserVideosGallery userId={user?.id || 0} isOwnProfile={true} />
              </TabsContent>

              <TabsContent value="friends" className="space-y-4">
                <UserFriendsList userId={user?.id || 0} isOwnProfile={true} />
              </TabsContent>

              <TabsContent value="experience" className="space-y-4">
                {/* Enhanced Experience Section */}
                <Card className="glassmorphic-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
                        Tango Experience
                      </h3>
                    </div>
                    
                    {/* Experience Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <Card className="bg-gradient-to-br from-turquoise-50 to-cyan-50 border-turquoise-200">
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-turquoise-800 mb-3">Dance Levels</h4>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-turquoise-700">Leader</span>
                                <span className="text-sm font-medium text-turquoise-800">{user.leaderLevel || 5}/10</span>
                              </div>
                              <div className="w-full bg-turquoise-100 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-turquoise-400 to-cyan-500 h-2 rounded-full transition-all duration-1000"
                                  style={{ width: `${(user.leaderLevel || 5) * 10}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-cyan-700">Follower</span>
                                <span className="text-sm font-medium text-cyan-800">{user.followerLevel || 5}/10</span>
                              </div>
                              <div className="w-full bg-cyan-100 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-1000"
                                  style={{ width: `${(user.followerLevel || 5) * 10}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-cyan-800 mb-3">Journey</h4>
                          <div className="space-y-2">
                            {user.yearsOfDancing && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-cyan-600" />
                                <span className="text-cyan-700">{user.yearsOfDancing} years dancing</span>
                              </div>
                            )}
                            {user.startedDancingYear && (
                              <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-cyan-600" />
                                <span className="text-cyan-700">Started in {user.startedDancingYear}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-cyan-600" />
                              <span className="text-cyan-700">{statsData?.eventsAttended || 0} events attended</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Roles and Skills */}
                    {user.tangoRoles && user.tangoRoles.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3">Tango Roles</h4>
                        <div className="flex flex-wrap gap-2">
                          {(typeof user.tangoRoles === 'string' ? JSON.parse(user.tangoRoles) : user.tangoRoles).map((role: string) => (
                            <Badge key={role} className="bg-gradient-to-r from-turquoise-100 to-cyan-100 text-turquoise-700 border-turquoise-200">
                              {role.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Call to Action */}
                    <div className="text-center p-6 bg-gradient-to-br from-turquoise-50/50 to-cyan-50/50 rounded-lg border-2 border-dashed border-turquoise-200">
                      <Star className="w-10 h-10 mx-auto text-turquoise-400 mb-3" />
                      <h5 className="text-lg font-medium text-turquoise-700 mb-2">Share Your Tango Story</h5>
                      <p className="text-turquoise-600 text-sm mb-4">
                        Add more details about your tango journey and connect with the community.
                      </p>
                      <Button 
                        className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white"
                        onClick={() => setActiveTab('about')}
                      >
                        Edit Experience
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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