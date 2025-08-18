import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface LocationData {
  country: string;
  state?: string;
  city?: string;
  countryId?: number;
  stateId?: number;
  cityId?: number;
}

interface SimpleLocationPickerProps {
  selectedLocation: LocationData;
  onLocationSelect: (location: LocationData) => void;
  className?: string;
}

export function SimpleLocationPicker({ selectedLocation, onLocationSelect }: SimpleLocationPickerProps) {
  const handleChange = (field: keyof LocationData, value: string) => {
    onLocationSelect({
      ...selectedLocation,
      [field]: value
    });
  };

  return (
    <Card className="glassmorphic-card">
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center gap-2 mb-4 text-turquoise-600">
          <MapPin className="w-5 h-5" />
          <span className="font-medium">Enter your location</span>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={selectedLocation.city || ''}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="e.g., Buenos Aires"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="state">State/Province (optional)</Label>
            <Input
              id="state"
              value={selectedLocation.state || ''}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder="e.g., Buenos Aires"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={selectedLocation.country || ''}
              onChange={(e) => handleChange('country', e.target.value)}
              placeholder="e.g., Argentina"
              className="mt-1"
            />
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mt-2">
          This helps other dancers find you and connect with people in your area.
        </p>
      </CardContent>
    </Card>
  );
}