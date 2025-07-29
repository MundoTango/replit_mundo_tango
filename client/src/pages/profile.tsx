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
import { Camera, Video, Users, Calendar, Star, UserCheck, Globe, PenLine, UserCircle, Sparkles, MapPin, Eye, GraduationCap, Music, Heart, MoreHorizontal, Plus, Edit2, Flame, Share2, MessageCircle, UserPlus } from 'lucide-react';
import { TravelDetailsComponent } from '@/components/profile/TravelDetailsComponent';
import { ProfileMemoryPostModal } from '@/components/profile/ProfileMemoryPostModal';
import { UserPhotosGallery } from '@/components/profile/UserPhotosGallery';
import { UserVideosGallery } from '@/components/profile/UserVideosGallery';
import { UserFriendsList } from '@/components/profile/UserFriendsList';
import { UserEventsList } from '@/components/profile/UserEventsList';
import { ProfileAboutSection } from '@/components/profile/ProfileAboutSection';
import { ProfileEngagementFeatures } from '@/components/profile/ProfileEngagementFeaturesSimplified';

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
  const [activeTab, setActiveTab] = useState('memories');
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
          {/* Enhanced Profile Header - Always Display */}
          <EnhancedProfileHeader
            user={user}
            stats={statsData || {}}
            isOwnProfile={true}
            onEditProfile={handleEditProfile}
          />

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
              <TabsTrigger 
                value="engagement" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-turquoise-500 rounded-none px-6 py-4"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                <span className="font-medium">Engagement</span>
              </TabsTrigger>
            </TabsList>
            <div className="p-6">
              <TabsContent value="about" className="space-y-4">
                {/* About Section with Guest Profile Tab */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3">
                    <ProfileAboutSection 
                      user={user} 
                      isOwnProfile={true}
                      currentUserId={user?.id}
                      isFriend={false}
                    />
                  </div>
                  
                  {/* Guest Profile in Side Panel */}
                  <div className="lg:col-span-1">
                    <Card className="glassmorphic-card">
                      <CardContent className="p-4">
                        <h3 className="font-semibold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent mb-4">
                          Guest Profile
                        </h3>
                        {guestProfileError ? (
                          <div className="text-center p-4">
                            <p className="text-sm text-red-600">Error loading guest profile</p>
                          </div>
                        ) : guestProfileLoading ? (
                          <div className="animate-pulse space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        ) : guestProfile ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-green-600">Verified Guest</span>
                            </div>
                            <p className="text-xs text-gray-600">Ready to request stays with hosts</p>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="w-full text-xs border-turquoise-200 text-turquoise-700 hover:bg-turquoise-50"
                            >
                              View Full Profile
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center space-y-3">
                            <UserCheck className="w-8 h-8 text-gray-300 mx-auto" />
                            <p className="text-xs text-gray-600">Create your guest profile to be housed by Hosts in the global tango community</p>
                            <Button 
                              size="sm"
                              onClick={() => setLocation('/groups')}
                              className="w-full text-xs bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white"
                            >
                              Create Profile
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="posts" className="space-y-4">
                {/* New Layout: Side Panel + Main Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Side Panel - About/Travel/Friends */}
                  <div className="lg:col-span-1 space-y-4">
                    {/* About Section */}
                    <Card className="glassmorphic-card">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">About</h3>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setActiveTab('about')}
                            className="text-xs text-turquoise-600 hover:text-turquoise-700"
                          >
                            Edit
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                          {(user as any)?.bio || "Share your tango story..."}
                        </p>
                        {(user as any)?.tangoRoles && (user as any).tangoRoles.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {(typeof (user as any).tangoRoles === 'string' ? JSON.parse((user as any).tangoRoles) : (user as any).tangoRoles).slice(0, 2).map((role: string) => (
                              <Badge key={role} variant="secondary" className="text-xs bg-turquoise-100 text-turquoise-700">
                                {role.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Travel Section */}
                    <Card className="glassmorphic-card">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">Travel</h3>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setActiveTab('travel')}
                            className="text-xs text-turquoise-600 hover:text-turquoise-700"
                          >
                            View
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-turquoise-500" />
                            <span className="text-sm text-gray-600">
                              {(user as any)?.city ? `${(user as any).city}${(user as any).country ? `, ${(user as any).country}` : ''}` : "Add location"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Globe className="w-3 h-3 text-cyan-500" />
                            <span className="text-sm text-gray-600">
                              {(user as any)?.languages ? `${(user as any).languages.length} languages` : "Add languages"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Friends Section */}
                    <Card className="glassmorphic-card">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">Friends</h3>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setActiveTab('friends')}
                            className="text-xs text-turquoise-600 hover:text-turquoise-700"
                          >
                            View All
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            {statsData?.friendsCount ? `${statsData.friendsCount} friends` : "No friends yet"}
                          </p>
                          {/* Friend Avatars Preview */}
                          <div className="flex -space-x-2">
                            {[1,2,3].map((i) => (
                              <div key={i} className="w-6 h-6 bg-gradient-to-br from-turquoise-100 to-cyan-100 rounded-full border-2 border-white flex items-center justify-center">
                                <Users className="w-3 h-3 text-turquoise-600" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Main Feed Area */}
                  <div className="lg:col-span-3 space-y-4">
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
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No memories yet</h3>
                          <p className="text-gray-600">
                            Start sharing your tango journey by creating your first memory.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
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
                {/* Combined Media Tab with Filters */}
                <Card className="glassmorphic-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
                        Media Gallery
                      </h3>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-turquoise-200 text-turquoise-700 hover:bg-turquoise-50">
                          <Camera className="w-4 h-4 mr-2" />
                          Upload Photo
                        </Button>
                        <Button variant="outline" size="sm" className="border-cyan-200 text-cyan-700 hover:bg-cyan-50">
                          <Video className="w-4 h-4 mr-2" />
                          Upload Video
                        </Button>
                      </div>
                    </div>
                    
                    {/* Media Filter Tabs */}
                    <div className="flex items-center gap-2 mb-6">
                      <Button 
                        variant="default" 
                        size="sm"
                        className="bg-gradient-to-r from-turquoise-500 to-cyan-600 text-white"
                      >
                        All Media
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-turquoise-200 text-turquoise-700 hover:bg-turquoise-50"
                      >
                        📸 Photos Only
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-cyan-200 text-cyan-700 hover:bg-cyan-50"
                      >
                        🎥 Videos Only
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-purple-200 text-purple-700 hover:bg-purple-50"
                      >
                        🎵 Dance Videos
                      </Button>
                    </div>

                    {/* Media Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {/* Sample Media Items */}
                      {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div key={item} className="relative group aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-turquoise-100 to-cyan-100 hover:shadow-lg transition-all cursor-pointer">
                          <div className="absolute inset-0 flex items-center justify-center">
                            {item % 3 === 0 ? (
                              <Video className="w-8 h-8 text-turquoise-600" />
                            ) : (
                              <Camera className="w-8 h-8 text-cyan-600" />
                            )}
                          </div>
                          <div className="absolute bottom-2 left-2 right-2">
                            <Badge 
                              variant="secondary" 
                              className="text-xs bg-white/80 text-gray-700"
                            >
                              {item % 3 === 0 ? "Video" : "Photo"}
                            </Badge>
                          </div>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-8 w-8 bg-white/80 hover:bg-white">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Empty State */}
                    <div className="text-center p-8 bg-gradient-to-br from-turquoise-50/50 to-cyan-50/50 rounded-lg border-2 border-dashed border-turquoise-200 mt-6">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Camera className="w-8 h-8 text-turquoise-400" />
                        <Video className="w-8 h-8 text-cyan-400" />
                      </div>
                      <h5 className="text-lg font-medium text-turquoise-700 mb-2">Share Your Tango Journey</h5>
                      <p className="text-turquoise-600 text-sm mb-4">
                        Upload photos and videos of your tango experiences, performances, and memories.
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          size="sm"
                          className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Upload Photos
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          className="border-turquoise-200 text-turquoise-700 hover:bg-turquoise-50"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Upload Videos
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="videos" className="space-y-4">
                {/* Redirect to Photos tab with video filter */}
                <Card className="glassmorphic-card">
                  <CardContent className="p-12 text-center">
                    <Video className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Videos are now in Media Gallery</h3>
                    <p className="text-gray-600 mb-4">
                      We've combined photos and videos into one place with smart filtering.
                    </p>
                    <Button 
                      className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white"
                      onClick={() => setActiveTab('photos')}
                    >
                      View Media Gallery
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="friends" className="space-y-4">
                <UserFriendsList userId={user?.id || 0} isOwnProfile={true} />
              </TabsContent>

              <TabsContent value="experience" className="space-y-4">
                {/* Tango Resume - Event-Tied Experience */}
                <Card className="glassmorphic-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
                        🌟 Tango Resume
                      </h3>
                      <Badge variant="outline" className="border-turquoise-200 text-turquoise-700">
                        Event-Based Experience
                      </Badge>
                    </div>
                    
                    {/* Resume Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                      <Card className="bg-gradient-to-br from-turquoise-50 to-cyan-50 border-turquoise-200">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-turquoise-600">{statsData?.eventsAttended || 0}</div>
                          <div className="text-sm text-turquoise-700">Events Attended</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-cyan-600">{statsData?.rolesAccepted || 0}</div>
                          <div className="text-sm text-cyan-700">Roles Accepted</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-blue-50 to-turquoise-50 border-blue-200">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">{(user as any)?.yearsOfDancing || 0}</div>
                          <div className="text-sm text-blue-700">Years Dancing</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-purple-600">★ 4.8</div>
                          <div className="text-sm text-purple-700">Avg Rating</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Professional Experience by Category */}
                    <div className="space-y-6">
                      <h4 className="font-semibold text-gray-800 text-lg">Professional Experience</h4>
                      
                      {/* Teacher Experience */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-5 h-5 text-turquoise-600" />
                          <h5 className="font-semibold text-turquoise-700">Teaching Experience</h5>
                        </div>
                        <div className="border-l-4 border-turquoise-400 pl-6 py-4 bg-gradient-to-r from-turquoise-50/30 to-transparent">
                          <div className="flex items-start justify-between">
                            <div>
                              <h6 className="font-semibold text-gray-900">Intermediate Tango Instructor</h6>
                              <p className="text-turquoise-600 font-medium">Buenos Aires Tango Festival 2024</p>
                              <p className="text-gray-600 text-sm">Taught advanced technique to 50+ international students</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span>📅 Started: 2020</span>
                                <span>⭐ Years dancing: 8</span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="text-turquoise-600 border-turquoise-200">
                              + Add Entry
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Organizer Experience */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-cyan-600" />
                          <h5 className="font-semibold text-cyan-700">Event Organization</h5>
                        </div>
                        <div className="border-l-4 border-cyan-400 pl-6 py-4 bg-gradient-to-r from-cyan-50/30 to-transparent">
                          <div className="flex items-start justify-between">
                            <div>
                              <h6 className="font-semibold text-gray-900">Milonga Organizer</h6>
                              <p className="text-cyan-600 font-medium">Monthly Practica Series</p>
                              <p className="text-gray-600 text-sm">Coordinated weekly events for 100+ dancers</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span>📅 Started: 2022</span>
                                <span>⭐ Years dancing: 8</span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="text-cyan-600 border-cyan-200">
                              + Add Entry
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* DJ Experience */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Music className="w-5 h-5 text-purple-600" />
                          <h5 className="font-semibold text-purple-700">DJ Experience</h5>
                        </div>
                        <div className="border-l-4 border-purple-400 pl-6 py-4 bg-gradient-to-r from-purple-50/30 to-transparent">
                          <div className="flex items-start justify-between">
                            <div>
                              <h6 className="font-semibold text-gray-900">Resident DJ</h6>
                              <p className="text-purple-600 font-medium">La Milonguita Weekly</p>
                              <p className="text-gray-600 text-sm">Curated traditional tandas for intimate milonga setting</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span>📅 Started: 2021</span>
                                <span>⭐ Years dancing: 8</span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="text-purple-600 border-purple-200">
                              + Add Entry
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="border-l-4 border-cyan-400 pl-6 py-4 bg-gradient-to-r from-cyan-50/30 to-transparent">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-semibold text-gray-900">DJ & Music Curator</h5>
                            <p className="text-cyan-600 font-medium">Milonga Luna - Weekly Series</p>
                            <p className="text-gray-600 text-sm">Curated and performed music for weekly milonga events</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span>📅 Jan-Dec 2024</span>
                              <span>📍 Local Community</span>
                              <span>⭐ 4.7/5 dancer feedback</span>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Ongoing</Badge>
                        </div>
                      </div>

                      {/* Empty State */}
                      <div className="text-center p-8 bg-gradient-to-br from-turquoise-50/50 to-cyan-50/50 rounded-lg border-2 border-dashed border-turquoise-200">
                        <Star className="w-12 h-12 mx-auto text-turquoise-400 mb-4" />
                        <h5 className="text-lg font-medium text-turquoise-700 mb-2">Build Your Tango Resume</h5>
                        <p className="text-turquoise-600 text-sm mb-4">
                          When event organizers select you for roles and you accept, they'll automatically appear here as professional experience.
                        </p>
                        <Button 
                          className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white"
                          onClick={() => setActiveTab('events')}
                        >
                          Browse Events
                        </Button>
                      </div>
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

              {/* NEW: Engagement Features Tab */}
              <TabsContent value="engagement" className="space-y-4">
                <ProfileEngagementFeatures user={user} statsData={statsData} />
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