import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  MapPin, 
  Calendar, 
  Heart, 
  Star,
  Users,
  Utensils,
  Coffee,
  ShoppingBag,
  Landmark,
  Theater,
  Music,
  Filter,
  ChevronDown,
  Navigation
} from 'lucide-react';
import HostHomesList from './Housing/HostHomesList';
import RecommendationsList from './Recommendations/RecommendationsList';
import CommunityMapWithLayers from './CommunityMapWithLayers';

interface CommunityToolbarProps {
  city?: string;
  groupSlug?: string;
}

export default function CommunityToolbar({ city, groupSlug }: CommunityToolbarProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('map');
  const [showFilters, setShowFilters] = useState(false);
  
  // Role-based check for super admin
  const isSuperAdmin = user?.roles?.includes('super_admin') || user?.isSuperAdmin;
  
  // Map layer toggles
  const [mapLayers, setMapLayers] = useState({
    events: true,
    housing: true,
    recommendations: true
  });
  
  // Date filter for events
  const [dateFilter, setDateFilter] = useState<{
    startDate?: Date;
    endDate?: Date;
  }>({});
  
  // Event metadata filters
  const [eventFilters, setEventFilters] = useState({
    category: 'all',
    priceRange: 'all',
    timeOfDay: 'all'
  });
  
  // Friend relationship filter
  const [friendFilter, setFriendFilter] = useState<'all' | 'direct' | 'friend-of-friend' | 'community'>('all');
  
  // Local vs visitor filter for recommendations
  const [recommendationType, setRecommendationType] = useState<'all' | 'local' | 'visitor'>('all');

  return (
    <div className="w-full">
      {/* Header with Role-Based Actions */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            {city || 'Community'} Hub
          </h2>
          <p className="text-gray-600 mt-1">
            Explore housing, recommendations, and events
          </p>
        </div>
        
        {/* Role-based buttons */}
        <div className="flex gap-2">
          {isSuperAdmin ? (
            <Button 
              onClick={() => setLocation('/host-onboarding')}
              className="bg-gradient-to-br from-pink-500 to-purple-600 text-white"
            >
              <Home className="h-4 w-4 mr-2" />
              List Your Property
            </Button>
          ) : (
            <Button 
              variant="outline"
              onClick={() => navigate('/housing-marketplace')}
            >
              <Home className="h-4 w-4 mr-2" />
              Browse All Housing
            </Button>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="map" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Interactive Map
          </TabsTrigger>
          <TabsTrigger value="housing" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Housing
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        {/* Map Tab with All Layers */}
        <TabsContent value="map" className="space-y-4">
          {/* Layer Controls */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Map Layers</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>
            
            {/* Layer Toggles */}
            <div className="flex gap-4 mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mapLayers.events}
                  onChange={(e) => setMapLayers({ ...mapLayers, events: e.target.checked })}
                  className="rounded"
                />
                <Calendar className="h-4 w-4 text-blue-500" />
                Events
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mapLayers.housing}
                  onChange={(e) => setMapLayers({ ...mapLayers, housing: e.target.checked })}
                  className="rounded"
                />
                <Home className="h-4 w-4 text-green-500" />
                Housing
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mapLayers.recommendations}
                  onChange={(e) => setMapLayers({ ...mapLayers, recommendations: e.target.checked })}
                  className="rounded"
                />
                <Star className="h-4 w-4 text-yellow-500" />
                Recommendations
              </label>
            </div>
            
            {/* Filters Section */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t space-y-4">
                {/* Date Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Date Range</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      className="flex-1 rounded-md border px-3 py-2"
                      onChange={(e) => setDateFilter({ ...dateFilter, startDate: new Date(e.target.value) })}
                    />
                    <span className="self-center">to</span>
                    <input
                      type="date"
                      className="flex-1 rounded-md border px-3 py-2"
                      onChange={(e) => setDateFilter({ ...dateFilter, endDate: new Date(e.target.value) })}
                    />
                  </div>
                </div>
                
                {/* Event Filters */}
                {mapLayers.events && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Event Filters</label>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={eventFilters.category}
                        onChange={(e) => setEventFilters({ ...eventFilters, category: e.target.value })}
                        className="rounded-md border px-3 py-2"
                      >
                        <option value="all">All Categories</option>
                        <option value="milonga">Milonga</option>
                        <option value="practica">Práctica</option>
                        <option value="workshop">Workshop</option>
                        <option value="festival">Festival</option>
                      </select>
                      <select
                        value={eventFilters.priceRange}
                        onChange={(e) => setEventFilters({ ...eventFilters, priceRange: e.target.value })}
                        className="rounded-md border px-3 py-2"
                      >
                        <option value="all">Any Price</option>
                        <option value="free">Free</option>
                        <option value="0-20">$0-20</option>
                        <option value="20-50">$20-50</option>
                        <option value="50+">$50+</option>
                      </select>
                      <select
                        value={eventFilters.timeOfDay}
                        onChange={(e) => setEventFilters({ ...eventFilters, timeOfDay: e.target.value })}
                        className="rounded-md border px-3 py-2"
                      >
                        <option value="all">Any Time</option>
                        <option value="morning">Morning</option>
                        <option value="afternoon">Afternoon</option>
                        <option value="evening">Evening</option>
                        <option value="night">Night</option>
                      </select>
                    </div>
                  </div>
                )}
                
                {/* Friend Relationship Filter */}
                {(mapLayers.housing || mapLayers.recommendations) && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Friend Connections</label>
                    <select
                      value={friendFilter}
                      onChange={(e) => setFriendFilter(e.target.value as any)}
                      className="w-full rounded-md border px-3 py-2"
                    >
                      <option value="all">All Users</option>
                      <option value="direct">Direct Friends Only</option>
                      <option value="friend-of-friend">Friends of Friends</option>
                      <option value="community">Community Members</option>
                    </select>
                  </div>
                )}
                
                {/* Local vs Visitor Filter for Recommendations */}
                {mapLayers.recommendations && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Recommendation Type</label>
                    <select
                      value={recommendationType}
                      onChange={(e) => setRecommendationType(e.target.value as any)}
                      className="w-full rounded-md border px-3 py-2"
                    >
                      <option value="all">All Recommendations</option>
                      <option value="local">From Locals (e.g., best steaks)</option>
                      <option value="visitor">From Visitors (e.g., authentic Chinese food)</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </Card>
          
          {/* Enhanced Map Component */}
          <div className="h-[600px] rounded-lg overflow-hidden border">
            <CommunityMapWithLayers
              city={city}
              groupSlug={groupSlug}
              layers={mapLayers}
              dateFilter={dateFilter}
              eventFilters={eventFilters}
              friendFilter={friendFilter}
              recommendationType={recommendationType}
              showDirections={true}
            />
          </div>
        </TabsContent>

        {/* Housing Tab */}
        <TabsContent value="housing">
          <HostHomesList 
            city={city} 
            groupSlug={groupSlug}
            showFilters={true}
            friendFilter={friendFilter}
          />
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations">
          <RecommendationsList 
            city={city}
            groupSlug={groupSlug}
            showFilters={true}
            friendFilter={friendFilter}
            recommendationType={recommendationType}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}