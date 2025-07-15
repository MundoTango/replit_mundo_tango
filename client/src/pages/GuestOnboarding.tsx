import React, { useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarIcon, Home, MapPin, Users, Star, MessageSquare, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface GuestOnboardingProps {
  hostHomeId?: string;
}

export default function GuestOnboarding({ hostHomeId }: GuestOnboardingProps) {
  const [location, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  
  // Form state
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guestCount, setGuestCount] = useState(1);
  const [purpose, setPurpose] = useState('');
  const [message, setMessage] = useState('');
  const [hasReadRules, setHasReadRules] = useState(false);

  // Get host home ID from URL search params or props
  const searchParams = new URLSearchParams(window.location.search);
  const homeId = hostHomeId || params.homeId || searchParams.get('hostHomeId');

  // Fetch host home details
  const { data: hostHome, isLoading: isLoadingHome } = useQuery({
    queryKey: ['/api/host-homes', homeId],
    enabled: !!homeId,
  });

  // Fetch host details
  const { data: host, isLoading: isLoadingHost } = useQuery({
    queryKey: ['/api/users', hostHome?.hostId],
    enabled: !!hostHome?.hostId,
  });

  // Submit booking request mutation
  const submitBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      return apiRequest('/api/guest-bookings', 'POST', bookingData);
    },
    onSuccess: (data) => {
      toast({
        title: 'Booking Request Sent!',
        description: 'The host will review your request and respond soon.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/guest-bookings'] });
      setLocation('/groups/' + hostHome?.cityGroupSlug);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit booking request',
        variant: 'destructive',
      });
    },
  });

  const steps = [
    { 
      title: 'Select Dates', 
      icon: CalendarIcon,
      description: 'Choose your check-in and check-out dates'
    },
    { 
      title: 'Guest Details', 
      icon: Users,
      description: 'Tell us about yourself and your trip'
    },
    { 
      title: 'House Rules', 
      icon: Home,
      description: 'Review and accept the house rules'
    },
    { 
      title: 'Message Host', 
      icon: MessageSquare,
      description: 'Introduce yourself to the host'
    },
    { 
      title: 'Review & Submit', 
      icon: CheckCircle2,
      description: 'Review your booking request'
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!checkIn || !checkOut || !purpose || !message || !hasReadRules) {
      toast({
        title: 'Missing Information',
        description: 'Please complete all required fields',
        variant: 'destructive',
      });
      return;
    }

    const bookingData = {
      hostHomeId: homeId,
      checkInDate: checkIn.toISOString(),
      checkOutDate: checkOut.toISOString(),
      guestCount,
      purpose,
      message,
      hasReadRules,
    };

    submitBookingMutation.mutate(bookingData);
  };

  if (isLoadingHome || isLoadingHost) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!hostHome) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
          <Button onClick={() => setLocation('/housing-marketplace')}>
            Browse Properties
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Select Dates
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">When would you like to stay?</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Check-in Date</Label>
                  <Calendar
                    mode="single"
                    selected={checkIn}
                    onSelect={setCheckIn}
                    disabled={(date) => date < new Date() || (checkOut && date >= checkOut)}
                    className="rounded-md border"
                  />
                </div>
                <div>
                  <Label>Check-out Date</Label>
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    onSelect={setCheckOut}
                    disabled={(date) => date < new Date() || (checkIn && date <= checkIn)}
                    className="rounded-md border"
                  />
                </div>
              </div>
              {checkIn && checkOut && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    {format(checkIn, 'PPP')} - {format(checkOut, 'PPP')} 
                    ({Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))} nights)
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 1: // Guest Details
        return (
          <div className="space-y-6">
            <div>
              <Label>Number of Guests</Label>
              <RadioGroup value={guestCount.toString()} onValueChange={(val) => setGuestCount(parseInt(val))}>
                {[1, 2, 3, 4].map((num) => (
                  <div key={num} className="flex items-center space-x-2 py-2">
                    <RadioGroupItem value={num.toString()} id={`guests-${num}`} />
                    <Label htmlFor={`guests-${num}`}>{num} {num === 1 ? 'Guest' : 'Guests'}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div>
              <Label htmlFor="purpose">Purpose of Your Visit</Label>
              <RadioGroup value={purpose} onValueChange={setPurpose}>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="milonga" id="milonga" />
                    <Label htmlFor="milonga">Attending Milongas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="festival" id="festival" />
                    <Label htmlFor="festival">Tango Festival</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="vacation" id="vacation" />
                    <Label htmlFor="vacation">Tango Vacation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lessons" id="lessons" />
                    <Label htmlFor="lessons">Taking Lessons</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 2: // House Rules
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">House Rules</h3>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  {hostHome.rules ? (
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{hostHome.rules}</p>
                    </div>
                  ) : (
                    <div className="space-y-3 text-sm">
                      <p>• Respect quiet hours (10 PM - 8 AM)</p>
                      <p>• No smoking inside the property</p>
                      <p>• No unregistered guests</p>
                      <p>• Keep common areas clean</p>
                      <p>• Respect neighbors and local community</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <div className="flex items-start space-x-2 mt-6">
                <input
                  type="checkbox"
                  id="rules-agreement"
                  checked={hasReadRules}
                  onChange={(e) => setHasReadRules(e.target.checked)}
                  className="mt-1"
                />
                <Label htmlFor="rules-agreement" className="text-sm">
                  I have read and agree to follow the house rules
                </Label>
              </div>
            </div>
          </div>
        );

      case 3: // Message Host
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src={host?.profileImage} />
                <AvatarFallback>{host?.name?.charAt(0) || 'H'}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">Message to {host?.name || 'Host'}</h3>
                <p className="text-sm text-gray-600">Introduce yourself and share why you'd like to stay</p>
              </div>
            </div>
            
            <div>
              <Label htmlFor="message">Your Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi! I'm visiting for the tango festival and would love to stay at your place. I'm a respectful guest and..."
                rows={6}
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-2">
                Tip: Share a bit about yourself, your tango experience, and why you chose this property
              </p>
            </div>
          </div>
        );

      case 4: // Review & Submit
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Review Your Booking Request</h3>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Property</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-4">
                    {hostHome.photos?.[0] && (
                      <img 
                        src={hostHome.photos[0].url} 
                        alt={hostHome.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <p className="font-semibold">{hostHome.title}</p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {hostHome.city}, {hostHome.country}
                      </p>
                      <p className="text-sm text-gray-600">
                        Hosted by {host?.name}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Booking Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in</span>
                    <span>{checkIn && format(checkIn, 'PPP')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out</span>
                    <span>{checkOut && format(checkOut, 'PPP')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests</span>
                    <span>{guestCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Purpose</span>
                    <span className="capitalize">{purpose.replace('_', ' ')}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Your Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{message}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Request to Book</h1>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        index <= currentStep
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-400"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs mt-2 text-center max-w-[80px]">
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "h-0.5 w-12 mx-2",
                        index < currentStep ? "bg-blue-600" : "bg-gray-200"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitBookingMutation.isPending || !hasReadRules}
            >
              {submitBookingMutation.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          )}
        </div>
    </div>
  );
}