import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import { Home, Building2, Hotel, Warehouse, TreePine, Ship } from 'lucide-react';

const PROPERTY_TYPES = [
  { id: 'apartment', label: 'Apartment', icon: Building2, description: 'A home in a multi-unit building' },
  { id: 'house', label: 'House', icon: Home, description: 'A standalone property' },
  { id: 'hotel', label: 'Hotel/Hostel', icon: Hotel, description: 'Commercial hospitality property' },
  { id: 'loft', label: 'Loft', icon: Warehouse, description: 'Open-plan living space' },
  { id: 'cabin', label: 'Cabin', icon: TreePine, description: 'Cozy retreat in nature' },
  { id: 'boat', label: 'Boat', icon: Ship, description: 'Live aboard vessel' },
];

const ROOM_TYPES = [
  { 
    id: 'entire_place', 
    label: 'Entire place', 
    description: 'Guests have the whole place to themselves' 
  },
  { 
    id: 'private_room', 
    label: 'Private room', 
    description: 'Guests have their own room but share common areas' 
  },
  { 
    id: 'shared_room', 
    label: 'Shared room', 
    description: 'Guests share a room with others' 
  },
];

interface PropertyTypeStepProps {
  data: any;
  updateData: (data: any) => void;
}

export default function PropertyTypeStep({ data, updateData }: PropertyTypeStepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">What type of property do you have?</h2>
        <p className="text-gray-600">Choose the option that best describes your place</p>
      </div>

      <div>
        <Label className="text-lg font-medium mb-4 block">Property type</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {PROPERTY_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = data.propertyType === type.id;
            
            return (
              <Card
                key={type.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
                }`}
                onClick={() => updateData({ propertyType: type.id })}
              >
                <div className="flex flex-col items-center text-center">
                  <Icon className={`w-8 h-8 mb-2 ${isSelected ? 'text-pink-500' : 'text-gray-400'}`} />
                  <h3 className="font-medium">{type.label}</h3>
                  <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <Label className="text-lg font-medium mb-4 block">What will guests have?</Label>
        <RadioGroup value={data.roomType} onValueChange={(value) => updateData({ roomType: value })}>
          <div className="space-y-3">
            {ROOM_TYPES.map((type) => (
              <Card
                key={type.id}
                className={`p-4 cursor-pointer transition-all ${
                  data.roomType === type.id ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
                }`}
              >
                <label htmlFor={type.id} className="flex items-start cursor-pointer">
                  <RadioGroupItem value={type.id} id={type.id} className="mt-1" />
                  <div className="ml-3">
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-gray-500">{type.description}</div>
                  </div>
                </label>
              </Card>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* External listing links */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Already listed elsewhere?</h3>
        <p className="text-sm text-gray-600 mb-4">
          If you have this property listed on other platforms, you can import details
        </p>
        <div className="space-y-3">
          <div>
            <Label htmlFor="airbnb-url">Airbnb listing URL (optional)</Label>
            <input
              id="airbnb-url"
              type="url"
              className="mt-1 w-full px-3 py-2 border rounded-md"
              placeholder="https://www.airbnb.com/rooms/..."
              value={data.airbnbUrl || ''}
              onChange={(e) => updateData({ airbnbUrl: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="vrbo-url">VRBO listing URL (optional)</Label>
            <input
              id="vrbo-url"
              type="url"
              className="mt-1 w-full px-3 py-2 border rounded-md"
              placeholder="https://www.vrbo.com/..."
              value={data.vrboUrl || ''}
              onChange={(e) => updateData({ vrboUrl: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}