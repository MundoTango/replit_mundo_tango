import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface SubscriptionTier {
  name: string;
  priceId: string | null;
  price: number;
  features: string[];
}

interface SubscriptionStatus {
  subscription: any;
  paymentMethods: any[];
  hasActiveSubscription: boolean;
}

const SubscriptionForm = ({ tier, onSuccess }: { tier: string; onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/payments/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier })
      });
      return response.json();
    },
    onSuccess: async (data) => {
      if (!stripe || !elements) {
        toast({
          title: "Error",
          description: "Stripe not initialized",
          variant: "destructive",
        });
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        toast({
          title: "Error",
          description: "Card element not found",
          variant: "destructive",
        });
        return;
      }

      setIsProcessing(true);
      
      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      setIsProcessing(false);

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent?.status === 'succeeded') {
        toast({
          title: "Success!",
          description: "Your subscription is now active",
        });
        onSuccess();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    subscribeMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      <Button
        type="submit"
        disabled={!stripe || subscribeMutation.isPending || isProcessing}
        className="w-full"
      >
        {subscribeMutation.isPending || isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Subscribe Now
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Test with card: 4242 4242 4242 4242 (any future expiry, any CVC)
      </p>
    </form>
  );
};

export default function Subscription() {
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Fetch subscription tiers
  const { data: tiersData, isLoading: tiersLoading } = useQuery({
    queryKey: ['/api/payments/subscription-tiers'],
  });

  // Fetch current subscription status
  const { data: statusData, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ['/api/payments/subscription'],
  });

  const tiers = (tiersData as any)?.data || {};
  const currentSubscription = (statusData as any)?.subscription;
  const hasActiveSubscription = (statusData as any)?.hasActiveSubscription;

  const tierOrder = ['free', 'basic', 'enthusiast', 'professional', 'enterprise'];
  const tierColors = {
    free: 'border-gray-300',
    basic: 'border-blue-300',
    enthusiast: 'border-purple-300',
    professional: 'border-orange-300',
    enterprise: 'border-red-300',
  };

  const handleSelectTier = (tierKey: string) => {
    if (tierKey === 'free') {
      toast({
        title: "Free Plan",
        description: "You're already on the free plan",
      });
      return;
    }
    setSelectedTier(tierKey);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    setSelectedTier(null);
    refetchStatus();
    // queryClient.invalidateQueries({ queryKey: ['/api/payments/subscription'] });
  };

  if (tiersLoading || statusLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground">
          Unlock premium features and take your experience to the next level
        </p>
        {hasActiveSubscription && (
          <Badge className="mt-4" variant="default">
            Current Plan: {currentSubscription?.metadata?.tier || 'Unknown'}
          </Badge>
        )}
      </div>

      {!showPaymentForm ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {tierOrder.map((tierKey) => {
            const tier = tiers[tierKey];
            if (!tier) return null;

            const isCurrentPlan = currentSubscription?.metadata?.tier === tierKey || (!hasActiveSubscription && tierKey === 'free');
            const price = tier.price / 100; // Convert cents to dollars

            return (
              <Card
                key={tierKey}
                className={cn(
                  "relative overflow-hidden transition-all hover:shadow-lg",
                  tierColors[tierKey as keyof typeof tierColors],
                  isCurrentPlan && "ring-2 ring-primary"
                )}
              >
                {isCurrentPlan && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">
                    Current
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="capitalize">{tier.name}</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold">
                      ${price}
                    </span>
                    {tierKey !== 'free' && <span className="text-muted-foreground">/month</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tier.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature.replace(/_/g, ' ')}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? "outline" : "default"}
                    disabled={isCurrentPlan}
                    onClick={() => handleSelectTier(tierKey)}
                  >
                    {isCurrentPlan ? "Current Plan" : tierKey === 'free' ? "Downgrade" : "Upgrade"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Subscription</CardTitle>
              <CardDescription>
                Subscribing to {selectedTier} plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise}>
                <SubscriptionForm 
                  tier={selectedTier!} 
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowPaymentForm(false);
                  setSelectedTier(null);
                }}
              >
                Cancel
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}