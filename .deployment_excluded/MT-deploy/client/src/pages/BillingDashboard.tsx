import React, { useState } from 'react';
import { 
  CreditCard, 
  Calendar, 
  ChevronRight,
  Download,
  Plus,
  AlertCircle,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

const BillingDashboard: React.FC = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  // Fetch current subscription
  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery<{
    subscription: any;
    paymentMethods: any[];
    invoices: any[];
  }>({
    queryKey: ['/api/payments/subscription'],
    enabled: isAuthenticated,
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/payments/cancel-subscription', { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payments/subscription'] });
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled. You'll retain access until the end of your billing period.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive"
      });
    }
  });

  // Resume subscription mutation
  const resumeSubscriptionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/payments/resume-subscription', { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payments/subscription'] });
      toast({
        title: "Subscription Resumed",
        description: "Your subscription has been resumed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to resume subscription",
        variant: "destructive"
      });
    }
  });

  // Delete payment method mutation
  const deletePaymentMethodMutation = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      return apiRequest(`/api/payments/payment-method/${paymentMethodId}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payments/subscription'] });
      toast({
        title: "Payment Method Removed",
        description: "The payment method has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove payment method",
        variant: "destructive"
      });
    }
  });

  if (!isAuthenticated) {
    setLocation('/api/login');
    return null;
  }

  if (subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-turquoise-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const subscription = subscriptionData?.subscription;
  const paymentMethods = subscriptionData?.paymentMethods || [];
  const invoices = subscriptionData?.invoices || [];

  const getSubscriptionStatus = () => {
    if (!subscription) return 'inactive';
    if (subscription.cancelAtPeriodEnd) return 'cancelling';
    return subscription.status || 'active';
  };

  const status = getSubscriptionStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Subscription</h1>
          <p className="text-gray-600">Manage your subscription and payment methods</p>
        </div>

        {/* Current Subscription */}
        <Card className="mb-8 glassmorphic-card">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Current Subscription</CardTitle>
                <CardDescription>Your active plan and billing details</CardDescription>
              </div>
              {subscription && (
                <Badge 
                  variant={status === 'active' ? 'default' : status === 'cancelling' ? 'secondary' : 'destructive'}
                  className={
                    status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : status === 'cancelling'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }
                >
                  {status === 'cancelling' ? 'Cancelling' : status}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription ? (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-lg capitalize">{subscription.tier} Plan</p>
                    <p className="text-gray-600">${subscription.amount / 100}/month</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Next billing date</p>
                    <p className="font-medium">
                      {subscription.currentPeriodEnd 
                        ? format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy')
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>

                {status === 'cancelling' && (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription>
                      Your subscription is set to cancel on {format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy')}. 
                      You'll retain access until then.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3">
                  {status === 'active' ? (
                    <>
                      <Link href="/subscribe">
                        <Button variant="outline">
                          Change Plan
                        </Button>
                      </Link>
                      <Button 
                        variant="destructive"
                        onClick={() => {
                          if (confirm('Are you sure you want to cancel your subscription?')) {
                            cancelSubscriptionMutation.mutate();
                          }
                        }}
                        disabled={cancelSubscriptionMutation.isPending}
                      >
                        {cancelSubscriptionMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          'Cancel Subscription'
                        )}
                      </Button>
                    </>
                  ) : status === 'cancelling' ? (
                    <Button 
                      onClick={() => resumeSubscriptionMutation.mutate()}
                      disabled={resumeSubscriptionMutation.isPending}
                    >
                      {resumeSubscriptionMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Resuming...
                        </>
                      ) : (
                        'Resume Subscription'
                      )}
                    </Button>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">You don't have an active subscription</p>
                <Link href="/subscribe">
                  <Button className="bg-gradient-to-r from-turquoise-500 to-cyan-500 hover:from-turquoise-600 hover:to-cyan-600">
                    View Plans
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="mb-8 glassmorphic-card">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Manage your saved payment methods</CardDescription>
              </div>
              <Button 
                size="sm"
                className="bg-gradient-to-r from-turquoise-500 to-cyan-500 hover:from-turquoise-600 hover:to-cyan-600"
                onClick={() => toast({ 
                  title: "Coming Soon", 
                  description: "Payment method management will be available soon." 
                })}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Card
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {paymentMethods.length > 0 ? (
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">•••• {method.last4}</p>
                        <p className="text-sm text-gray-500">
                          Expires {method.expMonth}/{method.expYear}
                        </p>
                      </div>
                      {method.isDefault && (
                        <Badge variant="secondary" className="ml-2">Default</Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to remove this payment method?')) {
                          deletePaymentMethodMutation.mutate(method.id);
                        }
                      }}
                      disabled={deletePaymentMethodMutation.isPending}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No payment methods saved</p>
            )}
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card className="glassmorphic-card">
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>Download your past invoices</CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length > 0 ? (
              <div className="space-y-2">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">
                          ${invoice.amount / 100} - {format(new Date(invoice.created * 1000), 'MMMM d, yyyy')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {invoice.description || `${subscription?.tier} Plan`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                        className={invoice.status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {invoice.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(invoice.invoicePdf, '_blank')}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No billing history available</p>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Need help with billing?{' '}
            <a 
              href="mailto:support@mundotango.life" 
              className="text-turquoise-600 hover:text-turquoise-700 underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BillingDashboard;