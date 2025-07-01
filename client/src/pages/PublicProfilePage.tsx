import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProfileHead from "@/components/profile/ProfileHead";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import PostCard from "@/components/feed/post-card";
import { Badge } from "@/components/ui/badge";
import { getTangoRoleById } from "@/utils/tangoRoles";
import { Users } from "lucide-react";

interface PublicUser {
  id: number;
  name: string;
  username: string;
  email: string;
  profileImage?: string;
  bio?: string;
  city?: string;
  country?: string;
  tangoRoles?: string[];
  yearsOfDancing?: number;
  leaderLevel?: number;
  followerLevel?: number;
  createdAt: string;
}

export default function PublicProfilePage() {
  const [match, params] = useRoute("/u/:username");
  const username = params?.username;

  // Fetch public user profile
  const { data: userData, isLoading: userLoading, error } = useQuery({
    queryKey: ['/api/public-profile', username],
    queryFn: async () => {
      const response = await fetch(`/api/public-profile/${username}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found');
        }
        throw new Error('Failed to fetch user profile');
      }
      
      const result = await response.json();
      return result.data as PublicUser;
    },
    enabled: !!username
  });

  // Fetch user posts
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['/api/user/public-posts', username],
    queryFn: async () => {
      const response = await fetch(`/api/user/public-posts/${username}`, {
        credentials: 'include'
      });
      
      if (!response.ok) return [];
      
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!username && !!userData
  });

  // Fetch user stats
  const { data: statsData } = useQuery({
    queryKey: ['/api/user/public-stats', username],
    queryFn: async () => {
      const response = await fetch(`/api/user/public-stats/${username}`, {
        credentials: 'include'
      });
      
      if (!response.ok) return {};
      
      const result = await response.json();
      return result.data || {};
    },
    enabled: !!username && !!userData
  });

  if (!match) {
    return <div>Page not found</div>;
  }

  if (userLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !userData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">User Not Found</h2>
            <p className="text-gray-600">
              {error?.message === 'User not found' 
                ? `No user found with username @${username}`
                : 'This profile is not available or may be private.'
              }
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Public Profile Header */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <p className="text-blue-800 font-medium">
              This is the public profile of @{userData.username}
            </p>
          </div>
        </div>

        {/* Profile Head Component */}
        <ProfileHead
          user={userData}
          activeTab="posts"
          onTabChange={() => {}}
          onEditProfile={() => {}}
          onAddTravelDetails={() => {}}
        />

        {/* Enhanced Tango Roles Display */}
        {userData.tangoRoles && userData.tangoRoles.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Tango Roles</h3>
              <div className="flex flex-wrap gap-2">
                {userData.tangoRoles.map((roleId, index) => {
                  const tangoRole = getTangoRoleById(roleId);
                  if (!tangoRole) return null;
                  
                  return (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-pink-50 text-pink-700 border-pink-200"
                    >
                      {tangoRole.emoji} {tangoRole.name}: {tangoRole.description}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Content */}
        <Tabs value="posts" className="space-y-4">
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No public posts</h3>
                  <p className="text-gray-600">
                    @{userData.username} hasn't shared any public posts yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}