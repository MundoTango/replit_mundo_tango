import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, Home, MapPin, Camera, DollarSign, Calendar, Shield, Sparkles } from 'lucide-react';
import PropertyTypeStep from '@/components/host-onboarding/PropertyTypeStep';
import PropertyDetailsStep from '@/components/host-onboarding/PropertyDetailsStep';
import LocationStep from '@/components/host-onboarding/LocationStep';
import AmenitiesStep from '@/components/host-onboarding/AmenitiesStep';
import PhotosStep from '@/components/host-onboarding/PhotosStep';
import PricingStep from '@/components/host-onboarding/PricingStep';
import AvailabilityStep from '@/components/host-onboarding/AvailabilityStep';
import ReviewStep from '@/components/host-onboarding/ReviewStep';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { toast } from '@/hooks/use-toast';

interface OnboardingData {
  // Property basics
  propertyType: string;
  roomType: string;
  title: string;
  description: string;
  
  // Location
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  
  // Details
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  
  // Amenities
  amenities: string[];
  
  // Photos
  photos: File[];
  
  // Pricing
  basePrice: number;
  cleaningFee: number;
  currency: string;
  
  // Availability
  instantBook: boolean;
  minimumStay: number;
  availableDates: Date[];
  
  // External listings
  airbnbUrl?: string;
  vrboUrl?: string;
}

const STEPS = [
  { id: 'property-type', title: 'Property Type', icon: Home },
  { id: 'property-details', title: 'Property Details', icon: Home },
  { id: 'location', title: 'Location', icon: MapPin },
  { id: 'amenities', title: 'Amenities', icon: Sparkles },
  { id: 'photos', title: 'Photos', icon: Camera },
  { id: 'pricing', title: 'Pricing', icon: DollarSign },
  { id: 'availability', title: 'Availability', icon: Calendar },
  { id: 'review', title: 'Review & Submit', icon: Shield },
];

export default function HostOnboarding() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({
    currency: 'USD',
    instantBook: false,
    minimumStay: 1,
    amenities: [],
    photos: [],
    availableDates: [],
  });

  const createHostHomeMutation = useMutation({
    mutationFn: async (data: Partial<OnboardingData>) => {
      try {
        console.log('Starting host home creation with data:', data);
        
        // First, upload photos
        const photoUrls: string[] = [];
        if (data.photos && data.photos.length > 0) {
          console.log('Uploading photos:', data.photos.length);
          setUploadProgress(10); // Start progress
          
          const formData = new FormData();
          data.photos.forEach((photo) => {
            formData.append('files', photo);
          });
          
          console.log('Sending photo upload request...');
          setUploadProgress(30); // Uploading
          
          const uploadResponse = await apiRequest('POST', '/api/upload/host-home-photos', formData);
          console.log('Upload response status:', uploadResponse.status);
          setUploadProgress(80); // Almost done
          
          const uploadData = await uploadResponse.json();
          console.log('Upload response data:', uploadData);
          setUploadProgress(100); // Complete
          
          if (uploadData.urls) {
            photoUrls.push(...uploadData.urls);
          }
        }

        // Then create the host home
        const hostHomeData = {
          ...data,
          photos: photoUrls,
          status: 'pending_review',
        };
        
        console.log('Creating host home with data:', hostHomeData);
        const response = await apiRequest('POST', '/api/host-homes', hostHomeData);
        console.log('Host home response status:', response.status);
        const result = await response.json();
        console.log('Host home creation result:', result);
        return result;
      } catch (error) {
        console.error('Error in createHostHomeMutation:', error);
        console.error('Error stack:', error.stack);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Your property has been submitted for review. We\'ll notify you once it\'s approved.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/host-homes'] });
      setLocation('/host-dashboard');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create listing. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const updateData = (stepData: Partial<OnboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...stepData }));
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < STEPS.length) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    createHostHomeMutation.mutate(onboardingData);
  };

  const progressPercentage = ((currentStep + 1) / STEPS.length) * 100;

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'property-type':
        return <PropertyTypeStep data={onboardingData} updateData={updateData} />;
      case 'property-details':
        return <PropertyDetailsStep data={onboardingData} updateData={updateData} />;
      case 'location':
        return <LocationStep data={onboardingData} updateData={updateData} />;
      case 'amenities':
        return <AmenitiesStep data={onboardingData} updateData={updateData} />;
      case 'photos':
        return <PhotosStep data={onboardingData} updateData={updateData} />;
      case 'pricing':
        return <PricingStep data={onboardingData} updateData={updateData} />;
      case 'availability':
        return <AvailabilityStep data={onboardingData} updateData={updateData} />;
      case 'review':
        return <ReviewStep data={onboardingData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">List Your Home</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                Step {currentStep + 1} of {STEPS.length}
              </span>
              <Button variant="outline" onClick={() => setLocation('/host-dashboard')}>
                Save & Exit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Progress value={progressPercentage} className="h-1" />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between py-4 overflow-x-auto">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              
              return (
                <button
                  key={step.id}
                  onClick={() => goToStep(index)}
                  className={`flex flex-col items-center min-w-[100px] px-2 ${
                    index <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                  disabled={index > currentStep}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span
                    className={`text-xs text-center ${
                      isCurrent ? 'text-pink-600 font-medium' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-6">
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={previousStep}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          {currentStep === STEPS.length - 1 ? (
            <div className="flex flex-col items-end gap-2">
              {createHostHomeMutation.isPending && uploadProgress > 0 && (
                <div className="w-64">
                  <div className="text-sm text-gray-600 mb-1">
                    Uploading photos... {uploadProgress}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              <Button
                onClick={handleSubmit}
                disabled={createHostHomeMutation.isPending}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                {createHostHomeMutation.isPending ? 'Submitting...' : 'Submit Listing'}
              </Button>
            </div>
          ) : (
            <Button
              onClick={nextStep}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}