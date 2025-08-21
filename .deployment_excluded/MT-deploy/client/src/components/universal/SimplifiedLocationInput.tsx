import { useState, useRef, useEffect } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface LocationData {
  address: string;
  city: string;
  state?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  formattedAddress: string;
  name?: string;
}

interface SimplifiedLocationInputProps {
  value?: string;
  placeholder?: string;
  onLocationSelect: (location: LocationData | string) => void;
  onClear?: () => void;
  className?: string;
  required?: boolean;
}

export default function SimplifiedLocationInput({
  value = '',
  placeholder = 'Enter location (e.g., La Viruta, Buenos Aires)',
  onLocationSelect,
  onClear,
  className = '',
  required = false
}: SimplifiedLocationInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Common Buenos Aires locations for quick selection
  const commonLocations = [
    'La Viruta Tango Club, Buenos Aires',
    'Salón Canning, Buenos Aires',
    'La Catedral Club, Buenos Aires',
    'Milonga Parakultural, Buenos Aires',
    'Centro Cultural Torquato Tasso, Buenos Aires',
    'Confitería Ideal, Buenos Aires',
    'El Beso Milonga, Buenos Aires',
    'Plaza Dorrego, San Telmo, Buenos Aires'
  ];

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Simple client-side filtering of common locations
    if (newValue.length > 2) {
      const filtered = commonLocations.filter(loc => 
        loc.toLowerCase().includes(newValue.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }

    // Always update parent with the string value
    onLocationSelect(newValue);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    onLocationSelect(suggestion);
    
    // Try to geocode using OpenStreetMap Nominatim
    geocodeLocation(suggestion);
  };

  const geocodeLocation = async (location: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
      );
      
      if (!response.ok) throw new Error('Geocoding failed');
      
      const data = await response.json();
      if (data && data[0]) {
        const result = data[0];
        const locationData: LocationData = {
          address: location,
          city: result.address?.city || result.address?.town || 'Buenos Aires',
          state: result.address?.state,
          country: result.address?.country || 'Argentina',
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          formattedAddress: result.display_name,
          name: location.split(',')[0] // First part as name
        };
        onLocationSelect(locationData);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      // Just use the string value if geocoding fails
      onLocationSelect(location);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInputValue('');
    setShowSuggestions(false);
    onLocationSelect('');
    onClear?.();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (inputValue.length > 2) {
              const filtered = commonLocations.filter(loc => 
                loc.toLowerCase().includes(inputValue.toLowerCase())
              );
              setSuggestions(filtered);
              setShowSuggestions(filtered.length > 0);
            }
          }}
          onBlur={() => {
            // Delay to allow click on suggestions
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={placeholder}
          required={required}
          className="pl-10 pr-10 border-gray-200 focus:border-turquoise-500 focus:ring-turquoise-500"
          disabled={isLoading}
        />
        {inputValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-2 hover:bg-turquoise-50 focus:bg-turquoise-50 focus:outline-none transition-colors"
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm">{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Quick location suggestions when empty */}
      {!inputValue && !showSuggestions && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">Popular tango venues:</p>
          <div className="flex flex-wrap gap-1">
            {commonLocations.slice(0, 3).map((loc, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(loc)}
                className="text-xs px-2 py-1 bg-turquoise-50 text-turquoise-700 rounded-full hover:bg-turquoise-100 transition-colors"
              >
                {loc.split(',')[0]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}