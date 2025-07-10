import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LocationStepProps {
  data: any;
  updateData: (data: any) => void;
}

export default function LocationStep({ data, updateData }: LocationStepProps) {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [mapUrl, setMapUrl] = useState('');

  // Generate static map URL when coordinates are available
  useEffect(() => {
    if (data.latitude && data.longitude) {
      const lat = data.latitude;
      const lng = data.longitude;
      // Using OpenStreetMap static map
      setMapUrl(`https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lng}`);
    }
  }, [data.latitude, data.longitude]);

  const geocodeAddress = async () => {
    if (!data.address || !data.city || !data.country) {
      toast({
        title: 'Missing information',
        description: 'Please fill in address, city, and country before verifying location.',
        variant: 'destructive',
      });
      return;
    }

    setIsGeocoding(true);
    try {
      const fullAddress = `${data.address}, ${data.city}, ${data.state || ''}, ${data.country}`.trim();
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`);
      const results = await response.json();

      if (results && results.length > 0) {
        const { lat, lon } = results[0];
        updateData({
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
        });
        toast({
          title: 'Location verified',
          description: 'We found your property on the map!',
        });
      } else {
        toast({
          title: 'Location not found',
          description: 'Please check your address and try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify location. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Where's your place located?</h2>
        <p className="text-gray-600">Your address is only shared with guests after they've made a reservation</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="address">Street address</Label>
          <Input
            id="address"
            placeholder="123 Main Street"
            value={data.address || ''}
            onChange={(e) => updateData({ address: e.target.value })}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="San Francisco"
              value={data.city || ''}
              onChange={(e) => updateData({ city: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="state">State/Province</Label>
            <Input
              id="state"
              placeholder="California"
              value={data.state || ''}
              onChange={(e) => updateData({ state: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              placeholder="United States"
              value={data.country || ''}
              onChange={(e) => updateData({ country: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="zipCode">ZIP/Postal code</Label>
            <Input
              id="zipCode"
              placeholder="94105"
              value={data.zipCode || ''}
              onChange={(e) => updateData({ zipCode: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Verify location button */}
      <div className="flex justify-center">
        <Button
          type="button"
          onClick={geocodeAddress}
          disabled={isGeocoding}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isGeocoding ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              Verifying location...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Verify location on map
            </>
          )}
        </Button>
      </div>

      {/* Map preview */}
      {data.latitude && data.longitude && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-100 p-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">Property location (approximate)</span>
          </div>
          <div className="relative h-64">
            <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              aria-hidden="false"
              tabIndex={0}
            />
          </div>
        </div>
      )}

      {/* Privacy notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-1">Your privacy is important</h4>
        <p className="text-sm text-blue-800">
          We'll only show your exact address to guests after they book. Before booking, 
          they'll see an approximate location.
        </p>
      </div>
    </div>
  );
}