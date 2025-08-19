import React, { useState, useEffect } from 'react';
import { Home, Users, MapPin, Wifi, Car, Coffee, Utensils, Star, Heart, UserCheck, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { useLocation } from 'wouter';

interface HostHome {
  id: number;
  userId: number;
  title: string;
  description: string;
  propertyType: 'entire_place' | 'private_room' | 'shared_room';
  maxGuests: number;
  city: string;
  country: string;
  address: string;
  latitude: number;
  longitude: number;
  amenities: string[];
  pricePerNight: number;
  currency: string;
  photos: { id: number; url: string; displayOrder: number }[];
  host: {
    id: number;
    name: string;
    username: string;
    profileImage: string | null;
    isVerified: boolean;
  };
  availability: boolean;
  averageRating: number;
  reviewCount: number;
  friendRelation?: {
    degree: number;
    type: 'direct' | 'friend_of_friend' | 'community';
    mutualFriends?: string[];
  };
}

interface FilterOptions {
  friendRelation: 'all' | 'friends' | 'friends_of_friends' | 'community';
  propertyType: 'all' | 'entire_place' | 'private_room' | 'shared_room';
  priceRange: { min: number; max: number };
  maxGuests: number;
}

interface HostHomesListProps {
  groupId: number;
  groupCity?: string;
  isSuperAdmin?: boolean;
}

export function HostHomesList({ groupId, groupCity, isSuperAdmin }: HostHomesListProps) {
  const [homes, setHomes] = useState<HostHome[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    friendRelation: 'all',
    propertyType: 'all',
    priceRange: { min: 0, max: 1000 },
    maxGuests: 1
  });
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetchHostHomes();
  }, [groupId, filters]);

  const fetchHostHomes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        city: groupCity || '',
        friendRelation: filters.friendRelation,
        propertyType: filters.propertyType,
        minPrice: filters.priceRange.min.toString(),
        maxPrice: filters.priceRange.max.toString(),
        guests: filters.maxGuests.toString()
      });

      const response = await fetch(`/api/host-homes?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setHomes(data.data);
      }
    } catch (error) {
      console.error('Error fetching host homes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'entire_place': return <Home className="h-4 w-4" />;
      case 'private_room': return <Users className="h-4 w-4" />;
      case 'shared_room': return <Users className="h-4 w-4" />;
      default: return <Home className="h-4 w-4" />;
    }
  };

  const getPropertyTypeLabel = (type: string) => {
    switch (type) {
      case 'entire_place': return 'Entire Place';
      case 'private_room': return 'Private Room';
      case 'shared_room': return 'Shared Room';
      default: return type;
    }
  };

  const getFriendshipBadge = (relation?: HostHome['friendRelation']) => {
    if (!relation) return null;
    
    switch (relation.type) {
      case 'direct':
        return (
          <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
            <UserCheck className="h-3 w-3" />
            <span>Friend</span>
          </div>
        );
      case 'friend_of_friend':
        return (
          <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
            <Shield className="h-3 w-3" />
            <span>Friend of Friend</span>
            {relation.mutualFriends && relation.mutualFriends.length > 0 && (
              <span className="text-xs">({relation.mutualFriends[0]})</span>
            )}
          </div>
        );
      case 'community':
        return (
          <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
            <Users className="h-3 w-3" />
            <span>Community Member</span>
          </div>
        );
      default:
        return null;
    }
  };

  const filteredHomes = homes; // Filtering already done server-side

  return (
    <div className="space-y-6">
      {/* Super Admin Host Onboarding Button */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg border border-pink-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">Host Onboarding System</h4>
              <p className="text-sm text-gray-600">Access the host onboarding wizard to add new properties</p>
            </div>
            <Button 
              onClick={() => setLocation('/host-onboarding')}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              Open Host Onboarding
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-semibold mb-4">Filter Accommodations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Friend Relationship Filter */}
          <div>
            <label className="text-sm font-medium mb-1 block">Connection Type</label>
            <select
              value={filters.friendRelation}
              onChange={(e) => setFilters({...filters, friendRelation: e.target.value as any})}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="all">All Hosts</option>
              <option value="friends">My Friends</option>
              <option value="friends_of_friends">Friends of Friends</option>
              <option value="community">Community Members</option>
            </select>
          </div>

          {/* Property Type Filter */}
          <div>
            <label className="text-sm font-medium mb-1 block">Accommodation Type</label>
            <select
              value={filters.propertyType}
              onChange={(e) => setFilters({...filters, propertyType: e.target.value as any})}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="all">All Types</option>
              <option value="entire_place">Entire Place</option>
              <option value="private_room">Private Room</option>
              <option value="shared_room">Shared Room</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="text-sm font-medium mb-1 block">Max Price per Night</label>
            <input
              type="range"
              min="0"
              max="1000"
              value={filters.priceRange.max}
              onChange={(e) => setFilters({...filters, priceRange: {...filters.priceRange, max: parseInt(e.target.value)}})}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>$0</span>
              <span>${filters.priceRange.max}</span>
            </div>
          </div>

          {/* Guest Count */}
          <div>
            <label className="text-sm font-medium mb-1 block">Guests</label>
            <input
              type="number"
              min="1"
              max="10"
              value={filters.maxGuests}
              onChange={(e) => setFilters({...filters, maxGuests: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Host Homes List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-500"></div>
        </div>
      ) : filteredHomes.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredHomes.map((home) => (
            <div key={home.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                 onClick={() => setLocation(`/host-homes/${home.id}`)}>
              {/* Photo */}
              <div className="relative h-48 bg-gray-200">
                {home.photos && home.photos.length > 0 ? (
                  <img 
                    src={home.photos[0].url} 
                    alt={home.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Home className="h-12 w-12" />
                  </div>
                )}
                
                {/* Property Type Badge */}
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1">
                  {getPropertyTypeIcon(home.propertyType)}
                  <span className="text-xs font-medium">{getPropertyTypeLabel(home.propertyType)}</span>
                </div>

                {/* Price */}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 rounded-lg">
                  <span className="font-semibold">${home.pricePerNight}</span>
                  <span className="text-sm"> /night</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Title and Location */}
                <h4 className="font-semibold text-lg mb-1 line-clamp-1">{home.title}</h4>
                <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                  <MapPin className="h-4 w-4" />
                  <span>{home.city}, {home.country}</span>
                </div>

                {/* Host Info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                      {home.host.profileImage ? (
                        <img src={home.host.profileImage} alt={home.host.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        home.host.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{home.host.name}</p>
                      {home.host.isVerified && (
                        <p className="text-xs text-green-600">Verified Host</p>
                      )}
                    </div>
                  </div>
                  {getFriendshipBadge(home.friendRelation)}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>Up to {home.maxGuests} guests</span>
                  </div>
                  {home.reviewCount > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span>{home.averageRating.toFixed(1)}</span>
                      <span className="text-gray-400">({home.reviewCount})</span>
                    </div>
                  )}
                </div>

                {/* Amenities Preview */}
                <div className="flex gap-2 mt-3">
                  {home.amenities.slice(0, 3).map((amenity, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {amenity}
                    </span>
                  ))}
                  {home.amenities.length > 3 && (
                    <span className="text-xs text-gray-500">+{home.amenities.length - 3} more</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Home className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No accommodations found</h3>
          <p className="text-gray-500">Try adjusting your filters or check back later</p>
        </div>
      )}
    </div>
  );
}