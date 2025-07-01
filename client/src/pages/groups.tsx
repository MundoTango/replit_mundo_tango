import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Search, Plus, Users, Globe, Lock, Star, MapPin, UserPlus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

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
          title: "Welcome!",
          description: `Automatically joined ${data.data.joinedGroups.length} city group(s)`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      }
    },
    onError: () => {
      toast({
        title: "Auto-join failed",
        description: "Could not automatically join city groups",
        variant: "destructive"
      });
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
        title: "Success!",
        description: "You've joined the group successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to join group. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Auto-join on page load (with authentication check)
  useEffect(() => {
    // Only auto-join if we have groups data (indicating we're authenticated)
    if (groupsData?.data) {
      autoJoinMutation.mutate();
    }
  }, [groupsData?.data]);

  const filteredGroups = groupsData?.data?.filter((group: any) => {
    if (activeTab === 'joined') return group.isJoined;
    if (activeTab === 'suggested') return !group.isJoined && group.memberCount > 500;
    return true; // all
  }) || [];

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
            {['all', 'joined', 'suggested'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-btn-color border-b-2 border-btn-color'
                    : 'text-gray-text-color hover:text-black-text-color'
                }`}
              >
                {tab === 'all' ? 'All Groups' : tab === 'joined' ? 'Joined' : 'Suggested'}
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
                  <div 
                    key={group.id} 
                    className="card bg-background-color cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setLocation(`/groups/${group.slug}`)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-btn-color rounded-lg flex items-center justify-center">
                            <span className="text-lg">{group.emoji || '🏙️'}</span>
                          </div>
                          <div className="text-left">
                            <h4 className="font-semibold text-black-text-color">{group.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-text-color">
                              {group.isPrivate ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                              <span>{group.isPrivate ? 'Private' : 'Public'} • {group.memberCount || 0} members</span>
                            </div>
                          </div>
                        </div>
                        {group.isJoined && (
                          <div className="flex items-center gap-1 text-green-600">
                            <Users className="h-4 w-4" />
                            <span className="text-xs font-medium">Member</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-text-color mb-4">
                        {group.description || `Connect with tango dancers in ${group.city}. Share events, find practice partners, and celebrate our passion for tango.`}
                      </p>
                      {group.isJoined ? (
                        <button 
                          className="w-full rounded-lg bg-green-100 text-green-800 border border-green-200 py-2 text-sm font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocation(`/groups/${group.slug}`);
                          }}
                        >
                          ✓ Member - View Group
                        </button>
                      ) : (
                        <button 
                          className={`w-full rounded-lg py-2 text-sm font-medium ${
                            group.isPrivate
                              ? 'border border-btn-color text-btn-color'
                              : 'bg-btn-color text-white'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!group.isPrivate) {
                              joinGroupMutation.mutate(group.slug);
                            }
                          }}
                          disabled={joinGroupMutation.isPending}
                        >
                          {joinGroupMutation.isPending ? 'Joining...' : (group.isPrivate ? 'Request to Join' : 'Join Group')}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-16 w-16 text-light-gray-color mx-auto mb-4" />
                <p className="text-gray-text-color">
                  {searchQuery ? `No groups found matching "${searchQuery}"` : "No groups found"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}