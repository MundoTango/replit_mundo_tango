import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Home, MapPin, Star, Users, Layers, Navigation } from 'lucide-react';
import { useLocation } from 'wouter';

// Fix for missing marker icons in production
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons for different types
const createCustomIcon = (color: string, icon: string) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
      <span style="color: white; font-size: 16px;">${icon}</span>
    </div>`,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

// Layer colors
const LAYER_COLORS = {
  cityGroup: '#3B82F6', // Blue
  event: '#10B981', // Green
  home: '#F59E0B', // Amber
  recommendation: '#EF4444', // Red
};

// Map View Controller component to properly set view when center changes
const MapViewController = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  
  React.useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
};

interface MapItem {
  id: string | number;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  type: 'cityGroup' | 'event' | 'home' | 'recommendation';
  city: string;
  slug?: string;
  memberCount?: number;
  eventCount?: number;
  hostCount?: number;
  recommendationCount?: number;
  date?: string;
  price?: number;
  rating?: number;
  photos?: string[];
}

interface CommunityMapWithLayersProps {
  city?: string;
  groupSlug?: string;
  centerLat?: number;
  centerLng?: number;
  groupCity?: string;
  layers?: {
    events: boolean;
    housing: boolean;
    recommendations: boolean;
  };
  dateFilter?: {
    startDate?: Date;
    endDate?: Date;
  };
  eventFilters?: {
    category: string;
    priceRange: string;
    timeOfDay: string;
  };
  friendFilter?: 'all' | 'direct' | 'friend-of-friend' | 'community';
  recommendationType?: 'all' | 'local' | 'visitor';
  showDirections?: boolean;
}

export default function CommunityMapWithLayers({
  city,
  groupSlug,
  centerLat,
  centerLng,
  groupCity,
  layers = { events: true, housing: true, recommendations: true },
  dateFilter,
  eventFilters,
  friendFilter = 'all',
  recommendationType = 'all',
  showDirections = false
}: CommunityMapWithLayersProps) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  
  // Use state for layer visibility, initialized from props
  const [showEvents, setShowEvents] = useState(layers.events);
  const [showHomes, setShowHomes] = useState(layers.housing);
  const [showRecommendations, setShowRecommendations] = useState(layers.recommendations);

  // Fetch city groups
  const { data: cityGroups = [] } = useQuery({
    queryKey: ['/api/community/city-groups', { city }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      
      const response = await fetch(`/api/community/city-groups?${params}`);
      if (!response.ok) throw new Error('Failed to fetch city groups');
      const data = await response.json();
      

      
      return data.success ? data.data : [];
    }
  });

  // Fetch events with location and filters
  const { data: events = [] } = useQuery({
    queryKey: ['/api/community/events-map', { city, groupSlug, dateFilter, eventFilters }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      if (groupSlug) params.append('groupSlug', groupSlug);
      if (dateFilter?.startDate) params.append('startDate', dateFilter.startDate.toISOString());
      if (dateFilter?.endDate) params.append('endDate', dateFilter.endDate.toISOString());
      if (eventFilters?.category && eventFilters.category !== 'all') params.append('category', eventFilters.category);
      if (eventFilters?.priceRange && eventFilters.priceRange !== 'all') params.append('priceRange', eventFilters.priceRange);
      if (eventFilters?.timeOfDay && eventFilters.timeOfDay !== 'all') params.append('timeOfDay', eventFilters.timeOfDay);
      
      const response = await fetch(`/api/community/events-map?${params}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    }
  });

  // Fetch host homes with friend filter
  const { data: homes = [] } = useQuery({
    queryKey: ['/api/community/homes-map', { city, groupSlug, friendFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      if (groupSlug) params.append('groupSlug', groupSlug);
      if (friendFilter && friendFilter !== 'all') params.append('friendFilter', friendFilter);
      
      const response = await fetch(`/api/community/homes-map?${params}`);
      if (!response.ok) throw new Error('Failed to fetch homes');
      return response.json();
    }
  });

  // Fetch recommendations with filters
  const { data: recommendations = [] } = useQuery({
    queryKey: ['/api/community/recommendations-map', { city, groupSlug, friendFilter, recommendationType }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      if (groupSlug) params.append('groupSlug', groupSlug);
      if (friendFilter && friendFilter !== 'all') params.append('friendFilter', friendFilter);
      if (recommendationType && recommendationType !== 'all') params.append('type', recommendationType);
      
      const response = await fetch(`/api/community/recommendations-map?${params}`);
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      return response.json();
    }
  });

  // Combine all items for the map
  const mapItems: MapItem[] = [
    // City groups
    ...cityGroups
      .filter((city: any) => {
        // Filter out entries with invalid coordinates (0,0)
        const hasValidCoords = city.lat !== 0 || city.lng !== 0;
        return hasValidCoords;
      })
      .map((city: any) => {
        return {
          id: city.id,
          lat: city.lat,
          lng: city.lng,
          title: city.name,
          description: `${city.totalUsers || city.memberCount || 0} members • ${city.eventCount || 0} events • ${city.hostCount || 0} hosts • ${city.recommendationCount || 0} recommendations`,
          type: 'cityGroup' as const,
          city: city.name,
          slug: city.slug,
          memberCount: city.totalUsers || city.memberCount || 0,
          eventCount: city.eventCount || 0,
          hostCount: city.hostCount || 0,
          recommendationCount: city.recommendationCount || 0,
        };
      }),
    // Events
    ...events.map((event: any) => ({
      id: event.id,
      lat: event.lat,
      lng: event.lng,
      title: event.title,
      description: event.description,
      type: 'event' as const,
      city: event.city,
      date: event.startDate,
      photos: event.photos,
    })),
    // Host homes
    ...homes.map((home: any) => ({
      id: home.id,
      lat: home.lat,
      lng: home.lng,
      title: home.title,
      description: home.description,
      type: 'home' as const,
      city: home.city,
      price: home.pricePerNight,
      photos: home.photos,
    })),
    // Recommendations
    ...recommendations.map((rec: any) => ({
      id: rec.id,
      lat: rec.lat,
      lng: rec.lng,
      title: rec.title,
      description: rec.description,
      type: 'recommendation' as const,
      city: rec.city,
      rating: rec.rating,
      photos: rec.photos,
    })),
  ];

  // Map fly to component
  function FlyToCity({ city }: { city: string | null }) {
    const map = useMap();
    
    useEffect(() => {
      if (city) {
        const cityItem = mapItems.find(item => item.type === 'cityGroup' && item.city === city);
        if (cityItem) {
          map.flyTo([cityItem.lat, cityItem.lng], 13, { duration: 2 });
        }
      }
    }, [city, map]);
    
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'cityGroup':
        return '🏙️';
      case 'event':
        return '📅';
      case 'home':
        return '🏠';
      case 'recommendation':
        return '⭐';
      default:
        return '📍';
    }
  };

  // Helper function to generate Google Maps URL
  const getGoogleMapsUrl = (lat: number, lng: number, title: string) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(title)}`;
  };

  // Helper function to generate Apple Maps URL
  const getAppleMapsUrl = (lat: number, lng: number, title: string) => {
    return `https://maps.apple.com/?daddr=${lat},${lng}&q=${encodeURIComponent(title)}`;
  };

  // Helper function to detect if user is on iOS
  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  };

  const renderPopupContent = (item: MapItem) => {
    // Enhanced popup for city groups
    if (item.type === 'cityGroup') {
      // City photo mapping based on CityPhotoService
      const getCityImage = () => {
        const cityPhotos: Record<string, string> = {
          'Buenos Aires': 'https://images.pexels.com/photos/16228260/pexels-photo-16228260.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
          'Montevideo': 'https://images.pexels.com/photos/5472862/pexels-photo-5472862.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
          'Milan': 'https://images.pexels.com/photos/1797161/pexels-photo-1797161.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
          'Paris': 'https://images.pexels.com/photos/161853/eiffel-tower-paris-france-tower-161853.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
          'Warsaw': 'https://images.pexels.com/photos/1477430/pexels-photo-1477430.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
          'São Paulo': 'https://images.pexels.com/photos/3619595/pexels-photo-3619595.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
          'San Francisco': 'https://images.pexels.com/photos/208745/pexels-photo-208745.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
          'Rosario': 'https://images.pexels.com/photos/2635011/pexels-photo-2635011.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop'
        };
        
        // Try exact match first
        if (cityPhotos[item.city]) {
          return cityPhotos[item.city];
        }
        
        // Try partial match
        for (const [cityName, photoUrl] of Object.entries(cityPhotos)) {
          if (item.city.toLowerCase().includes(cityName.toLowerCase())) {
            return photoUrl;
          }
        }
        
        return null;
      };
      
      const cityImage = getCityImage();
      
      return (
        <div className="p-0 min-w-[280px] overflow-hidden">
          {/* City Image Header */}
          {cityImage && (
            <div className="relative h-32 mb-3">
              <img 
                src={cityImage}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-2 left-3 right-3">
                <h3 className="font-bold text-xl text-white drop-shadow-lg">{item.title}</h3>
              </div>
            </div>
          )}
          
          {!cityImage && (
            <div className="relative h-24 mb-3 bg-gradient-to-br from-purple-500 to-blue-500">
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="font-bold text-xl text-white drop-shadow-lg px-3 text-center">{item.title}</h3>
              </div>
            </div>
          )}
          
          {/* Stats Section */}
          <div className="px-4 pb-4">
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-blue-50 rounded-lg p-2 text-center">
                <Users className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                <div className="text-base font-bold text-gray-900">{item.memberCount || 0}</div>
                <div className="text-xs text-gray-600">members</div>
              </div>
              <div className="bg-green-50 rounded-lg p-2 text-center">
                <Calendar className="h-4 w-4 text-green-600 mx-auto mb-1" />
                <div className="text-base font-bold text-gray-900">{item.eventCount || 0}</div>
                <div className="text-xs text-gray-600">events</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-2 text-center">
                <Home className="h-4 w-4 text-amber-600 mx-auto mb-1" />
                <div className="text-base font-bold text-gray-900">{item.hostCount || 0}</div>
                <div className="text-xs text-gray-600">hosts</div>
              </div>
              <div className="bg-red-50 rounded-lg p-2 text-center">
                <Star className="h-4 w-4 text-red-600 mx-auto mb-1" />
                <div className="text-base font-bold text-gray-900">{item.recommendationCount || 0}</div>
                <div className="text-xs text-gray-600">recs</div>
              </div>
            </div>
            
            <button 
              className="w-full mt-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium text-sm hover:from-purple-700 hover:to-blue-700 transition-all"
              onClick={() => {
                // Navigate to the group detail page using slug
                if (item.slug) {
                  setLocation(`/groups/${item.slug}`);
                } else {
                  // Fallback to groups page with city filter
                  setLocation(`/groups?city=${encodeURIComponent(item.city)}`);
                }
              }}
            >
              View Community
            </button>
            
            {/* Direction buttons */}
            <div className="flex gap-2 mt-2">
              <a 
                href={getGoogleMapsUrl(item.lat, item.lng, item.title)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 px-3 rounded text-xs font-medium transition-colors"
              >
                <Navigation className="h-3 w-3" />
                Google Maps
              </a>
              <a 
                href={getAppleMapsUrl(item.lat, item.lng, item.title)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 px-3 rounded text-xs font-medium transition-colors"
              >
                <Navigation className="h-3 w-3" />
                Apple Maps
              </a>
            </div>
          </div>
        </div>
      );
    }
    
    // MT Design popup for other types
    return (
      <div className="p-3 min-w-[240px] max-w-[300px]">
        <h3 className="font-bold text-lg mb-2 text-gray-800">{item.title}</h3>
        {item.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>}
        
        {item.type === 'event' && item.date && (
          <div className="flex items-center gap-2 text-sm p-2 bg-green-50 rounded-lg">
            <div className="p-1.5 bg-green-500 rounded">
              <Calendar className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-medium text-green-800">{new Date(item.date).toLocaleDateString()}</span>
          </div>
        )}
        
        {item.type === 'home' && item.price && (
          <div className="flex items-center gap-2 text-sm p-2 bg-amber-50 rounded-lg">
            <div className="p-1.5 bg-amber-500 rounded">
              <Home className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-medium text-amber-800">${item.price}/night</span>
          </div>
        )}
        
        {item.type === 'recommendation' && item.rating && (
          <div className="flex items-center gap-2 text-sm p-2 bg-red-50 rounded-lg">
            <div className="p-1.5 bg-red-500 rounded">
              <Star className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-medium text-red-800">{item.rating}/5 stars</span>
          </div>
        )}
        
        {item.photos && item.photos.length > 0 && (
          <img 
            src={item.photos[0]} 
            alt={item.title}
            className="w-full h-32 object-cover rounded-lg mt-3 shadow-sm"
          />
        )}
        
        {/* MT Style Direction buttons */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-purple-100">
          <a 
            href={getGoogleMapsUrl(item.lat, item.lng, item.title)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 px-3 rounded-lg text-xs font-medium transition-all shadow-sm hover:shadow-md"
          >
            <Navigation className="h-3.5 w-3.5" />
            Google Maps
          </a>
          <a 
            href={getAppleMapsUrl(item.lat, item.lng, item.title)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-2 px-3 rounded-lg text-xs font-medium transition-all shadow-sm hover:shadow-md"
          >
            <Navigation className="h-3.5 w-3.5" />
            Apple Maps
          </a>
        </div>
      </div>
    );
  };


  
  return (
    <div className="h-full w-full relative">
      {/* MT Design Layer Control */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-xl shadow-xl p-5 min-w-[240px] border border-purple-100">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-gradient-to-r from-purple-200 to-pink-200">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-gray-800">Map Layers</span>
        </div>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-purple-50 transition-colors">
            <input
              type="checkbox"
              checked={showEvents}
              onChange={(e) => setShowEvents(e.target.checked)}
              className="h-5 w-5 text-purple-600 focus:ring-purple-500 rounded cursor-pointer"
            />
            <span className="flex items-center gap-2 text-sm font-medium text-gray-700 group-hover:text-purple-700">
              <Calendar className="h-4 w-4 text-green-600" />
              Events
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-pink-50 transition-colors">
            <input
              type="checkbox"
              checked={showHomes}
              onChange={(e) => setShowHomes(e.target.checked)}
              className="h-5 w-5 text-pink-600 focus:ring-pink-500 rounded cursor-pointer"
            />
            <span className="flex items-center gap-2 text-sm font-medium text-gray-700 group-hover:text-pink-700">
              <Home className="h-4 w-4 text-amber-600" />
              Host Homes
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-blue-50 transition-colors">
            <input
              type="checkbox"
              checked={showRecommendations}
              onChange={(e) => setShowRecommendations(e.target.checked)}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 rounded cursor-pointer"
            />
            <span className="flex items-center gap-2 text-sm font-medium text-gray-700 group-hover:text-blue-700">
              <Star className="h-4 w-4 text-red-600" />
              Recommendations
            </span>
          </label>
        </div>
      </div>
      
      <MapContainer
        key={`${centerLat}-${centerLng}`} // Force re-render when center changes
        center={[centerLat || -15, centerLng || -60]} // Use provided center or default to South America
        zoom={centerLat && centerLng ? 13 : 3} // Use zoom 13 for city view, 3 for global view
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Map Controller to properly set view */}
        <MapViewController 
          center={[centerLat || -15, centerLng || -60]} 
          zoom={centerLat && centerLng ? 13 : 3} 
        />
        
        {/* Display City Groups - Always visible as base layer */}
        {mapItems
          .filter(item => item.type === 'cityGroup')
          .map(item => {

            return (
              <Marker
                key={`city-${item.id}`}
                position={[item.lat, item.lng]}
                icon={createCustomIcon(LAYER_COLORS.cityGroup, getIcon(item.type))}
              >
                <Popup>{renderPopupContent(item)}</Popup>
              </Marker>
            );
          })}
        
        {/* Events Layer */}
        {showEvents && mapItems
          .filter(item => item.type === 'event')
          .map(item => (
            <CircleMarker
              key={`event-${item.id}`}
              center={[item.lat, item.lng]}
              radius={8}
              fillColor={LAYER_COLORS.event}
              color="white"
              weight={2}
              fillOpacity={0.8}
            >
              <Popup>{renderPopupContent(item)}</Popup>
            </CircleMarker>
          ))}
          
        {/* Host Homes Layer */}
        {showHomes && mapItems
          .filter(item => item.type === 'home')
          .map(item => (
            <CircleMarker
              key={`home-${item.id}`}
              center={[item.lat, item.lng]}
              radius={8}
              fillColor={LAYER_COLORS.home}
              color="white"
              weight={2}
              fillOpacity={0.8}
            >
              <Popup>{renderPopupContent(item)}</Popup>
            </CircleMarker>
          ))}
          
        {/* Recommendations Layer */}
        {showRecommendations && mapItems
          .filter(item => item.type === 'recommendation')
          .map(item => (
            <CircleMarker
              key={`rec-${item.id}`}
              center={[item.lat, item.lng]}
              radius={8}
              fillColor={LAYER_COLORS.recommendation}
              color="white"
              weight={2}
              fillOpacity={0.8}
            >
              <Popup>{renderPopupContent(item)}</Popup>
            </CircleMarker>
          ))}
        
        <FlyToCity city={selectedCity} />
      </MapContainer>
    </div>
  );
}