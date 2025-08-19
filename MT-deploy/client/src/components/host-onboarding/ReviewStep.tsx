import React from 'react';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { 
  Home, MapPin, DollarSign, Calendar, Camera, 
  Check, AlertCircle, Edit2, Sparkles 
} from 'lucide-react';

interface ReviewStepProps {
  data: any;
}

export default function ReviewStep({ data }: ReviewStepProps) {
  const isComplete = (fields: any[]) => fields.every(field => field);

  const sections = [
    {
      title: 'Property basics',
      icon: Home,
      complete: isComplete([data.propertyType, data.roomType, data.title, data.description]),
      items: [
        { label: 'Property type', value: data.propertyType?.replace('_', ' ') },
        { label: 'Room type', value: data.roomType?.replace('_', ' ') },
        { label: 'Title', value: data.title },
        { label: 'Max guests', value: data.maxGuests },
        { label: 'Bedrooms', value: data.bedrooms },
        { label: 'Beds', value: data.beds },
        { label: 'Bathrooms', value: data.bathrooms },
      ],
    },
    {
      title: 'Location',
      icon: MapPin,
      complete: isComplete([data.address, data.city, data.country]),
      items: [
        { label: 'Address', value: data.address },
        { label: 'City', value: data.city },
        { label: 'State/Province', value: data.state },
        { label: 'Country', value: data.country },
        { label: 'ZIP code', value: data.zipCode },
        { label: 'Coordinates', value: data.latitude && data.longitude ? '✓ Verified' : 'Not verified' },
      ],
    },
    {
      title: 'Amenities',
      icon: Sparkles,
      complete: data.amenities?.length > 0,
      items: [
        { label: 'Total amenities', value: `${data.amenities?.length || 0} selected` },
        { label: 'Smoking', value: data.smokingAllowed ? 'Allowed' : 'Not allowed' },
        { label: 'Pets', value: data.petsAllowed ? 'Allowed' : 'Not allowed' },
        { label: 'Events', value: data.eventsAllowed ? 'Allowed' : 'Not allowed' },
        { label: 'Wheelchair access', value: data.wheelchairAccessible ? 'Yes' : 'No' },
      ],
    },
    {
      title: 'Photos',
      icon: Camera,
      complete: data.photos?.length >= 5,
      items: [
        { label: 'Photos uploaded', value: `${data.photos?.length || 0} photos` },
        { 
          label: 'Status', 
          value: data.photos?.length >= 5 ? 'Ready' : `Need ${5 - (data.photos?.length || 0)} more photos` 
        },
      ],
    },
    {
      title: 'Pricing',
      icon: DollarSign,
      complete: isComplete([data.basePrice, data.currency]),
      items: [
        { label: 'Base price', value: data.basePrice ? `${data.currency || 'USD'} ${data.basePrice}/night` : 'Not set' },
        { label: 'Cleaning fee', value: data.cleaningFee ? `${data.currency || 'USD'} ${data.cleaningFee}` : 'None' },
        { label: 'Weekly discount', value: data.weeklyDiscount ? `${data.weeklyDiscount}%` : 'None' },
        { label: 'Monthly discount', value: data.monthlyDiscount ? `${data.monthlyDiscount}%` : 'None' },
      ],
    },
    {
      title: 'Availability',
      icon: Calendar,
      complete: true, // Always true for basic settings
      items: [
        { label: 'Instant Book', value: data.instantBook ? 'Enabled' : 'Disabled' },
        { label: 'Minimum stay', value: `${data.minimumStay || 1} night${(data.minimumStay || 1) > 1 ? 's' : ''}` },
        { label: 'Advance notice', value: data.advanceNotice?.replace('_', ' ') || 'Same day' },
        { label: 'Check-in', value: data.checkInTime || '3:00 PM' },
        { label: 'Check-out', value: data.checkOutTime || '11:00 AM' },
      ],
    },
  ];

  const allComplete = sections.every(section => section.complete);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Review your listing</h2>
        <p className="text-gray-600">
          Make sure everything looks good before submitting for review
        </p>
      </div>

      {/* Completion status */}
      {!allComplete && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-900 mb-1">Some sections need attention</h4>
              <p className="text-sm text-orange-800">
                Please complete all required information before submitting your listing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sections review */}
      <div className="space-y-4">
        {sections.map((section, index) => {
          const Icon = section.icon;
          
          return (
            <Card key={section.title} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    section.complete ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {section.complete ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-medium">{section.title}</h3>
                    <p className="text-sm text-gray-500">
                      {section.complete ? 'Complete' : 'Incomplete'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-pink-600 hover:text-pink-700 text-sm font-medium flex items-center gap-1"
                  onClick={() => {
                    // In a real app, this would navigate to the specific step
                    console.log(`Edit ${section.title}`);
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {section.items.map((item) => (
                  <div key={item.label}>
                    <Label className="text-xs text-gray-500">{item.label}</Label>
                    <p className="text-sm font-medium mt-1">
                      {item.value || <span className="text-gray-400">Not set</span>}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* External listings */}
      {(data.airbnbUrl || data.vrboUrl) && (
        <Card className="p-6">
          <h3 className="font-medium mb-4">External listings</h3>
          <div className="space-y-2">
            {data.airbnbUrl && (
              <div>
                <Label className="text-xs text-gray-500">Airbnb</Label>
                <p className="text-sm font-medium mt-1 text-blue-600 truncate">
                  {data.airbnbUrl}
                </p>
              </div>
            )}
            {data.vrboUrl && (
              <div>
                <Label className="text-xs text-gray-500">VRBO</Label>
                <p className="text-sm font-medium mt-1 text-blue-600 truncate">
                  {data.vrboUrl}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Submission notice */}
      {allComplete && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900 mb-1">Ready to submit!</h4>
              <p className="text-sm text-green-800">
                Your listing is complete. Click submit to make it live!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}