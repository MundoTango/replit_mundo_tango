import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, Utensils, Globe, Heart, Phone, MapPin, DollarSign, Calendar, Shield, User } from 'lucide-react';

interface GuestProfileData {
  accommodationPreferences: {
    propertyTypes: string[];
    roomTypes: string[];
    amenities: string[];
  };
  dietaryRestrictions: string[];
  languagesSpoken: string[];
  travelInterests: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  specialNeeds: string;
  preferredNeighborhoods: string[];
  budgetRange: {
    min: number;
    max: number;
    currency: string;
  };
  stayDurationPreference: string;
}

interface GuestProfileDisplayProps {
  profile: GuestProfileData;
  isOwnProfile: boolean;
}

export function GuestProfileDisplay({ profile, isOwnProfile }: GuestProfileDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Guest Profile Badge */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Guest Profile</h2>
        <Badge className="bg-green-100 text-green-800 border-green-300">
          <User className="h-3 w-3 mr-1" />
          Verified Guest
        </Badge>
      </div>

      {/* Privacy Notice */}
      {isOwnProfile && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <p className="text-blue-800">
              Your guest profile is private and only visible to you. Hosts will see this information only when you request a stay.
            </p>
          </div>
        </div>
      )}

      {/* Accommodation Preferences */}
      <Card className="glassmorphic-card beautiful-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-purple-600" />
            Accommodation Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Property Types</h4>
            <div className="flex flex-wrap gap-2">
              {profile.accommodationPreferences.propertyTypes.map((type) => (
                <Badge key={type} variant="secondary">{type}</Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Room Types</h4>
            <div className="flex flex-wrap gap-2">
              {profile.accommodationPreferences.roomTypes.map((type) => (
                <Badge key={type} variant="secondary">{type}</Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {profile.accommodationPreferences.amenities.map((amenity) => (
                <Badge key={amenity} variant="outline">{amenity}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Travel Information */}
      <Card className="glassmorphic-card beautiful-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            Travel Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Languages Spoken</h4>
            <div className="flex flex-wrap gap-2">
              {profile.languagesSpoken.map((lang) => (
                <Badge key={lang} className="bg-blue-100 text-blue-800">{lang}</Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Travel Interests</h4>
            <div className="flex flex-wrap gap-2">
              {profile.travelInterests.map((interest) => (
                <Badge key={interest} className="bg-green-100 text-green-800">{interest}</Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Preferred Neighborhoods</h4>
            <div className="flex flex-wrap gap-2">
              {profile.preferredNeighborhoods.map((neighborhood) => (
                <Badge key={neighborhood} variant="outline">
                  <MapPin className="h-3 w-3 mr-1" />
                  {neighborhood}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dietary & Special Needs */}
      <Card className="glassmorphic-card beautiful-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-orange-600" />
            Dietary & Special Needs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Dietary Restrictions</h4>
            {profile.dietaryRestrictions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.dietaryRestrictions.map((restriction) => (
                  <Badge key={restriction} className="bg-orange-100 text-orange-800">{restriction}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No dietary restrictions specified</p>
            )}
          </div>
          {profile.specialNeeds && (
            <div>
              <h4 className="font-semibold mb-2">Special Needs</h4>
              <p className="text-gray-700">{profile.specialNeeds}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget & Duration */}
      <Card className="glassmorphic-card beautiful-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Budget & Stay Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Budget Range</h4>
            <p className="text-lg">
              {profile.budgetRange.currency} {profile.budgetRange.min} - {profile.budgetRange.max} / night
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Preferred Stay Duration</h4>
            <Badge variant="secondary" className="text-sm">
              <Calendar className="h-3 w-3 mr-1" />
              {profile.stayDurationPreference}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact - Only visible to own profile */}
      {isOwnProfile && profile.emergencyContact && (
        <Card className="glassmorphic-card beautiful-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-red-600" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700 mb-2">This information is private and only shared with hosts after booking confirmation.</p>
              <div className="space-y-2">
                <p><strong>Name:</strong> {profile.emergencyContact.name}</p>
                <p><strong>Phone:</strong> {profile.emergencyContact.phone}</p>
                <p><strong>Relationship:</strong> {profile.emergencyContact.relationship}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}