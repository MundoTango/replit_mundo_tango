import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Calendar, Home, Star, Users, MapPin } from 'lucide-react';
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
    friendLevel?: number;
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
  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);

  // Fetch map data for the city/community
  const { data: mapData = [], isLoading } = useQuery({
    queryKey: ['/api/community/map-data', city, country, groupSlug],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      if (country) params.append('country', country);
      if (groupSlug) params.append('groupSlug', groupSlug);
      
      const response = await fetch(`/api/community/map-data?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error('Failed to fetch map data');
        return [];
      }
      
      const result = await response.json();
      return result.data || [];
    }
  });

  // Filter data based on active layers
  const filteredData = mapData.filter((item: MapItem) => {
    return activeLayers[item.type];
  });

  // Create custom icons for different item types
  const eventIcon = L.divIcon({
    className: 'custom-event-marker',
    html: '<div class="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-md flex items-center justify-center"><div class="w-2 h-2 bg-white rounded-full"></div></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  const housingIcon = L.divIcon({
    className: 'custom-housing-marker',
    html: '<div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-md flex items-center justify-center"><div class="w-2 h-2 bg-white rounded-full"></div></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  const recommendationIcon = L.divIcon({
    className: 'custom-recommendation-marker',
    html: '<div class="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-md flex items-center justify-center"><div class="w-2 h-2 bg-white rounded-full"></div></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'event': return eventIcon;
      case 'housing': return housingIcon;
      case 'recommendation': return recommendationIcon;
      default: return eventIcon;
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* Layer Toggle Controls */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3 space-y-2">
        <p className="text-sm font-semibold text-gray-700">Layers</p>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={activeLayers.events}
              onChange={(e) => setActiveLayers(prev => ({ ...prev, events: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm text-gray-600">Events</span>
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={activeLayers.housing}
              onChange={(e) => setActiveLayers(prev => ({ ...prev, housing: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm text-gray-600">Housing</span>
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={activeLayers.recommendations}
              onChange={(e) => setActiveLayers(prev => ({ ...prev, recommendations: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm text-gray-600">Places</span>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </label>
        </div>
      </div>

      {/* Map Container */}
      <MapContainer
        center={center}
        zoom={13}
        className="h-full w-full rounded-lg"
        style={{ height: '100%', width: '100%' }}
      >
        <ChangeView center={center} zoom={13} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {filteredData.map((item: MapItem) => (
          <Marker
            key={item.id}
            position={[item.latitude, item.longitude]}
            icon={getIcon(item.type)}
            eventHandlers={{
              click: () => setSelectedItem(item)
            }}
          >
            <Popup>
              <div className="p-2 max-w-sm">
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                {item.address && (
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.address}
                  </p>
                )}
                {item.metadata && (
                  <div className="text-xs text-gray-500 space-y-1">
                    {item.metadata.price && <p>Price: {item.metadata.price}</p>}
                    {item.metadata.date && <p>Date: {item.metadata.date}</p>}
                    {item.metadata.rating && <p>Rating: {item.metadata.rating}/5</p>}
                  </div>
                )}
                <Button size="sm" className="w-full mt-2">
                  View Details
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}