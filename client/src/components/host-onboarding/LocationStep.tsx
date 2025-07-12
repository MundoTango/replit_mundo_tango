import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Navigation, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';

const libraries: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
};

const defaultCenter = {
  lat: -34.603722, // Buenos Aires default
  lng: -58.381592,
};

interface LocationStepProps {
  data: any;
  updateData: (data: any) => void;
}

export default function LocationStep({ data, updateData }: LocationStepProps) {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [mapUrl, setMapUrl] = useState('');
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [center, setCenter] = useState(defaultCenter);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check if we have Google Maps API key - moved to top to avoid hoisting issues
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  // Debug Google Maps API key
  console.log('Google Maps API Key exists:', !!googleMapsApiKey);
  console.log('Google Maps API Key length:', googleMapsApiKey?.length);
  console.log('Google Maps API Key (first 10 chars):', googleMapsApiKey?.substring(0, 10));

  // Update center when coordinates change
  useEffect(() => {
    if (data.latitude && data.longitude) {
      const newCenter = { lat: data.latitude, lng: data.longitude };
      setCenter(newCenter);
      
      // Update marker position
      if (marker && map) {
        marker.setPosition(newCenter);
        map.panTo(newCenter);
      }
    }
  }, [data.latitude, data.longitude, map, marker]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    
    // Create marker
    const newMarker = new google.maps.Marker({
      position: center,
      map: map,
      draggable: true,
      animation: google.maps.Animation.DROP,
    });
    
    setMarker(newMarker);
    
    // Handle marker drag
    newMarker.addListener('dragend', () => {
      const position = newMarker.getPosition();
      if (position) {
        updateData({
          latitude: position.lat(),
          longitude: position.lng(),
        });
        
        // Reverse geocode to get address
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: position }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const components = results[0].address_components;
            let streetNumber = '';
            let streetName = '';
            let city = '';
            let state = '';
            let country = '';
            let zipCode = '';
            
            components?.forEach((component) => {
              const types = component.types;
              if (types.includes('street_number')) streetNumber = component.long_name;
              if (types.includes('route')) streetName = component.long_name;
              if (types.includes('locality')) city = component.long_name;
              if (types.includes('administrative_area_level_1')) state = component.short_name;
              if (types.includes('country')) country = component.long_name;
              if (types.includes('postal_code')) zipCode = component.long_name;
            });
            
            updateData({
              address: `${streetNumber} ${streetName}`.trim(),
              city,
              state,
              country,
              zipCode,
            });
          }
        });
      }
    });
  }, [center, updateData]);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng && marker) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      marker.setPosition(e.latLng);
      updateData({
        latitude: lat,
        longitude: lng,
      });
      
      // Reverse geocode
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: e.latLng }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const components = results[0].address_components;
          let streetNumber = '';
          let streetName = '';
          let city = '';
          let state = '';
          let country = '';
          let zipCode = '';
          
          components?.forEach((component) => {
            const types = component.types;
            if (types.includes('street_number')) streetNumber = component.long_name;
            if (types.includes('route')) streetName = component.long_name;
            if (types.includes('locality')) city = component.long_name;
            if (types.includes('administrative_area_level_1')) state = component.short_name;
            if (types.includes('country')) country = component.long_name;
            if (types.includes('postal_code')) zipCode = component.long_name;
          });
          
          updateData({
            address: `${streetNumber} ${streetName}`.trim(),
            city,
            state,
            country,
            zipCode,
          });
        }
      });
    }
  }, [marker, updateData]);

  const onPlaceChanged = useCallback(() => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        updateData({
          latitude: lat,
          longitude: lng,
        });
        
        if (map && marker) {
          map.panTo(place.geometry.location);
          map.setZoom(17);
          marker.setPosition(place.geometry.location);
        }
        
        // Parse address components
        if (place.address_components) {
          let streetNumber = '';
          let streetName = '';
          let city = '';
          let state = '';
          let country = '';
          let zipCode = '';
          
          place.address_components.forEach((component) => {
            const types = component.types;
            if (types.includes('street_number')) streetNumber = component.long_name;
            if (types.includes('route')) streetName = component.long_name;
            if (types.includes('locality')) city = component.long_name;
            if (types.includes('administrative_area_level_1')) state = component.short_name;
            if (types.includes('country')) country = component.long_name;
            if (types.includes('postal_code')) zipCode = component.long_name;
          });
          
          updateData({
            address: `${streetNumber} ${streetName}`.trim(),
            city,
            state,
            country,
            zipCode,
          });
        }
      }
    }
  }, [map, marker, updateData]);

  const onAutocompleteLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  }, []);

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
        
        // Update map if using Google Maps
        if (map && marker) {
          const newPos = new google.maps.LatLng(parseFloat(lat), parseFloat(lon));
          map.panTo(newPos);
          map.setZoom(17);
          marker.setPosition(newPos);
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
  }, [data.address, data.city, data.state, data.country, map, marker, updateData]);

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
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon),
    });

    setShowSuggestions(false);
    setAddressSuggestions([]);

    // Update map if available
    if (map && marker) {
      const newPos = new google.maps.LatLng(parseFloat(suggestion.lat), parseFloat(suggestion.lon));
      map.panTo(newPos);
      map.setZoom(17);
      marker.setPosition(newPos);
    }

    toast({
      title: 'Address selected',
      description: 'Location has been updated on the map.',
    });
  }, [updateData, map, marker, toast]);

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

      {/* Google Maps integration */}
      {googleMapsApiKey ? (
        <LoadScript
          googleMapsApiKey={googleMapsApiKey}
          libraries={libraries}
          onLoad={() => console.log('Google Maps loaded successfully')}
          onError={(error) => {
            console.error('Error loading Google Maps:', error);
            toast({
              title: 'Map Loading Error',
              description: 'Failed to load Google Maps. Please check your internet connection.',
              variant: 'destructive',
            });
          }}
        >
          <div className="space-y-4">
            {/* Autocomplete search box */}
            <div className="relative">
              <Label htmlFor="search-address">Search for your address</Label>
              <Autocomplete
                onLoad={onAutocompleteLoad}
                onPlaceChanged={onPlaceChanged}
              >
                <div className="relative">
                  <Input
                    id="search-address"
                    ref={inputRef}
                    placeholder="Start typing your address..."
                    className="mt-1 pr-10"
                  />
                  <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                </div>
              </Autocomplete>
            </div>

            {/* Interactive Google Map */}
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={15}
                onLoad={onMapLoad}
                onClick={onMapClick}
                options={{
                  streetViewControl: true,
                  mapTypeControl: true,
                  fullscreenControl: true,
                }}
              />
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
        </LoadScript>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            Google Maps integration requires an API key. Please add VITE_GOOGLE_MAPS_API_KEY to your environment variables.
          </p>
        </div>
      )}

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