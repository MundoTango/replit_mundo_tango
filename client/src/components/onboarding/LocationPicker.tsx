import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { locationService, type Country, type State, type City } from "@/services/locationService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Globe, Building } from "lucide-react";

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
  const [countrySearch, setCountrySearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Get filtered data based on search terms and selections
  const countries = useMemo(() => {
    try {
      if (countrySearch.length > 0) {
        return locationService.searchCountries(countrySearch);
      }
      return locationService.getAllCountries().slice(0, 50); // Limit for performance
    } catch (err) {
      console.error('Error loading countries:', err);
      setError('Failed to load countries');
      return [];
    }
  }, [countrySearch]);

  const states = useMemo(() => {
    try {
      if (!value.countryId) return [];
      if (stateSearch.length > 0) {
        return locationService.searchStates(stateSearch, value.countryId);
      }
      return locationService.getStatesByCountryId(value.countryId);
    } catch (err) {
      console.error('Error loading states:', err);
      return [];
    }
  }, [value.countryId, stateSearch]);

  const cities = useMemo(() => {
    try {
      if (!value.countryId) return [];
      if (citySearch.length > 0) {
        const searchResults = value.stateId 
          ? locationService.searchCities(citySearch, value.stateId)
          : locationService.searchCities(citySearch, undefined, value.countryId);
        return searchResults;
      }
      if (value.stateId) {
        return locationService.getCitiesByStateId(value.stateId).slice(0, 100);
      }
      return locationService.getMajorCitiesByCountry(value.countryId, 50);
    } catch (err) {
      console.error('Error loading cities:', err);
      return [];
    }
  }, [value.countryId, value.stateId, citySearch]);

  const handleCountryChange = (countryId: string) => {
    const country = countries.find(c => c.id === parseInt(countryId));
    onChange({
      country: country?.name || '',
      state: '',
      city: '',
      countryId: parseInt(countryId),
      stateId: 0,
      cityId: 0,
    });
    setStateSearch('');
    setCitySearch('');
  };

  const handleStateChange = (stateId: string) => {
    const state = states.find(s => s.id === parseInt(stateId));
    onChange({
      ...value,
      state: state?.name || '',
      city: '',
      stateId: parseInt(stateId),
      cityId: 0,
    });
    setCitySearch('');
  };

  const handleCityChange = (cityId: string) => {
    const city = cities.find(c => c.id === parseInt(cityId));
    onChange({
      ...value,
      city: city?.name || '',
      cityId: parseInt(cityId),
    });
  };

  return (
    <Card className={className}>
      <CardContent className="p-6 space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Country Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <Label htmlFor="country" className="font-medium">Country</Label>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search countries..."
              value={countrySearch}
              onChange={(e) => setCountrySearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={value.countryId > 0 ? value.countryId.toString() : ""} onValueChange={handleCountryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.id.toString()}>
                  <div className="flex items-center gap-2">
                    <span>{country.emoji || "🌍"}</span>
                    <span>{country.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* State Selection */}
        {value.countryId > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-green-600" />
              <Label htmlFor="state" className="font-medium">State/Province</Label>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search states..."
                value={stateSearch}
                onChange={(e) => setStateSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={value.stateId > 0 ? value.stateId.toString() : ""} onValueChange={handleStateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select your state/province" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {states.map((state) => (
                  <SelectItem key={state.id} value={state.id.toString()}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* City Selection */}
        {value.countryId > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-600" />
              <Label htmlFor="city" className="font-medium">City</Label>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search cities..."
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={value.cityId > 0 ? value.cityId.toString() : ""} onValueChange={handleCityChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select your city" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id.toString()}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}