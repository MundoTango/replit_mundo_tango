import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Info, DollarSign, Percent } from 'lucide-react';

interface PricingStepProps {
  data: any;
  updateData: (data: any) => void;
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'ARS', symbol: 'AR$', name: 'Argentine Peso' },
];

export default function PricingStep({ data, updateData }: PricingStepProps) {
  const selectedCurrency = CURRENCIES.find(c => c.code === (data.currency || 'USD'));

  // Calculate suggested prices based on base price
  const basePrice = parseFloat(data.basePrice) || 0;
  const suggestedWeeklyDiscount = Math.round(basePrice * 0.9); // 10% off
  const suggestedMonthlyDiscount = Math.round(basePrice * 0.8); // 20% off

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Set your price</h2>
        <p className="text-gray-600">
          You can change your price anytime. We'll help you price competitively.
        </p>
      </div>

      {/* Currency selection */}
      <div>
        <Label htmlFor="currency">Currency</Label>
        <select
          id="currency"
          className="mt-1 w-full px-3 py-2 border rounded-md"
          value={data.currency || 'USD'}
          onChange={(e) => updateData({ currency: e.target.value })}
        >
          {CURRENCIES.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.symbol} - {currency.name}
            </option>
          ))}
        </select>
      </div>

      {/* Base price */}
      <div>
        <Label htmlFor="basePrice">Base price per night</Label>
        <div className="relative mt-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500">{selectedCurrency?.symbol}</span>
          </div>
          <Input
            id="basePrice"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            className="pl-10"
            value={data.basePrice || ''}
            onChange={(e) => updateData({ basePrice: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Guest price before taxes: {selectedCurrency?.symbol}{basePrice || 0}
        </p>
      </div>

      {/* Cleaning fee */}
      <div>
        <Label htmlFor="cleaningFee">Cleaning fee (optional)</Label>
        <div className="relative mt-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500">{selectedCurrency?.symbol}</span>
          </div>
          <Input
            id="cleaningFee"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            className="pl-10"
            value={data.cleaningFee || ''}
            onChange={(e) => updateData({ cleaningFee: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          One-time fee charged to guests
        </p>
      </div>

      {/* Smart pricing suggestion */}
      {basePrice > 0 && (
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-pink-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-pink-900 mb-1">Smart pricing active</h4>
              <p className="text-sm text-pink-800">
                Based on demand in your area, your price may automatically adjust between{' '}
                {selectedCurrency?.symbol}{Math.round(basePrice * 0.8)} and{' '}
                {selectedCurrency?.symbol}{Math.round(basePrice * 1.2)} to help you earn more.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Discounts */}
      <div>
        <h3 className="text-lg font-medium mb-4">Offer discounts for longer stays</h3>
        <p className="text-sm text-gray-600 mb-4">
          Attract more bookings with weekly and monthly discounts
        </p>
        
        <div className="space-y-4">
          {/* Weekly discount */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Label>Weekly discount (7+ nights)</Label>
              <span className="text-sm text-gray-500">
                Suggested: {selectedCurrency?.symbol}{suggestedWeeklyDiscount}/night
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="10"
                  value={data.weeklyDiscount || ''}
                  onChange={(e) => updateData({ weeklyDiscount: parseInt(e.target.value) || 0 })}
                />
                <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <span className="text-sm text-gray-600">
                = {selectedCurrency?.symbol}
                {basePrice ? Math.round(basePrice * (1 - (data.weeklyDiscount || 0) / 100)) : 0}/night
              </span>
            </div>
          </div>

          {/* Monthly discount */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Label>Monthly discount (28+ nights)</Label>
              <span className="text-sm text-gray-500">
                Suggested: {selectedCurrency?.symbol}{suggestedMonthlyDiscount}/night
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="20"
                  value={data.monthlyDiscount || ''}
                  onChange={(e) => updateData({ monthlyDiscount: parseInt(e.target.value) || 0 })}
                />
                <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <span className="text-sm text-gray-600">
                = {selectedCurrency?.symbol}
                {basePrice ? Math.round(basePrice * (1 - (data.monthlyDiscount || 0) / 100)) : 0}/night
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Pricing tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• New listings with competitive prices get booked faster</li>
              <li>• Consider starting 20% below similar listings in your area</li>
              <li>• You can always increase your price after getting reviews</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}