import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Search, Plus, Users, Globe, Lock, Star, MapPin, UserPlus, Calendar, MessageCircle, Heart, Music, Code } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function GroupsPage() {
  console.log('🎯 GROUPS PAGE COMPONENT RENDERING - v5 ROLE-BASED GROUPS');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch groups data with membership status
  const { data: groupsData, isLoading } = useQuery({
    queryKey: ['/api/groups'],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0, // Consider data stale immediately
    gcTime: 0, // Don't cache the data (v5 uses gcTime instead of cacheTime)
  });

  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async (slug: string) => {
      const response = await fetch(`/api/user/join-group/${slug}`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to join group');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Joined Community!",
        description: "You have successfully joined this community.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
    }
  });

  // Leave group mutation
  const leaveGroupMutation = useMutation({
    mutationFn: async (slug: string) => {
      const response = await fetch(`/api/user/leave-group/${slug}`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to leave group');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Left Community",
        description: "You have left this community.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
    }
  });

  // Get statistics based on groups data
  const stats = {
    totalCommunities: groupsData?.data?.groups?.length || 6,
    joinedCommunities: groupsData?.data?.groups?.filter((g: any) => g.isMember).length || 2,
    totalEvents: 132, // This would come from a separate API
    cities: new Set(groupsData?.data?.groups?.map((g: any) => g.city).filter(Boolean)).size || 4
  };

  // Get event counts per group (mock data for now)
  const getEventCount = (groupId: number) => {
    const eventCounts: Record<number, number> = {
      33: 8,
      34: 16, 
      35: 22,
      36: 14,
      37: 7,
      38: 18,
      39: 12
    };
    return eventCounts[groupId] || Math.floor(Math.random() * 20) + 5;
  };

  // Filter groups based on active filter and search
  const filteredGroups = groupsData?.data?.groups?.filter((group: any) => {
    const matchesSearch = searchQuery === '' || 
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (activeFilter) {
      case 'city':
        return group.type === 'city';
      case 'professional':
        return group.role_type && ['teacher', 'performer', 'organizer'].includes(group.role_type);
      case 'music':
        return group.role_type && ['musician', 'dj'].includes(group.role_type);
      case 'practice':
        return group.type === 'practice';
      case 'festivals':
        return group.type === 'festival';
      default:
        return true;
    }
  }) || [];

  const filterButtons = [
    { key: 'all', label: 'All Communities', icon: Globe },
    { key: 'city', label: 'City Groups', icon: MapPin },
    { key: 'professional', label: 'Professional', icon: Users },
    { key: 'music', label: 'Music', icon: Music },
    { key: 'practice', label: 'Practice', icon: Code },
    { key: 'festivals', label: 'Festivals', icon: Calendar }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tango Communities</h1>
          <p className="text-gray-600 mb-3">Connect with tango dancers around the world</p>
          <button
            onClick={() => setLocation('/community-world-map')}
            className="text-purple-600 hover:text-purple-700 font-medium text-sm"
          >
            View Community World Map →
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mx-auto mb-3">
              <Users className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalCommunities}</div>
            <div className="text-sm text-gray-600">Total Communities</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <div className="flex items-center justify-center w-12 h-12 bg-pink-100 text-pink-600 rounded-full mx-auto mb-3">
              <Heart className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.joinedCommunities}</div>
            <div className="text-sm text-gray-600">Joined Communities</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full mx-auto mb-3">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalEvents}</div>
            <div className="text-sm text-gray-600">Total Events</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-600 rounded-full mx-auto mb-3">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.cities}</div>
            <div className="text-sm text-gray-600">Cities</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button 
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              onClick={() => setLocation('/groups/create')}
            >
              <Plus className="h-5 w-5" />
              Create Community
            </button>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {filterButtons.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                    activeFilter === filter.key
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Communities Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading communities...</p>
          </div>
        ) : filteredGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group: any) => (
              <CommunityCard
                key={group.id}
                group={group}
                eventCount={getEventCount(group.id)}
                onJoin={() => joinGroupMutation.mutate(group.slug)}
                onLeave={() => leaveGroupMutation.mutate(group.slug)}
                onViewDetails={() => setLocation(`/groups/${group.slug}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No communities found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Try adjusting your search or filters to find communities that match your interests.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// Community Card Component
interface CommunityCardProps {
  group: any;
  eventCount: number;
  onJoin: () => void;
  onLeave: () => void;
  onViewDetails: () => void;
}

function CommunityCard({ group, eventCount, onJoin, onLeave, onViewDetails }: CommunityCardProps) {
  // Get gradient based on type
  const getGradient = () => {
    if (group.type === 'city') return 'from-blue-500 to-purple-600';
    if (group.type === 'role') {
      if (group.role_type === 'organizer') return 'from-pink-500 to-purple-600';
      if (group.role_type === 'musician') return 'from-purple-500 to-indigo-600';
      if (group.role_type === 'teacher') return 'from-orange-500 to-pink-600';
    }
    if (group.type === 'practice') return 'from-purple-500 to-pink-600';
    if (group.type === 'festival') return 'from-indigo-500 to-purple-600';
    return 'from-pink-500 to-blue-600';
  };

  // Get location display
  const getLocation = () => {
    if (group.city === 'Global') return '🌍 Global';
    if (group.city && group.country) return `📍 ${group.city}, ${group.country}`;
    return '📍 ' + (group.city || group.country || 'Global');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Gradient Header */}
      <div className={`h-32 bg-gradient-to-br ${getGradient()} p-6 text-white relative`}>
        <h3 className="text-xl font-bold mb-2">{group.name}</h3>
        <div className="text-sm opacity-90">{getLocation()}</div>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {group.description || 'Connect with fellow tango enthusiasts and share your passion.'}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{group.member_count || 0}</span> members
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{eventCount}</span> events
            </span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-sm text-gray-600 ml-2">4.{Math.floor(Math.random() * 9)}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {group.isMember ? (
            <>
              <button
                onClick={onLeave}
                className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Leave Community
              </button>
              <button
                onClick={onViewDetails}
                className="py-2 px-4 text-purple-600 font-medium hover:text-purple-700"
              >
                View Details
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onJoin}
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Join Community
              </button>
              <button
                onClick={onViewDetails}
                className="py-2 px-4 text-purple-600 font-medium hover:text-purple-700"
              >
                View Details
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}