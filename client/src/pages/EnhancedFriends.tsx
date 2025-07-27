import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useHotkeys } from 'react-hotkeys-hook';
import InfiniteScroll from 'react-infinite-scroll-component';
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided, DraggableStateSnapshot, DroppableProvided, DroppableStateSnapshot } from 'react-beautiful-dnd';
import AvatarGroup from 'react-avatar-group';
import Fuse from 'fuse.js';
import Select from 'react-select';
import { animated, useSpring } from 'react-spring';
import { 
  FacebookShareButton, 
  TwitterShareButton, 
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon 
} from 'react-share';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import LazyLoad from 'react-lazyload';
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
  Music,
  Star,
  Activity,
  Filter,
  Download,
  Share2,
  Grid,
  List,
  ArrowUpDown,
  Zap,
  TrendingUp
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
  favoriteGroup?: string;
  lastActivity?: {
    type: string;
    message: string;
    timestamp: string;
  };
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

interface FriendApiResponse {
  success: boolean;
  data: Friend[];
}

interface RequestApiResponse {
  success: boolean;
  data: FriendRequest[];
}

const filterOptions = [
  { value: 'all', label: 'All Friends' },
  { value: 'online', label: 'Online Only' },
  { value: 'dancers', label: 'Dancers' },
  { value: 'teachers', label: 'Teachers' },
  { value: 'organizers', label: 'Organizers' },
  { value: 'performers', label: 'Performers' },
  { value: 'location', label: 'By Location' }
];

const sortOptions = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'recent', label: 'Recently Active' },
  { value: 'mutual', label: 'Mutual Friends' },
  { value: 'location', label: 'Location' }
];

