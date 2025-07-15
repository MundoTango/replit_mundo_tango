import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, MapPin, Users, Globe, Filter, Utensils, Coffee, ShoppingBag, Heart, Camera, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface Recommendation {
  id: number;
  title: string;
  description: string;
  category: 'restaurant' | 'bar' | 'cafe' | 'attraction' | 'shopping' | 'entertainment' | 'other';
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  recommendedBy: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
    isLocal: boolean;
    nationality?: string;
  };
  friendConnection?: 'direct' | 'friend-of-friend' | 'community' | null;
  localRecommendations: number;
  visitorRecommendations: number;
  rating?: number;
  priceLevel?: 1 | 2 | 3 | 4;
  tags: string[];
  photos: string[];
}

interface RecommendationsListProps {
  groupSlug?: string;
  city?: string;
  showFilters?: boolean;
  friendFilter?: 'all' | 'direct' | 'friend-of-friend' | 'community';
  recommendationType?: 'all' | 'local' | 'visitor';
}

export default function RecommendationsList({ 
  groupSlug, 
  city, 
  showFilters = true,
  friendFilter: propFriendFilter,
  recommendationType: propRecommendationType 
}: RecommendationsListProps) {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    category: 'all',
    recommendationType: propRecommendationType || 'all',
    priceLevel: 'all',
    friendFilter: propFriendFilter || 'all'
  });

  // Sync with prop changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      ...(propFriendFilter && { friendFilter: propFriendFilter }),
      ...(propRecommendationType && { recommendationType: propRecommendationType })
    }));
  }, [propFriendFilter, propRecommendationType]);

  // Fetch recommendations
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['/api/recommendations', { city, groupSlug, ...filters }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      if (groupSlug) params.append('groupSlug', groupSlug);
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.recommendationType !== 'all') params.append('type', filters.recommendationType);
      if (filters.priceLevel !== 'all') params.append('priceLevel', filters.priceLevel);
      if (filters.friendFilter !== 'all') params.append('friendFilter', filters.friendFilter);
      
      const response = await fetch(`/api/recommendations?${params}`);
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      const data = await response.json();
      return data.data as Recommendation[];
    },
    enabled: !!city || !!groupSlug
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'restaurant':
        return Utensils;
      case 'bar':
      case 'cafe':
        return Coffee;
      case 'shopping':
        return ShoppingBag;
      case 'attraction':
        return Camera;
      case 'entertainment':
        return Music;
      default:
        return Star;
    }
  };

  const getPriceLevelDisplay = (level?: number) => {
    if (!level) return null;
    return '$'.repeat(level);
  };

  const getRecommenderContext = (rec: Recommendation) => {
    if (rec.recommendedBy.isLocal) {
      return `Local ${rec.city} resident`;
    } else if (rec.recommendedBy.nationality) {
      // Special logic for cultural recommendations
      if (rec.category === 'restaurant' && rec.recommendedBy.nationality === 'Chinese' && rec.tags.includes('chinese')) {
        return 'Chinese visitor recommends authentic Chinese';
      }
      return `${rec.recommendedBy.nationality} visitor`;
    }
    return 'Community member';
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
            <h3 className="font-semibold">Filter Recommendations</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="all">All categories</option>
                <option value="restaurant">Restaurants</option>
                <option value="bar">Bars</option>
                <option value="cafe">Cafés</option>
                <option value="attraction">Attractions</option>
                <option value="shopping">Shopping</option>
                <option value="entertainment">Entertainment</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Recommendation Type */}
            <div>
              <label className="text-sm font-medium mb-1 block">Recommended by</label>
              <select
                value={filters.recommendationType}
                onChange={(e) => setFilters({...filters, recommendationType: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="all">Everyone</option>
                <option value="locals">Locals only</option>
                <option value="visitors">Visitors only</option>
                <option value="friends">Friends & connections</option>
              </select>
            </div>

            {/* Price Level */}
            <div>
              <label className="text-sm font-medium mb-1 block">Price level</label>
              <select
                value={filters.priceLevel}
                onChange={(e) => setFilters({...filters, priceLevel: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="all">All prices</option>
                <option value="1">$ - Budget</option>
                <option value="2">$$ - Moderate</option>
                <option value="3">$$$ - Upscale</option>
                <option value="4">$$$$ - Luxury</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations?.map((rec) => {
          const CategoryIcon = getCategoryIcon(rec.category);
          
          return (
            <div key={rec.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Photo */}
              {rec.photos[0] && (
                <div className="h-48 bg-gray-200">
                  <img 
                    src={rec.photos[0]} 
                    alt={rec.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CategoryIcon className="h-5 w-5 text-pink-500" />
                      <h3 className="font-semibold text-lg">{rec.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{rec.description}</p>
                  </div>
                  <div className="text-right">
                    {rec.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{rec.rating.toFixed(1)}</span>
                      </div>
                    )}
                    {rec.priceLevel && (
                      <span className="text-sm text-gray-600">{getPriceLevelDisplay(rec.priceLevel)}</span>
                    )}
                  </div>
                </div>
                
                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <MapPin className="h-4 w-4" />
                  <span>{rec.address}</span>
                </div>
                
                {/* Tags */}
                {rec.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {rec.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Recommender Info */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                      {rec.recommendedBy.profileImage ? (
                        <img src={rec.recommendedBy.profileImage} alt={rec.recommendedBy.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        rec.recommendedBy.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{rec.recommendedBy.name}</p>
                      <p className="text-xs text-gray-500">{getRecommenderContext(rec)}</p>
                    </div>
                  </div>
                  
                  {/* Social Proof */}
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {rec.localRecommendations > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {rec.localRecommendations} locals
                        </span>
                      )}
                      {rec.visitorRecommendations > 0 && (
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {rec.visitorRecommendations} visitors
                        </span>
                      )}
                    </div>
                    {rec.friendConnection && (
                      <div className="text-xs text-pink-600 font-medium mt-1 flex items-center gap-1 justify-end">
                        <Heart className="h-3 w-3" />
                        {rec.friendConnection === 'direct' ? 'Friend' : 'FOF'}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1">
                    View on Map
                  </Button>
                  <Button variant="outline" size="sm">
                    Get Directions
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Empty State */}
      {(!recommendations || recommendations.length === 0) && (
        <div className="text-center py-12">
          <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No recommendations yet</h3>
          <p className="text-gray-500">
            {city ? `Be the first to recommend a place in ${city}!` : 'Select a city to see recommendations.'}
          </p>
        </div>
      )}
    </div>
  );
}