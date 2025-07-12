import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Calendar, Home, MapPin, Filter, Layers, Users, X } from 'lucide-react';
import { Button } from '../ui/button';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Event {
  id: number;
  title: string;
  location: string;
  latitude: number;
  longitude: number;
  startDate: string;
  attendeeCount: number;
  host?: { name: string };
}

interface HostHome {
  id: number;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  propertyType: string;
  pricePerNight: number;
  host: { name: string };
  friendRelation?: { type: string };
}

interface Recommendation {
  id: number;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  rating: number;
  recommender: { name: string; isLocal: boolean };
  friendRelation?: { type: string };
}

interface CommunityMapWithLayersProps {
  groupCity?: string;
  centerLat?: number;
  centerLng?: number;
}

// Map control to fit bounds
function FitBoundsControl({ markers }: { markers: any[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.latitude, m.longitude]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, map]);
  
  return null;
}

export function CommunityMapWithLayers({ groupCity, centerLat = -34.6037, centerLng = -58.3816 }: CommunityMapWithLayersProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [hostHomes, setHostHomes] = useState<HostHome[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Layer toggles
  const [showEvents, setShowEvents] = useState(true);
  const [showHousing, setShowHousing] = useState(true);
  const [showRecommendations, setShowRecommendations] = useState(true);
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [housingTypeFilter, setHousingTypeFilter] = useState('all');
  const [recommendationCategoryFilter, setRecommendationCategoryFilter] = useState('all');

  useEffect(() => {
    fetchAllData();
  }, [groupCity]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchEvents(),
        fetchHostHomes(),
        fetchRecommendations()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams({
        city: groupCity || '',
        startDate: dateFilter.start || '',
        endDate: dateFilter.end || ''
      });
      
      const response = await fetch(`/api/events/map?${params}`);
      const data = await response.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchHostHomes = async () => {
    try {
      const params = new URLSearchParams({
        city: groupCity || '',
        propertyType: housingTypeFilter !== 'all' ? housingTypeFilter : ''
      });
      
      const response = await fetch(`/api/host-homes/map?${params}`);
      const data = await response.json();
      if (data.success) {
        setHostHomes(data.data);
      }
    } catch (error) {
      console.error('Error fetching host homes:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const params = new URLSearchParams({
        city: groupCity || '',
        category: recommendationCategoryFilter !== 'all' ? recommendationCategoryFilter : ''
      });
      
      const response = await fetch(`/api/recommendations/map?${params}`);
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.data);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  // Custom icons for different layers
  const eventIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.4 0 0 5.4 0 12C0 21 12 32 12 32S24 21 24 12C24 5.4 18.6 0 12 0Z" fill="#FF1744"/>
        <circle cx="12" cy="12" r="8" fill="white"/>
        <path d="M12 7V12L15 15" stroke="#FF1744" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `),
    iconSize: [24, 32],
    iconAnchor: [12, 32],
    popupAnchor: [0, -32],
  });

  const housingIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.4 0 0 5.4 0 12C0 21 12 32 12 32S24 21 24 12C24 5.4 18.6 0 12 0Z" fill="#4CAF50"/>
        <circle cx="12" cy="12" r="8" fill="white"/>
        <path d="M12 6L7 10V16H10V13H14V16H17V10L12 6Z" fill="#4CAF50"/>
      </svg>
    `),
    iconSize: [24, 32],
    iconAnchor: [12, 32],
    popupAnchor: [0, -32],
  });

  const recommendationIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.4 0 0 5.4 0 12C0 21 12 32 12 32S24 21 24 12C24 5.4 18.6 0 12 0Z" fill="#2196F3"/>
        <circle cx="12" cy="12" r="8" fill="white"/>
        <path d="M12 6L13.5 9.5L17 10L14.5 12.5L15 16L12 14L9 16L9.5 12.5L7 10L10.5 9.5L12 6Z" fill="#2196F3"/>
      </svg>
    `),
    iconSize: [24, 32],
    iconAnchor: [12, 32],
    popupAnchor: [0, -32],
  });

  const allMarkers = [
    ...(showEvents ? events : []),
    ...(showHousing ? hostHomes : []),
    ...(showRecommendations ? recommendations : [])
  ];

  return (
    <div className="relative h-full">
      {/* Map Container */}
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBoundsControl markers={allMarkers} />
        
        {/* Event Markers */}
        {showEvents && events.map((event) => (
          <Marker
            key={`event-${event.id}`}
            position={[event.latitude, event.longitude]}
            icon={eventIcon}
          >
            <Popup>
              <div className="p-2">
                <h4 className="font-semibold">{event.title}</h4>
                <p className="text-sm text-gray-600">{event.location}</p>
                <p className="text-sm">
                  {new Date(event.startDate).toLocaleDateString()} at{' '}
                  {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                {event.host && (
                  <p className="text-sm">Host: {event.host.name}</p>
                )}
                <p className="text-sm font-medium">{event.attendeeCount} attending</p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Housing Markers */}
        {showHousing && hostHomes.map((home) => (
          <Marker
            key={`home-${home.id}`}
            position={[home.latitude, home.longitude]}
            icon={housingIcon}
          >
            <Popup>
              <div className="p-2">
                <h4 className="font-semibold">{home.title}</h4>
                <p className="text-sm text-gray-600">{home.address}</p>
                <p className="text-sm">{home.propertyType.replace('_', ' ')}</p>
                <p className="text-sm font-medium">${home.pricePerNight}/night</p>
                <p className="text-sm">Host: {home.host.name}</p>
                {home.friendRelation && (
                  <p className="text-sm text-green-600">
                    {home.friendRelation.type === 'direct' ? 'Friend' : 
                     home.friendRelation.type === 'friend_of_friend' ? 'Friend of Friend' :
                     'Community Member'}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Recommendation Markers */}
        {showRecommendations && recommendations.map((rec) => (
          <Marker
            key={`rec-${rec.id}`}
            position={[rec.latitude, rec.longitude]}
            icon={recommendationIcon}
          >
            <Popup>
              <div className="p-2">
                <h4 className="font-semibold">{rec.title}</h4>
                <p className="text-sm text-gray-600">{rec.address}</p>
                <p className="text-sm">{rec.category}</p>
                <p className="text-sm">⭐ {rec.rating.toFixed(1)}</p>
                <p className="text-sm">By: {rec.recommender.name}</p>
                {rec.recommender.isLocal && (
                  <p className="text-sm text-green-600">Local Expert</p>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 w-full"
                  onClick={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(rec.address)}`;
                    window.open(url, '_blank');
                  }}
                >
                  Get Directions
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Layer Controls */}
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="h-5 w-5" />
          <span className="font-semibold">Map Layers</span>
        </div>
        
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showEvents}
              onChange={(e) => setShowEvents(e.target.checked)}
              className="rounded"
            />
            <Calendar className="h-4 w-4 text-red-600" />
            <span className="text-sm">Events ({events.length})</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showHousing}
              onChange={(e) => setShowHousing(e.target.checked)}
              className="rounded"
            />
            <Home className="h-4 w-4 text-green-600" />
            <span className="text-sm">Housing ({hostHomes.length})</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showRecommendations}
              onChange={(e) => setShowRecommendations(e.target.checked)}
              className="rounded"
            />
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="text-sm">Recommendations ({recommendations.length})</span>
          </label>
        </div>
        
        <Button
          size="sm"
          variant="outline"
          className="w-full mt-3"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-1" />
          {showFilters ? 'Hide' : 'Show'} Filters
        </Button>
      </div>
      
      {/* Filters Panel */}
      {showFilters && (
        <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-4 w-80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Filters</h3>
            <button onClick={() => setShowFilters(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Date Filter for Events */}
          {showEvents && (
            <div className="mb-4">
              <h4 className="font-medium text-sm mb-2">Event Dates</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={dateFilter.start}
                  onChange={(e) => setDateFilter({...dateFilter, start: e.target.value})}
                  className="px-2 py-1 border rounded text-sm"
                  placeholder="Start"
                />
                <input
                  type="date"
                  value={dateFilter.end}
                  onChange={(e) => setDateFilter({...dateFilter, end: e.target.value})}
                  className="px-2 py-1 border rounded text-sm"
                  placeholder="End"
                />
              </div>
            </div>
          )}
          
          {/* Housing Type Filter */}
          {showHousing && (
            <div className="mb-4">
              <h4 className="font-medium text-sm mb-2">Housing Type</h4>
              <select
                value={housingTypeFilter}
                onChange={(e) => setHousingTypeFilter(e.target.value)}
                className="w-full px-2 py-1 border rounded text-sm"
              >
                <option value="all">All Types</option>
                <option value="entire_place">Entire Place</option>
                <option value="private_room">Private Room</option>
                <option value="shared_room">Shared Room</option>
              </select>
            </div>
          )}
          
          {/* Recommendation Category Filter */}
          {showRecommendations && (
            <div className="mb-4">
              <h4 className="font-medium text-sm mb-2">Recommendation Category</h4>
              <select
                value={recommendationCategoryFilter}
                onChange={(e) => setRecommendationCategoryFilter(e.target.value)}
                className="w-full px-2 py-1 border rounded text-sm"
              >
                <option value="all">All Categories</option>
                <option value="restaurant">Restaurants</option>
                <option value="bar">Bars</option>
                <option value="cafe">Cafés</option>
                <option value="attraction">Attractions</option>
                <option value="shopping">Shopping</option>
                <option value="entertainment">Entertainment</option>
              </select>
            </div>
          )}
          
          <Button
            size="sm"
            onClick={fetchAllData}
            className="w-full"
          >
            Apply Filters
          </Button>
        </div>
      )}
      
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-[999]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-500"></div>
        </div>
      )}
    </div>
  );
}