export default function EnhancedFriendsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showSendRequestModal, setShowSendRequestModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Friend | null>(null);
  const [requestNote, setRequestNote] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]);
  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
  const [hasMore, setHasMore] = useState(true);
  const [friendGroups, setFriendGroups] = useState<Record<string, string[]>>({
    favorites: [],
    closeCircle: [],
    professional: []
  });
  const { toast } = useToast();

  // Animations
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 280, friction: 60 }
  });

  // Keyboard shortcuts
  useHotkeys('cmd+f, ctrl+f', (e) => {
    e.preventDefault();
    document.getElementById('friend-search')?.focus();
  });

  useHotkeys('cmd+a, ctrl+a', (e) => {
    e.preventDefault();
    setShowSendRequestModal(true);
  });

  // Fetch friends data
  const { data: friendsData, isLoading: friendsLoading } = useQuery<FriendApiResponse>({
    queryKey: ['/api/friends'],
    enabled: true
  });

  // Fetch friend requests
  const { data: requestsData, isLoading: requestsLoading } = useQuery<RequestApiResponse>({
    queryKey: ['/api/friends/requests'],
    enabled: true
  });

  // Fetch friend suggestions
  const { data: suggestionsData } = useQuery<FriendApiResponse>({
    queryKey: ['/api/friends/suggestions'],
    enabled: activeTab === 'suggestions'
  });

  const friends = friendsData?.data || [];
  const requests = requestsData?.data || [];
  const suggestions = suggestionsData?.data || [];

  // Fuzzy search setup
  const fuse = useMemo(() => {
    return new Fuse(friends, {
      keys: ['name', 'username', 'location', 'tangoRoles'],
      threshold: 0.3,
      includeScore: true
    });
  }, [friends]);

  // Search friends with fuzzy matching
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return friends;
    return fuse.search(searchQuery).map(result => result.item);
  }, [searchQuery, fuse, friends]);

  // Filter and sort friends
  const filteredAndSortedFriends = useMemo(() => {
    let filtered = searchResults;

    // Apply filters
    switch (selectedFilter.value) {
      case 'online':
        filtered = filtered.filter(f => f.isOnline);
        break;
      case 'dancers':
        filtered = filtered.filter(f => f.tangoRoles?.includes('dancer'));
        break;
      case 'teachers':
        filtered = filtered.filter(f => f.tangoRoles?.includes('teacher'));
        break;
      case 'organizers':
        filtered = filtered.filter(f => f.tangoRoles?.includes('organizer'));
        break;
      case 'performers':
        filtered = filtered.filter(f => f.tangoRoles?.includes('performer'));
        break;
    }

    // Apply sorting
    const sorted = [...filtered];
    switch (selectedSort.value) {
      case 'name':
        sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'recent':
        sorted.sort((a, b) => {
          const aTime = a.lastActivity?.timestamp || '0';
          const bTime = b.lastActivity?.timestamp || '0';
          return bTime.localeCompare(aTime);
        });
        break;
      case 'mutual':
        sorted.sort((a, b) => (b.mutualFriends || 0) - (a.mutualFriends || 0));
        break;
      case 'location':
        sorted.sort((a, b) => (a.location || '').localeCompare(b.location || ''));
        break;
    }

    return sorted;
  }, [searchResults, selectedFilter, selectedSort]);

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
        title: '🎉 Friend request sent!',
        description: 'Your friend request has been sent successfully.'
      });
      setShowSendRequestModal(false);
      setSelectedUser(null);
      setRequestNote('');
    }
  });

  // Handle drag and drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const friendId = result.draggableId;
    const destinationGroup = result.destination.droppableId;
    const sourceGroup = result.source.droppableId;

    setFriendGroups(prev => {
      const newGroups = { ...prev };
      
      // Remove from source group
      if (sourceGroup !== 'all') {
        newGroups[sourceGroup] = newGroups[sourceGroup].filter(id => id !== friendId);
      }
      
      // Add to destination group
      if (destinationGroup !== 'all' && !newGroups[destinationGroup].includes(friendId)) {
        newGroups[destinationGroup] = [...newGroups[destinationGroup], friendId];
      }
      
      return newGroups;
    });

    toast({
      title: '✨ Friend categorized',
      description: `Friend moved to ${destinationGroup} group`
    });
  };

  // Export friends to CSV
  const exportFriendsToCSV = () => {
    const csvContent = [
      ['Name', 'Username', 'Location', 'Roles', 'Mutual Friends'].join(','),
      ...friends.map(f => [
        f.name,
        f.username,
        f.location || '',
        (f.tangoRoles || []).join(';'),
        f.mutualFriends || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mundo-tango-friends.csv';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: '📥 Friends exported',
      description: 'Your friends list has been exported to CSV'
    });
  };

  // Infinite scroll load more
  const loadMoreFriends = () => {
    // In a real app, this would fetch more friends from the API
    setTimeout(() => {
      setHasMore(false);
    }, 1000);
  };

  // Friend activity feed
  const recentActivities = friends
    .filter(f => f.lastActivity)
    .sort((a, b) => {
      const aTime = a.lastActivity?.timestamp || '0';
      const bTime = b.lastActivity?.timestamp || '0';
      return bTime.localeCompare(aTime);
    })
    .slice(0, 10);

  if (friendsLoading || requestsLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto p-6">
          <Skeleton height={60} className="mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} height={100} />
            ))}
          </div>
          <Skeleton height={400} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <animated.div style={fadeIn} className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">
              Friends
            </h1>
            <p className="text-gray-600 mt-1">Connect with dancers in your community</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={exportFriendsToCSV}
              variant="outline"
              className="border-turquoise-200 hover:bg-turquoise-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={() => setShowSendRequestModal(true)}
              className="bg-gradient-to-r from-turquoise-400 to-cyan-500 hover:from-turquoise-500 hover:to-cyan-600 text-white"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Friends
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-r from-turquoise-50 to-cyan-50 glassmorphic-card hover:scale-105 transition-transform">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-turquoise-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{friends.length}</p>
                <p className="text-sm text-gray-600">Total Friends</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-r from-turquoise-50 to-blue-50 glassmorphic-card hover:scale-105 transition-transform">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-cyan-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {friends.filter(f => f.isOnline).length}
                </p>
                <p className="text-sm text-gray-600">Online Now</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 glassmorphic-card hover:scale-105 transition-transform">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter((r: FriendRequest) => r.status === 'pending').length}
                </p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-turquoise-50 glassmorphic-card hover:scale-105 transition-transform">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-cyan-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {friendGroups.favorites.length}
                </p>
                <p className="text-sm text-gray-600">Favorites</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-turquoise-50 glassmorphic-card hover:scale-105 transition-transform">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {recentActivities.length}
                </p>
                <p className="text-sm text-gray-600">Active Today</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="friend-search"
                type="text"
                placeholder="Search friends by name, username, or location... (Cmd+F)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedFilter}
              onChange={(newValue) => {
                if (newValue) setSelectedFilter(newValue);
              }}
              options={filterOptions}
              className="w-48"
              placeholder="Filter by..."
            />
            <Select
              value={selectedSort}
              onChange={(newValue) => {
                if (newValue) setSelectedSort(newValue);
              }}
              options={sortOptions}
              className="w-48"
              placeholder="Sort by..."
            />
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Friend Activity Feed */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-turquoise-600" />
                Friend Activity
              </h3>
              <div className="space-y-3">
                {recentActivities.map((friend) => (
                  <LazyLoad key={friend.id} height={60} once>
                    <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="w-8 h-8 bg-gradient-to-r from-turquoise-400 to-cyan-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {friend.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {friend.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {friend.lastActivity?.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {friend.lastActivity?.timestamp}
                        </p>
                      </div>
                    </div>
                  </LazyLoad>
                ))}
              </div>
            </Card>
          </div>

          {/* Friends List with Drag & Drop */}
          <div className="lg:col-span-3">
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Friend Groups */}
                {[
                  { id: 'favorites', title: 'Favorites', icon: Star, color: 'yellow' },
                  { id: 'closeCircle', title: 'Close Circle', icon: Heart, color: 'rose' },
                  { id: 'professional', title: 'Professional', icon: Zap, color: 'purple' }
                ].map((group) => (
                  <Droppable key={group.id} droppableId={group.id}>
                    {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`p-4 min-h-[100px] transition-all ${
                          snapshot.isDraggingOver 
                            ? `bg-${group.color}-50 border-${group.color}-300 scale-105` 
                            : ''
                        }`}
                      >
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <group.icon className={`w-4 h-4 text-${group.color}-600`} />
                          {group.title}
                          <Badge variant="secondary" className="ml-auto">
                            {friendGroups[group.id]?.length || 0}
                          </Badge>
                        </h4>
                        <div className="space-y-2">
                          {friendGroups[group.id]?.map((friendId, index) => {
                            const friend = friends.find(f => f.id === friendId);
                            if (!friend) return null;
                            return (
                              <Draggable
                                key={friendId}
                                draggableId={friendId}
                                index={index}
                              >
                                {(provided: DraggableProvided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="bg-white p-2 rounded-lg border text-sm"
                                  >
                                    {friend.name}
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      </Card>
                    )}
                  </Droppable>
                ))}
              </div>

              {/* All Friends List */}
              <Droppable droppableId="all">
                {(provided: DroppableProvided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    id="scrollableDiv"
                    style={{ height: '600px', overflow: 'auto' }}
                  >
                    <InfiniteScroll
                      dataLength={filteredAndSortedFriends.length}
                      next={loadMoreFriends}
                      hasMore={hasMore}
                      loader={
                        <div className="text-center py-4">
                          <Skeleton height={100} count={3} />
                        </div>
                      }
                      endMessage={
                        <p className="text-center py-4 text-gray-500">
                          <b>🎉 You've seen all your friends!</b>
                        </p>
                      }
                      scrollableTarget="scrollableDiv"
                    >
                      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
                        {filteredAndSortedFriends.map((friend, index) => (
                          <Draggable
                            key={friend.id}
                            draggableId={friend.id}
                            index={index}
                          >
                            {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <LazyLoad height={150} once>
                                  <Card 
                                    className={`p-4 transition-all ${
                                      snapshot.isDragging 
                                        ? 'shadow-2xl scale-105 rotate-2' 
                                        : 'hover:shadow-lg'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex gap-4">
                                        <div className="relative">
                                          <div className="w-12 h-12 bg-gradient-to-r from-turquoise-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold">
                                            {friend.name?.charAt(0) || 'U'}
                                          </div>
                                          {friend.isOnline && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          <h4 className="font-semibold text-gray-900">{friend.name}</h4>
                                          <p className="text-sm text-gray-600">@{friend.username}</p>
                                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                            <MapPin className="w-3 h-3" />
                                            {friend.location}
                                          </p>
                                          <div className="flex gap-2 mt-2">
                                            {friend.tangoRoles?.map(role => (
                                              <Badge key={role} variant="outline" className="text-xs border-turquoise-200">
                                                {role}
                                              </Badge>
                                            ))}
                                          </div>
                                          {friend.mutualFriends && friend.mutualFriends > 0 && (
                                            <p className="text-xs text-gray-500 mt-2">
                                              {friend.mutualFriends} mutual friends
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex gap-1">
                                        <Button size="icon" variant="ghost">
                                          <MessageCircle className="w-4 h-4" />
                                        </Button>
                                        <div className="relative group">
                                          <Button size="icon" variant="ghost">
                                            <Share2 className="w-4 h-4" />
                                          </Button>
                                          <div className="absolute right-0 mt-1 hidden group-hover:flex gap-1 bg-white shadow-lg rounded-lg p-2">
                                            <FacebookShareButton
                                              url={`https://mundotango.life/profile/${friend.username}`}
                                            >
                                              <FacebookIcon size={24} round />
                                            </FacebookShareButton>
                                            <TwitterShareButton
                                              url={`https://mundotango.life/profile/${friend.username}`}
                                              title={`Check out ${friend.name} on Mundo Tango!`}
                                            >
                                              <TwitterIcon size={24} round />
                                            </TwitterShareButton>
                                            <WhatsappShareButton
                                              url={`https://mundotango.life/profile/${friend.username}`}
                                              title={`Check out ${friend.name} on Mundo Tango!`}
                                            >
                                              <WhatsappIcon size={24} round />
                                            </WhatsappShareButton>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </Card>
                                </LazyLoad>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </div>
                      {provided.placeholder}
                    </InfiniteScroll>
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Press <kbd className="px-2 py-1 bg-gray-100 rounded">Cmd+F</kbd> to search • 
            <kbd className="px-2 py-1 bg-gray-100 rounded ml-2">Cmd+A</kbd> to add friends
          </p>
        </div>
      </animated.div>
    </DashboardLayout>
  );
}