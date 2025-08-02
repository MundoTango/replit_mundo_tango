import React, { useState, useEffect } from 'react';
import { MapPin, Star, DollarSign, UserCheck, Shield, Users, Globe, Home as LocalIcon, Coffee, Utensils, ShoppingBag, Camera, Wine, Music } from 'lucide-react';
import { Button } from '../ui/button';
import { useLocation } from 'wouter';

interface Recommendation {
  id: number;
  userId: number;
  title: string;
  description: string;
  category: 'restaurant' | 'bar' | 'cafe' | 'attraction' | 'shopping' | 'entertainment' | 'other';
  isLocalRecommendation: boolean;
  address: string;
  latitude: number;
  longitude: number;
  googlePlaceId?: string;
  rating: number;
  priceLevel: number;
  photos: string[];
  tags: string[];
  // Flat structure from API
  recommenderId: number;
  recommenderName: string;
  recommenderUsername: string;
  recommenderProfileImage: string | null;
  recommenderCity: string;
  recommenderTangoRoles: string[];
  friendRelation?: {
    degree: number;
    type: 'direct' | 'friend_of_friend' | 'community';
    mutualFriends?: string[];
  };
  createdAt: string;
}

interface FilterOptions {
  friendRelation: 'all' | 'friends' | 'friends_of_friends' | 'community';
  recommenderType: 'all' | 'locals' | 'visitors';
  category: 'all' | 'restaurant' | 'bar' | 'cafe' | 'attraction' | 'shopping' | 'entertainment' | 'other';
  priceLevel: 'all' | 1 | 2 | 3 | 4;
}

interface RecommendationsListProps {
  groupId: number;
  groupCity?: string;
}

export function RecommendationsList({ groupId, groupCity }: RecommendationsListProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    friendRelation: 'all',
    recommenderType: 'all',
    category: 'all',
    priceLevel: 'all'
  });
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetchRecommendations();
  }, [groupId, filters]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        city: groupCity || '',
        friendRelation: filters.friendRelation,
        recommenderType: filters.recommenderType,
        category: filters.category,
        priceLevel: filters.priceLevel.toString()
      });

      const response = await fetch(`/api/recommendations?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setRecommendations(data.data);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'restaurant': return <Utensils className="h-4 w-4" />;
      case 'bar': return <Wine className="h-4 w-4" />;
      case 'cafe': return <Coffee className="h-4 w-4" />;
      case 'attraction': return <Camera className="h-4 w-4" />;
      case 'shopping': return <ShoppingBag className="h-4 w-4" />;
      case 'entertainment': return <Music className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getPriceLevelDisplay = (level: number) => {
    return Array(level).fill('$').join('');
  };

  const getFriendshipBadge = (relation?: Recommendation['friendRelation']) => {
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

  const getRecommenderContext = (rec: Recommendation, category: string, groupCity?: string) => {
    const isInGroupCity = rec.recommenderCity === groupCity;
    const isLocal = rec.isLocalRecommendation && isInGroupCity;
    
    // Special logic for certain categories
    if (category === 'restaurant' && !isLocal) {
      // For restaurants, visitors might have valuable perspectives on authentic cuisine from their home country
      if (rec.recommenderCity && rec.recommenderCity !== groupCity) {
        return (
          <div className="flex items-center gap-1 text-xs text-orange-600">
            <Globe className="h-3 w-3" />
            <span>Visitor from {rec.recommenderCity}</span>
          </div>
        );
      }
    }
    
    if (isLocal) {
      return (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <LocalIcon className="h-3 w-3" />
          <span>Local Expert</span>
        </div>
      );
    }
    
    return null;
  };

  const filteredRecommendations = recommendations; // Filtering already done server-side

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-semibold mb-4">Filter Recommendations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Friend Relationship Filter */}
          <div>
            <label className="text-sm font-medium mb-1 block">Connection Type</label>
            <select
              value={filters.friendRelation}
              onChange={(e) => setFilters({...filters, friendRelation: e.target.value as any})}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="all">All Recommenders</option>
              <option value="friends">My Friends</option>
              <option value="friends_of_friends">Friends of Friends</option>
              <option value="community">Community Members</option>
            </select>
          </div>

          {/* Recommender Type Filter */}
          <div>
            <label className="text-sm font-medium mb-1 block">Recommender Type</label>
            <select
              value={filters.recommenderType}
              onChange={(e) => setFilters({...filters, recommenderType: e.target.value as any})}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="all">All Types</option>
              <option value="locals">Local Experts</option>
              <option value="visitors">Visitors</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-sm font-medium mb-1 block">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value as any})}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="all">All Categories</option>
              <option value="restaurant">🍽️ Restaurants</option>
              <option value="bar">🍷 Bars</option>
              <option value="cafe">☕ Cafés</option>
              <option value="attraction">🎭 Attractions</option>
              <option value="shopping">🛍️ Shopping</option>
              <option value="entertainment">🎵 Entertainment</option>
              <option value="other">📍 Other</option>
            </select>
          </div>

          {/* Price Level Filter */}
          <div>
            <label className="text-sm font-medium mb-1 block">Price Level</label>
            <select
              value={filters.priceLevel}
              onChange={(e) => setFilters({...filters, priceLevel: e.target.value === 'all' ? 'all' : parseInt(e.target.value) as any})}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="all">All Prices</option>
              <option value="1">$ - Budget</option>
              <option value="2">$$ - Moderate</option>
              <option value="3">$$$ - Upscale</option>
              <option value="4">$$$$ - Luxury</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contextual Tip */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
        <p className="text-sm text-gray-700">
          <strong>Pro tip:</strong> For authentic local cuisine, check recommendations from locals. 
          For international cuisine (e.g., Chinese food in Buenos Aires), visitor recommendations might be more valuable!
        </p>
      </div>

      {/* Recommendations List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-500"></div>
        </div>
      ) : filteredRecommendations.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecommendations.map((rec) => (
            <div key={rec.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
              {/* Photo */}
              {rec.photos && rec.photos.length > 0 && (
                <div className="relative h-48 bg-gray-200">
                  <img 
                    src={rec.photos[0]} 
                    alt={rec.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Category Badge */}
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1">
                    {getCategoryIcon(rec.category)}
                    <span className="text-xs font-medium">{getCategoryLabel(rec.category)}</span>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                {/* Title and Rating */}
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-lg line-clamp-1 flex-1">{rec.title}</h4>
                  <div className="flex items-center gap-1 ml-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{rec.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Location and Price */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{rec.address}</span>
                  </div>
                  {rec.priceLevel > 0 && (
                    <span className="text-green-600 font-medium">
                      {getPriceLevelDisplay(rec.priceLevel)}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{rec.description}</p>

                {/* Recommender Info */}
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                        {rec.recommenderProfileImage ? (
                          <img src={rec.recommenderProfileImage} alt={rec.recommenderName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          rec.recommenderName.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{rec.recommenderName}</p>
                        {getRecommenderContext(rec, rec.category, groupCity)}
                      </div>
                    </div>
                    {getFriendshipBadge(rec.friendRelation)}
                  </div>
                </div>

                {/* Tags */}
                {rec.tags && rec.tags.length > 0 && (
                  <div className="flex gap-1 mt-3 flex-wrap">
                    {rec.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Get Directions Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Open Google Maps directions
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(rec.address)}`;
                    window.open(url, '_blank');
                  }}
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  Get Directions
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No recommendations found</h3>
          <p className="text-gray-500">Be the first to recommend a place in {groupCity}!</p>
        </div>
      )}
    </div>
  );
}