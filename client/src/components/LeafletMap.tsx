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
              <div className="text-center">
                <h3 className="font-semibold">{city.city || city.name}</h3>
                {city.country && <p className="text-sm text-gray-600">{city.country}</p>}
                <p className="text-sm mt-1">
                  <span className="font-medium">{memberCount}</span> members
                </p>
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
            <div className="text-center">
              <h3 className="font-semibold">Buenos Aires</h3>
              <p className="text-sm text-gray-600">Argentina</p>
              <p className="text-sm mt-1">
                <span className="font-medium">1</span> member
              </p>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}