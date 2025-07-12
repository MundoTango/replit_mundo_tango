import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Calendar, Home, Star, Users, MapPin, Filter, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapItem {
  id: number;
  type: 'event' | 'housing' | 'recommendation';
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  metadata?: {
    price?: string;
    date?: string;
    rating?: number;
    friendLevel?: number; // degrees of separation
    isLocal?: boolean;
    propertyType?: string;
  };
}

interface CommunityMapWithLayersProps {
  groupSlug?: string;
  city?: string;
  country?: string;
  center?: [number, number];
}

// Helper component to change map view
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function CommunityMapWithLayers({ 
  groupSlug, 
  city = 'Buenos Aires', 
  country = 'Argentina',
  center = [-34.6037, -58.3816] // Buenos Aires default
}: CommunityMapWithLayersProps) {
  const [activeLayers, setActiveLayers] = useState({
    events: true,
    housing: true,
    recommendations: true
  });
  
  const [filters, setFilters] = useState({
    friendLevel: 3, // up to 3 degrees of separation
    localOnly: false,
    visitorOnly: false,
    propertyType: 'all'
  });

  // Fetch map data
  const { data: mapData, isLoading } = useQuery({
    queryKey: ['/api/community/map-data', groupSlug, city],
    queryFn: async () => {
      const params = new URLSearchParams({
        city,
        ...(groupSlug && { groupSlug })
      });
      const response = await fetch(`/api/community/map-data?${params}`);
      const data = await response.json();
      return data.data || [];
    }
  });

  // Create custom icons for different types
  const createIcon = (type: string, color: string) => {
    return L.divIcon({
      html: `
        <div class="relative">
          <div class="absolute -top-8 -left-4 w-8 h-8 ${color} rounded-full flex items-center justify-center text-white shadow-lg">
            ${type === 'event' ? '📅' : type === 'housing' ? '🏠' : '⭐'}
          </div>
        </div>
      `,
      className: 'custom-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });
  };

  const eventIcon = createIcon('event', 'bg-purple-500');
  const housingIcon = createIcon('housing', 'bg-blue-500');
  const recommendationIcon = createIcon('recommendation', 'bg-yellow-500');

  // Filter data based on active layers and filters
  const filteredData = (mapData || []).filter((item: MapItem) => {
    // Layer filter
    if (!activeLayers[item.type]) return false;
    
    // Friend level filter
    if (filters.friendLevel < 3 && item.metadata?.friendLevel && item.metadata.friendLevel > filters.friendLevel) {
      return false;
    }
    
    // Local/Visitor filter for recommendations
    if (item.type === 'recommendation') {
      if (filters.localOnly && !item.metadata?.isLocal) return false;
      if (filters.visitorOnly && item.metadata?.isLocal) return false;
    }
    
    // Property type filter for housing
    if (item.type === 'housing' && filters.propertyType !== 'all') {
      if (item.metadata?.propertyType !== filters.propertyType) return false;
    }
    
    return true;
  });

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  return (
    <div className="relative h-full w-full">
      {/* Layer Controls */}
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-gray-600" />
          Map Layers
        </h3>
        
        <div className="space-y-2">
          <button
            onClick={() => toggleLayer('events')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              activeLayers.events 
                ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">Events</span>
            {activeLayers.events && <span className="ml-auto text-xs">✓</span>}
          </button>
          
          <button
            onClick={() => toggleLayer('housing')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              activeLayers.housing 
                ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Home className="h-4 w-4" />
            <span className="text-sm font-medium">Housing</span>
            {activeLayers.housing && <span className="ml-auto text-xs">✓</span>}
          </button>
          
          <button
            onClick={() => toggleLayer('recommendations')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              activeLayers.recommendations 
                ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Star className="h-4 w-4" />
            <span className="text-sm font-medium">Recommendations</span>
            {activeLayers.recommendations && <span className="ml-auto text-xs">✓</span>}
          </button>
        </div>
        
        {/* Advanced Filters */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </h4>
          
          {/* Friend Level Filter */}
          <div className="mb-3">
            <label className="text-xs text-gray-600 mb-1 block">Friend Connections</label>
            <select 
              value={filters.friendLevel}
              onChange={(e) => setFilters(prev => ({ ...prev, friendLevel: Number(e.target.value) }))}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
            >
              <option value={1}>Direct Friends</option>
              <option value={2}>Friends of Friends</option>
              <option value={3}>Up to 3 Degrees</option>
            </select>
          </div>
          
          {/* Local/Visitor Filter for Recommendations */}
          {activeLayers.recommendations && (
            <div className="mb-3">
              <label className="text-xs text-gray-600 mb-1 block">Recommendations From</label>
              <div className="flex gap-1">
                <button
                  onClick={() => setFilters(prev => ({ 
                    ...prev, 
                    localOnly: !prev.localOnly,
                    visitorOnly: false 
                  }))}
                  className={`flex-1 px-2 py-1 text-xs rounded ${
                    filters.localOnly 
                      ? 'bg-pink-500 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Locals
                </button>
                <button
                  onClick={() => setFilters(prev => ({ 
                    ...prev, 
                    visitorOnly: !prev.visitorOnly,
                    localOnly: false 
                  }))}
                  className={`flex-1 px-2 py-1 text-xs rounded ${
                    filters.visitorOnly 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Visitors
                </button>
              </div>
            </div>
          )}
          
          {/* Property Type Filter for Housing */}
          {activeLayers.housing && (
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Property Type</label>
              <select 
                value={filters.propertyType}
                onChange={(e) => setFilters(prev => ({ ...prev, propertyType: e.target.value }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
              >
                <option value="all">All Types</option>
                <option value="room">Private Room</option>
                <option value="shared">Shared Room</option>
                <option value="apartment">Entire Apartment</option>
                <option value="house">Entire House</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <MapContainer
        center={center}
        zoom={13}
        className="h-full w-full"
        style={{ minHeight: '500px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ChangeView center={center} zoom={13} />
        
        {/* Render filtered markers */}
        {filteredData.map((item: MapItem) => (
          <Marker
            key={`${item.type}-${item.id}`}
            position={[item.latitude, item.longitude]}
            icon={
              item.type === 'event' ? eventIcon :
              item.type === 'housing' ? housingIcon :
              recommendationIcon
            }
          >
            <Popup>
              <div className="p-2 max-w-xs">
                <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                
                {/* Event details */}
                {item.type === 'event' && item.metadata?.date && (
                  <div className="text-xs text-gray-500">
                    <Calendar className="inline h-3 w-3 mr-1" />
                    {new Date(item.metadata.date).toLocaleDateString()}
                  </div>
                )}
                
                {/* Housing details */}
                {item.type === 'housing' && (
                  <div className="text-xs text-gray-500">
                    {item.metadata?.price && <div>💰 {item.metadata.price}</div>}
                    {item.metadata?.propertyType && (
                      <div>🏠 {item.metadata.propertyType}</div>
                    )}
                  </div>
                )}
                
                {/* Recommendation details */}
                {item.type === 'recommendation' && (
                  <div className="text-xs text-gray-500">
                    {item.metadata?.rating && <div>⭐ {item.metadata.rating}/5</div>}
                    {item.metadata?.isLocal !== undefined && (
                      <div>
                        {item.metadata.isLocal ? '👤 Local recommendation' : '🌍 Visitor recommendation'}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Friend connection info */}
                {item.metadata?.friendLevel && (
                  <div className="text-xs text-blue-600 mt-1">
                    <Users className="inline h-3 w-3 mr-1" />
                    {item.metadata.friendLevel === 1 ? 'Direct friend' :
                     item.metadata.friendLevel === 2 ? 'Friend of friend' :
                     `${item.metadata.friendLevel} degrees away`}
                  </div>
                )}
                
                {/* Google Maps link */}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-800"
                >
                  <Globe className="h-3 w-3" />
                  Get directions
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-[1000]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map data...</p>
          </div>
        </div>
      )}
    </div>
  );
}