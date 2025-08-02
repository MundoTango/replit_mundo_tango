import React, { useState } from 'react';
import { Check, X, Sparkles, Star, Zap, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'wouter';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '@/hooks/useAuth';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface SubscriptionTier {
  name: string;
  priceId: string | null;
  price: number;
  features: string[];
}

interface SubscriptionTiersResponse {
  free: SubscriptionTier;
  basic: SubscriptionTier;
  enthusiast: SubscriptionTier;
  professional: SubscriptionTier;
  enterprise: SubscriptionTier;
}

const Subscribe: React.FC = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedTier, setSelectedTier] = useState<string>('');

  // Fetch subscription tiers
  const { data: tiers, isLoading: tiersLoading } = useQuery<{ success: boolean; data: SubscriptionTiersResponse }>({
    queryKey: ['/api/payments/subscription-tiers'],
  });

  // Fetch current subscription
  const { data: currentSubscription } = useQuery<{ subscription: any }>({
    queryKey: ['/api/payments/subscription'],
    enabled: isAuthenticated,
  });

  // Create subscription mutation
  const createSubscriptionMutation = useMutation({
    mutationFn: async (tier: string) => {
      const response = await apiRequest('POST', '/api/payments/subscribe', { tier });
      return response.json();
    },
    onSuccess: async (data: any) => {
      if (data.clientSecret) {
        // Redirect to checkout page with the selected tier
        toast({
          title: "Subscription Created",
          description: "Redirecting to secure payment...",
        });
        
        // Store the client secret and redirect to checkout
        sessionStorage.setItem('stripe_client_secret', data.clientSecret);
        sessionStorage.setItem('selected_tier', data.tier);
        setLocation(`/checkout/${data.tier}`);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create subscription",
        variant: "destructive"
      });
    }
  });

  const handleSubscribe = (tier: string) => {
    // Temporarily bypass auth check for testing payment flow
    // Remove this bypass in production
    const skipAuthForTesting = true;
    
    if (!isAuthenticated && !skipAuthForTesting) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe",
        variant: "destructive"
      });
      setLocation('/api/login');
      return;
    }

    if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
      toast({
        title: "Configuration Error",
        description: "Stripe is not configured. Please contact support.",
        variant: "destructive"
      });
      return;
    }

    setSelectedTier(tier);
    createSubscriptionMutation.mutate(tier);
  };

  if (tiersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-turquoise-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const tierData = tiers?.data;
  const currentTier = currentSubscription?.subscription?.tier || 'free';

  const tiersList = [
    {
      key: 'free',
      name: 'Free',
      price: 0,
      description: 'Perfect for exploring the platform',
      icon: <Sparkles className="w-6 h-6" />,
      features: [
        'Basic profile',
        'View events',
        'Join city & professional groups',
        '100MB storage',
        'Community access'
      ],
      notIncluded: ['Create events', 'Join other groups', 'Advanced analytics']
    },
    {
      key: 'basic',
      name: 'Basic',
      price: 5,
      description: 'Great for active dancers',
      icon: <Star className="w-6 h-6" />,
      features: [
        'Everything in Free',
        '5GB storage',
        'Create basic events',
        'Join all groups',
        'Advanced search'
      ],
      notIncluded: ['Analytics dashboard', 'Custom branding'],
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Unlock premium features and take your tango journey to the next level
          </p>
        </div>

        {/* Current Plan Banner */}
        {isAuthenticated && currentTier !== 'free' && (
          <div className="mb-8 p-4 bg-gradient-to-r from-turquoise-100 to-cyan-100 rounded-lg text-center">
            <p className="text-gray-700">
              You're currently on the <span className="font-semibold">{currentTier}</span> plan.
              <Link href="/settings/billing">
                <a className="ml-2 text-turquoise-600 hover:text-turquoise-700 underline">
                  Manage billing
                </a>
              </Link>
            </p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {tiersList.map((tier) => {
            const isCurrentPlan = currentTier === tier.key;
            const isUpgrade = tiersList.findIndex(t => t.key === currentTier) < tiersList.findIndex(t => t.key === tier.key);
            
            return (
              <Card 
                key={tier.key}
                className={`relative glassmorphic-card hover:scale-105 transition-transform duration-300 ${
                  tier.popular ? 'ring-2 ring-turquoise-500' : ''
                }`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-turquoise-500 to-cyan-500">
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-8 pt-6">
                  <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-turquoise-100 to-cyan-100 rounded-full w-fit">
                    {tier.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                  <CardDescription className="mt-2">{tier.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${tier.price}</span>
                    {tier.price > 0 && <span className="text-gray-500">/month</span>}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Included Features */}
                  <div className="space-y-2">
                    {tier.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Not Included Features */}
                  {tier.notIncluded.length > 0 && (
                    <div className="space-y-2 pt-4 border-t border-gray-200">
                      {tier.notIncluded.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <X className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-500">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Action Button */}
                  <div className="pt-4">
                    {isCurrentPlan ? (
                      <Button 
                        className="w-full" 
                        variant="outline"
                        disabled
                      >
                        Current Plan
                      </Button>
                    ) : tier.key === 'free' ? (
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => setLocation('/settings/billing')}
                      >
                        Downgrade
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-gradient-to-r from-turquoise-500 to-cyan-500 hover:from-turquoise-600 hover:to-cyan-600"
                        onClick={() => handleSubscribe(tier.key)}
                        disabled={createSubscriptionMutation.isPending && selectedTier === tier.key}
                      >
                        {createSubscriptionMutation.isPending && selectedTier === tier.key
                          ? 'Processing...'
                          : isUpgrade ? 'Upgrade' : 'Select Plan'
                        }
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>



        {/* FAQ Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Questions about our plans?{' '}
            <Link href="/help/billing">
              <a className="text-turquoise-600 hover:text-turquoise-700 underline">
                View billing FAQ
              </a>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;