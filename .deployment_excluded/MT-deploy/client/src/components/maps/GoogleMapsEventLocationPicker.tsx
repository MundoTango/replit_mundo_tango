import React, { useState, useEffect, useRef } from 'react';
import { loadGoogleMaps, isGoogleMapsLoaded } from '@/lib/google-maps-loader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, X } from 'lucide-react';

interface EventLocationData {
  address: string;
  venue: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  placeId: string;
  formattedAddress: string;
  postalCode?: string;
}

interface GoogleMapsEventLocationPickerProps {
  value?: string;
  onLocationSelect: (location: EventLocationData) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  showMap?: boolean;
}

export default function GoogleMapsEventLocationPicker({
  value = '',
  onLocationSelect,
  onClear,
  placeholder = "Search event venue or location...",
  className = '',
  required = false,
  showMap = false
}: GoogleMapsEventLocationPickerProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initializeGoogleMaps = async () => {
      // Check if already loaded
      if (isGoogleMapsLoaded()) {
        setIsLoaded(true);
        return;
      }
      
      try {
        await loadGoogleMaps();
        setIsLoaded(true);
        setError(null);
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load Google Maps');
      }
    };

    initializeGoogleMaps();
  }, []);

  // Initialize autocomplete when Maps API is loaded
  useEffect(() => {
    if (isLoaded && inputRef.current && !autocompleteRef.current) {
      try {
        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['establishment', 'geocode'],
          fields: ['place_id', 'formatted_address', 'name', 'geometry', 'address_components', 'types']
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry && place.geometry.location) {
            const locationData = extractEventLocationData(place);
            setInputValue(locationData.formattedAddress);
            onLocationSelect(locationData);
            setShowSuggestions(false);
            
            if (showMap && mapInstanceRef.current) {
              updateMap(locationData);
            }
          }
        });

        autocompleteRef.current = autocomplete;
      } catch (err) {
        console.error('Error initializing autocomplete:', err);
        setError('Failed to initialize location search');
      }
    }
  }, [isLoaded, onLocationSelect, showMap]);

  // Initialize map if showMap is true
  useEffect(() => {
    if (isLoaded && showMap && mapRef.current && !mapInstanceRef.current) {
      try {
        const map = new google.maps.Map(mapRef.current, {
          zoom: 15,
          center: { lat: -34.6037, lng: -58.3816 }, // Buenos Aires default
          mapTypeId: google.maps.MapTypeId.ROADMAP
        });
        
        mapInstanceRef.current = map;
      } catch (err) {
        console.error('Error initializing map:', err);
      }
    }
  }, [isLoaded, showMap]);

  const extractEventLocationData = (place: google.maps.places.PlaceResult): EventLocationData => {
    const components = place.address_components || [];
    let venue = place.name || '';
    let address = '';
    let city = '';
    let state = '';
    let country = '';
    let postalCode = '';

    components.forEach((component) => {
      const types = component.types;
      
      if (types.includes('street_number') || types.includes('route')) {
        address += component.long_name + ' ';
      } else if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.long_name;
      } else if (types.includes('country')) {
        country = component.long_name;
      } else if (types.includes('postal_code')) {
        postalCode = component.long_name;
      }
    });

    return {
      address: address.trim(),
      venue,
      city,
      state,
      country,
      latitude: place.geometry!.location!.lat(),
      longitude: place.geometry!.location!.lng(),
      placeId: place.place_id || '',
      formattedAddress: place.formatted_address || '',
      postalCode
    };
  };

  const updateMap = (location: EventLocationData) => {
    if (mapInstanceRef.current) {
      const position = { lat: location.latitude, lng: location.longitude };
      
      mapInstanceRef.current.setCenter(position);
      
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      
      markerRef.current = new google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: location.venue || location.formattedAddress
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue.length > 2 && isLoaded) {
      // Trigger places search
      const service = new google.maps.places.PlacesService(document.createElement('div'));
      service.textSearch(
        { query: newValue },
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            setSuggestions(results.slice(0, 5));
            setShowSuggestions(true);
          }
        }
      );
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    const locationData = extractEventLocationData(suggestion);
    setInputValue(locationData.formattedAddress);
    onLocationSelect(locationData);
    setShowSuggestions(false);
    
    if (showMap && mapInstanceRef.current) {
      updateMap(locationData);
    }
  };

  const handleClear = () => {
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    onClear?.();
    
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
  };

  if (error) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <MapPin className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          className="pr-20"
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
          <MapPin className="h-4 w-4 text-gray-400" />
          {inputValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-gray-50 focus:outline-none"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {suggestion.name}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {suggestion.formatted_address}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Optional map display */}
      {showMap && (
        <div className="mt-4">
          <div
            ref={mapRef}
            className="h-64 w-full rounded-lg border border-gray-200"
          />
        </div>
      )}
    </div>
  );
}