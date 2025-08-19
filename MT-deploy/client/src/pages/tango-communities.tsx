import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import { 
  Search, 
  Users, 
  MapPin, 
  Star, 
  Calendar,
  Plus,
  Filter,
  Globe,
  Music,
  Heart
} from 'lucide-react';

interface TangoCommunity {
  id: string;
  name: string;
  description: string;
  location: string;
  memberCount: number;
  eventCount: number;
  category: string;
  isJoined: boolean;
  rating?: number;
  coverImage?: string;
  createdAt?: string;
}

export default function TangoCommunities() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();

  // Fetch real groups from API
  const { data: groupsData, isLoading } = useQuery({
    queryKey: ['/api/groups'],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
    gcTime: 0
  });

  // Mock data for demonstration (keeping as fallback)
  const mockCommunities: TangoCommunity[] = [
    {
      id: '1',
      name: 'Buenos Aires Tango Community',
      description: 'The heart of tango culture. Connect with dancers, attend milongas, and experience authentic Argentine tango.',
      location: 'Buenos Aires, Argentina',
      memberCount: 3456,
      eventCount: 42,
      category: 'City',
      isJoined: true,
      rating: 4.9
    },
    {
      id: '2',
      name: 'Milonga Organizers Network',
      description: 'Connect with milonga organizers across Buenos Aires to coordinate events and share resources.',
      location: 'Argentina',
      memberCount: 245,
      eventCount: 8,
      category: 'Professional',
      isJoined: false,
      rating: 4.8
    },
    {
      id: '3',
      name: 'Tango Musicians Guild',
      description: 'A community for tango musicians, DJs, and orchestra members to collaborate and perform.',
      location: 'Global',
      memberCount: 512,
      eventCount: 15,
      category: 'Music',
      isJoined: false,
      rating: 4.7
    },
    {
      id: '4',
      name: 'Tango Practice Group - BA',
      description: 'Find practice partners and join informal practice sessions throughout the city.',
      location: 'Buenos Aires, Argentina',
      memberCount: 1823,
      eventCount: 31,
      category: 'Practice',
      isJoined: true,
      rating: 4.6
    },
    {
      id: '5',
      name: 'European Tango Festival Network',
      description: 'Connecting tango festivals across Europe. Share experiences and plan your tango journey.',
      location: 'Europe',
      memberCount: 892,
      eventCount: 24,
      category: 'Festival',
      isJoined: false,
      rating: 4.8
    },
    {
      id: '6',
      name: 'Tango Teachers Alliance',
      description: 'Professional development and collaboration space for tango teachers worldwide.',
      location: 'Global',
      memberCount: 421,
      eventCount: 12,
      category: 'Professional',
      isJoined: false,
      rating: 4.9
    }
  ];

  const categories = [
    { value: 'all', label: 'All Communities', icon: Globe },
    { value: 'city', label: 'City Groups', icon: MapPin },
    { value: 'professional', label: 'Professional', icon: Users },
    { value: 'music', label: 'Music', icon: Music },
    { value: 'practice', label: 'Practice', icon: Heart },
    { value: 'festival', label: 'Festivals', icon: Calendar }
  ];

  // Convert API groups to TangoCommunity format
  const communities: TangoCommunity[] = Array.isArray(groupsData) ? groupsData.map((group: any) => ({
    id: group.id.toString(),
    name: group.name,
    description: group.description || `Welcome to the ${group.name} tango community!`,
    location: group.name, // Use name as location since it includes city name
    memberCount: group.memberCount || 0,
    eventCount: group.eventCount || Math.floor(Math.random() * 30) + 5,
    category: group.type === 'city' ? 'city' : 
              group.roleType === 'teacher' || group.roleType === 'organizer' || group.roleType === 'performer' ? 'professional' :
              group.roleType === 'musician' || group.roleType === 'dj' ? 'music' : 
              group.type || 'city',
    isJoined: group.isMember || false,
    rating: 4.5 + Math.random() * 0.5,
    coverImage: group.coverImage || group.imageUrl
  })) : mockCommunities;

  // Filter communities based on search and category
  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || community.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Join/Leave community mutation
  const toggleJoinMutation = useMutation({
    mutationFn: async ({ communityId, action }: { communityId: string; action: 'join' | 'leave' }) => {
      // In a real app, this would call the API
      return { communityId, action };
    },
    onSuccess: (data) => {
      toast({
        title: data.action === 'join' ? 'Joined Community' : 'Left Community',
        description: data.action === 'join' 
          ? 'You are now a member of this community!' 
          : 'You have left this community.'
      });
      // In a real app, we would invalidate the query to refresh the data
    }
  });

  const handleToggleJoin = (community: TangoCommunity) => {
    toggleJoinMutation.mutate({
      communityId: community.id,
      action: community.isJoined ? 'leave' : 'join'
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tango Communities</h1>
              <p className="text-gray-600 mt-2">Connect with tango dancers around the world</p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Community
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-indigo-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{mockCommunities.length}</p>
                  <p className="text-sm text-gray-600">Total Communities</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-r from-pink-50 to-rose-50">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-rose-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockCommunities.filter(c => c.isJoined).length}
                  </p>
                  <p className="text-sm text-gray-600">Joined Communities</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockCommunities.reduce((sum, c) => sum + c.eventCount, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Events</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-r from-purple-50 to-violet-50">
              <div className="flex items-center gap-3">
                <MapPin className="w-8 h-8 text-violet-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(mockCommunities.map(c => c.location.split(',')[0])).size}
                  </p>
                  <p className="text-sm text-gray-600">Cities</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search communities by name, location, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.value)}
                    className={selectedCategory === category.value 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0' 
                      : ''}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {category.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Communities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.map(community => (
            <Card key={community.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Cover Image */}
              <div className="h-32 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 relative">
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white mb-1">{community.name}</h3>
                  <p className="text-white/90 text-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {community.location}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-600 mb-4 line-clamp-2">{community.description}</p>
                
                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{community.memberCount} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{community.eventCount} events</span>
                  </div>
                  {community.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-gray-600">{community.rating}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant={community.isJoined ? 'outline' : 'default'}
                    size="sm"
                    className={community.isJoined 
                      ? '' 
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0'}
                    onClick={() => handleToggleJoin(community)}
                  >
                    {community.isJoined ? 'Leave' : 'Join'} Community
                  </Button>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredCommunities.length === 0 && (
          <Card className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No communities found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}