import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getAuthToken } from "@/lib/authUtils";
import Navbar from "@/components/layout/navbar";
import MobileNav from "@/components/layout/mobile-nav";
import PostCard from "@/components/feed/post-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  MapPin, 
  Calendar, 
  Users, 
  Heart,
  MessageCircle,
  Share2,
  Edit3,
  Camera
} from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    city: user?.city || "",
    country: user?.country || "",
  });

  // Fetch user profile data
  const { data: profileInfo, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    queryFn: async () => {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      return data.data;
    },
  });

  // Fetch user posts
  const { data: userPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: [`/api/posts/user/${user?.id}`],
    queryFn: async () => {
      const response = await fetch(`/api/posts/user/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      return data.data;
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      setIsEditingProfile(false);
      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(profileData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    updateProfileMutation.mutate(formData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('image_url', file);
      updateProfileMutation.mutate(formData);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-tango-gray">
        <Navbar onMenuClick={() => setIsChatOpen(true)} />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      </div>
    );
  }

  const stats = profileInfo?.stats || {
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
    eventsCount: 0,
  };

  return (
    <div className="min-h-screen bg-tango-gray">
      <Navbar onMenuClick={() => setIsChatOpen(true)} />
      
      <div className="pt-16 pb-20 lg:pb-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Profile Header */}
          <Card className="card-shadow mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
                
                {/* Profile Image */}
                <div className="relative">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={user?.profileImage || ""} alt={user?.name} />
                    <AvatarFallback className="text-2xl">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <label className="absolute bottom-0 right-0 bg-tango-red text-white rounded-full p-2 cursor-pointer hover:bg-tango-red/90">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold text-tango-black">{user?.name}</h1>
                      <p className="text-gray-600">@{user?.username}</p>
                      {user?.city && (
                        <div className="flex items-center text-gray-500 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{user.city}{user?.country && `, ${user.country}`}</span>
                        </div>
                      )}
                    </div>
                    
                    <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Edit Profile</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                          <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              value={profileData.name}
                              onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                              id="bio"
                              value={profileData.bio}
                              onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                              placeholder="Tell us about your tango journey..."
                            />
                          </div>
                          <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={profileData.city}
                              onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="country">Country</Label>
                            <Input
                              id="country"
                              value={profileData.country}
                              onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                            />
                          </div>
                          <Button 
                            type="submit" 
                            className="w-full bg-tango-red hover:bg-tango-red/90"
                            disabled={updateProfileMutation.isPending}
                          >
                            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Bio */}
                  {user?.bio && (
                    <p className="text-gray-700 mb-4">{user.bio}</p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="font-bold text-xl text-tango-red">{stats.postsCount}</div>
                      <div className="text-sm text-gray-500">Posts</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-xl text-tango-red">{stats.followersCount}</div>
                      <div className="text-sm text-gray-500">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-xl text-tango-red">{stats.followingCount}</div>
                      <div className="text-sm text-gray-500">Following</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-xl text-tango-red">{stats.eventsCount}</div>
                      <div className="text-sm text-gray-500">Events</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-6 mt-6">
              {postsLoading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="card-shadow p-6 animate-pulse">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                      <div className="h-64 bg-gray-200 rounded-lg"></div>
                    </Card>
                  ))}
                </div>
              ) : userPosts.length > 0 ? (
                userPosts.map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <Card className="card-shadow">
                  <CardContent className="p-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <MessageCircle className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No posts yet</h3>
                    <p className="text-gray-500">Share your first tango experience with the community!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="events" className="mt-6">
              <Card className="card-shadow">
                <CardContent className="p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <Calendar className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No events yet</h3>
                  <p className="text-gray-500">Start organizing tango events in your area!</p>
                  <Button className="mt-4 bg-tango-red hover:bg-tango-red/90">
                    Create Event
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="experience" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="card-shadow">
                  <CardHeader>
                    <CardTitle className="text-tango-black">Dance Experience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Social Dancing Cities</Label>
                        <p className="text-gray-800">Buenos Aires, Paris, New York</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Favorite Dancing Cities</Label>
                        <p className="text-gray-800">Buenos Aires, Barcelona</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Annual Events Attended</Label>
                        <p className="text-gray-800">12+ events per year</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-shadow">
                  <CardHeader>
                    <CardTitle className="text-tango-black">Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Favorite Tango Style</Label>
                        <p className="text-gray-800">Argentine Tango</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Experience Level</Label>
                        <p className="text-gray-800">Advanced</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Years Dancing</Label>
                        <p className="text-gray-800">8+ years</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav onOpenChat={() => setIsChatOpen(true)} />
    </div>
  );
}
