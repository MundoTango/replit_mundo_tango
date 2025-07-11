import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Search, Plus, Users, Globe, Lock, Star, MapPin, UserPlus, Calendar, MessageCircle, Heart, Music, Code } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import CommunityCard from '@/components/Community/CommunityCard';

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
    queryFn: async () => {
      // Add cache-busting query parameter
      const cacheBuster = Date.now();
      const response = await fetch(`/api/groups?_t=${cacheBuster}`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const data = await response.json();
      console.log('🔄 GROUPS API RESPONSE:', data);
      console.log('📊 Member status for each group:', data?.data?.map((g: any) => ({
        id: g.id,
        name: g.name,
        isMember: g.isMember,
        membershipStatus: g.membershipStatus
      })));
      return data;
    }
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
    totalCommunities: groupsData?.data?.length || 6,
    joinedCommunities: groupsData?.data?.filter((g: any) => g.isMember || g.membershipStatus === 'member').length || 2,
    totalEvents: 132, // This would come from a separate API
    cities: new Set(groupsData?.data?.map((g: any) => g.city).filter(Boolean)).size || 4
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
  const filteredGroups = groupsData?.data?.filter((group: any) => {
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
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#8E142E] to-[#0D448A] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              onClick={() => {
                toast({
                  title: "Coming Soon",
                  description: "Community creation feature will be available soon!",
                  variant: "default",
                });
              }}
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
                community={{
                  id: group.id,
                  name: group.name,
                  description: group.description || 'Connect with fellow tango enthusiasts and share your passion.',
                  imageUrl: group.image_url,
                  location: group.city && group.country ? `${group.city}, ${group.country}` : (group.city || group.country || 'Global'),
                  memberCount: group.member_count || 0,
                  eventCount: getEventCount(group.id),
                  isJoined: group.membershipStatus === 'member'
                }}
                onJoin={() => joinGroupMutation.mutate(group.slug)}
                onLeave={() => leaveGroupMutation.mutate(group.slug)}
                onClick={() => setLocation(`/groups/${group.slug}`)}
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

