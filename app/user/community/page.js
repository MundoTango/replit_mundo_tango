"use client";
import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../../auth/useAuthContext';
import CommunityCard from '../../../components/Community/CommunityCard';
import { Button, TextField, MenuItem, Select, FormControl, InputLabel, Tabs, Tab, Box } from '@mui/material';
import { Add, Search, LocationOn, Group } from '@mui/icons-material';

const CommunityPage = () => {
  const { user } = useAuthContext();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      // Since we don't have a specific community endpoint, we'll use the search
      const response = await fetch('/api/user/global-search?type=users&limit=20');
      if (response.ok) {
        const data = await response.json();
        // Transform user data into community-like structure for demonstration
        const transformedCommunities = data.data?.users?.map(userItem => ({
          id: userItem.id,
          name: `${userItem.city || 'Local'} Tango Community`,
          description: `Join the vibrant tango community in ${userItem.city || 'this area'}. Connect with dancers, attend events, and share your passion for tango.`,
          imageUrl: undefined,
          location: `${userItem.city || 'Unknown'}, ${userItem.country || ''}`,
          memberCount: Math.floor(Math.random() * 200) + 50, // Mock member count
          eventCount: Math.floor(Math.random() * 20) + 5, // Mock event count
          isJoined: false
        })) || [];
        setCommunities(transformedCommunities);
      }
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = async (communityId) => {
    try {
      // Since we don't have a specific community join endpoint, we'll use follow
      const response = await fetch('/api/friend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          friend_id: communityId
        })
      });

      if (response.ok) {
        setCommunities(prev => prev.map(community => 
          community.id === communityId 
            ? { ...community, isJoined: true, memberCount: community.memberCount + 1 }
            : community
        ));
      }
    } catch (error) {
      console.error('Error joining community:', error);
    }
  };

  const handleLeaveCommunity = async (communityId) => {
    try {
      const response = await fetch(`/api/friend/${communityId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCommunities(prev => prev.map(community => 
          community.id === communityId 
            ? { ...community, isJoined: false, memberCount: community.memberCount - 1 }
            : community
        ));
      }
    } catch (error) {
      console.error('Error leaving community:', error);
    }
  };

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !filterLocation || community.location.toLowerCase().includes(filterLocation.toLowerCase());
    const matchesTab = activeTab === 0 || (activeTab === 1 && community.isJoined);
    return matchesSearch && matchesLocation && matchesTab;
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view communities</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-black">Tango Communities</h1>
            <p className="text-[#64748B] mt-1">Connect with tango dancers around the world</p>
          </div>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowCreateModal(true)}
            sx={{
              backgroundColor: '#0D448A',
              '&:hover': { backgroundColor: '#0a3570' },
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px',
              padding: '10px 20px',
            }}
          >
            Create Community
          </Button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '16px',
              },
              '& .Mui-selected': {
                color: '#0D448A',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#0D448A',
              },
            }}
          >
            <Tab label="All Communities" />
            <Tab label="My Communities" />
          </Tabs>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              fullWidth
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search className="text-gray-400 mr-2" />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />
            
            <TextField
              fullWidth
              placeholder="Filter by location..."
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              InputProps={{
                startAdornment: <LocationOn className="text-gray-400 mr-2" />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />
          </div>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <Group className="text-[#0D448A] text-3xl" />
              <div>
                <h3 className="text-2xl font-bold text-black">{communities.length}</h3>
                <p className="text-[#64748B] text-sm">Total Communities</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <Group className="text-[#8E142E] text-3xl" />
              <div>
                <h3 className="text-2xl font-bold text-black">
                  {communities.filter(c => c.isJoined).length}
                </h3>
                <p className="text-[#64748B] text-sm">Joined Communities</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <LocationOn className="text-[#0D448A] text-3xl" />
              <div>
                <h3 className="text-2xl font-bold text-black">
                  {new Set(communities.map(c => c.location)).size}
                </h3>
                <p className="text-[#64748B] text-sm">Cities</p>
              </div>
            </div>
          </div>
        </div>

        {/* Communities Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : filteredCommunities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Group className="text-6xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {activeTab === 1 ? 'No joined communities' : 'No communities found'}
            </h3>
            <p className="text-gray-500 mb-4">
              {activeTab === 1 
                ? "Join communities to connect with other tango dancers" 
                : searchQuery || filterLocation 
                  ? "Try adjusting your search criteria" 
                  : "Be the first to create a community in your area"}
            </p>
            <Button
              variant="contained"
              onClick={() => setShowCreateModal(true)}
              sx={{
                backgroundColor: '#0D448A',
                '&:hover': { backgroundColor: '#0a3570' },
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
              }}
            >
              Create First Community
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                onJoin={handleJoinCommunity}
                onLeave={handleLeaveCommunity}
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {filteredCommunities.length > 0 && (
          <div className="text-center mt-8">
            <Button
              variant="outlined"
              onClick={fetchCommunities}
              sx={{
                borderColor: '#0D448A',
                color: '#0D448A',
                '&:hover': {
                  borderColor: '#0a3570',
                  backgroundColor: '#f5f5f5',
                },
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
                padding: '10px 30px',
              }}
            >
              Load More Communities
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;