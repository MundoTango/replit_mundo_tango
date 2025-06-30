import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Users, Calendar, Sparkles, Heart, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface GroupMember {
  id: number;
  userId: number;
  role: string;
  joinedAt: string;
  status: string;
  user: {
    id: number;
    name: string;
    username: string;
    email: string;
    profileImage: string | null;
    bio: string | null;
    city: string | null;
    country: string | null;
  };
}

interface Group {
  id: number;
  name: string;
  slug: string;
  description: string;
  emoji: string;
  city: string;
  country: string | null;
  type: string;
  isPrivate: boolean;
  memberCount: number;
  createdAt: string;
  members: GroupMember[];
}

interface GroupPageData {
  group: Group;
  recentMemories: any[];
  upcomingEvents: any[];
  currentUserMembership: GroupMember | null;
  stats: {
    totalMembers: number;
    onlineMembers: number;
    recentlyJoined: number;
  };
}

export default function GroupPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: groupData, isLoading, error } = useQuery<GroupPageData>({
    queryKey: ['/api/groups', slug],
    enabled: !!slug,
  });

  const autoAssignMutation = useMutation({
    mutationFn: () => apiRequest("/api/groups/auto-assign", "POST", {}),
    onSuccess: (data) => {
      toast({
        title: "Joined group successfully!",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/groups', slug] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to join group",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading group...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !groupData) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Group Not Found</h1>
            <p className="text-gray-600">The group you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { group, recentMemories, upcomingEvents, currentUserMembership, stats } = groupData;
  const isCurrentUserMember = !!currentUserMembership;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
        <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-6">
          {/* Header Section with TT Branding */}
          <div className="bg-gradient-to-r from-coral-400 via-coral-500 to-indigo-500 rounded-2xl p-8 mb-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-6xl">{group.emoji}</div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">{group.name}</h1>
                  <div className="flex items-center text-white/90 mb-3">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{group.city}{group.country && `, ${group.country}`}</span>
                  </div>
                  <p className="text-white/80 text-lg leading-relaxed max-w-2xl">
                    {group.description}
                  </p>
                </div>
              </div>
              
              {/* Membership Actions */}
              <div className="text-right">
                {isCurrentUserMember ? (
                  <div className="space-y-3">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                      <Users className="h-4 w-4 mr-2" />
                      {currentUserMembership.role === 'admin' ? 'Group Admin' : 'Member'}
                    </Badge>
                    <div className="text-white/80 text-sm">
                      Joined {new Date(currentUserMembership.joinedAt).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => autoAssignMutation.mutate()}
                    disabled={autoAssignMutation.isPending}
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
                    size="lg"
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    {autoAssignMutation.isPending ? "Joining..." : "Join Group"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-coral-600 mb-2">{stats.totalMembers}</div>
                <div className="text-gray-600 font-medium">Total Members</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{upcomingEvents.length}</div>
                <div className="text-gray-600 font-medium">Upcoming Events</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-teal-600 mb-2">{stats.recentlyJoined}</div>
                <div className="text-gray-600 font-medium">Joined This Week</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Members */}
            <div className="lg:col-span-1">
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-800">
                    <Users className="h-5 w-5 mr-2 text-coral-500" />
                    Members ({stats.totalMembers})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {group.members.slice(0, 8).map((member) => (
                    <div key={member.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.user.profileImage || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-coral-400 to-indigo-500 text-white">
                          {member.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{member.user.name}</div>
                        <div className="text-sm text-gray-500">@{member.user.username}</div>
                        {member.role === 'admin' && (
                          <Badge variant="outline" className="text-xs mt-1">Admin</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {group.members.length > 8 && (
                    <div className="text-center pt-4">
                      <Button variant="ghost" className="text-coral-600 hover:text-coral-700">
                        View All Members
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Events & Activity */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upcoming Events */}
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-800">
                    <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingEvents.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingEvents.map((event) => (
                        <div key={event.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                              <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(event.date).toLocaleDateString()}
                              </div>
                            </div>
                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                              {event.eventType}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No upcoming events in this area</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Memories/Activity */}
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-800">
                    <Sparkles className="h-5 w-5 mr-2 text-teal-500" />
                    Recent Memories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentMemories.length > 0 ? (
                    <div className="space-y-4">
                      {recentMemories.map((memory, index) => (
                        <div key={index} className="p-4 border border-gray-100 rounded-lg">
                          <p className="text-gray-700">{memory.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Heart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No memories shared yet</p>
                      <p className="text-sm mt-1">Be the first to share a tango memory with this group!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}