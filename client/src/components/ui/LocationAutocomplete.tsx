import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';

interface LocationSuggestion {
  id: string;
  display: string;
  city: string;
  state: string;
  country: string;
  type: 'city' | 'state' | 'country';
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (location: string, details?: LocationSuggestion) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// City data with proper spelling/diacritics
const CITY_DATA = [
  { name: "Buenos Aires", country: "Argentina", state: "", variations: ["buenos aires", "BA", "baires"] },
  { name: "Kolasin", country: "Montenegro", state: "", variations: ["kolasin", "koläsin", "kolašin"] },
  { name: "Belgrade", country: "Serbia", state: "", variations: ["beograd", "belgrade"] },
  { name: "New York", country: "United States", state: "New York", variations: ["NYC", "new york city", "manhattan"] },
  { name: "Paris", country: "France", state: "", variations: ["paris"] },
  { name: "London", country: "United Kingdom", state: "", variations: ["london"] },
  { name: "Berlin", country: "Germany", state: "", variations: ["berlin"] },
  { name: "Madrid", country: "Spain", state: "", variations: ["madrid"] },
  { name: "Barcelona", country: "Spain", state: "", variations: ["barcelona", "bcn"] },
  { name: "Istanbul", country: "Turkey", state: "", variations: ["istanbul", "constantinople"] },
  { name: "São Paulo", country: "Brazil", state: "São Paulo", variations: ["sao paulo", "sp"] },
  { name: "Rio de Janeiro", country: "Brazil", state: "Rio de Janeiro", variations: ["rio", "rio de janeiro"] },
  { name: "Mexico City", country: "Mexico", state: "", variations: ["cdmx", "ciudad de mexico"] },
  { name: "Tokyo", country: "Japan", state: "", variations: ["tokyo", "東京"] },
  { name: "Seoul", country: "South Korea", state: "", variations: ["seoul", "서울"] },
  { name: "Montevideo", country: "Uruguay", state: "", variations: ["montevideo", "mvd"] },
  { name: "Medellín", country: "Colombia", state: "", variations: ["medellin", "medellín"] },
  { name: "Bogotá", country: "Colombia", state: "", variations: ["bogota", "bogotá"] },
  { name: "Lima", country: "Peru", state: "", variations: ["lima"] }
];

export function LocationAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Enter city name...", 
  className = "",
  disabled = false 
}: LocationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length >= 2) {
      setIsLoading(true);
      const filtered = CITY_DATA
        .filter(city => {
          const searchTerm = value.toLowerCase();
          return city.name.toLowerCase().includes(searchTerm) ||
                 city.variations.some(variation => variation.toLowerCase().includes(searchTerm));
        })
        .slice(0, 8)
        .map(city => ({
          id: `${city.name}-${city.country}`,
          display: `${city.name}${city.state ? `, ${city.state}` : ''}, ${city.country}`,
          city: city.name,
          state: city.state,
          country: city.country,
          type: 'city' as const
        }));
      
      setSuggestions(filtered);
      setIsOpen(filtered.length > 0);
      setIsLoading(false);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    onChange(suggestion.display, suggestion);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-turquoise-500" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`pl-10 pr-10 glassmorphic-input ${className}`}
          disabled={disabled}
          onFocus={() => value.length >= 2 && suggestions.length > 0 && setIsOpen(true)}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-3 h-4 w-4 text-turquoise-500 animate-spin" />
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white/95 backdrop-blur-xl border border-turquoise-200/50 rounded-xl shadow-xl max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-turquoise-50/80 cursor-pointer transition-colors"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <MapPin className="h-4 w-4 text-turquoise-500 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{suggestion.city}</div>
                <div className="text-sm text-gray-600">
                  {suggestion.state && `${suggestion.state}, `}{suggestion.country}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}