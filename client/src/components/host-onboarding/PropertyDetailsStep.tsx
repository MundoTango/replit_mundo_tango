import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Minus, Plus } from 'lucide-react';

interface PropertyDetailsStepProps {
  data: any;
  updateData: (data: any) => void;
}

export default function PropertyDetailsStep({ data, updateData }: PropertyDetailsStepProps) {
  const handleNumberChange = (field: string, value: number, min: number = 0, max: number = 99) => {
    const newValue = Math.max(min, Math.min(max, value));
    updateData({ [field]: newValue });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Tell us about your place</h2>
        <p className="text-gray-600">Share some basic info about your property</p>
      </div>

      {/* Title and Description */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Give your place a title</Label>
          <Input
            id="title"
            placeholder="Cozy downtown apartment with city views"
            value={data.title || ''}
            onChange={(e) => updateData({ title: e.target.value })}
            className="mt-1"
            maxLength={255}
          />
          <p className="text-xs text-gray-500 mt-1">{data.title?.length || 0}/255 characters</p>
        </div>

        <div>
          <Label htmlFor="description">Describe your place</Label>
          <Textarea
            id="description"
            placeholder="Tell guests what makes your place special..."
            value={data.description || ''}
            onChange={(e) => updateData({ description: e.target.value })}
            className="mt-1 min-h-[120px]"
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 mt-1">{data.description?.length || 0}/1000 characters</p>
        </div>
      </div>

      {/* Guest capacity */}
      <div>
        <Label className="text-lg font-medium mb-4 block">How many guests can you accommodate?</Label>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium">Maximum guests</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleNumberChange('maxGuests', (data.maxGuests || 1) - 1, 1, 20)}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-medium">{data.maxGuests || 1}</span>
              <button
                type="button"
                onClick={() => handleNumberChange('maxGuests', (data.maxGuests || 1) + 1, 1, 20)}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms and beds */}
      <div>
        <Label className="text-lg font-medium mb-4 block">Rooms and beds</Label>
        <div className="space-y-4">
          {[
            { field: 'bedrooms', label: 'Bedrooms', min: 0, max: 50 },
            { field: 'beds', label: 'Beds', min: 1, max: 50 },
          ].map((item) => (
            <div key={item.field} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">{item.label}</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleNumberChange(item.field, (data[item.field] || item.min) - 1, item.min, item.max)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{data[item.field] || item.min}</span>
                  <button
                    type="button"
                    onClick={() => handleNumberChange(item.field, (data[item.field] || item.min) + 1, item.min, item.max)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Bathrooms with decimal support */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Bathrooms</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const current = data.bathrooms || 1;
                    const newValue = Math.max(0.5, current - 0.5);
                    updateData({ bathrooms: newValue });
                  }}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{data.bathrooms || 1}</span>
                <button
                  type="button"
                  onClick={() => {
                    const current = data.bathrooms || 1;
                    const newValue = Math.min(10, current + 0.5);
                    updateData({ bathrooms: newValue });
                  }}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}