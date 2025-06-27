import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import locationsData from "@/data/locations.json";

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

  // Client-side search using complete location database
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    
    try {
      const lowerQuery = searchQuery.toLowerCase();
      const results = (locationsData as any[])
        .filter(item => 
          item.name.toLowerCase().includes(lowerQuery) ||
          item.display.toLowerCase().includes(lowerQuery)
        )
        .sort((a, b) => {
          // Prioritize exact matches at the beginning
          const aStartsWith = a.name.toLowerCase().startsWith(lowerQuery);
          const bStartsWith = b.name.toLowerCase().startsWith(lowerQuery);
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          
          // Then prioritize cities over states over countries
          const typeOrder = { city: 0, state: 1, country: 2 };
          const aOrder = typeOrder[a.type as keyof typeof typeOrder] || 3;
          const bOrder = typeOrder[b.type as keyof typeof typeOrder] || 3;
          if (aOrder !== bOrder) return aOrder - bOrder;
          
          return a.name.localeCompare(b.name);
        })
        .slice(0, 50)
        .map(item => ({
          id: item.id,
          display: item.displayWithFlag || item.display,
          city: item.type === 'city' ? item.name : '',
          state: item.state,
          country: item.country,
          countryId: 0, // Not needed for display
          stateId: 0,   // Not needed for display
          cityId: 0,    // Not needed for display
          type: item.type,
          flag: item.flag || '🌍'
        }));

      return results;
    } catch (error) {
      console.error("Error searching locations:", error);
      setError("Failed to search locations. Please try again.");
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