import React, { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import DashboardLayout from '@/layouts/DashboardLayout';
import { 
  ArrowLeft, MapPin, Users, Globe, Lock, Calendar, MessageCircle, 
  Camera, Settings, UserPlus, Heart, Share2, MoreVertical, Flag,
  Image, Video, FileText, Link as LinkIcon, UserCheck, UserX,
  Star, Clock, Info, Home, Music, BookOpen, Trophy, Zap, Mail,
  Eye, ChevronRight, AlertCircle, Shield, Edit
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import EventMap from '@/components/EventMap';
import { Filter } from 'lucide-react';
import CommunityToolbar from '@/components/CommunityToolbar';
import CommunityMapWithLayers from '@/components/CommunityMapWithLayers';
import HostHomesList from '@/components/Housing/HostHomesList';
import RecommendationsList from '@/components/Recommendations/RecommendationsList';
import '../styles/ttfiles.css';
import '../styles/mt-group.css';

interface GroupMember {
  user: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
  role: string;
  joinedAt: string;
}

interface GroupEvent {
  id: number;
  title: string;
  startDate: string;
  location: string;
  attendeeCount: number;
}

interface GroupPost {
  id: number;
  content: string;
  author: {
    name: string;
    username: string;
    profileImage?: string;
  };
  createdAt: string;
  likesCount: number;
  commentsCount: number;
}

export default function GroupDetailPageMT() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('about');
  
  // Member data state
  const [memberData, setMemberData] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  
  // Event filtering state
  const [eventFilters, setEventFilters] = useState({
    search: '',
    eventType: 'all',
    dateRange: { start: '', end: '' },
    location: '',
    priceRange: { min: 0, max: 1000 },
    hasSpace: false
  });
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  // Event data state
  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Post data state
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsPage, setPostsPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  // Fetch member details with roles when members tab is active
  React.useEffect(() => {
    if (activeTab === 'members' && slug) {
      setLoadingMembers(true);
      fetch(`/api/groups/${slug}/members`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setMemberData(data.data);
          }
          setLoadingMembers(false);
        })
        .catch(() => setLoadingMembers(false));
    }
  }, [activeTab, slug]);
  
  // Fetch group events when events tab is active
  React.useEffect(() => {
    if (activeTab === 'events' && slug) {
      setLoadingEvents(true);
      fetch(`/api/groups/${slug}/events`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setEvents(data.data || []);
          }
          setLoadingEvents(false);
        })
        .catch(() => setLoadingEvents(false));
    }
  }, [activeTab, slug]);
  
  // Fetch group posts when posts tab is active
  React.useEffect(() => {
    if (activeTab === 'posts' && slug) {
      fetchPosts();
    }
  }, [activeTab, slug, postsPage]);
  
  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      const response = await fetch(`/api/groups/${slug}/posts?page=${postsPage}&limit=10`);
      const data = await response.json();
      
      if (data.success) {
        if (postsPage === 1) {
          setPosts(data.data || []);
        } else {
          setPosts(prev => [...prev, ...(data.data || [])]);
        }
        setHasMorePosts((data.data || []).length === 10);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };
  
  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const seconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return postDate.toLocaleDateString();
  };

  // Fetch group details with members
  const { data: response, isLoading, error } = useQuery({
    queryKey: [`/api/groups/${slug}`],
    enabled: !!slug,
    retry: 2,
  });

  // Extract group data from API response
  const group = response?.data;
  
  // Check if user is member/admin
  const isMember = group?.members?.some((m: GroupMember) => m.user.id === user?.id) || false;
  const isAdmin = group?.members?.some((m: GroupMember) => m.user.id === user?.id && m.role === 'admin') || false;
  const memberRole = group?.members?.find((m: GroupMember) => m.user.id === user?.id)?.role || 'member';

  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/user/join-group/${slug}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to join group');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Welcome to the group!',
        description: `You are now a member of ${group?.name}`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${slug}`] });
    },
  });

  // Leave group mutation
  const leaveGroupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/user/leave-group/${slug}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to leave group');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Left group',
        description: `You have left ${group?.name}`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${slug}`] });
    },
  });

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading group details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !group) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Group not found</h2>
            <p className="text-gray-600 mb-6">This group may have been removed or you don't have access.</p>
            <Button 
              onClick={() => setLocation('/groups')}
              className="mt-action-button mt-action-button-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Groups
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const renderAboutTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Info */}
      <div className="lg:col-span-2 space-y-6">
        {/* Description */}
        <div className="mt-info-card">
          <div className="mt-info-card-header">
            <Info className="mt-info-card-icon" />
            <h3 className="mt-info-card-title">About this group</h3>
          </div>
          <div className="mt-info-card-content">
            <p>{group.description || 'No description provided.'}</p>
          </div>
        </div>

        {/* Group Rules */}
        {group.rules && (
          <div className="mt-info-card">
            <div className="mt-info-card-header">
              <Shield className="mt-info-card-icon" />
              <h3 className="mt-info-card-title">Group Rules</h3>
            </div>
            <div className="mt-info-card-content">
              <p className="whitespace-pre-wrap">{group.rules}</p>
            </div>
          </div>
        )}

        {/* Group Activities */}
        {group.activities && group.activities.length > 0 && (
          <div className="mt-info-card">
            <div className="mt-info-card-header">
              <Zap className="mt-info-card-icon" />
              <h3 className="mt-info-card-title">What we do</h3>
            </div>
            <div className="mt-info-card-content space-y-3">
              {group.activities.map((activity: any, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  {activity.icon === 'music' && <Music className="h-5 w-5 text-pink-500 mt-0.5" />}
                  {activity.icon === 'book' && <BookOpen className="h-5 w-5 text-blue-500 mt-0.5" />}
                  {activity.icon === 'trophy' && <Trophy className="h-5 w-5 text-purple-500 mt-0.5" />}
                  {!activity.icon && <Zap className="h-5 w-5 text-purple-500 mt-0.5" />}
                  <div>
                    <h4 className="font-semibold">{activity.title}</h4>
                    <p className="text-sm">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Group Tags/Interests */}
        {group.tags && group.tags.length > 0 && (
          <div className="mt-info-card">
            <div className="mt-info-card-header">
              <Heart className="mt-info-card-icon" />
              <h3 className="mt-info-card-title">Our Interests</h3>
            </div>
            <div className="mt-info-card-content">
              <div className="flex flex-wrap gap-2">
                {group.tags.map((tag: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-gradient-to-r from-pink-100 to-purple-100 text-sm rounded-full text-gray-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Info */}
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="mt-info-card">
          <div className="mt-info-card-header">
            <Star className="mt-info-card-icon" />
            <h3 className="mt-info-card-title">Group Stats</h3>
          </div>
          <div className="mt-info-card-content space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Members</span>
              <span className="font-semibold">{group.memberCount || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Created</span>
              <span className="font-semibold">
                {new Date(group.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Type</span>
              <span className="font-semibold capitalize">{group.type}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Privacy</span>
              <span className="font-semibold capitalize">{group.privacy || 'public'}</span>
            </div>
          </div>
        </div>

        {/* Group Admins */}
        <div className="mt-info-card">
          <div className="mt-info-card-header">
            <Shield className="mt-info-card-icon" />
            <h3 className="mt-info-card-title">Group Admins</h3>
          </div>
          <div className="mt-info-card-content space-y-3">
            {group.members?.filter((m: GroupMember) => m.role === 'admin').map((admin: GroupMember) => (
              <div key={admin.user.id} className="flex items-center gap-3">
                <div className="mt-member-avatar text-sm">
                  {admin.user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{admin.user.name}</p>
                  <p className="text-xs text-gray-500">@{admin.user.username}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMembersTab = () => {
    // Filter to show only professional members (teachers, organizers, DJs, etc.)
    const professionalRoles = ['teacher', 'organizer', 'dj', 'performer', 'musician', 'photographer', 'videographer'];
    
    // Filter professional members
    const professionalMembers = memberData.filter(member => 
      member.tangoRoles?.some((role: string) => professionalRoles.includes(role))
    );
    
    return (
      <div className="space-y-6">
        {/* Member Search */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Professional Members</h3>
            <p className="text-sm text-gray-500">
              {professionalMembers.length} professionals • {memberData.length} total members
            </p>
          </div>
          {isAdmin && (
            <Button className="mt-action-button mt-action-button-primary">
              <UserPlus className="h-4 w-4" />
              Invite Members
            </Button>
          )}
        </div>

        {/* Professional Members Grid */}
        {loadingMembers ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-500"></div>
          </div>
        ) : professionalMembers.length > 0 ? (
          <div className="mt-members-grid">
            {professionalMembers.map((member: any) => (
              <div 
                key={member.user.id} 
                className="mt-member-card"
                onClick={() => setLocation(`/u/${member.user.username}`)}
              >
                <div className="mt-member-avatar">
                  {member.user.profileImage ? (
                    <img src={member.user.profileImage} alt={member.user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    member.user.name.charAt(0)
                  )}
                </div>
                <div className="mt-member-info">
                  <p className="mt-member-name">{member.user.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {member.tangoRoles?.filter((role: string) => professionalRoles.includes(role)).map((role: string) => (
                      <span key={role} className="text-xs bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2 py-0.5 rounded-full">
                        {role}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </p>
                </div>
                {member.role === 'admin' && (
                  <span className="mt-member-badge">Admin</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-empty-state">
            <Users className="mt-empty-icon" />
            <h3 className="mt-empty-title">No professional members yet</h3>
            <p className="mt-empty-description">
              Teachers, organizers, and other professionals will appear here when they join.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderEventsTab = () => {
    // Filter events based on current filters
    const filteredEvents = events.filter(event => {
      if (eventFilters.search && !event.title.toLowerCase().includes(eventFilters.search.toLowerCase())) {
        return false;
      }
      if (eventFilters.eventType !== 'all' && event.eventType !== eventFilters.eventType) {
        return false;
      }
      if (eventFilters.dateRange.start && new Date(event.startDate) < new Date(eventFilters.dateRange.start)) {
        return false;
      }
      if (eventFilters.dateRange.end && new Date(event.startDate) > new Date(eventFilters.dateRange.end)) {
        return false;
      }
      if (eventFilters.location && !event.location.toLowerCase().includes(eventFilters.location.toLowerCase())) {
        return false;
      }
      if (eventFilters.hasSpace && event.attendeeCount >= event.maxAttendees) {
        return false;
      }
      return true;
    });

    return (
      <div className="space-y-6">
        {/* Events Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Group Events</h3>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <Calendar className="h-4 w-4" />
                List
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <MapPin className="h-4 w-4" />
                Map
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-pink-50' : ''}
            >
              <Filter className="h-4 w-4" />
              Filters {filteredEvents.length !== events.length && `(${filteredEvents.length})`}
            </Button>
            {isMember && (
              <Button className="mt-action-button mt-action-button-primary">
                <Calendar className="h-4 w-4" />
                Create Event
              </Button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="text-sm font-medium mb-1 block">Search</label>
                <input
                  type="text"
                  placeholder="Search events..."
                  value={eventFilters.search}
                  onChange={(e) => setEventFilters({...eventFilters, search: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              {/* Event Type */}
              <div>
                <label className="text-sm font-medium mb-1 block">Type</label>
                <select
                  value={eventFilters.eventType}
                  onChange={(e) => setEventFilters({...eventFilters, eventType: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="all">All Types</option>
                  <option value="milonga">Milonga</option>
                  <option value="practica">Práctica</option>
                  <option value="workshop">Workshop</option>
                  <option value="festival">Festival</option>
                  <option value="concert">Concert</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="text-sm font-medium mb-1 block">Location</label>
                <input
                  type="text"
                  placeholder="Search location..."
                  value={eventFilters.location}
                  onChange={(e) => setEventFilters({...eventFilters, location: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Date Range */}
              <div>
                <label className="text-sm font-medium mb-1 block">From Date</label>
                <input
                  type="date"
                  value={eventFilters.dateRange.start}
                  onChange={(e) => setEventFilters({...eventFilters, dateRange: {...eventFilters.dateRange, start: e.target.value}})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">To Date</label>
                <input
                  type="date"
                  value={eventFilters.dateRange.end}
                  onChange={(e) => setEventFilters({...eventFilters, dateRange: {...eventFilters.dateRange, end: e.target.value}})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Has Space */}
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eventFilters.hasSpace}
                    onChange={(e) => setEventFilters({...eventFilters, hasSpace: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-sm">Only show events with space</span>
                </label>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEventFilters({
                search: '',
                eventType: 'all',
                dateRange: { start: '', end: '' },
                location: '',
                priceRange: { min: 0, max: 1000 },
                hasSpace: false
              })}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* View Mode Content */}
        {viewMode === 'list' ? (
          <div className="mt-events-list">
            {loadingEvents ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-500"></div>
              </div>
            ) : filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <div key={event.id} className="mt-event-item" onClick={() => setLocation(`/events/${event.id}`)}>
                  <div className="mt-event-date">
                    <div className="mt-event-day">{new Date(event.startDate).getDate()}</div>
                    <div className="mt-event-month">{new Date(event.startDate).toLocaleDateString('en', { month: 'short' }).toUpperCase()}</div>
                  </div>
                  <div className="mt-event-details">
                    <h4 className="mt-event-title">{event.title}</h4>
                    <div className="mt-event-info">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(event.startDate).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {event.attendeeCount || 0} attending
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              ))
            ) : (
              <div className="mt-empty-state">
                <Calendar className="mt-empty-icon" />
                <h3 className="mt-empty-title">No events found</h3>
                <p className="mt-empty-description">
                  {events.length > 0 ? 'Try adjusting your filters' : 'Be the first to organize an event for this group!'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-[600px] relative">
            <EventMap 
              events={filteredEvents}
              cityLat={group?.latitude}
              cityLng={group?.longitude}
              onEventClick={(event) => setLocation(`/events/${event.id}`)}
            />
          </div>
        )}
      </div>
    );
  };

  const renderPostsTab = () => (
      <div className="space-y-6">
        {/* Create Post */}
        {isMember && (
          <div className="mt-info-card">
            <div className="flex gap-3">
              <div className="mt-member-avatar">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || 'U'
                )}
              </div>
              <div className="flex-1">
                <button 
                  onClick={() => setLocation(`/groups/${slug}/create-post`)}
                  className="w-full text-left px-4 py-3 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  Share something with the group...
                </button>
                <div className="flex gap-2 mt-3">
                  <Button variant="ghost" size="sm" className="text-pink-600 hover:bg-pink-50">
                    <Image className="h-4 w-4 mr-2" />
                    Photo
                  </Button>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                    <Video className="h-4 w-4 mr-2" />
                    Video
                  </Button>
                  <Button variant="ghost" size="sm" className="text-purple-600 hover:bg-purple-50">
                    <Calendar className="h-4 w-4 mr-2" />
                    Event
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
  
        {/* Posts List */}
        {loadingPosts && postsPage === 1 ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-500"></div>
          </div>
        ) : posts.length > 0 ? (
          <>
            {posts.map((post) => (
              <div key={post.id} className="mt-info-card">
                <div className="flex items-start gap-3 mb-4">
                  <div className="mt-member-avatar cursor-pointer" onClick={() => setLocation(`/u/${post.author.username}`)}>
                    {post.author.profileImage ? (
                      <img src={post.author.profileImage} alt={post.author.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      post.author.name?.charAt(0) || 'U'
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold cursor-pointer hover:underline" onClick={() => setLocation(`/u/${post.author.username}`)}>
                      {post.author.name}
                    </h4>
                    <p className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                
                <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
                
                {/* Media Assets */}
                {post.mediaAssets && post.mediaAssets.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {post.mediaAssets.map((media: any) => (
                      <div key={media.id} className="relative rounded-lg overflow-hidden">
                        {media.fileType === 'image' ? (
                          <img src={media.fileUrl} alt="" className="w-full h-48 object-cover" />
                        ) : media.fileType === 'video' ? (
                          <video src={media.fileUrl} className="w-full h-48 object-cover" controls />
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-6 text-gray-500">
                  <button className={`flex items-center gap-2 transition-colors ${post.isLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}>
                    <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm font-medium">{post.likesCount || 0}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">{post.commentsCount || 0}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
                    <Share2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Share</span>
                  </button>
                </div>
              </div>
            ))}
            
            {/* Load More */}
            {hasMorePosts && (
              <div className="text-center">
                <Button
                  onClick={() => setPostsPage(prev => prev + 1)}
                  disabled={loadingPosts}
                  className="mt-action-button mt-action-button-secondary"
                >
                  {loadingPosts ? 'Loading...' : 'Load More Posts'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="mt-empty-state">
            <MessageCircle className="mt-empty-icon" />
            <h3 className="mt-empty-title">No posts yet</h3>
            <p className="mt-empty-description">
              {isMember ? 'Be the first to share something with the group!' : 'Join the group to see and create posts.'}
            </p>
          </div>
        )}
      </div>
  );

  const renderHousingTab = () => {
    return (
      <div className="space-y-6">
        {/* Host Onboarding for Super Admin */}
        {user?.isSuperAdmin && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-900">Super Admin Actions</span>
            </div>
            <Button
              onClick={() => setLocation('/host-onboarding')}
              className="mt-action-button mt-action-button-primary"
            >
              <Home className="h-4 w-4" />
              Start Host Onboarding
            </Button>
          </div>
        )}
        
        <HostHomesList 
          groupSlug={group.slug}
          city={group.city}
          showFilters={false}
        />
      </div>
    );
  };

  const renderRecommendationsTab = () => {
    return (
      <div className="space-y-6">
        <RecommendationsList 
          groupSlug={group.slug}
          city={group.city}
          showFilters={false}
        />
      </div>
    );
  };

  const renderCommunityHub = () => {
    return (
      <div className="space-y-6">
        {/* Super admin sees host onboarding option */}
        {user?.isSuperAdmin && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-6 w-6 text-purple-600" />
                  <h3 className="text-lg font-bold text-purple-900">Super Admin Host Management</h3>
                </div>
                <p className="text-purple-700">Manage host homes and onboard new hosts for this community.</p>
              </div>
              <Button
                onClick={() => setLocation('/host-onboarding')}
                className="bg-gradient-to-br from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
              >
                <Home className="h-4 w-4 mr-2" />
                Start Host Onboarding
              </Button>
            </div>
          </div>
        )}

        {/* All users see the community toolbar */}
        <CommunityToolbar 
          city={group.city} 
          groupSlug={group.slug}
        />
        
        {/* Guest-specific messaging for non-super admins */}
        {!user?.isSuperAdmin && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mt-4">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              <p className="text-blue-800">
                Browse available host homes, local recommendations, and events in {group.city}. 
                Click on any home to request a stay!
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMapTab = () => {
    // Get coordinates for the city if available
    const getCoordinatesForCity = (city: string) => {
      const cityCoordinates: { [key: string]: [number, number] } = {
        'Buenos Aires': [-34.6037, -58.3816],
        'Paris': [48.8566, 2.3522],
        'New York': [40.7128, -74.0060],
        'London': [51.5074, -0.1278],
        'Berlin': [52.5200, 13.4050],
        'Barcelona': [41.3851, 2.1734],
        'Rome': [41.9028, 12.4964],
        'Tokyo': [35.6762, 139.6503],
        'Sydney': [-33.8688, 151.2093],
        'Mexico City': [19.4326, -99.1332],
      };
      return cityCoordinates[city] || [-34.6037, -58.3816]; // Default to Buenos Aires
    };

    const cityCenter = group.city ? getCoordinatesForCity(group.city) : [-34.6037, -58.3816];

    return (
      <div className="space-y-6">
        <div className="mt-info-card">
          <div className="mt-info-card-header">
            <MapPin className="mt-info-card-icon" />
            <h3 className="mt-info-card-title">Community Map</h3>
          </div>
          <div className="mt-info-card-content p-0">
            <div className="p-4 border-b border-gray-200">
              <p className="text-gray-600">
                Explore events, housing, and recommendations in {group.city || 'your city'}. 
                Filter by friend connections, local vs visitor recommendations, and property types.
              </p>
            </div>
            
            {/* Map Container */}
            <div className="h-[600px] relative">
              <CommunityMapWithLayers
                groupCity={group.city}
                centerLat={cityCenter[0]}
                centerLng={cityCenter[1]}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* MT Group Header */}
        <div className="mt-group-header">
          {(group.image_url || group.coverImage) && (
            <img 
              src={group.image_url || group.coverImage} 
              alt={`${group.city || group.name} cityscape`}
              className="mt-group-cover"
            />
          )}
          
          <div className="mt-group-header-content">
            <button
              onClick={() => setLocation('/groups')}
              className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Groups
            </button>
            
            <div className="flex items-end justify-between">
              <div>
                {/* Group Avatar */}
                <div className="mt-group-avatar mb-4">
                  {group.imageUrl ? (
                    <img src={group.imageUrl} alt={group.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold bg-gradient-to-br from-pink-400 to-purple-600 text-white">
                      {group.emoji || group.name.charAt(0)}
                    </div>
                  )}
                </div>
                
                {/* Group Info */}
                <h1 className="mt-group-title">{group.name}</h1>
                <p className="mt-group-subtitle">{group.tagline || `Welcome to ${group.name}`}</p>
                
                {/* Group Stats */}
                <div className="mt-group-stats">
                  <div className="mt-group-stat">
                    {group.privacy === 'public' ? (
                      <Globe className="mt-group-stat-icon" />
                    ) : (
                      <Lock className="mt-group-stat-icon" />
                    )}
                    <span>{group.privacy === 'public' ? 'Public' : 'Private'} Group</span>
                  </div>
                  <div className="mt-group-stat">
                    <Users className="mt-group-stat-icon" />
                    <span>{group.memberCount || 0} members</span>
                  </div>
                  {group.city && (
                    <div className="mt-group-stat">
                      <MapPin className="mt-group-stat-icon" />
                      <span>{group.city}{group.country ? `, ${group.country}` : ''}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                {isMember ? (
                  <>
                    {isAdmin && (
                      <Button
                        onClick={() => setLocation(`/groups/${slug}/edit`)}
                        className="mt-action-button mt-action-button-secondary"
                      >
                        <Settings className="h-4 w-4" />
                        Manage
                      </Button>
                    )}
                    <Button
                      onClick={() => leaveGroupMutation.mutate()}
                      disabled={leaveGroupMutation.isPending}
                      className="mt-action-button mt-action-button-danger"
                    >
                      <UserX className="h-4 w-4" />
                      Leave Group
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => joinGroupMutation.mutate()}
                    disabled={joinGroupMutation.isPending}
                    className="mt-action-button mt-action-button-primary"
                  >
                    <UserPlus className="h-4 w-4" />
                    Join Group
                  </Button>
                )}
                
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-4 py-6">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex gap-8" aria-label="Tabs">
              {[
                { id: 'about', label: 'About', icon: Info },
                { id: 'posts', label: 'Posts', icon: MessageCircle },
                { id: 'events', label: 'Events', icon: Calendar },
                { id: 'members', label: 'Members', icon: Users },
                { id: 'community-hub', label: 'Community Hub', icon: MapPin },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id 
                      ? 'border-pink-500 text-pink-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'about' && renderAboutTab()}
            {activeTab === 'members' && renderMembersTab()}
            {activeTab === 'events' && renderEventsTab()}
            {activeTab === 'posts' && renderPostsTab()}
            {activeTab === 'community-hub' && renderCommunityHub()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}