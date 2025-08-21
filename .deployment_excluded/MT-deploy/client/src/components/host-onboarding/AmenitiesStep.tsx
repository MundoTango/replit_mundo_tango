import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Wifi, Tv, Car, Waves, AirVent, Utensils, Coffee, Dumbbell, 
  Shirt, Wind, Snowflake, Lock, AlertTriangle, Cigarette,
  Baby, Users, Dog, Accessibility, TreePine, Building,
  Laptop, Bath, BedDouble, Sofa, Microwave, Refrigerator
} from 'lucide-react';

const AMENITY_CATEGORIES = [
  {
    category: 'Basic',
    amenities: [
      { id: 'wifi', label: 'Wifi', icon: Wifi },
      { id: 'tv', label: 'TV', icon: Tv },
      { id: 'air_conditioning', label: 'Air conditioning', icon: AirVent },
      { id: 'heating', label: 'Heating', icon: Snowflake },
      { id: 'washer', label: 'Washer', icon: Shirt },
      { id: 'dryer', label: 'Dryer', icon: Wind },
    ],
  },
  {
    category: 'Kitchen',
    amenities: [
      { id: 'kitchen', label: 'Kitchen', icon: Utensils },
      { id: 'refrigerator', label: 'Refrigerator', icon: Refrigerator },
      { id: 'microwave', label: 'Microwave', icon: Microwave },
      { id: 'coffee_maker', label: 'Coffee maker', icon: Coffee },
      { id: 'dishwasher', label: 'Dishwasher', icon: Utensils },
      { id: 'cooking_basics', label: 'Cooking basics', icon: Utensils },
    ],
  },
  {
    category: 'Bathroom',
    amenities: [
      { id: 'hair_dryer', label: 'Hair dryer', icon: Wind },
      { id: 'shampoo', label: 'Shampoo', icon: Bath },
      { id: 'hot_water', label: 'Hot water', icon: Bath },
      { id: 'bath_tub', label: 'Bathtub', icon: Bath },
    ],
  },
  {
    category: 'Bedroom',
    amenities: [
      { id: 'bed_linens', label: 'Bed linens', icon: BedDouble },
      { id: 'extra_pillows', label: 'Extra pillows and blankets', icon: BedDouble },
      { id: 'hangers', label: 'Hangers', icon: Shirt },
      { id: 'iron', label: 'Iron', icon: Shirt },
    ],
  },
  {
    category: 'Safety',
    amenities: [
      { id: 'smoke_alarm', label: 'Smoke alarm', icon: AlertTriangle },
      { id: 'carbon_monoxide_alarm', label: 'Carbon monoxide alarm', icon: AlertTriangle },
      { id: 'first_aid_kit', label: 'First aid kit', icon: AlertTriangle },
      { id: 'fire_extinguisher', label: 'Fire extinguisher', icon: AlertTriangle },
      { id: 'lock_on_bedroom_door', label: 'Lock on bedroom door', icon: Lock },
    ],
  },
  {
    category: 'Location features',
    amenities: [
      { id: 'free_parking', label: 'Free parking on premises', icon: Car },
      { id: 'paid_parking', label: 'Paid parking on premises', icon: Car },
      { id: 'pool', label: 'Pool', icon: Waves },
      { id: 'gym', label: 'Gym', icon: Dumbbell },
      { id: 'elevator', label: 'Elevator', icon: Building },
      { id: 'garden', label: 'Garden or backyard', icon: TreePine },
    ],
  },
  {
    category: 'Work friendly',
    amenities: [
      { id: 'dedicated_workspace', label: 'Dedicated workspace', icon: Laptop },
      { id: 'laptop_friendly', label: 'Laptop friendly workspace', icon: Laptop },
    ],
  },
  {
    category: 'Family friendly',
    amenities: [
      { id: 'children_welcome', label: 'Children welcome', icon: Baby },
      { id: 'crib', label: 'Crib', icon: Baby },
      { id: 'high_chair', label: 'High chair', icon: Baby },
      { id: 'toys', label: 'Children\'s toys', icon: Baby },
    ],
  },
];

interface AmenitiesStepProps {
  data: any;
  updateData: (data: any) => void;
}

export default function AmenitiesStep({ data, updateData }: AmenitiesStepProps) {
  const toggleAmenity = (amenityId: string) => {
    const currentAmenities = data.amenities || [];
    const newAmenities = currentAmenities.includes(amenityId)
      ? currentAmenities.filter((id: string) => id !== amenityId)
      : [...currentAmenities, amenityId];
    
    updateData({ amenities: newAmenities });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">What amenities do you offer?</h2>
        <p className="text-gray-600">These are the features guests look for most</p>
      </div>

      <div className="space-y-8">
        {AMENITY_CATEGORIES.map((category) => (
          <div key={category.category}>
            <h3 className="font-medium text-lg mb-4">{category.category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {category.amenities.map((amenity) => {
                const Icon = amenity.icon;
                const isChecked = data.amenities?.includes(amenity.id) || false;
                
                return (
                  <label
                    key={amenity.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isChecked ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => toggleAmenity(amenity.id)}
                    />
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium">{amenity.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Additional rules */}
      <div className="border-t pt-6">
        <h3 className="font-medium text-lg mb-4">Additional rules</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <Checkbox
              checked={data.smokingAllowed || false}
              onCheckedChange={(checked) => updateData({ smokingAllowed: checked })}
            />
            <Cigarette className="w-5 h-5 text-gray-600" />
            <span className="text-sm">Smoking allowed</span>
          </label>
          <label className="flex items-center gap-3">
            <Checkbox
              checked={data.petsAllowed || false}
              onCheckedChange={(checked) => updateData({ petsAllowed: checked })}
            />
            <Dog className="w-5 h-5 text-gray-600" />
            <span className="text-sm">Pets allowed</span>
          </label>
          <label className="flex items-center gap-3">
            <Checkbox
              checked={data.eventsAllowed || false}
              onCheckedChange={(checked) => updateData({ eventsAllowed: checked })}
            />
            <Users className="w-5 h-5 text-gray-600" />
            <span className="text-sm">Events allowed</span>
          </label>
          <label className="flex items-center gap-3">
            <Checkbox
              checked={data.wheelchairAccessible || false}
              onCheckedChange={(checked) => updateData({ wheelchairAccessible: checked })}
            />
            <Accessibility className="w-5 h-5 text-gray-600" />
            <span className="text-sm">Wheelchair accessible</span>
          </label>
        </div>
      </div>
    </div>
  );
}