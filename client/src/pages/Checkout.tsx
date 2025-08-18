import React, { useState, useEffect } from 'react';
import { 
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Loader2, 
  CreditCard, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  Tag,
  ArrowLeft
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation, useRoute } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface CheckoutFormProps {
  tier: string;
  clientSecret: string;
  promoCode?: string;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ tier, clientSecret, promoCode }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?tier=${tier}`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    } else {
      // Payment succeeded
      toast({
        title: "Payment Successful!",
        description: "Your subscription has been activated.",
      });
      setLocation('/settings/billing');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="glassmorphic-card p-6 rounded-lg">
        <PaymentElement 
          options={{
            layout: 'tabs',
            wallets: {
              applePay: 'auto',
              googlePay: 'auto'
            }
          }}
        />
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4">
        <Link href="/subscribe">
          <Button type="button" variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Plans
          </Button>
        </Link>
        
        <Button 
          type="submit" 
          disabled={!stripe || isProcessing}
          className="flex-1 bg-gradient-to-r from-turquoise-500 to-cyan-500 hover:from-turquoise-600 hover:to-cyan-600"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Complete Payment
            </>
          )}
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <Lock className="w-4 h-4" />
        <span>Secured by Stripe</span>
      </div>
    </form>
  );
};

const Checkout: React.FC = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/checkout/:tier");
  const tier = params?.tier || '';
  
  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  
  // Fetch subscription tiers for pricing display
  const { data: tiersData } = useQuery({
    queryKey: ['/api/payments/subscription-tiers'],
  });

  // Create payment intent
  const { data: paymentData, isLoading, error } = useQuery({
    queryKey: ['/api/payments/create-checkout-session', tier, appliedPromo?.code],
    queryFn: async () => {
      return apiRequest('/api/payments/create-checkout-session', {
        method: 'POST',
        body: { 
          tier,
          promoCode: appliedPromo?.code 
        }
      });
    },
    enabled: isAuthenticated && !!tier,
  });

  // Apply promo code mutation
  const applyPromoMutation = useMutation({
    mutationFn: async (code: string) => {
      return apiRequest('/api/payments/validate-promo', {
        method: 'POST',
        body: { code, tier }
      });
    },
    onSuccess: (data) => {
      setAppliedPromo(data);
      toast({
        title: "Promo Code Applied!",
        description: `${data.discount}% discount applied to your subscription.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Invalid Promo Code",
        description: error.message || "The promo code is not valid or has expired.",
        variant: "destructive"
      });
    }
  });

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      applyPromoMutation.mutate(promoCode.trim());
    }
  };

  if (!isAuthenticated) {
    setLocation('/api/login');
    return null;
  }

  if (!tier || !['basic'].includes(tier)) {
    setLocation('/subscribe');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-turquoise-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !paymentData?.clientSecret) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 py-12">
        <div className="max-w-md mx-auto px-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error?.message || 'Failed to initialize payment. Please try again.'}
            </AlertDescription>
          </Alert>
          <Link href="/subscribe" className="mt-4 inline-block">
            <Button variant="outline">Back to Plans</Button>
          </Link>
        </div>
      </div>
    );
  }

  const selectedTier = tiersData?.data?.[tier];
  const originalPrice = selectedTier?.price || 0;
  const discountAmount = appliedPromo ? (originalPrice * appliedPromo.discount / 100) : 0;
  const finalPrice = originalPrice - discountAmount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Subscription</h1>
          <p className="text-gray-600">Secure payment powered by Stripe</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <Card className="glassmorphic-card">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold capitalize">{tier} Plan</p>
                    <p className="text-sm text-gray-500">Monthly subscription</p>
                  </div>
                  <p className="text-lg font-semibold">${(originalPrice / 100).toFixed(2)}</p>
                </div>

                {appliedPromo && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center text-green-600">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        <span>Promo: {appliedPromo.code}</span>
                      </div>
                      <span>-${(discountAmount / 100).toFixed(2)}</span>
                    </div>
                  </>
                )}

                <Separator />

                <div className="flex justify-between items-center">
                  <p className="font-semibold">Total</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">
                    ${(finalPrice / 100).toFixed(2)}/mo
                  </p>
                </div>

                {/* Promo Code Input */}
                {!appliedPromo && (
                  <div className="space-y-2 pt-4">
                    <Label htmlFor="promo">Have a promo code?</Label>
                    <div className="flex gap-2">
                      <Input
                        id="promo"
                        placeholder="Enter code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleApplyPromo}
                        disabled={applyPromoMutation.isPending || !promoCode.trim()}
                        variant="outline"
                      >
                        {applyPromoMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Apply'
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Features */}
                <div className="pt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">Included features:</p>
                  {selectedTier?.features?.slice(0, 5).map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div>
            <Card className="glassmorphic-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Details
                </CardTitle>
                <CardDescription>
                  Enter your payment information below
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Elements 
                  stripe={stripePromise} 
                  options={{
                    clientSecret: paymentData.clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#14b8a6',
                        colorBackground: '#ffffff',
                        colorText: '#1f2937',
                        colorDanger: '#ef4444',
                        fontFamily: 'system-ui, sans-serif',
                        borderRadius: '8px',
                      },
                    },
                  }}
                >
                  <CheckoutForm 
                    tier={tier} 
                    clientSecret={paymentData.clientSecret}
                    promoCode={appliedPromo?.code}
                  />
                </Elements>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-8 text-center">
          <Badge variant="secondary" className="px-4 py-2">
            <Lock className="w-4 h-4 mr-2" />
            Your payment information is encrypted and secure
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default Checkout;