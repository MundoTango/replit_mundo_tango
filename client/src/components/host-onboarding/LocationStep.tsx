import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Navigation, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const defaultCenter = {
  lat: -34.603722, // Buenos Aires default
  lng: -58.381592,
};

interface LocationStepProps {
  data: any;
  updateData: (data: any) => void;
}

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    house_number?: string;
    road?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

// Custom component to handle map clicks in Leaflet
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationStep({ data, updateData }: LocationStepProps) {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    data.latitude && data.longitude ? [data.latitude, data.longitude] : null
  );
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle map click
  const handleMapClick = async (lat: number, lng: number) => {
    setMarkerPosition([lat, lng]);
    updateData({
      latitude: lat,
      longitude: lng,
    });

    // Reverse geocode using OpenStreetMap Nominatim
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.address) {
        updateData({
          address: [data.address.house_number, data.address.road].filter(Boolean).join(' ') || '',
          city: data.address.city || data.address.town || data.address.village || '',
          state: data.address.state || '',
          country: data.address.country || '',
          zipCode: data.address.postcode || '',
        });
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  // Removed Google Maps place changed and autocomplete load handlers

  // Manual geocoding function for verify button
  const geocodeAddress = useCallback(async () => {
    if (!data.address || !data.city || !data.country) {
      toast({
        title: 'Missing information',
        description: 'Please fill in address, city, and country before verifying location.',
        variant: 'destructive',
      });
      return;
    }

    setIsGeocoding(true);
    
    try {
      // Always use OpenStreetMap for manual verification to avoid Google Maps issues
      const fullAddress = `${data.address}, ${data.city}, ${data.state || ''}, ${data.country}`.trim();
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`);
      const results = await response.json();

      if (results && results.length > 0) {
        const { lat, lon } = results[0];
        updateData({
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
        });
        
        // Update map position
        setMarkerPosition([parseFloat(lat), parseFloat(lon)]);
        if (mapRef.current) {
          mapRef.current.setView([parseFloat(lat), parseFloat(lon)], 17);
        }
        
        toast({
          title: 'Location verified',
          description: 'We found your property on the map!',
        });
      } else {
        toast({
          title: 'Location not found',
          description: 'Please check your address and try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify location. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGeocoding(false);
    }
  }, [data.address, data.city, data.state, data.country, updateData]);

  // Address autocomplete search using OpenStreetMap
  const searchAddressSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      const results = await response.json();
      
      const formattedResults = results.map((result: any) => ({
        display_name: result.display_name,
        lat: result.lat,
        lon: result.lon,
        address: result.address || {},
      }));
      
      setAddressSuggestions(formattedResults);
      setShowSuggestions(formattedResults.length > 0);
    } catch (error) {
      console.error('Error searching addresses:', error);
      setAddressSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle address input change with debouncing
  const handleAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateData({ address: value });

    // Clear previous timeout
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }

    // Set new timeout for search
    suggestionsTimeoutRef.current = setTimeout(() => {
      searchAddressSuggestions(value);
    }, 500);
  }, [updateData, searchAddressSuggestions]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: any) => {
    const { address } = suggestion;
    
    updateData({
      address: address.road || address.pedestrian || address.footway || '',
      city: address.city || address.town || address.village || address.municipality || '',
      state: address.state || address.province || '',
      country: address.country || '',
      zipCode: address.postcode || '', // Add zip code from address
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon),
    });

    setShowSuggestions(false);
    setAddressSuggestions([]);

    // Update map position
    setMarkerPosition([parseFloat(suggestion.lat), parseFloat(suggestion.lon)]);
    if (mapRef.current) {
      mapRef.current.setView([parseFloat(suggestion.lat), parseFloat(suggestion.lon)], 17);
    }

    toast({
      title: 'Address selected',
      description: 'Location has been updated on the map.',
    });
  }, [updateData, toast]);

  const getDirectionsUrl = () => {
    if (data.latitude && data.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${data.latitude},${data.longitude}`;
    }
    return '';
  };

  const getAppleMapsUrl = () => {
    if (data.latitude && data.longitude) {
      return `https://maps.apple.com/?daddr=${data.latitude},${data.longitude}`;
    }
    return '';
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Where's your place located?</h2>
        <p className="text-gray-600">Your address is only shared with guests after they've made a reservation</p>
      </div>

      {/* OpenStreetMap/Leaflet integration */}
      <div className="space-y-4">
        {/* Interactive Leaflet Map */}
        <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height: '400px' }}>
          <MapContainer
            center={markerPosition || [defaultCenter.lat, defaultCenter.lng]}
            zoom={markerPosition ? 17 : 15}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onMapClick={handleMapClick} />
            {markerPosition && <Marker position={markerPosition} />}
          </MapContainer>
        </div>

        {/* Directions links */}
        {data.latitude && data.longitude && (
          <div className="flex gap-4">
            <a
              href={getDirectionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <Navigation className="h-4 w-4" />
              Get Google Maps directions
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href={getAppleMapsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <Navigation className="h-4 w-4" />
              Open in Apple Maps
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Label htmlFor="address">Street address</Label>
          <Input
            id="address"
            placeholder="123 Main Street"
            value={data.address || ''}
            onChange={handleAddressChange}
            onFocus={() => data.address && searchAddressSuggestions(data.address)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="mt-1"
          />
          
          {/* Address suggestions dropdown */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {isSearching ? (
                <div className="p-3 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-500 mx-auto"></div>
                  <p className="mt-2 text-sm">Searching...</p>
                </div>
              ) : (
                addressSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-0"
                  >
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {suggestion.display_name}
                    </p>
                    {suggestion.address && (
                      <p className="text-xs text-gray-500 mt-1">
                        {[
                          suggestion.address.city || suggestion.address.town,
                          suggestion.address.state,
                          suggestion.address.country
                        ].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="San Francisco"
              value={data.city || ''}
              onChange={(e) => updateData({ city: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="state">State/Province</Label>
            <Input
              id="state"
              placeholder="California"
              value={data.state || ''}
              onChange={(e) => updateData({ state: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              placeholder="United States"
              value={data.country || ''}
              onChange={(e) => updateData({ country: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="zipCode">ZIP/Postal code</Label>
            <Input
              id="zipCode"
              placeholder="94105"
              value={data.zipCode || ''}
              onChange={(e) => updateData({ zipCode: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Verify location button */}
      <div className="flex justify-center">
        <Button
          type="button"
          onClick={geocodeAddress}
          disabled={isGeocoding}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isGeocoding ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              Verifying location...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Verify location on map
            </>
          )}
        </Button>
      </div>

      {/* Map preview */}
      {data.latitude && data.longitude && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-100 p-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">Property location (approximate)</span>
          </div>
          <div className="relative h-64">
            <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              aria-hidden="false"
              tabIndex={0}
            />
          </div>
        </div>
      )}

      {/* Privacy notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-1">Your privacy is important</h4>
        <p className="text-sm text-blue-800">
          We'll only show your exact address to guests after they book. Before booking, 
          they'll see an approximate location.
        </p>
      </div>
    </div>
  );
}