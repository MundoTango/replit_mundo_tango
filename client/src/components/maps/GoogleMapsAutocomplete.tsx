import { useState, useRef, useEffect, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LocationData {
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  placeId: string;
  formattedAddress: string;
}

interface GoogleMapsAutocompleteProps {
  value?: string;
  placeholder?: string;
  onLocationSelect: (location: LocationData) => void;
  onClear?: () => void;
  showMap?: boolean;
  className?: string;
  required?: boolean;
}

export default function GoogleMapsAutocomplete({
  value = '',
  placeholder = 'Search for a location...',
  onLocationSelect,
  onClear,
  showMap = false,
  className = '',
  required = false
}: GoogleMapsAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initializeGoogleMaps = async () => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        console.log('Google Maps API Key check:', apiKey ? 'Available' : 'Missing');
        if (!apiKey) {
          console.error('Google Maps API key not found in environment variables');
          throw new Error('Google Maps API key not configured');
        }
        
        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places', 'geometry']
        });

        await loader.load();
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setError('Failed to load Google Maps. Please check your API key.');
      }
    };

    initializeGoogleMaps();
  }, []);

  // Initialize autocomplete when Google Maps is loaded
  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    try {
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['(cities)'],
        fields: ['place_id', 'formatted_address', 'name', 'geometry', 'address_components']
      });

      autocompleteRef.current = autocomplete;

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (!place.geometry || !place.geometry.location) {
          setError('No location data available for this place.');
          return;
        }

        const locationData = extractLocationData(place);
        setSelectedLocation(locationData);
        setInputValue(locationData.formattedAddress);
        onLocationSelect(locationData);

        // Update map if enabled
        if (showMap && mapInstanceRef.current) {
          updateMap(locationData);
        }
      });

    } catch (error) {
      console.error('Error initializing autocomplete:', error);
      setError('Failed to initialize location search.');
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded, onLocationSelect, showMap]);

  // Initialize map if enabled
  useEffect(() => {
    if (!isLoaded || !showMap || !mapRef.current) return;

    try {
      const map = new google.maps.Map(mapRef.current, {
        zoom: 13,
        center: { lat: -34.6037, lng: -58.3816 }, // Default to Buenos Aires
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });

      mapInstanceRef.current = map;

      // Add click listener for manual location selection
      map.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode(
            { location: event.latLng },
            (results, status) => {
              if (status === 'OK' && results && results[0]) {
                const locationData = extractLocationData(results[0]);
                setSelectedLocation(locationData);
                setInputValue(locationData.formattedAddress);
                onLocationSelect(locationData);
                updateMap(locationData);
              }
            }
          );
        }
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      setError('Failed to initialize map.');
    }
  }, [isLoaded, showMap, onLocationSelect]);

  // Extract structured location data from Google Places result
  const extractLocationData = (place: google.maps.places.PlaceResult | google.maps.GeocoderResult): LocationData => {
    const components = place.address_components || [];
    let city = '';
    let state = '';
    let country = '';

    components.forEach(component => {
      const types = component.types;
      if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.long_name;
      } else if (types.includes('country')) {
        country = component.long_name;
      }
    });

    const location = place.geometry?.location;
    const lat = typeof location?.lat === 'function' ? location.lat() : location?.lat || 0;
    const lng = typeof location?.lng === 'function' ? location.lng() : location?.lng || 0;

    return {
      address: place.formatted_address || '',
      city,
      state,
      country,
      latitude: lat,
      longitude: lng,
      placeId: place.place_id || '',
      formattedAddress: place.formatted_address || ''
    };
  };

  // Update map with new location
  const updateMap = (location: LocationData) => {
    if (!mapInstanceRef.current) return;

    const position = { lat: location.latitude, lng: location.longitude };
    
    // Update map center
    mapInstanceRef.current.setCenter(position);
    mapInstanceRef.current.setZoom(15);

    // Update or create marker
    if (markerRef.current) {
      markerRef.current.setPosition(position);
    } else {
      markerRef.current = new google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        draggable: true,
        title: location.formattedAddress
      });

      // Handle marker drag
      markerRef.current.addListener('dragend', () => {
        const newPosition = markerRef.current?.getPosition();
        if (newPosition) {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode(
            { location: newPosition },
            (results, status) => {
              if (status === 'OK' && results && results[0]) {
                const locationData = extractLocationData(results[0]);
                setSelectedLocation(locationData);
                setInputValue(locationData.formattedAddress);
                onLocationSelect(locationData);
              }
            }
          );
        }
      });
    }
  };

  const handleClear = () => {
    setInputValue('');
    setSelectedLocation(null);
    setError(null);
    if (onClear) onClear();
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setError(null);
  };

  if (!isLoaded) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-600">Loading location search...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search className="w-4 h-4" />
        </div>
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          className="pl-10 pr-10 py-3 w-full border-gray-200 focus:border-pink-300 focus:ring-pink-100 rounded-lg"
        />
        {inputValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Selected Location Info */}
      {selectedLocation && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                {selectedLocation.city && `${selectedLocation.city}, `}
                {selectedLocation.state && `${selectedLocation.state}, `}
                {selectedLocation.country}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Coordinates: {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Map Display */}
      {showMap && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">Map Preview</p>
            <p className="text-xs text-gray-500">Click on map or drag marker to adjust location</p>
          </div>
          <div 
            ref={mapRef}
            className="w-full h-64 rounded-lg border border-gray-200"
          />
        </div>
      )}
    </div>
  );
}