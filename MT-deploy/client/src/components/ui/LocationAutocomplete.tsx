import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2, Coffee, UtensilsCrossed, Wine, Music, ShoppingBag } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface LocationSuggestion {
  id: string;
  display: string;
  city: string;
  state: string;
  country: string;
  type: 'city' | 'state' | 'country' | 'business';
  businessType?: string;
  address?: string;
  rating?: number;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (location: string, details?: LocationSuggestion) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  includeBusinesses?: boolean;
  businessTypes?: string[];
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
  placeholder = "Enter location or business...", 
  className = "",
  disabled = false,
  includeBusinesses = false,
  businessTypes = ['restaurant', 'bar', 'cafe', 'club', 'store']
}: LocationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length >= 2) {
      setIsLoading(true);
      
      const searchLocations = async () => {
        try {
          // Search cities first
          const cityResults = CITY_DATA
            .filter(city => {
              const searchTerm = value.toLowerCase();
              return city.name.toLowerCase().includes(searchTerm) ||
                     city.variations.some(variation => variation.toLowerCase().includes(searchTerm));
            })
            .slice(0, 4)
            .map(city => ({
              id: `${city.name}-${city.country}`,
              display: `${city.name}${city.state ? `, ${city.state}` : ''}, ${city.country}`,
              city: city.name,
              state: city.state,
              country: city.country,
              type: 'city' as const
            }));

          let businessResults: LocationSuggestion[] = [];
          
          // Search businesses if enabled
          if (includeBusinesses) {
            try {
              console.log(`🔍 Frontend searching for businesses: "${value}"`);
              
              // Use fetch directly instead of apiRequest to debug
              const url = `/api/search/businesses?q=${encodeURIComponent(value)}&types=${businessTypes.join(',')}&limit=4`;
              console.log('🔗 Frontend making request to:', url);
              
              const response = await fetch(url, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include'
              });
              
              console.log('🔍 Frontend raw response status:', response.status);
              
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
              }
              
              const data = await response.json();
              console.log('🔍 Frontend business search response data:', data);
              
              // Handle both direct array and nested object responses
              const businessData = Array.isArray(data) ? data : data?.data || [];
              
              if (businessData && businessData.length > 0) {
                businessResults = businessData.map((business: any) => ({
                  id: `business-${business.id}`,
                  display: business.name || business.display,
                  city: business.city,
                  state: business.state,
                  country: business.country,
                  type: 'business' as const,
                  businessType: business.businessType || business.type,
                  address: business.address,
                  rating: business.rating
                }));
                console.log(`🎯 Frontend mapped ${businessResults.length} businesses:`, businessResults);
                console.log(`🎯 First business example:`, businessResults[0]);
              } else {
                console.log('⚠️ No business data found in response');
              }
            } catch (error) {
              console.error('🚨 Frontend business search error:', error);
              console.error('🚨 Error details:', error instanceof Error ? error.message : String(error));
              console.log('Business search unavailable, showing cities only');
            }
          }

          const allResults = [...businessResults, ...cityResults];
          console.log(`🎯 Final suggestions being set:`, allResults);
          console.log(`🎯 Business results count: ${businessResults.length}, City results count: ${cityResults.length}`);
          setSuggestions(allResults);
        } catch (error) {
          console.error('Search error:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      };

      searchLocations();
      setIsOpen(true);
      console.log(`🔍 Set dropdown open for search: "${value}"`);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      console.log(`🔍 Cleared suggestions for short search: "${value}"`);
    }
  }, [value, includeBusinesses, businessTypes]);

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
    // Location selected
    
    // ESA LIFE CEO 56x21 - Update value immediately and ensure it propagates
    const displayValue = suggestion.type === 'business' 
      ? suggestion.display 
      : `${suggestion.city}, ${suggestion.country}`;
    
    // Update the parent component with full suggestion details
    onChange(displayValue, suggestion);
    
    // Force immediate state updates
    setSuggestions([]);
    setIsOpen(false);
    
    // Use requestAnimationFrame to ensure DOM updates complete
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.blur();
      }
    });
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
          onFocus={() => {
            if (value.length >= 2 && suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onBlur={(e) => {
            // ESA LIFE CEO 56x21 - Delay blur to allow click events to complete
            const relatedTarget = e.relatedTarget as HTMLElement;
            if (!relatedTarget || !dropdownRef.current?.contains(relatedTarget)) {
              setTimeout(() => {
                setIsOpen(false);
              }, 200); // Give enough time for click to register
            }
          }}
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
            <button
              key={suggestion.id}
              type="button"
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-turquoise-50/80 cursor-pointer transition-colors text-left"
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent blur before click
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSuggestionClick(suggestion);
              }}
            >
              {suggestion.type === 'business' ? (
                suggestion.businessType === 'restaurant' ? <UtensilsCrossed className="h-4 w-4 text-turquoise-500 flex-shrink-0" /> :
                suggestion.businessType === 'bar' ? <Wine className="h-4 w-4 text-turquoise-500 flex-shrink-0" /> :
                suggestion.businessType === 'cafe' ? <Coffee className="h-4 w-4 text-turquoise-500 flex-shrink-0" /> :
                suggestion.businessType === 'club' ? <Music className="h-4 w-4 text-turquoise-500 flex-shrink-0" /> :
                <ShoppingBag className="h-4 w-4 text-turquoise-500 flex-shrink-0" />
              ) : (
                <MapPin className="h-4 w-4 text-turquoise-500 flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {suggestion.type === 'business' ? suggestion.display : suggestion.city}
                </div>
                <div className="text-sm text-gray-600">
                  {suggestion.type === 'business' ? (
                    <>
                      {suggestion.address && <div>{suggestion.address}</div>}
                      {suggestion.rating && <div>⭐ {suggestion.rating}/5</div>}
                    </>
                  ) : (
                    <>{suggestion.state && `${suggestion.state}, `}{suggestion.country}</>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}