import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ChevronLeft, ChevronRight, Home, Utensils, Globe, Heart, Phone, MapPin, DollarSign, Calendar } from 'lucide-react';

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

export function GuestOnboardingFlow() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [profileData, setProfileData] = useState<GuestProfileData>({
    accommodationPreferences: {
      propertyTypes: [],
      roomTypes: [],
      amenities: []
    },
    dietaryRestrictions: [],
    languagesSpoken: [],
    travelInterests: [],
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    specialNeeds: '',
    preferredNeighborhoods: [],
    budgetRange: {
      min: 0,
      max: 0,
      currency: 'USD'
    },
    stayDurationPreference: 'short'
  });

  const totalSteps = 6;

  const propertyTypes = ['Apartment', 'House', 'Townhouse', 'Loft', 'Studio', 'Villa'];
  const roomTypes = ['Entire place', 'Private room', 'Shared room'];
  const amenities = ['WiFi', 'Kitchen', 'Washer', 'Dryer', 'Air conditioning', 'Heating', 'Workspace', 'TV', 'Parking', 'Elevator', 'Gym', 'Pool'];
  const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-free', 'Halal', 'Kosher', 'Dairy-free', 'Nut allergies', 'Seafood allergies'];
  const languages = ['English', 'Spanish', 'Portuguese', 'French', 'German', 'Italian', 'Chinese', 'Japanese', 'Korean', 'Russian', 'Arabic'];
  const interests = ['Tango Dancing', 'Museums', 'Art Galleries', 'Live Music', 'Food Tours', 'Wine Tasting', 'Historical Sites', 'Shopping', 'Nature & Parks', 'Photography', 'Cooking Classes', 'Local Markets'];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCheckboxChange = (category: string, value: string, checked: boolean) => {
    setProfileData(prev => {
      const newData = { ...prev };
      
      if (category === 'propertyTypes' || category === 'roomTypes' || category === 'amenities') {
        const preferences = { ...newData.accommodationPreferences };
        if (checked) {
          preferences[category] = [...preferences[category], value];
        } else {
          preferences[category] = preferences[category].filter(item => item !== value);
        }
        newData.accommodationPreferences = preferences;
      } else if (category === 'dietaryRestrictions' || category === 'languagesSpoken' || category === 'travelInterests' || category === 'preferredNeighborhoods') {
        if (checked) {
          newData[category] = [...newData[category], value];
        } else {
          newData[category] = newData[category].filter(item => item !== value);
        }
      }
      
      return newData;
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const response = await apiRequest('/api/guest-profile', {
        method: 'POST',
        body: JSON.stringify(profileData)
      });

      if (response.success) {
        toast({
          title: 'Profile Created!',
          description: 'Your guest profile has been saved successfully.',
        });
        navigate('/profile');
      } else {
        throw new Error(response.message || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving guest profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Home className="w-12 h-12 text-turquoise-500 mx-auto" />
              <h3 className="text-xl font-semibold">Accommodation Preferences</h3>
              <p className="text-gray-600">What type of place are you looking for?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Property Types</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {propertyTypes.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={profileData.accommodationPreferences.propertyTypes.includes(type)}
                        onCheckedChange={(checked) => handleCheckboxChange('propertyTypes', type, checked as boolean)}
                      />
                      <Label htmlFor={type} className="font-normal cursor-pointer">{type}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Room Types</Label>
                <div className="space-y-2 mt-2">
                  {roomTypes.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={profileData.accommodationPreferences.roomTypes.includes(type)}
                        onCheckedChange={(checked) => handleCheckboxChange('roomTypes', type, checked as boolean)}
                      />
                      <Label htmlFor={type} className="font-normal cursor-pointer">{type}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Must-Have Amenities</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {amenities.map(amenity => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={profileData.accommodationPreferences.amenities.includes(amenity)}
                        onCheckedChange={(checked) => handleCheckboxChange('amenities', amenity, checked as boolean)}
                      />
                      <Label htmlFor={amenity} className="font-normal cursor-pointer">{amenity}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Utensils className="w-12 h-12 text-turquoise-500 mx-auto" />
              <h3 className="text-xl font-semibold">Dietary Preferences</h3>
              <p className="text-gray-600">Let us know about any dietary restrictions or preferences</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {dietaryOptions.map(diet => (
                <div key={diet} className="flex items-center space-x-2">
                  <Checkbox
                    id={diet}
                    checked={profileData.dietaryRestrictions.includes(diet)}
                    onCheckedChange={(checked) => handleCheckboxChange('dietaryRestrictions', diet, checked as boolean)}
                  />
                  <Label htmlFor={diet} className="font-normal cursor-pointer">{diet}</Label>
                </div>
              ))}
            </div>

            <div>
              <Label htmlFor="specialNeeds">Any special needs or additional requirements?</Label>
              <Textarea
                id="specialNeeds"
                placeholder="E.g., wheelchair accessibility, medical conditions, etc."
                value={profileData.specialNeeds}
                onChange={(e) => setProfileData(prev => ({ ...prev, specialNeeds: e.target.value }))}
                className="mt-2"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Globe className="w-12 h-12 text-turquoise-500 mx-auto" />
              <h3 className="text-xl font-semibold">Languages & Interests</h3>
              <p className="text-gray-600">Help us connect you with the right people and experiences</p>
            </div>
            
            <div>
              <Label>Languages You Speak</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {languages.map(lang => (
                  <div key={lang} className="flex items-center space-x-2">
                    <Checkbox
                      id={lang}
                      checked={profileData.languagesSpoken.includes(lang)}
                      onCheckedChange={(checked) => handleCheckboxChange('languagesSpoken', lang, checked as boolean)}
                    />
                    <Label htmlFor={lang} className="font-normal cursor-pointer">{lang}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Your Interests</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {interests.map(interest => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox
                      id={interest}
                      checked={profileData.travelInterests.includes(interest)}
                      onCheckedChange={(checked) => handleCheckboxChange('travelInterests', interest, checked as boolean)}
                    />
                    <Label htmlFor={interest} className="font-normal cursor-pointer">{interest}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <MapPin className="w-12 h-12 text-turquoise-500 mx-auto" />
              <h3 className="text-xl font-semibold">Location & Duration</h3>
              <p className="text-gray-600">Where do you want to stay and for how long?</p>
            </div>
            
            <div>
              <Label>Preferred Neighborhoods</Label>
              <p className="text-sm text-gray-600 mb-2">Select neighborhoods you're interested in</p>
              <div className="grid grid-cols-2 gap-3">
                {['Palermo', 'Recoleta', 'San Telmo', 'La Boca', 'Puerto Madero', 'Belgrano', 'Villa Crespo', 'Almagro'].map(hood => (
                  <div key={hood} className="flex items-center space-x-2">
                    <Checkbox
                      id={hood}
                      checked={profileData.preferredNeighborhoods.includes(hood)}
                      onCheckedChange={(checked) => handleCheckboxChange('preferredNeighborhoods', hood, checked as boolean)}
                    />
                    <Label htmlFor={hood} className="font-normal cursor-pointer">{hood}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="stayDuration">Typical Stay Duration</Label>
              <Select
                value={profileData.stayDurationPreference}
                onValueChange={(value) => setProfileData(prev => ({ ...prev, stayDurationPreference: value }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Few days (1-7 days)</SelectItem>
                  <SelectItem value="medium">Few weeks (1-4 weeks)</SelectItem>
                  <SelectItem value="long">Month or more (1-3 months)</SelectItem>
                  <SelectItem value="extended">Extended stay (3+ months)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <DollarSign className="w-12 h-12 text-turquoise-500 mx-auto" />
              <h3 className="text-xl font-semibold">Budget Range</h3>
              <p className="text-gray-600">Help us find options within your budget</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={profileData.budgetRange.currency}
                  onValueChange={(value) => setProfileData(prev => ({ 
                    ...prev, 
                    budgetRange: { ...prev.budgetRange, currency: value }
                  }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="ARS">ARS - Argentine Peso</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="minBudget">Minimum Budget (per night)</Label>
                <Input
                  id="minBudget"
                  type="number"
                  placeholder="0"
                  value={profileData.budgetRange.min || ''}
                  onChange={(e) => setProfileData(prev => ({ 
                    ...prev, 
                    budgetRange: { ...prev.budgetRange, min: parseInt(e.target.value) || 0 }
                  }))}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="maxBudget">Maximum Budget (per night)</Label>
                <Input
                  id="maxBudget"
                  type="number"
                  placeholder="0"
                  value={profileData.budgetRange.max || ''}
                  onChange={(e) => setProfileData(prev => ({ 
                    ...prev, 
                    budgetRange: { ...prev.budgetRange, max: parseInt(e.target.value) || 0 }
                  }))}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Phone className="w-12 h-12 text-turquoise-500 mx-auto" />
              <h3 className="text-xl font-semibold">Emergency Contact</h3>
              <p className="text-gray-600">For your safety, please provide an emergency contact</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  placeholder="Full name"
                  value={profileData.emergencyContact.name}
                  onChange={(e) => setProfileData(prev => ({ 
                    ...prev, 
                    emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                  }))}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  placeholder="+1 234 567 8900"
                  value={profileData.emergencyContact.phone}
                  onChange={(e) => setProfileData(prev => ({ 
                    ...prev, 
                    emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                  }))}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="contactRelationship">Relationship</Label>
                <Input
                  id="contactRelationship"
                  placeholder="E.g., Spouse, Parent, Friend"
                  value={profileData.emergencyContact.relationship}
                  onChange={(e) => setProfileData(prev => ({ 
                    ...prev, 
                    emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                  }))}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Privacy Note:</strong> This information is kept strictly confidential and will only be used in case of emergency.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <Progress value={(currentStep / totalSteps) * 100} className="mb-4" />
          <CardTitle>Complete Your Guest Profile</CardTitle>
          <CardDescription>
            Step {currentStep} of {totalSteps}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {renderStep()}

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < totalSteps ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-turquoise-500 to-blue-500 hover:from-turquoise-600 hover:to-blue-600"
              >
                {isSubmitting ? 'Saving...' : 'Complete Profile'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}