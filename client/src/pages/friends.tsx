import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  UserPlus, 
  Users, 
  MessageCircle, 
  Check, 
  X, 
  Clock,
  UserCheck,
  Send,
  Heart,
  MapPin,
  Globe,
  Music
} from 'lucide-react';

interface Friend {
  id: string;
  name: string;
  username: string;
  profileImage?: string;
  location?: string;
  tangoRoles?: string[];
  isOnline?: boolean;
  lastSeen?: string;
  mutualFriends?: number;
}

interface FriendRequest {
  id: string;
  user_id: number;
  friend_id: number;
  sender_notes?: string;
  receiver_notes?: string;
  status: 'pending' | 'connected' | 'decline';
  created_at: string;
  friend_user?: Friend;
  user?: Friend;
}

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showSendRequestModal, setShowSendRequestModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Friend | null>(null);
  const [requestNote, setRequestNote] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const { toast } = useToast();

  // Fetch friends data
  const { data: friendsData, isLoading: friendsLoading } = useQuery({
    queryKey: ['/api/friends'],
    enabled: true
  });

  // Fetch friend requests
  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ['/api/friends/requests'],
    enabled: true
  });

  // Fetch friend suggestions
  const { data: suggestionsData } = useQuery({
    queryKey: ['/api/friends/suggestions'],
    enabled: activeTab === 'suggestions'
  });

  const friends = (friendsData as any)?.data || [];
  const requests = (requestsData as any)?.data || [];
  const suggestions = (suggestionsData as any)?.data || [];

  // Search for users to send friend requests
  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    // Mock search results
    const mockSearchResults: Friend[] = [
      {
        id: '6',
        name: 'Laura Chen',
        username: 'laura_tango',
        location: 'San Francisco, USA',
        tangoRoles: ['dancer'],
        mutualFriends: 3
      },
      {
        id: '7',
        name: 'Roberto Diaz',
        username: 'roberto_teacher',
        location: 'Barcelona, Spain',
        tangoRoles: ['teacher', 'performer'],
        mutualFriends: 7
      }
    ];
    
    setSearchResults(mockSearchResults.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.username.toLowerCase().includes(query.toLowerCase())
    ));
  };

  // Send friend request mutation
  const sendRequestMutation = useMutation({
    mutationFn: async ({ friendId, notes }: { friendId: string; notes: string }) => {
      const response = await fetch('/api/friend/send-friend-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friend_id: friendId, sender_notes: notes })
      });
      
      if (!response.ok) throw new Error('Failed to send friend request');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Friend request sent!',
        description: 'Your friend request has been sent successfully.'
      });
      setShowSendRequestModal(false);
      setSelectedUser(null);
      setRequestNote('');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send friend request. Please try again.',
        variant: 'destructive'
      });
    }
  });

  // Update friend request status mutation
  const updateRequestMutation = useMutation({
    mutationFn: async ({ requestId, status, notes }: { 
      requestId: string; 
      status: 'connected' | 'decline'; 
      notes?: string 
    }) => {
      const response = await fetch(`/api/friend/update-friend-request/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, receiver_notes: notes })
      });
      
      if (!response.ok) throw new Error('Failed to update request');
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: variables.status === 'connected' ? 'Friend added!' : 'Request declined',
        description: variables.status === 'connected' 
          ? 'You are now connected as friends.' 
          : 'The friend request has been declined.'
      });
    }
  });

  const handleSendRequest = () => {
    if (!selectedUser) return;
    
    sendRequestMutation.mutate({
      friendId: selectedUser.id,
      notes: requestNote
    });
  };

  const handleAcceptRequest = (request: FriendRequest) => {
    updateRequestMutation.mutate({
      requestId: request.id,
      status: 'connected',
      notes: 'Looking forward to dancing together!'
    });
  };

  const handleDeclineRequest = (request: FriendRequest) => {
    updateRequestMutation.mutate({
      requestId: request.id,
      status: 'decline'
    });
  };

  // Filter content based on active tab
  const getTabContent = () => {
    switch (activeTab) {
      case 'all':
        return friends;
      case 'online':
        return friends.filter((f: Friend) => f.isOnline);
      case 'requests':
        return requests.filter((r: FriendRequest) => r.status === 'pending');
      case 'suggestions':
        return suggestions;
      default:
        return [];
    }
  };

  // Show loading state
  if (friendsLoading || requestsLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading friends...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Friends</h1>
            <p className="text-gray-600 mt-1">Connect with dancers in your community</p>
          </div>
          <Button
            onClick={() => setShowSendRequestModal(true)}
            className="bg-gradient-to-r from-turquoise-400 to-cyan-500 hover:from-turquoise-500 hover:to-cyan-600 text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Friends
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-r from-turquoise-50 to-cyan-50 glassmorphic-card">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-turquoise-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{friends.length}</p>
                <p className="text-sm text-gray-600">Total Friends</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-r from-turquoise-50 to-blue-50 glassmorphic-card">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-cyan-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {friends.filter((f: Friend) => f.isOnline).length}
                </p>
                <p className="text-sm text-gray-600">Online Now</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 glassmorphic-card">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter((r: FriendRequest) => r.status === 'pending').length}
                </p>
                <p className="text-sm text-gray-600">Pending Requests</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-turquoise-50 glassmorphic-card">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-cyan-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {friends.reduce((sum: number, f: Friend) => sum + (f.mutualFriends || 0), 0)}
                </p>
                <p className="text-sm text-gray-600">Mutual Friends</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search friends by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Tabs */}
        <Card>
          <div className="flex border-b">
            {[
              { id: 'all', label: 'All Friends', icon: Users },
              { id: 'online', label: 'Online', icon: Globe },
              { id: 'requests', label: 'Requests', icon: Clock },
              { id: 'suggestions', label: 'Suggestions', icon: UserPlus }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-turquoise-600 border-b-2 border-turquoise-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === 'requests' && requests.filter((r: FriendRequest) => r.status === 'pending').length > 0 && (
                    <Badge className="ml-2 bg-rose-500 text-white">
                      {requests.filter((r: FriendRequest) => r.status === 'pending').length}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'requests' ? (
              // Friend Requests Tab
              <div className="space-y-4">
                {requests.filter((r: FriendRequest) => r.status === 'pending').map((request: FriendRequest) => (
                  <Card key={request.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-turquoise-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold">
                          {request.friend_user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {request.friend_user?.name}
                          </h4>
                          <p className="text-sm text-gray-600">@{request.friend_user?.username}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {request.friend_user?.location}
                          </p>
                          {request.sender_notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700 italic">"{request.sender_notes}"</p>
                            </div>
                          )}
                          <div className="flex gap-2 mt-3">
                            {request.friend_user?.tangoRoles?.map((role: string) => (
                              <Badge key={role} variant="outline" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptRequest(request)}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeclineRequest(request)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                {requests.filter((r: FriendRequest) => r.status === 'pending').length === 0 && (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No pending friend requests</p>
                  </div>
                )}
              </div>
            ) : (
              // Friends List
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getTabContent().filter((friend: any) => 
                  friend.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  friend.username?.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((friend: any) => (
                  <Card key={friend.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-r from-turquoise-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold">
                            {friend.name?.charAt(0) || 'U'}
                          </div>
                          {friend.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{friend.name}</h4>
                          <p className="text-sm text-gray-600">@{friend.username}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {friend.location}
                          </p>
                          <div className="flex gap-2 mt-2">
                            {friend.tangoRoles?.map((role: string) => (
                              <Badge key={role} variant="outline" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                          {friend.mutualFriends && (
                            <p className="text-xs text-gray-500 mt-2">
                              {friend.mutualFriends} mutual friends
                            </p>
                          )}
                          {!friend.isOnline && friend.lastSeen && (
                            <p className="text-xs text-gray-500 mt-1">
                              Last seen {friend.lastSeen}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                {getTabContent().length === 0 && (
                  <div className="col-span-2 text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {activeTab === 'online' 
                        ? 'No friends are online right now' 
                        : 'You haven\'t added any friends yet'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Send Friend Request Modal */}
        {showSendRequestModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Send Friend Request</h3>
              
              {/* Search Users */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search for users
                </label>
                <Input
                  type="text"
                  placeholder="Type a name or username..."
                  onChange={(e) => searchUsers(e.target.value)}
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mb-4 max-h-48 overflow-y-auto">
                  {searchResults.map(user => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`p-3 border rounded-lg mb-2 cursor-pointer transition-colors ${
                        selectedUser?.id === user.id 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-600">@{user.username}</p>
                          <p className="text-xs text-gray-500">{user.location}</p>
                        </div>
                        {user.mutualFriends && (
                          <Badge variant="outline" className="text-xs">
                            {user.mutualFriends} mutual
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected User & Note */}
              {selectedUser && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add a note (optional)
                  </label>
                  <Textarea
                    placeholder="Hi! I'd love to connect..."
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={handleSendRequest}
                  disabled={!selectedUser || sendRequestMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Request
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSendRequestModal(false);
                    setSelectedUser(null);
                    setRequestNote('');
                    setSearchResults([]);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}