import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Select } from '@/components/ui/select';
import { Info, Calendar as CalendarIcon, Clock, Zap } from 'lucide-react';
import { addMonths, startOfToday } from 'date-fns';

interface AvailabilityStepProps {
  data: any;
  updateData: (data: any) => void;
}

export default function AvailabilityStep({ data, updateData }: AvailabilityStepProps) {
  const [selectedDates, setSelectedDates] = useState<Date[]>(data.availableDates || []);
  const today = startOfToday();
  const threeMonthsFromNow = addMonths(today, 3);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    const dateExists = selectedDates.some(d => d.toDateString() === date.toDateString());
    let newDates;
    
    if (dateExists) {
      newDates = selectedDates.filter(d => d.toDateString() !== date.toDateString());
    } else {
      newDates = [...selectedDates, date];
    }
    
    setSelectedDates(newDates);
    updateData({ availableDates: newDates });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">When can guests book?</h2>
        <p className="text-gray-600">
          Set your availability preferences and booking settings
        </p>
      </div>

      {/* Instant Book */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-medium">Instant Book</h3>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              Guests can book instantly without waiting for your approval
            </p>
            <p className="text-xs text-purple-600 font-medium">
              Recommended: Listings with Instant Book get up to 2x more bookings
            </p>
          </div>
          <Switch
            checked={data.instantBook || false}
            onCheckedChange={(checked) => updateData({ instantBook: checked })}
          />
        </div>
      </div>

      {/* Minimum stay */}
      <div>
        <Label htmlFor="minimumStay">Minimum nights per stay</Label>
        <select
          id="minimumStay"
          className="mt-1 w-full px-3 py-2 border rounded-md"
          value={data.minimumStay || 1}
          onChange={(e) => updateData({ minimumStay: parseInt(e.target.value) })}
        >
          {[1, 2, 3, 4, 5, 7, 14, 28].map((nights) => (
            <option key={nights} value={nights}>
              {nights} {nights === 1 ? 'night' : 'nights'}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Shorter stays mean more bookings, but also more turnovers
        </p>
      </div>

      {/* Advance notice */}
      <div>
        <Label htmlFor="advanceNotice">How much notice do you need?</Label>
        <select
          id="advanceNotice"
          className="mt-1 w-full px-3 py-2 border rounded-md"
          value={data.advanceNotice || 'same_day'}
          onChange={(e) => updateData({ advanceNotice: e.target.value })}
        >
          <option value="same_day">Same day (up to 2 hours before)</option>
          <option value="1_day">At least 1 day</option>
          <option value="2_days">At least 2 days</option>
          <option value="3_days">At least 3 days</option>
          <option value="7_days">At least 7 days</option>
        </select>
      </div>

      {/* Booking window */}
      <div>
        <Label htmlFor="bookingWindow">How far in advance can guests book?</Label>
        <select
          id="bookingWindow"
          className="mt-1 w-full px-3 py-2 border rounded-md"
          value={data.bookingWindow || '3_months'}
          onChange={(e) => updateData({ bookingWindow: e.target.value })}
        >
          <option value="3_months">3 months in advance</option>
          <option value="6_months">6 months in advance</option>
          <option value="9_months">9 months in advance</option>
          <option value="1_year">1 year in advance</option>
          <option value="all">All future dates</option>
        </select>
      </div>

      {/* Check-in/out times */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="checkInTime">Check-in time</Label>
          <select
            id="checkInTime"
            className="mt-1 w-full px-3 py-2 border rounded-md"
            value={data.checkInTime || '15:00'}
            onChange={(e) => updateData({ checkInTime: e.target.value })}
          >
            {Array.from({ length: 24 }, (_, i) => {
              const hour = i.toString().padStart(2, '0');
              return (
                <option key={hour} value={`${hour}:00`}>
                  {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <Label htmlFor="checkOutTime">Check-out time</Label>
          <select
            id="checkOutTime"
            className="mt-1 w-full px-3 py-2 border rounded-md"
            value={data.checkOutTime || '11:00'}
            onChange={(e) => updateData({ checkOutTime: e.target.value })}
          >
            {Array.from({ length: 24 }, (_, i) => {
              const hour = i.toString().padStart(2, '0');
              return (
                <option key={hour} value={`${hour}:00`}>
                  {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Calendar availability (simplified for MVP) */}
      <div>
        <h3 className="text-lg font-medium mb-2">Set your calendar availability</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select dates when your property is available. You can update this anytime.
        </p>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarIcon className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium">Availability options</span>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="availability"
                value="always"
                checked={data.availabilityType === 'always'}
                onChange={() => updateData({ availabilityType: 'always' })}
                className="text-pink-500"
              />
              <div>
                <div className="font-medium">Always available</div>
                <div className="text-xs text-gray-500">Your calendar is open for all future dates</div>
              </div>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="availability"
                value="sometimes"
                checked={data.availabilityType === 'sometimes' || !data.availabilityType}
                onChange={() => updateData({ availabilityType: 'sometimes' })}
                className="text-pink-500"
              />
              <div>
                <div className="font-medium">Sometimes available</div>
                <div className="text-xs text-gray-500">You'll manually block dates when unavailable</div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Additional settings info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Pro tip</h4>
            <p className="text-sm text-blue-800">
              You can sync your calendar with other platforms (Airbnb, VRBO) after your 
              listing is published to avoid double bookings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}