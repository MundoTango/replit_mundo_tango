import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers not showing
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapCity {
  id: string | number;
  name: string;
  city?: string;
  country?: string;
  lat: number;
  lng: number;
  memberCount?: number | string;
  totalUsers?: number;
  eventCount?: number;
}

interface LeafletMapProps {
  cities: MapCity[];
  onCityClick?: (city: MapCity) => void;
  selectedCity?: MapCity | null;
}

// Component to handle map updates when selected city changes
function MapUpdater({ selectedCity }: { selectedCity?: MapCity | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedCity && selectedCity.lat && selectedCity.lng) {
      map.flyTo([selectedCity.lat, selectedCity.lng], 10, {
        duration: 1.5
      });
    }
  }, [selectedCity, map]);
  
  return null;
}

export default function LeafletMap({ cities, onCityClick, selectedCity }: LeafletMapProps) {
  // Create custom icons based on member count
  const getMarkerIcon = (memberCount: number) => {
    const size = Math.min(40, 20 + memberCount / 5);
    const color = memberCount > 100 ? '#FF1744' : 
                  memberCount > 50 ? '#F50057' : 
                  memberCount > 20 ? '#E91E63' : '#9C27B0';
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  // Filter cities with valid coordinates
  const validCities = cities.filter(city => 
    city.lat && city.lng && 
    !isNaN(city.lat) && !isNaN(city.lng) &&
    city.lat !== 0 && city.lng !== 0
  );
  
  // Debug Buenos Aires coordinates
  const buenosAires = cities.find(city => city.city === 'Buenos Aires');
  if (buenosAires) {
    console.log('Buenos Aires coordinates:', { lat: buenosAires.lat, lng: buenosAires.lng });
  }
  }

  // If no valid cities, show Buenos Aires as default
  const defaultCenter: [number, number] = validCities.length > 0 
    ? [0, 0] // World view
    : [-34.6037, -58.3816]; // Buenos Aires

  return (
    <MapContainer
      center={defaultCenter}
      zoom={2}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg border border-gray-200"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapUpdater selectedCity={selectedCity} />
      
      {validCities.map((city) => {
        const memberCount = typeof city.memberCount === 'string' 
          ? parseInt(city.memberCount) 
          : city.memberCount || city.totalUsers || 0;
        
        return (
          <Marker
            key={city.id}
            position={[city.lat, city.lng]}
            icon={getMarkerIcon(memberCount)}
            eventHandlers={{
              click: () => onCityClick?.(city),
            }}
          >
            <Popup>
              <div 
                className="text-center cursor-pointer p-2 hover:bg-gray-50 rounded transition-colors"
                onClick={() => {
                  onCityClick?.(city);
                  // Navigate to city group page using slug
                  const slug = city.slug || `tango-${(city.city || city.name).toLowerCase().replace(/\s+/g, '-')}-${(city.country || '').toLowerCase().replace(/\s+/g, '-')}`;
                  window.location.href = `/groups/${slug}`;
                }}
              >
                <h3 className="font-bold text-lg bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
                  {city.city || city.name}
                </h3>
                {city.country && <p className="text-sm text-gray-600">{city.country}</p>}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-center gap-1 text-sm">
                    <span className="font-semibold text-pink-600">{memberCount}</span>
                    <span className="text-gray-600">members</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-sm">
                    <span className="font-semibold text-blue-600">{city.eventCount || 0}</span>
                    <span className="text-gray-600">events</span>
                  </div>
                </div>
                <button className="mt-2 text-xs bg-gradient-to-r from-pink-500 to-blue-500 text-white px-3 py-1 rounded-full hover:opacity-90 transition-opacity">
                  View Group
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
      
      {/* Add Buenos Aires as default if no cities */}
      {validCities.length === 0 && (
        <Marker
          position={[-34.6037, -58.3816]}
          icon={getMarkerIcon(1)}
        >
          <Popup>
            <div 
              className="text-center cursor-pointer p-2 hover:bg-gray-50 rounded transition-colors"
              onClick={() => {
                window.location.href = `/groups/buenos-aires`;
              }}
            >
              <h3 className="font-bold text-lg bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
                Buenos Aires
              </h3>
              <p className="text-sm text-gray-600">Argentina</p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-center gap-1 text-sm">
                  <span className="font-semibold text-pink-600">1</span>
                  <span className="text-gray-600">member</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-sm">
                  <span className="font-semibold text-blue-600">0</span>
                  <span className="text-gray-600">events</span>
                </div>
              </div>
              <button className="mt-2 text-xs bg-gradient-to-r from-pink-500 to-blue-500 text-white px-3 py-1 rounded-full hover:opacity-90 transition-opacity">
                View Group
              </button>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}