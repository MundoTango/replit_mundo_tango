import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, MapPin, Search } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface Location {
  city: string;
  state: string;
  country: string;
}

interface AutocompleteLocationPickerProps {
  selectedLocation: Location;
  onLocationSelect: (location: Location) => void;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    county?: string;
    country?: string;
  };
}

export function AutocompleteLocationPicker({ selectedLocation, onLocationSelect }: AutocompleteLocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(searchQuery, 500);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search for locations when query changes
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const searchLocations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(debouncedQuery)}&format=json&addressdetails=1&limit=10`
        );
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error searching locations:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchLocations();
  }, [debouncedQuery]);

  const handleSuggestionClick = (result: NominatimResult) => {
    const city = result.address.city || result.address.town || result.address.village || '';
    const state = result.address.state || result.address.county || '';
    const country = result.address.country || '';

    onLocationSelect({ city, state, country });
    setSearchQuery(`${city}${state ? ', ' + state : ''}${country ? ', ' + country : ''}`);
    setShowSuggestions(false);
  };

  const displayLocation = selectedLocation.city || selectedLocation.state || selectedLocation.country
    ? `${selectedLocation.city}${selectedLocation.state ? ', ' + selectedLocation.state : ''}${selectedLocation.country ? ', ' + selectedLocation.country : ''}`
    : '';

  return (
    <div className="space-y-4">
      <div ref={searchRef} className="relative">
        <Label htmlFor="location-search" className="text-sm font-medium mb-2 block">
          Search for your city
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="location-search"
            type="text"
            placeholder="Type to search for any city worldwide..."
            value={searchQuery || displayLocation}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchQuery('')}
            className="pl-10 pr-10"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
          )}
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-auto shadow-lg">
            <ul className="py-1">
              {suggestions.map((result, index) => {
                const city = result.address.city || result.address.town || result.address.village || '';
                const state = result.address.state || result.address.county || '';
                const country = result.address.country || '';
                const displayName = `${city}${state ? ', ' + state : ''}${country ? ', ' + country : ''}`;

                return (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-turquoise-50 cursor-pointer transition-colors duration-150 flex items-center gap-2"
                    onClick={() => handleSuggestionClick(result)}
                  >
                    <MapPin className="w-4 h-4 text-turquoise-500 flex-shrink-0" />
                    <span className="text-sm">{displayName || result.display_name}</span>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </div>

      {selectedLocation.city && (
        <div className="text-sm text-gray-600 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-turquoise-500" />
          <span>
            Selected: {selectedLocation.city}
            {selectedLocation.state && `, ${selectedLocation.state}`}
            {selectedLocation.country && `, ${selectedLocation.country}`}
          </span>
        </div>
      )}
    </div>
  );
}