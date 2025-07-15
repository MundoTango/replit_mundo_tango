import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Home, MapPin, Star, Users } from 'lucide-react';

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

interface MapItem {
  id: string | number;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  type: 'cityGroup' | 'event' | 'home' | 'recommendation';
  city: string;
  memberCount?: number;
  eventCount?: number;
  date?: string;
  price?: number;
  rating?: number;
  photos?: string[];
}

export default function CommunityMapWithLayers() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  // Fetch city groups
  const { data: cityGroups = [] } = useQuery({
    queryKey: ['/api/community/city-groups'],
  });

  // Fetch events with location
  const { data: events = [] } = useQuery({
    queryKey: ['/api/community/events-map'],
  });

  // Fetch host homes
  const { data: homes = [] } = useQuery({
    queryKey: ['/api/community/homes-map'],
  });

  // Fetch recommendations
  const { data: recommendations = [] } = useQuery({
    queryKey: ['/api/community/recommendations-map'],
  });

  // Combine all items for the map
  const mapItems: MapItem[] = [
    // City groups
    ...cityGroups.map((city: any) => ({
      id: city.id,
      lat: city.lat,
      lng: city.lng,
      title: city.name,
      description: `${city.memberCount} members • ${city.eventCount} events`,
      type: 'cityGroup' as const,
      city: city.name,
      memberCount: city.memberCount,
      eventCount: city.eventCount,
    })),
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
          map.flyTo([cityItem.lat, cityItem.lng], 10, { duration: 2 });
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

  const renderPopupContent = (item: MapItem) => {
    return (
      <div className="p-2 min-w-[200px]">
        <h3 className="font-bold text-lg mb-1">{item.title}</h3>
        {item.description && <p className="text-sm text-gray-600 mb-2">{item.description}</p>}
        
        {item.type === 'cityGroup' && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-blue-500" />
              <span>{item.memberCount} members</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-green-500" />
              <span>{item.eventCount} events</span>
            </div>
          </div>
        )}
        
        {item.type === 'event' && item.date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-green-500" />
            <span>{new Date(item.date).toLocaleDateString()}</span>
          </div>
        )}
        
        {item.type === 'home' && item.price && (
          <div className="flex items-center gap-2 text-sm">
            <Home className="h-4 w-4 text-amber-500" />
            <span>${item.price}/night</span>
          </div>
        )}
        
        {item.type === 'recommendation' && item.rating && (
          <div className="flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 text-red-500" />
            <span>{item.rating}/5 stars</span>
          </div>
        )}
        
        {item.photos && item.photos.length > 0 && (
          <img 
            src={item.photos[0]} 
            alt={item.title}
            className="w-full h-24 object-cover rounded mt-2"
          />
        )}
      </div>
    );
  };

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={[-15, -60]} // Center on South America
        zoom={3}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <LayersControl position="topright">
          {/* City Groups Base Layer */}
          <LayersControl.BaseLayer checked name="City Groups">
            <div>
              {mapItems
                .filter(item => item.type === 'cityGroup')
                .map(item => (
                  <Marker
                    key={`city-${item.id}`}
                    position={[item.lat, item.lng]}
                    icon={createCustomIcon(LAYER_COLORS.cityGroup, getIcon(item.type))}
                  >
                    <Popup>{renderPopupContent(item)}</Popup>
                  </Marker>
                ))}
            </div>
          </LayersControl.BaseLayer>
          
          {/* Events Overlay */}
          <LayersControl.Overlay checked name="Events">
            <div>
              {mapItems
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
            </div>
          </LayersControl.Overlay>
          
          {/* Host Homes Overlay */}
          <LayersControl.Overlay name="Host Homes">
            <div>
              {mapItems
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
            </div>
          </LayersControl.Overlay>
          
          {/* Recommendations Overlay */}
          <LayersControl.Overlay name="Recommendations">
            <div>
              {mapItems
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
            </div>
          </LayersControl.Overlay>
        </LayersControl>
        
        <FlyToCity city={selectedCity} />
      </MapContainer>
    </div>
  );
}