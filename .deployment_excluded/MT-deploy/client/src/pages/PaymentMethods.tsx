import React, { useState } from 'react';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
  CardElement
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Loader2,
  CreditCard,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Shield,
  Star
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  is_default: boolean;
}

const AddPaymentMethodForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    // Create payment method
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement)!,
    });

    if (error) {
      setErrorMessage(error.message || 'Failed to add payment method');
      setIsProcessing(false);
      return;
    }

    // Send to backend
    try {
      await apiRequest('/api/payments/payment-method', {
        method: 'POST',
        body: { paymentMethodId: paymentMethod.id }
      });

      toast({
        title: "Payment Method Added",
        description: "Your new payment method has been added successfully.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/payments/payment-methods'] });
      onSuccess();
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to save payment method');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="glassmorphic-card p-6 rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#1f2937',
                '::placeholder': {
                  color: '#9ca3af',
                },
              },
              invalid: {
                color: '#ef4444',
              },
            },
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
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 bg-gradient-to-r from-turquoise-500 to-cyan-500 hover:from-turquoise-600 hover:to-cyan-600"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Payment Method
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

const PaymentMethods: React.FC = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch payment methods
  const { data: paymentMethods, isLoading } = useQuery({
    queryKey: ['/api/payments/payment-methods'],
    enabled: isAuthenticated,
  });

  // Set default payment method mutation
  const setDefaultMutation = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      return apiRequest('/api/payments/payment-method/default', {
        method: 'PUT',
        body: { paymentMethodId }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payments/payment-methods'] });
      toast({
        title: "Default Payment Method Updated",
        description: "Your default payment method has been changed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update default payment method",
        variant: "destructive"
      });
    }
  });

  // Delete payment method mutation
  const deleteMutation = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      return apiRequest(`/api/payments/payment-method/${paymentMethodId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payments/payment-methods'] });
      toast({
        title: "Payment Method Removed",
        description: "The payment method has been removed from your account.",
      });
      setDeletingId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove payment method",
        variant: "destructive"
      });
      setDeletingId(null);
    }
  });

  const handleDelete = (paymentMethodId: string) => {
    if (window.confirm('Are you sure you want to remove this payment method?')) {
      setDeletingId(paymentMethodId);
      deleteMutation.mutate(paymentMethodId);
    }
  };

  if (!isAuthenticated) {
    window.location.href = '/api/login';
    return null;
  }

  const getCardBrandIcon = (brand: string) => {
    const brandLower = brand.toLowerCase();
    if (brandLower.includes('visa')) return '💳';
    if (brandLower.includes('mastercard')) return '💳';
    if (brandLower.includes('amex')) return '💳';
    if (brandLower.includes('discover')) return '💳';
    return '💳';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Methods</h1>
          <p className="text-gray-600">Manage your payment methods for subscriptions and purchases</p>
        </div>

        <Card className="glassmorphic-card mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Payment Methods</CardTitle>
              <CardDescription>Add or remove payment methods from your account</CardDescription>
            </div>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-gradient-to-r from-turquoise-500 to-cyan-500 hover:from-turquoise-600 hover:to-cyan-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-turquoise-500" />
              </div>
            ) : (!paymentMethods || (paymentMethods as PaymentMethod[]).length === 0) ? (
              <div className="text-center py-8">
                <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No payment methods added yet</p>
                <p className="text-sm text-gray-400 mt-2">Add a payment method to subscribe to premium features</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(paymentMethods as PaymentMethod[])?.map((method: PaymentMethod) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{getCardBrandIcon(method.card?.brand || '')}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium capitalize">{method.card?.brand}</p>
                          <span className="text-gray-500">•••• {method.card?.last4}</span>
                          {method.is_default && (
                            <Badge variant="secondary" className="bg-turquoise-100 text-turquoise-700">
                              <Star className="w-3 h-3 mr-1" />
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          Expires {method.card?.exp_month}/{method.card?.exp_year}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!method.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDefaultMutation.mutate(method.id)}
                          disabled={setDefaultMutation.isPending}
                        >
                          {setDefaultMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Set Default
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(method.id)}
                        disabled={deletingId === method.id || method.is_default}
                        className="text-red-600 hover:text-red-700"
                      >
                        {deletingId === method.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="bg-white/70 backdrop-blur-xl rounded-lg p-6 flex items-start gap-4">
          <Shield className="h-6 w-6 text-turquoise-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Your payment information is secure</h3>
            <p className="text-sm text-gray-600">
              We use industry-standard encryption to protect your payment details. Your full card number is never stored on our servers.
              All payment processing is handled securely by Stripe.
            </p>
          </div>
        </div>
      </div>

      {/* Add Payment Method Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>
              Add a new credit or debit card to your account
            </DialogDescription>
          </DialogHeader>
          <Elements stripe={stripePromise}>
            <AddPaymentMethodForm onSuccess={() => setShowAddDialog(false)} />
          </Elements>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentMethods;