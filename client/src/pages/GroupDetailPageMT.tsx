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
        <div className="mt-info-card">
          <div className="mt-info-card-header">
            <Zap className="mt-info-card-icon" />
            <h3 className="mt-info-card-title">What we do</h3>
          </div>
          <div className="mt-info-card-content space-y-3">
            <div className="flex items-start gap-3">
              <Music className="h-5 w-5 text-pink-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">Weekly Milongas</h4>
                <p className="text-sm">Join us every Friday for social dancing</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">Workshops</h4>
                <p className="text-sm">Monthly workshops with guest teachers</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Trophy className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">Performances</h4>
                <p className="text-sm">Showcase your skills at our events</p>
              </div>
            </div>
          </div>
        </div>
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

  const renderMembersTab = () => (
    <div className="space-y-6">
      {/* Member Search */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{group.memberCount} Members</h3>
        {isAdmin && (
          <Button className="mt-action-button mt-action-button-primary">
            <UserPlus className="h-4 w-4" />
            Invite Members
          </Button>
        )}
      </div>

      {/* Members Grid */}
      <div className="mt-members-grid">
        {group.members?.map((member: GroupMember) => (
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
              <p className="mt-member-role">
                {member.role === 'admin' ? 'Admin' : 'Member'} • Joined {new Date(member.joinedAt).toLocaleDateString()}
              </p>
            </div>
            {member.role === 'admin' && (
              <span className="mt-member-badge">Admin</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderEventsTab = () => (
    <div className="space-y-6">
      {/* Events Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Upcoming Events</h3>
        {isMember && (
          <Button className="mt-action-button mt-action-button-primary">
            <Calendar className="h-4 w-4" />
            Create Event
          </Button>
        )}
      </div>

      {/* Events List */}
      <div className="mt-events-list">
        {/* Mock events for now */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="mt-event-item">
            <div className="mt-event-date">
              <div className="mt-event-day">{15 + i}</div>
              <div className="mt-event-month">JAN</div>
            </div>
            <div className="mt-event-details">
              <h4 className="mt-event-title">Weekly Milonga at {group.name}</h4>
              <div className="mt-event-info">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  9:00 PM
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {group.city || 'Buenos Aires'}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {42 + i * 7} attending
                </span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {false && (
        <div className="mt-empty-state">
          <Calendar className="mt-empty-icon" />
          <h3 className="mt-empty-title">No upcoming events</h3>
          <p className="mt-empty-description">
            Be the first to organize an event for this group!
          </p>
          {isMember && (
            <Button className="mt-action-button mt-action-button-primary">
              Create First Event
            </Button>
          )}
        </div>
      )}
    </div>
  );

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
              <button className="w-full text-left px-4 py-3 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors">
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
      {[1, 2, 3].map((i) => (
        <div key={i} className="mt-info-card">
          <div className="flex items-start gap-3 mb-4">
            <div className="mt-member-avatar">
              M{i}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">Member {i}</h4>
              <p className="text-sm text-gray-500">2 hours ago</p>
            </div>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
          <p className="mb-4">
            Just had an amazing practice session! Working on my ochos and feeling great progress. 
            Who else is practicing today? 💃
          </p>
          <div className="flex items-center gap-6 text-gray-500">
            <button className="flex items-center gap-2 hover:text-pink-500 transition-colors">
              <Heart className="h-5 w-5" />
              <span className="text-sm font-medium">12</span>
            </button>
            <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-medium">5</span>
            </button>
            <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
              <Share2 className="h-5 w-5" />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );

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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}