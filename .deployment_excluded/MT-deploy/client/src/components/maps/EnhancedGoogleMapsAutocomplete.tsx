import { useState, useRef, useEffect, useCallback } from 'react';
import { loadGoogleMaps, isGoogleMapsLoaded } from '@/lib/google-maps-loader';
import { MapPin, Search, X, Navigation } from 'lucide-react';
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
  name?: string; // Business name
  type?: string; // Place type (restaurant, etc.)
  phoneNumber?: string;
  website?: string;
  openingHours?: string[];
  rating?: number;
  priceLevel?: number;
}

interface LocationSuggestion {
  name: string;
  lat: number;
  lng: number;
  context?: string;
}

interface EnhancedGoogleMapsAutocompleteProps {
  value?: string;
  placeholder?: string;
  onLocationSelect: (location: LocationData) => void;
  onClear?: () => void;
  showMap?: boolean;
  className?: string;
  required?: boolean;
  currentLocation?: { lat: number; lng: number };
  suggestions?: LocationSuggestion[];
  allowBusinessSearch?: boolean;
}

export default function EnhancedGoogleMapsAutocomplete({
  value = '',
  placeholder = 'Search for a location or business...',
  onLocationSelect,
  onClear,
  showMap = false,
  className = '',
  required = false,
  currentLocation,
  suggestions = [],
  allowBusinessSearch = true
}: EnhancedGoogleMapsAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<google.maps.places.PlaceResult[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initializeGoogleMaps = async () => {
      if (isGoogleMapsLoaded()) {
        setIsLoaded(true);
        return;
      }
      
      try {
        await loadGoogleMaps();
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setError('Failed to load Google Maps. Please check your API key.');
      }
    };

    initializeGoogleMaps();
  }, []);

  // Initialize autocomplete with enhanced options
  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    try {
      // Configure autocomplete for both addresses and businesses
      const options: google.maps.places.AutocompleteOptions = {
        fields: [
          'place_id', 
          'formatted_address', 
          'name', 
          'geometry', 
          'address_components',
          'types',
          'business_status',
          'rating',
          'price_level',
          'opening_hours',
          'website',
          'formatted_phone_number'
        ]
      };

      // If we have current location, bias results to that area
      if (currentLocation) {
        options.bounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(
            currentLocation.lat - 0.1,
            currentLocation.lng - 0.1
          ),
          new google.maps.LatLng(
            currentLocation.lat + 0.1,
            currentLocation.lng + 0.1
          )
        );
        options.strictBounds = false;
      }

      // Don't restrict types if business search is allowed
      if (!allowBusinessSearch) {
        options.types = ['(cities)'];
      }

      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, options);
      autocompleteRef.current = autocomplete;

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (!place.geometry || !place.geometry.location) {
          setError('No location data available for this place.');
          return;
        }

        const locationData = extractEnhancedLocationData(place);
        setSelectedLocation(locationData);
        setInputValue(locationData.name || locationData.formattedAddress);
        onLocationSelect(locationData);

        // Update map if enabled
        if (showMap && mapInstanceRef.current) {
          updateMap(locationData);
        }

        // Search for nearby places if this is a general location
        if (!place.types?.includes('establishment') && placesServiceRef.current) {
          searchNearbyPlaces(locationData);
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
  }, [isLoaded, onLocationSelect, showMap, currentLocation, allowBusinessSearch]);

  // Initialize map if enabled
  useEffect(() => {
    if (!isLoaded || !showMap || !mapRef.current) return;

    try {
      const center = currentLocation || { lat: -34.6037, lng: -58.3816 }; // Default to Buenos Aires
      
      const map = new google.maps.Map(mapRef.current, {
        zoom: 15,
        center,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });

      mapInstanceRef.current = map;
      placesServiceRef.current = new google.maps.places.PlacesService(map);

      // Add current location marker if available
      if (currentLocation) {
        new google.maps.Marker({
          position: currentLocation,
          map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
          title: 'Your location'
        });
      }

      // Add suggestion markers
      suggestions.forEach(suggestion => {
        const marker = new google.maps.Marker({
          position: { lat: suggestion.lat, lng: suggestion.lng },
          map,
          title: suggestion.name,
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png'
          }
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div>
              <strong>${suggestion.name}</strong>
              ${suggestion.context ? `<br><small>${suggestion.context}</small>` : ''}
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
          setInputValue(suggestion.name);
          // Trigger selection
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode(
            { location: { lat: suggestion.lat, lng: suggestion.lng } },
            (results, status) => {
              if (status === 'OK' && results && results[0]) {
                const locationData = extractEnhancedLocationData(results[0]);
                locationData.name = suggestion.name;
                onLocationSelect(locationData);
              }
            }
          );
        });
      });

      // Add click listener for manual location selection
      map.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode(
            { location: event.latLng },
            (results, status) => {
              if (status === 'OK' && results && results[0]) {
                const locationData = extractEnhancedLocationData(results[0]);
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
  }, [isLoaded, showMap, onLocationSelect, currentLocation, suggestions]);

  // Search for nearby places
  const searchNearbyPlaces = (location: LocationData) => {
    if (!placesServiceRef.current || !mapInstanceRef.current) return;

    const request: google.maps.places.PlaceSearchRequest = {
      location: new google.maps.LatLng(location.latitude, location.longitude),
      radius: 500,
      type: 'establishment'
    };

    placesServiceRef.current.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        setNearbyPlaces(results.slice(0, 5)); // Show top 5 nearby places
        setShowSuggestions(true);
      }
    });
  };

  // Extract enhanced location data from Google Places result
  const extractEnhancedLocationData = (
    place: google.maps.places.PlaceResult | google.maps.GeocoderResult
  ): LocationData => {
    const components = place.address_components || [];
    let city = '';
    let state = '';
    let country = '';
    let address = '';

    components.forEach(component => {
      const types = component.types;
      if (types.includes('street_number') || types.includes('route')) {
        address += component.long_name + ' ';
      } else if (types.includes('locality')) {
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

    // Type guard to check if it's a PlaceResult
    const isPlaceResult = 'name' in place;

    return {
      address: address.trim() || place.formatted_address || '',
      city,
      state,
      country,
      latitude: lat,
      longitude: lng,
      placeId: place.place_id || '',
      formattedAddress: place.formatted_address || '',
      // Enhanced fields for businesses
      name: isPlaceResult ? place.name : undefined,
      type: isPlaceResult && place.types ? place.types[0] : undefined,
      phoneNumber: isPlaceResult ? place.formatted_phone_number : undefined,
      website: isPlaceResult ? place.website : undefined,
      openingHours: isPlaceResult && place.opening_hours ? place.opening_hours.weekday_text : undefined,
      rating: isPlaceResult ? place.rating : undefined,
      priceLevel: isPlaceResult ? place.price_level : undefined,
    };
  };

  // Update map with selected location
  const updateMap = (location: LocationData) => {
    if (!mapInstanceRef.current) return;

    const position = new google.maps.LatLng(location.latitude, location.longitude);
    
    // Update or create marker
    if (markerRef.current) {
      markerRef.current.setPosition(position);
    } else {
      markerRef.current = new google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        draggable: true,
        animation: google.maps.Animation.DROP,
      });

      markerRef.current.addListener('dragend', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode(
            { location: event.latLng },
            (results, status) => {
              if (status === 'OK' && results && results[0]) {
                const locationData = extractEnhancedLocationData(results[0]);
                setSelectedLocation(locationData);
                setInputValue(locationData.formattedAddress);
                onLocationSelect(locationData);
              }
            }
          );
        }
      });
    }

    mapInstanceRef.current.panTo(position);
    mapInstanceRef.current.setZoom(17);
  };

  // Use current location
  const useCurrentLocation = () => {
    if (!currentLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          // Reverse geocode to get address
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode(
            { location },
            (results, status) => {
              if (status === 'OK' && results && results[0]) {
                const locationData = extractEnhancedLocationData(results[0]);
                setSelectedLocation(locationData);
                setInputValue(locationData.formattedAddress);
                onLocationSelect(locationData);
                if (showMap) updateMap(locationData);
              }
            }
          );
        },
        (error) => {
          setError('Could not get your location. Please enable location services.');
        },
        { enableHighAccuracy: true }
      );
    } else {
      // Use provided current location
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        { location: currentLocation },
        (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const locationData = extractEnhancedLocationData(results[0]);
            setSelectedLocation(locationData);
            setInputValue(locationData.formattedAddress);
            onLocationSelect(locationData);
            if (showMap) updateMap(locationData);
          }
        }
      );
    }
  };

  // Handle input value change
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
              className="pl-10 pr-10"
              required={required}
              disabled={!isLoaded}
            />
            {inputValue && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInputValue('');
                  setSelectedLocation(null);
                  onClear?.();
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {isLoaded && (
            <Button
              variant="outline"
              size="sm"
              onClick={useCurrentLocation}
              className="whitespace-nowrap"
              title="Use current location"
            >
              <Navigation className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-600 mt-1">{error}</p>
        )}

        {/* Business details if selected */}
        {selectedLocation && selectedLocation.name && (
          <div className="mt-2 p-3 bg-purple-50 rounded-lg text-sm">
            <p className="font-semibold">{selectedLocation.name}</p>
            {selectedLocation.rating && (
              <p className="text-gray-600">
                Rating: {'⭐'.repeat(Math.round(selectedLocation.rating))} ({selectedLocation.rating})
              </p>
            )}
            {selectedLocation.phoneNumber && (
              <p className="text-gray-600">📞 {selectedLocation.phoneNumber}</p>
            )}
            {selectedLocation.website && (
              <a href={selectedLocation.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                🌐 Website
              </a>
            )}
          </div>
        )}

        {/* Nearby places suggestions */}
        {showSuggestions && nearbyPlaces.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
            <p className="px-4 py-2 text-sm font-semibold text-gray-700 border-b">Nearby places:</p>
            {nearbyPlaces.map((place, index) => (
              <button
                key={index}
                onClick={() => {
                  const locationData = extractEnhancedLocationData(place);
                  setSelectedLocation(locationData);
                  setInputValue(locationData.name || locationData.formattedAddress);
                  onLocationSelect(locationData);
                  setShowSuggestions(false);
                  if (showMap) updateMap(locationData);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
              >
                <p className="font-medium">{place.name}</p>
                <p className="text-gray-500">{place.vicinity}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map container */}
      {showMap && (
        <div 
          ref={mapRef} 
          className="w-full h-64 rounded-lg border border-gray-200"
          style={{ minHeight: '250px' }}
        />
      )}
    </div>
  );
}