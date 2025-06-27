import * as React from "react";
import { useState, useEffect } from "react";
import { Country, State, City } from "country-state-city";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface LocationData {
  country: string;
  state: string;
  city: string;
  countryCode: string;
  stateCode: string;
}

interface LocationPickerProps {
  value: LocationData;
  onChange: (location: LocationData) => void;
  className?: string;
}

export function LocationPicker({ value, onChange, className }: LocationPickerProps) {
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const allCountries = Country.getAllCountries();
      setCountries(allCountries || []);
      setError(null);
    } catch (err) {
      console.error('Error loading countries:', err);
      setError('Failed to load countries');
      setCountries([]);
    }
  }, []);

  useEffect(() => {
    try {
      if (value.countryCode) {
        const allStates = State.getStatesOfCountry(value.countryCode);
        setStates(allStates || []);
      } else {
        setStates([]);
      }
    } catch (err) {
      console.error('Error loading states:', err);
      setStates([]);
    }
  }, [value.countryCode]);

  useEffect(() => {
    try {
      if (value.countryCode && value.stateCode) {
        const allCities = City.getCitiesOfState(value.countryCode, value.stateCode);
        setCities(allCities || []);
      } else {
        setCities([]);
      }
    } catch (err) {
      console.error('Error loading cities:', err);
      setCities([]);
    }
  }, [value.countryCode, value.stateCode]);

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.isoCode === countryCode);
    onChange({
      country: country?.name || '',
      state: '',
      city: '',
      countryCode,
      stateCode: '',
    });
  };

  const handleStateChange = (stateCode: string) => {
    const state = states.find(s => s.isoCode === stateCode);
    onChange({
      ...value,
      state: state?.name || '',
      city: '',
      stateCode,
    });
  };

  const handleCityChange = (cityName: string) => {
    onChange({
      ...value,
      city: cityName,
    });
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
          <Label htmlFor="country">Country</Label>
          <Select value={value.countryCode} onValueChange={handleCountryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.isoCode} value={country.isoCode}>
                  <div className="flex items-center gap-2">
                    <span>{country.flag}</span>
                    <span>{country.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {value.countryCode && (
          <div className="space-y-2">
            <Label htmlFor="state">State/Province</Label>
            <Select value={value.stateCode} onValueChange={handleStateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select your state/province" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state.isoCode} value={state.isoCode}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {value.stateCode && (
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Select value={value.city} onValueChange={handleCityChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select your city" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {cities.map((city) => (
                  <SelectItem key={city.name} value={city.name}>
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