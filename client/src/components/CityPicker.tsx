import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';
import { debounce } from 'lodash';
import { cn } from '@/lib/utils';

interface CityPickerProps {
  value?: string;
  onChange: (location: { city: string; country: string }) => void;
  placeholder?: string;
  showBusinesses?: boolean;
  className?: string;
}

interface City {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export default function CityPicker({
  value,
  onChange,
  placeholder = "Search for a city...",
  showBusinesses = false,
  className
}: CityPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);

  const searchCities = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setCities([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1&featuretype=city`
        );
        const data = await response.json();
        
        const cityResults: City[] = data
          .filter((item: any) => item.addresstype === 'city' || item.type === 'city')
          .map((item: any) => ({
            name: item.address?.city || item.address?.town || item.display_name.split(',')[0],
            country: item.address?.country || '',
            state: item.address?.state || '',
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon)
          }))
          .filter((city: City, index: number, self: City[]) => 
            index === self.findIndex((c) => c.name === city.name && c.country === city.country)
          );

        setCities(cityResults);
      } catch (error) {
        console.error('Error searching cities:', error);
        setCities([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    searchCities(searchTerm);
  }, [searchTerm, searchCities]);

  const handleSelect = (city: City) => {
    onChange({ city: city.name, country: city.country });
    setOpen(false);
    setSearchTerm('');
  };

  const displayValue = value || '';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between text-left font-normal",
            !displayValue && "text-muted-foreground",
            className
          )}
        >
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {displayValue || placeholder}
          </span>
          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {loading && (
              <CommandEmpty>Searching cities...</CommandEmpty>
            )}
            {!loading && searchTerm.length < 2 && (
              <CommandEmpty>Type at least 2 characters to search</CommandEmpty>
            )}
            {!loading && searchTerm.length >= 2 && cities.length === 0 && (
              <CommandEmpty>No cities found</CommandEmpty>
            )}
            {!loading && cities.length > 0 && (
              <CommandGroup>
                {cities.map((city) => (
                  <CommandItem
                    key={`${city.name}-${city.country}-${city.state || ''}`}
                    value={`${city.name} ${city.country}`}
                    onSelect={() => handleSelect(city)}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{city.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {[city.state, city.country].filter(Boolean).join(', ')}
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}