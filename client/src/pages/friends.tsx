
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, UserPlus, Users, UserCheck } from "lucide-react";

interface Friend {
  id: number;
  name: string;
  username: string;
  profileImage?: string;
  location?: string;
  mutualFriends?: number;
  status: 'pending' | 'accepted' | 'none';
}

export default function FriendsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: friendsData } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const response = await fetch("/api/friend", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch friends");
      return response.json();
    },
  });

  const { data: suggestedUsers } = useQuery({
    queryKey: ["users", "suggested", searchQuery],
    queryFn: async () => {
      const response = await fetch(`/api/user/get-all-users?search=${searchQuery}&limit=20`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      return data.data || [];
    },
  });

  const sendFriendRequestMutation = useMutation({
    mutationFn: async (friendId: number) => {
      const response = await fetch("/api/friend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ friend_id: friendId }),
      });
      if (!response.ok) throw new Error("Failed to send friend request");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["users", "suggested"] });
      toast({
        title: "Success",
        description: "Friend request sent!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive",
      });
    },
  });

  const acceptFriendRequestMutation = useMutation({
    mutationFn: async (friendId: number) => {
      const response = await fetch(`/api/friend/${friendId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: "accepted" }),
      });
      if (!response.ok) throw new Error("Failed to accept friend request");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast({
        title: "Success",
        description: "Friend request accepted!",
      });
    },
  });

  const handleSendFriendRequest = (friendId: number) => {
    sendFriendRequestMutation.mutate(friendId);
  };

  const handleAcceptRequest = (friendId: number) => {
    acceptFriendRequestMutation.mutate(friendId);
  };

  const friends = friendsData?.data?.following || [];
  const friendRequests = friendsData?.data?.followers?.filter((f: Friend) => f.status === 'pending') || [];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Friends</h1>
        <p className="text-gray-600">Connect with tango dancers around the world</p>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Friends</TabsTrigger>
          <TabsTrigger value="requests">
            Requests
            {friendRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {friendRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center">
              <Users className="w-5 h-5 mr-2" />
              My Friends ({friends.length})
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.map((friend: Friend) => (
              <Card key={friend.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={friend.profileImage} />
                      <AvatarFallback>{friend.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{friend.name}</h3>
                      <p className="text-sm text-gray-500">@{friend.username}</p>
                      {friend.location && (
                        <p className="text-xs text-gray-400">{friend.location}</p>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center">
            <UserCheck className="w-5 h-5 mr-2" />
            Friend Requests ({friendRequests.length})
          </h2>
          
          <div className="space-y-4">
            {friendRequests.map((request: Friend) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={request.profileImage} />
                        <AvatarFallback>{request.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{request.name}</h3>
                        <p className="text-sm text-gray-500">@{request.username}</p>
                        {request.mutualFriends && (
                          <p className="text-xs text-gray-400">
                            {request.mutualFriends} mutual friends
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRequest(request.id)}
                        disabled={acceptFriendRequestMutation.isPending}
                      >
                        Accept
                      </Button>
                      <Button variant="outline" size="sm">
                        Decline
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center">
            <UserPlus className="w-5 h-5 mr-2" />
            Suggested Friends
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestedUsers?.slice(0, 12).map((user: Friend) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.profileImage} />
                      <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                      {user.location && (
                        <p className="text-xs text-gray-400">{user.location}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleSendFriendRequest(user.id)}
                    disabled={sendFriendRequestMutation.isPending}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Friend
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search for tango dancers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestedUsers?.map((user: Friend) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.profileImage} />
                      <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                      {user.location && (
                        <p className="text-xs text-gray-400">{user.location}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleSendFriendRequest(user.id)}
                    disabled={sendFriendRequestMutation.isPending}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Friend
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
