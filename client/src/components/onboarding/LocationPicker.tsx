import * as React from "react";
import { useState, useMemo } from "react";
import { locationService } from "@/services/locationService";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationData {
  country: string;
  state: string;
  city: string;
  countryId: number;
  stateId: number;
  cityId: number;
}

interface LocationPickerProps {
  value: LocationData;
  onChange: (location: LocationData) => void;
  className?: string;
}

export function LocationPicker({ value, onChange, className }: LocationPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Generate display value from current location data
  const displayValue = useMemo(() => {
    if (value.city && value.state && value.country) {
      return `${value.city}, ${value.state}, ${value.country}`;
    } else if (value.state && value.country) {
      return `${value.state}, ${value.country}`;
    } else if (value.country) {
      return value.country;
    }
    return "";
  }, [value.city, value.state, value.country]);

  // Search all locations and format as "city, state, country"
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    
    try {
      const results: Array<{
        id: string;
        display: string;
        city: string;
        state: string;
        country: string;
        countryId: number;
        stateId: number;
        cityId: number;
      }> = [];

      // Search cities first (most specific)
      const cities = locationService.searchCities(searchQuery);
      cities.forEach(city => {
        const state = locationService.getStateById(city.state_id);
        const country = locationService.getCountryById(city.country_id);
        if (state && country) {
          results.push({
            id: `city-${city.id}`,
            display: `${city.name}, ${state.name}, ${country.name}`,
            city: city.name,
            state: state.name,
            country: country.name,
            countryId: country.id,
            stateId: state.id,
            cityId: city.id,
          });
        }
      });

      // Search states (if not too many city results)
      if (results.length < 20) {
        const states = locationService.searchStates(searchQuery);
        states.forEach(state => {
          const country = locationService.getCountryById(state.country_id);
          if (country) {
            results.push({
              id: `state-${state.id}`,
              display: `${state.name}, ${country.name}`,
              city: "",
              state: state.name,
              country: country.name,
              countryId: country.id,
              stateId: state.id,
              cityId: 0,
            });
          }
        });
      }

      // Search countries (if not too many results)
      if (results.length < 15) {
        const countries = locationService.searchCountries(searchQuery);
        countries.forEach(country => {
          results.push({
            id: `country-${country.id}`,
            display: country.name,
            city: "",
            state: "",
            country: country.name,
            countryId: country.id,
            stateId: 0,
            cityId: 0,
          });
        });
      }

      return results.slice(0, 50); // Limit results for performance
    } catch (err) {
      console.error('Error searching locations:', err);
      setError('Failed to search locations');
      return [];
    }
  }, [searchQuery]);

  const handleLocationSelect = (result: any) => {
    onChange({
      country: result.country,
      state: result.state,
      city: result.city,
      countryId: result.countryId,
      stateId: result.stateId,
      cityId: result.cityId,
    });
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <Card className={className}>
      <CardContent className="p-6 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <Label htmlFor="location" className="font-medium">Location</Label>
          </div>
          
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between h-auto min-h-[40px] text-left"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <span className={displayValue ? "text-foreground" : "text-muted-foreground"}>
                    {displayValue || "Search for your location..."}
                  </span>
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Type to search locations..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>
                    {searchQuery.length < 2 
                      ? "Type at least 2 characters to search..." 
                      : "No locations found."
                    }
                  </CommandEmpty>
                  {searchResults.length > 0 && (
                    <CommandGroup heading="Locations">
                      {searchResults.map((result) => (
                        <CommandItem
                          key={result.id}
                          value={result.display}
                          onSelect={() => handleLocationSelect(result)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2 w-full">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="flex-1">{result.display}</span>
                            {displayValue === result.display && (
                              <Check className="w-4 h-4" />
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {displayValue && (
            <div className="text-sm text-gray-600 mt-2">
              <p>Selected: <span className="font-medium">{displayValue}</span></p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}