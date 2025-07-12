import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Home, MapPin, Users, Star, Filter, DollarSign, Bed, Shield, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface HostHome {
  id: number;
  title: string;
  description: string;
  propertyType: string;
  roomType: string;
  city: string;
  state: string;
  country: string;
  pricePerNight: number;
  maxGuests: number;
  bedroomCount: number;
  bathroomCount: number;
  amenities: string[];
  photos: Array<{ url: string; displayOrder: number }>;
  host: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
  distanceFromUser?: number;
  friendConnection?: 'direct' | 'friend-of-friend' | 'community' | null;
  rating?: number;
  reviewCount?: number;
}

interface HostHomesListProps {
  groupSlug?: string;
  city?: string;
  showFilters?: boolean;
}

export default function HostHomesList({ groupSlug, city, showFilters = true }: HostHomesListProps) {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 500 },
    roomType: 'all',
    maxGuests: 1,
    friendFilter: 'all' // all, friends, friends-of-friends
  });

  // Fetch host homes
  const { data: homes, isLoading } = useQuery({
    queryKey: ['/api/host-homes', { city, groupSlug, ...filters }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      if (groupSlug) params.append('groupSlug', groupSlug);
      params.append('minPrice', filters.priceRange.min.toString());
      params.append('maxPrice', filters.priceRange.max.toString());
      if (filters.roomType !== 'all') params.append('roomType', filters.roomType);
      params.append('minGuests', filters.maxGuests.toString());
      if (filters.friendFilter !== 'all') params.append('friendFilter', filters.friendFilter);
      
      const response = await fetch(`/api/host-homes?${params}`);
      if (!response.ok) throw new Error('Failed to fetch homes');
      const data = await response.json();
      return data.data as HostHome[];
    },
    enabled: !!city || !!groupSlug
  });

  const getFriendConnectionLabel = (connection: string | null) => {
    switch (connection) {
      case 'direct':
        return 'Your friend';
      case 'friend-of-friend':
        return 'Friend of friend';
      case 'community':
        return 'Community member';
      default:
        return null;
    }
  };

  const getRoomTypeLabel = (type: string) => {
    switch (type) {
      case 'entire_place':
        return 'Entire place';
      case 'private_room':
        return 'Private room';
      case 'shared_room':
        return 'Shared room';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold">Filter Housing</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Price Range */}
            <div>
              <label className="text-sm font-medium mb-1 block">Price per night</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={filters.priceRange.min}
                  onChange={(e) => setFilters({...filters, priceRange: {...filters.priceRange, min: parseInt(e.target.value) || 0}})}
                  className="w-20 px-2 py-1 border rounded"
                  placeholder="0"
                />
                <span>-</span>
                <input
                  type="number"
                  value={filters.priceRange.max}
                  onChange={(e) => setFilters({...filters, priceRange: {...filters.priceRange, max: parseInt(e.target.value) || 500}})}
                  className="w-20 px-2 py-1 border rounded"
                  placeholder="500"
                />
              </div>
            </div>

            {/* Room Type */}
            <div>
              <label className="text-sm font-medium mb-1 block">Room type</label>
              <select
                value={filters.roomType}
                onChange={(e) => setFilters({...filters, roomType: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="all">All types</option>
                <option value="entire_place">Entire place</option>
                <option value="private_room">Private room</option>
                <option value="shared_room">Shared room</option>
              </select>
            </div>

            {/* Guests */}
            <div>
              <label className="text-sm font-medium mb-1 block">Guests</label>
              <select
                value={filters.maxGuests}
                onChange={(e) => setFilters({...filters, maxGuests: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>{num}+ guests</option>
                ))}
              </select>
            </div>

            {/* Friend Filter */}
            <div>
              <label className="text-sm font-medium mb-1 block">Connection</label>
              <select
                value={filters.friendFilter}
                onChange={(e) => setFilters({...filters, friendFilter: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="all">All hosts</option>
                <option value="friends">Friends only</option>
                <option value="friends-of-friends">Friends & FOF</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Homes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {homes?.map((home) => (
          <div key={home.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            {/* Main Photo */}
            <div className="relative h-48 bg-gray-200">
              {home.photos[0] ? (
                <img 
                  src={home.photos[0].url} 
                  alt={home.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Home className="h-12 w-12 text-gray-400" />
                </div>
              )}
              
              {/* Friend Connection Badge */}
              {home.friendConnection && (
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Heart className="h-3 w-3 text-pink-500" />
                  {getFriendConnectionLabel(home.friendConnection)}
                </div>
              )}
              
              {/* Price */}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded">
                <span className="font-semibold">${home.pricePerNight}</span>/night
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1">{home.title}</h3>
                  <p className="text-sm text-gray-600">
                    {getRoomTypeLabel(home.roomType)} • {home.maxGuests} guests
                  </p>
                </div>
                {home.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{home.rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-500">({home.reviewCount})</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <MapPin className="h-4 w-4" />
                <span>{home.city}, {home.state}</span>
              </div>
              
              {/* Host Info */}
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {home.host.profileImage ? (
                    <img src={home.host.profileImage} alt={home.host.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    home.host.name.charAt(0)
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{home.host.name}</p>
                  {home.host.id === user?.id && (
                    <span className="text-xs text-purple-600 font-medium">Your listing</span>
                  )}
                </div>
                {home.host.id !== user?.id && (
                  <Button variant="outline" size="sm">
                    Contact
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Empty State */}
      {(!homes || homes.length === 0) && (
        <div className="text-center py-12">
          <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No housing available</h3>
          <p className="text-gray-500">
            {city ? `No hosts have listed properties in ${city} yet.` : 'Select a city to see available housing.'}
          </p>
        </div>
      )}
    </div>
  );
}