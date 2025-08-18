import React from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Heart, Users, MapPin, Coffee, ShoppingBag } from 'lucide-react';

export function GuestOnboardingEntrance() {
  const [, navigate] = useLocation();

  const benefits = [
    {
      icon: Home,
      title: 'Find the Perfect Stay',
      description: 'Get personalized housing recommendations based on your preferences and budget'
    },
    {
      icon: Heart,
      title: 'Connect with Locals',
      description: 'Receive tailored recommendations from locals who share your interests'
    },
    {
      icon: Users,
      title: 'Join Community Events',
      description: 'Discover events that match your schedule and interests'
    },
    {
      icon: MapPin,
      title: 'Explore Like a Local',
      description: 'Access hidden gems and authentic experiences curated by the community'
    },
    {
      icon: Coffee,
      title: 'Dietary Preferences',
      description: 'Find restaurants and cafes that cater to your dietary needs'
    },
    {
      icon: ShoppingBag,
      title: 'Personalized Shopping',
      description: 'Discover local shops and markets that match your style'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="border-2 border-gradient-to-r from-turquoise-500 to-blue-500">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-turquoise-500 to-blue-500 rounded-full flex items-center justify-center">
            <Users className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-turquoise-600 to-blue-600 bg-clip-text text-transparent">
            Welcome to Our Community!
          </CardTitle>
          <CardDescription className="text-lg max-w-2xl mx-auto">
            Tell us about yourself to receive personalized recommendations for housing, 
            events, and local experiences tailored just for you.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-turquoise-100 to-blue-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-turquoise-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{benefit.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-r from-turquoise-50 to-blue-50 rounded-lg p-6 text-center">
            <p className="text-gray-700 mb-4">
              <strong>🔒 Your privacy matters:</strong> Your profile information is only visible to you 
              and helps us provide better recommendations. You control what you share.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/guest-onboarding')}
              size="lg"
              className="bg-gradient-to-r from-turquoise-500 to-blue-500 hover:from-turquoise-600 hover:to-blue-600 text-white"
            >
              Get Started - It only takes 2 minutes
            </Button>
            <Button
              onClick={() => navigate('/community')}
              size="lg"
              variant="outline"
              className="border-gray-300"
            >
              Maybe Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}