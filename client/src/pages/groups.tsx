import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Search, Plus, Users, Globe, Lock, Star, MapPin, UserPlus, Calendar, MessageCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

// Auto-generate landscape photos for cities
const getCitySpecificImage = (city: string, country: string): string => {
  const cityImages: Record<string, string> = {
    'buenos-aires-argentina': 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&h=300&fit=crop&q=80',
    'san-francisco-usa': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=300&fit=crop&q=80',
    'montevideo-uruguay': 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&h=300&fit=crop&q=80',
    'milan-italy': 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=800&h=300&fit=crop&q=80',
    'paris-france': 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=300&fit=crop&q=80',
    'warsaw-poland': 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=300&fit=crop&q=80',
    'sao-paulo-brazil': 'https://images.unsplash.com/photo-1554980291-c320154d20b2?w=800&h=300&fit=crop&q=80',
    'rosario-argentina': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=300&fit=crop&q=80'
  };
  
  const key = `${city}-${country}`.toLowerCase().replace(/\s+/g, '-');
  return cityImages[key] || `https://images.unsplash.com/photo-1573160813959-df05c19fdc0e?w=800&h=300&fit=crop&q=80&auto=format&ixlib=rb-4.0.3`;
};

export default function GroupsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch groups data with membership status
  const { data: groupsData, isLoading } = useQuery({
    queryKey: ['/api/groups']
  });

  // Auto-join mutation
  const autoJoinMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/user/auto-join-city-groups', {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to auto-join groups');
      return response.json();
    },
    onSuccess: (data) => {
      if (data.data.joinedGroups?.length > 0) {
        toast({
          title: "Joined Groups!",
          description: `Automatically joined ${data.data.joinedGroups.length} local groups.`,
          variant: "default",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      }
    },
    onError: (error) => {
      console.error('Auto-join error:', error);
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
        title: "Joined Group!",
        description: "You have successfully joined this group.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
    }
  });

  // Auto-join on page load
  useEffect(() => {
    // Only auto-join if we have groups data
    if (groupsData?.data) {
      autoJoinMutation.mutate();
    }
  }, [groupsData?.data]);

  const filteredGroups = groupsData?.data?.filter((group: any) => {
    if (activeTab === 'joined') return group.isJoined;
    if (activeTab === 'following') return group.isFollowing && !group.isJoined;
    if (activeTab === 'suggested') return !group.isJoined && !group.isFollowing && group.memberCount > 500;
    return true; // all
  }) || [];

  // Add "following" tab
  const tabs = [
    { key: 'all', label: 'All Groups' },
    { key: 'joined', label: 'Joined' },
    { key: 'following', label: 'Following' },
    { key: 'suggested', label: 'Suggested' }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* TrangoTech Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-black-text-color">Groups</h1>
            <p className="text-gray-text-color">Join communities and discover tango groups</p>
          </div>
          <button className="rounded-xl bg-btn-color text-sm font-bold text-white flex items-center justify-center gap-2 px-6 h-10">
            <Plus className="h-4 w-4" />
            Create Group
          </button>
        </div>

        {/* Search Bar - TT Style */}
        <div className="card mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-light-gray-color" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-text pl-10 w-full"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="flex border-b border-border-color">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 font-medium capitalize transition-colors ${
                  activeTab === tab.key
                    ? 'text-btn-color border-b-2 border-btn-color'
                    : 'text-gray-text-color hover:text-black-text-color'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Groups Content */}
          <div className="p-12 text-center">
            <Users className="h-16 w-16 text-light-gray-color mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-black-text-color mb-2">
              {activeTab === 'joined' ? "You haven't joined any groups yet" : "Discover Tango Groups"}
            </h3>
            <p className="text-gray-text-color mb-6 max-w-md mx-auto">
              {activeTab === 'joined' 
                ? "Join groups to connect with dancers who share your interests and passion for tango."
                : "Find and join tango groups in your area or explore communities worldwide."
              }
            </p>

            {/* Groups Grid */}
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-btn-color mx-auto"></div>
                <p className="text-gray-text-color mt-2">Loading groups...</p>
              </div>
            ) : filteredGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mt-8">
                {filteredGroups
                  .filter((group: any) => 
                    !searchQuery || 
                    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    group.city?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((group: any) => (
                  <EnhancedGroupCard 
                    key={group.id} 
                    group={group} 
                    onClick={() => setLocation(`/groups/${group.slug}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-light-gray-color mx-auto mb-2" />
                <p className="text-gray-text-color">No groups found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Enhanced Group Card Component with TT Design
interface EnhancedGroupCardProps {
  group: any;
  onClick: () => void;
}

function EnhancedGroupCard({ group, onClick }: EnhancedGroupCardProps) {
  const backgroundImage = getCitySpecificImage(group.city || '', group.country || '');
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      {/* Cover Image */}
      <div 
        className="h-32 bg-gradient-to-r from-pink-500 to-purple-600 relative"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="absolute top-4 left-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
            <span className="text-xl">{group.emoji || '🏙️'}</span>
          </div>
        </div>
        <div className="absolute top-4 right-4 flex items-center gap-1 text-white text-xs">
          <Users className="h-3 w-3" />
          <span>{group.memberCount} members</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">{group.name}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              {group.isPrivate ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
              <span>Public • {group.memberCount} members</span>
            </div>
          </div>
          
          {group.isJoined && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full">
              <span className="text-xs font-medium">✓ Member</span>
            </div>
          )}
        </div>
        
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          Connect with tango dancers and enthusiasts in {group.city}, {group.country}. Share local events, find dance partners, and build community connections.
        </p>
        
        {group.isJoined ? (
          <button className="w-full py-2 px-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1">
            ✓ Member - View Group
          </button>
        ) : (
          <div className="flex gap-2">
            <button className="flex-1 py-2 px-3 bg-pink-500 text-white rounded-lg text-xs font-medium hover:bg-pink-600 transition-colors">
              Join Group
            </button>
            {group.isFollowing ? (
              <button className="px-3 py-2 bg-orange-50 border border-orange-200 text-orange-600 rounded-lg text-xs font-medium">
                Following
              </button>
            ) : (
              <button className="px-3 py-2 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors">
                Follow
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}