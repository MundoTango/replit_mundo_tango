import React, { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Globe, Plus, Search } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface CityGroup {
  id: number;
  name: string;
  slug: string;
  city?: string;
  country?: string;
  memberCount?: number;
  type: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

interface CityGroupAutocompleteProps {
  value?: CityGroup | null;
  onSelect: (cityGroup: CityGroup | null) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  allowCreate?: boolean;
  onCreateNew?: (cityName: string) => void;
}

export default function CityGroupAutocomplete({
  value,
  onSelect,
  placeholder = "Search for a city...",
  label = "City",
  required = false,
  allowCreate = true,
  onCreateNew
}: CityGroupAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [inputValue, setInputValue] = useState(value?.name || '');
  
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Update input when value changes externally
  useEffect(() => {
    setInputValue(value?.name || '');
  }, [value]);

  // Fetch all groups and filter city groups
  const { data: cityGroups, isLoading } = useQuery({
    queryKey: ['/api/groups', { search: debouncedSearch }],
    queryFn: async () => {
      const response = await fetch('/api/groups', {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch groups');
      const result = await response.json();
      
      // Filter for city groups and apply search
      const cities = (result.data || []).filter((group: CityGroup) => 
        group.type === 'city' && 
        (!debouncedSearch || group.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
      );
      
      // Sort by member count
      return cities.sort((a: CityGroup, b: CityGroup) => 
        (b.memberCount || 0) - (a.memberCount || 0)
      );
    },
    enabled: isOpen
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSearchTerm(value);
    setIsOpen(true);
    
    // Clear selection if input is cleared
    if (!value) {
      onSelect(null);
    }
  };

  const handleSelectCity = (cityGroup: CityGroup) => {
    setInputValue(cityGroup.name);
    onSelect(cityGroup);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCreateNew = () => {
    setIsOpen(false);
    if (onCreateNew) {
      onCreateNew(inputValue);
    }
  };

  // Extract city and country from group name (e.g., "Buenos Aires, Argentina")
  const parseCityName = (name: string) => {
    const parts = name.split(',').map(p => p.trim());
    return {
      city: parts[0] || name,
      country: parts[1] || ''
    };
  };

  return (
    <div className="relative">
      {label && (
        <Label htmlFor="city-search" className="mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          id="city-search"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className="pl-10"
          required={required}
        />
      </div>

      {/* Selected city display */}
      {value && (
        <div className="mt-2 p-3 bg-turquoise-50 dark:bg-turquoise-900/20 rounded-lg border border-turquoise-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-turquoise-600" />
                <span className="font-medium text-gray-900 dark:text-gray-100">{value.name}</span>
              </div>
              {value.memberCount !== undefined && (
                <div className="flex items-center gap-1 mt-1 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="w-3 h-3" />
                  <span>{value.memberCount} members</span>
                </div>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSelect(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <Card className="absolute z-50 w-full mt-1 max-h-80 overflow-auto shadow-lg">
          {isLoading && (
            <div className="p-4 text-center text-gray-500">
              Loading cities...
            </div>
          )}

          {!isLoading && cityGroups && cityGroups.length > 0 && (
            <div className="py-1">
              {cityGroups.map((cityGroup: CityGroup) => {
                const { city, country } = parseCityName(cityGroup.name);
                return (
                  <button
                    key={cityGroup.id}
                    onClick={() => handleSelectCity(cityGroup)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-turquoise-500 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {city}
                          </div>
                          {country && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {country}
                            </div>
                          )}
                        </div>
                      </div>
                      {cityGroup.memberCount !== undefined && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Users className="w-3 h-3" />
                          <span>{cityGroup.memberCount}</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {!isLoading && debouncedSearch && (!cityGroups || cityGroups.length === 0) && (
            <div className="p-4">
              <p className="text-center text-gray-500 mb-3">
                No cities found matching "{debouncedSearch}"
              </p>
              {allowCreate && (
                <Button
                  onClick={handleCreateNew}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New City
                </Button>
              )}
            </div>
          )}

          {!isLoading && !debouncedSearch && cityGroups && cityGroups.length > 0 && (
            <div className="p-4 text-center text-gray-500">
              Showing all cities
            </div>
          )}
        </Card>
      )}
    </div>
  );
}