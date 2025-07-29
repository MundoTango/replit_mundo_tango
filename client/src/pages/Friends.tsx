import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { FriendRequestList } from '@/components/FriendRequestList';
import { FriendRequestForm } from '@/components/FriendRequestForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Users, UserPlus, Search, MessageCircle, MoreVertical, UserCheck } from 'lucide-react';
import { Link } from 'wouter';

interface Friend {
  id: number;
  friendId: number;
  friend: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
    city?: string;
    country?: string;
    isOnline?: boolean;
  };
  connectionDegree?: number;
  mutualFriends?: number;
  createdAt: string;
}

interface SuggestedFriend {
  id: number;
  name: string;
  username: string;
  profileImage?: string;
  city?: string;
  country?: string;
  mutualFriends?: number;
  commonGroups?: number;
  tangoRoles?: string[];
}

export function Friends() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFriendRequestDialog, setShowFriendRequestDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SuggestedFriend | null>(null);
  const [activeTab, setActiveTab] = useState('friends');

  // Fetch friends list
  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ['/api/friends'],
    queryFn: async () => {
      const response = await apiRequest('/api/friends', { method: 'GET' });
      const data = await response.json();
      return data.data || [];
    },
  });

  // Fetch friend suggestions
  const { data: suggestions = [], isLoading: suggestionsLoading } = useQuery({
    queryKey: ['/api/friends/suggestions'],
    queryFn: async () => {
      const response = await apiRequest('/api/friends/suggestions', { method: 'GET' });
      const data = await response.json();
      return data.data || [];
    },
  });

  // Fetch pending friend requests count
  const { data: requestsData } = useQuery({
    queryKey: ['/api/friend-requests/received'],
    queryFn: async () => {
      const response = await apiRequest('/api/friend-requests/received', { method: 'GET' });
      const data = await response.json();
      return data.data || [];
    },
  });

  const pendingRequestsCount = requestsData?.filter((r: any) => r.status === 'pending').length || 0;

  const filteredFriends = friends.filter((friend: Friend) =>
    friend.friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendRequest = (user: SuggestedFriend) => {
    setSelectedUser(user);
    setShowFriendRequestDialog(true);
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <span className="bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
            Friends & Connections
          </span>
        </h1>
        <p className="text-muted-foreground">
          Connect with dancers from around the world
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 glassmorphic-card">
          <TabsTrigger value="friends" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-turquoise-400/20 data-[state=active]:to-cyan-500/20">
            <Users className="mr-2 h-4 w-4" />
            Friends ({friends.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-turquoise-400/20 data-[state=active]:to-cyan-500/20">
            <UserPlus className="mr-2 h-4 w-4" />
            Requests
            {pendingRequestsCount > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">
                {pendingRequestsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-turquoise-400/20 data-[state=active]:to-cyan-500/20">
            <UserCheck className="mr-2 h-4 w-4" />
            Suggestions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-4">
          <Card className="glassmorphic-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Friends</CardTitle>
                  <CardDescription>
                    {friends.length} connections in your network
                  </CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search friends..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 glassmorphic-input"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {friendsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-center gap-4 p-4 rounded-lg bg-white/50">
                      <div className="h-12 w-12 rounded-full bg-gray-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-gray-200 rounded" />
                        <div className="h-3 w-24 bg-gray-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredFriends.length > 0 ? (
                <div className="grid gap-4">
                  {filteredFriends.map((friend: Friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-white/50 hover:bg-white/70 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <Link href={`/profile/${friend.friend.username}`}>
                          <Avatar className="h-12 w-12 ring-2 ring-turquoise-200/50 hover:ring-turquoise-300 transition-all cursor-pointer">
                            <AvatarImage src={friend.friend.profileImage} />
                            <AvatarFallback className="bg-gradient-to-br from-turquoise-400 to-cyan-500 text-white">
                              {friend.friend.name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div>
                          <Link href={`/profile/${friend.friend.username}`}>
                            <h3 className="font-semibold hover:text-turquoise-600 transition-colors cursor-pointer">
                              {friend.friend.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            @{friend.friend.username} • {friend.friend.city}, {friend.friend.country}
                          </p>
                          {friend.connectionDegree && friend.connectionDegree > 1 && (
                            <p className="text-xs text-turquoise-600 mt-1">
                              {friend.connectionDegree}° connection • {friend.mutualFriends} mutual friends
                            </p>
                          )}
                        </div>
                        {friend.friend.isOnline && (
                          <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href="/messages">
                          <Button size="sm" variant="outline">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button size="sm" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No friends found matching your search' : 'No friends yet. Start connecting!'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <FriendRequestList />
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle>Suggested Connections</CardTitle>
              <CardDescription>
                People you might know based on your tango network
              </CardDescription>
            </CardHeader>
            <CardContent>
              {suggestionsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-center gap-4 p-4 rounded-lg bg-white/50">
                      <div className="h-16 w-16 rounded-full bg-gray-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-gray-200 rounded" />
                        <div className="h-3 w-48 bg-gray-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : suggestions.length > 0 ? (
                <div className="grid gap-4">
                  {suggestions.map((suggestion: SuggestedFriend) => (
                    <div
                      key={suggestion.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-white/50 hover:bg-white/70 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <Link href={`/profile/${suggestion.username}`}>
                          <Avatar className="h-16 w-16 ring-2 ring-turquoise-200/50 hover:ring-turquoise-300 transition-all cursor-pointer">
                            <AvatarImage src={suggestion.profileImage} />
                            <AvatarFallback className="bg-gradient-to-br from-turquoise-400 to-cyan-500 text-white text-lg">
                              {suggestion.name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div>
                          <Link href={`/profile/${suggestion.username}`}>
                            <h3 className="font-semibold text-lg hover:text-turquoise-600 transition-colors cursor-pointer">
                              {suggestion.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            @{suggestion.username} • {suggestion.city}, {suggestion.country}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            {suggestion.mutualFriends && suggestion.mutualFriends > 0 && (
                              <span className="text-xs text-turquoise-600">
                                {suggestion.mutualFriends} mutual friends
                              </span>
                            )}
                            {suggestion.commonGroups && suggestion.commonGroups > 0 && (
                              <span className="text-xs text-cyan-600">
                                {suggestion.commonGroups} common groups
                              </span>
                            )}
                          </div>
                          {suggestion.tangoRoles && suggestion.tangoRoles.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {suggestion.tangoRoles.slice(0, 3).map((role) => (
                                <Badge
                                  key={role}
                                  variant="secondary"
                                  className="text-xs bg-turquoise-100 text-turquoise-700"
                                >
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSendRequest(suggestion)}
                        className="bg-gradient-to-r from-turquoise-500 to-cyan-600 text-white hover:shadow-md"
                      >
                        <UserPlus className="mr-1 h-4 w-4" />
                        Connect
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <UserCheck className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No suggestions available right now
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Friend Request Dialog */}
      <Dialog open={showFriendRequestDialog} onOpenChange={setShowFriendRequestDialog}>
        <DialogContent className="max-w-2xl">
          {selectedUser && (
            <FriendRequestForm
              receiverId={selectedUser.id}
              receiverName={selectedUser.name}
              onSuccess={() => {
                setShowFriendRequestDialog(false);
                setSelectedUser(null);
              }}
              onCancel={() => {
                setShowFriendRequestDialog(false);
                setSelectedUser(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}