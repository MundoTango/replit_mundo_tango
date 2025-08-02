import Stripe from 'stripe';
import { storage } from '../storage';
import type { User, Subscription, PaymentMethod, Payment } from '../../shared/schema';

// Initialize Stripe with secret key (lazy loaded)
let stripe: Stripe | null = null;

const getStripe = (): Stripe => {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured. Please add it to your environment variables.');
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil' as Stripe.LatestApiVersion,
    });
  }
  return stripe;
};

// Subscription tiers and pricing
export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    priceId: null,
    price: 0,
    features: ['basic_features', 'limited_storage']
  },
  basic: {
    name: 'Basic',
    priceId: process.env.STRIPE_PRICE_ID_BASIC || '',
    price: 500, // $5.00 in cents
    features: ['all_free_features', 'unlimited_storage', 'priority_support']
  },
  enthusiast: {
    name: 'Enthusiast',
    priceId: process.env.STRIPE_PRICE_ID_ENTHUSIAST || '',
    price: 999, // $9.99 in cents
    features: ['all_basic_features', 'advanced_analytics', 'custom_branding']
  },
  professional: {
    name: 'Professional',
    priceId: process.env.STRIPE_PRICE_ID_PROFESSIONAL || '',
    price: 2499, // $24.99 in cents
    features: ['all_enthusiast_features', 'api_access', 'white_label']
  },
  enterprise: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_PRICE_ID_ENTERPRISE || '',
    price: 9999, // $99.99 in cents
    features: ['all_professional_features', 'dedicated_support', 'custom_features']
  }
};

export class PaymentService {
  // Create or get Stripe customer
  async getOrCreateCustomer(user: User): Promise<string> {
    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    const customer = await getStripe().customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user.id.toString()
      }
    });

    await storage.updateUserStripeCustomerId(user.id, customer.id);
    return customer.id;
  }

  // Create subscription
  async createSubscription(userId: number, tier: string): Promise<Subscription> {
    const user = await storage.getUser(userId);
    if (!user) throw new Error('User not found');

    const tierConfig = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
    if (!tierConfig || !tierConfig.priceId) {
      throw new Error('Invalid subscription tier');
    }

    const customerId = await this.getOrCreateCustomer(user);

    // Create subscription in Stripe
    const stripeSubscription = await getStripe().subscriptions.create({
      customer: customerId,
      items: [{ price: tierConfig.priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent']
    });

    // Save subscription to database
    const subscription = await storage.createSubscription({
      userId: user.id,
      planId: tierConfig.priceId,
      status: stripeSubscription.status,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      paymentProvider: 'stripe',
      providerSubscriptionId: stripeSubscription.id,
      metadata: {
        tier,
        stripePriceId: tierConfig.priceId
      }
    });

    // Update user subscription info
    await storage.updateUserSubscriptionInfo(
      user.id,
      stripeSubscription.id,
      stripeSubscription.status,
      tier
    );

    return subscription;
  }

  // Get subscription client secret for payment
  async getSubscriptionClientSecret(subscriptionId: string): Promise<string | null> {
    const subscription = await getStripe().subscriptions.retrieve(subscriptionId, {
      expand: ['latest_invoice.payment_intent']
    });

    const invoice = subscription.latest_invoice;
    if (typeof invoice === 'object' && invoice !== null) {
      const paymentIntent = (invoice as any).payment_intent;
      if (typeof paymentIntent === 'object' && paymentIntent !== null) {
        return paymentIntent.client_secret || null;
      }
    }

    return null;
  }

  // Cancel subscription
  async cancelSubscription(userId: number): Promise<void> {
    const user = await storage.getUser(userId);
    if (!user || !user.stripeSubscriptionId) {
      throw new Error('No active subscription found');
    }

    await getStripe().subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    await storage.updateUserSubscriptionInfo(
      user.id,
      user.stripeSubscriptionId,
      'canceled',
      'free'
    );
  }

  // Resume subscription
  async resumeSubscription(userId: number): Promise<void> {
    const user = await storage.getUser(userId);
    if (!user || !user.stripeSubscriptionId) {
      throw new Error('No subscription found');
    }

    await getStripe().subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: false
    });

    const subscription = await storage.getSubscriptionByUserId(userId);
    if (subscription) {
      const metadata = subscription.metadata as any;
      await storage.updateUserSubscriptionInfo(
        user.id,
        user.stripeSubscriptionId,
        'active',
        metadata?.tier || 'basic'
      );
    }
  }

  // Create payment intent for one-time payments
  async createPaymentIntent(userId: number, amount: number, currency: string = 'usd'): Promise<{ clientSecret: string }> {
    const user = await storage.getUser(userId);
    if (!user) throw new Error('User not found');

    const customerId = await this.getOrCreateCustomer(user);

    const paymentIntent = await getStripe().paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      metadata: {
        userId: user.id.toString()
      }
    });

    // Record payment in database
    await storage.createPayment({
      userId: user.id,
      stripePaymentIntentId: paymentIntent.id,
      amount,
      currency,
      status: paymentIntent.status,
      metadata: {
        stripeCustomerId: customerId
      }
    });

    return { clientSecret: paymentIntent.client_secret! };
  }

  // Add payment method
  async addPaymentMethod(userId: number, paymentMethodId: string): Promise<PaymentMethod> {
    const user = await storage.getUser(userId);
    if (!user) throw new Error('User not found');

    const customerId = await this.getOrCreateCustomer(user);

    // Attach payment method to customer
    await getStripe().paymentMethods.attach(paymentMethodId, {
      customer: customerId
    });

    // Get payment method details
    const stripePaymentMethod = await getStripe().paymentMethods.retrieve(paymentMethodId);

    // Save to database
    const paymentMethod = await storage.createPaymentMethod({
      userId: user.id,
      provider: 'stripe',
      type: stripePaymentMethod.type,
      lastFour: stripePaymentMethod.card?.last4,
      brand: stripePaymentMethod.card?.brand,
      country: stripePaymentMethod.card?.country,
      expiryMonth: stripePaymentMethod.card?.exp_month,
      expiryYear: stripePaymentMethod.card?.exp_year,
      providerPaymentMethodId: paymentMethodId
    });

    return paymentMethod;
  }

  // Set default payment method
  async setDefaultPaymentMethod(userId: number, paymentMethodId: string): Promise<void> {
    const user = await storage.getUser(userId);
    if (!user || !user.stripeCustomerId) throw new Error('User not found');

    await getStripe().customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });

    await storage.setDefaultPaymentMethod(userId, paymentMethodId);
  }

  // Get user's payment methods
  async getUserPaymentMethods(userId: number): Promise<PaymentMethod[]> {
    return await storage.getUserPaymentMethods(userId);
  }

  // Process webhook with enhanced security
  async processWebhook(signature: string, payload: string): Promise<void> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[SECURITY] STRIPE_WEBHOOK_SECRET not configured');
      throw new Error('Webhook configuration error');
    }

    let event: Stripe.Event;
    try {
      // Verify webhook signature to prevent spoofing attacks
      event = getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
      console.log(`[AUDIT] Webhook verified: ${event.type} - ${event.id}`);
    } catch (err: any) {
      console.error('[SECURITY] Webhook signature verification failed:', {
        error: err.message,
        timestamp: new Date().toISOString()
      });
      throw new Error('Invalid webhook signature');
    }

    // Check if we've already processed this event
    const existingEvent = await storage.getWebhookEventByStripeId(event.id);
    if (existingEvent?.processed) {
      return;
    }

    // Record the event
    const webhookEvent = await storage.createWebhookEvent({
      stripeEventId: event.id,
      type: event.type,
      data: event.data as any
    });

    // Process based on event type
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }

    // Mark as processed
    await storage.markWebhookEventProcessed(webhookEvent.id.toString());
  }

  // Handle subscription update
  private async handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    if (typeof customer === 'string' || customer.deleted) return;

    const userId = parseInt(customer.metadata.userId);
    if (!userId) return;

    // Update subscription in database
    const dbSubscription = await storage.getSubscriptionByProviderSubscriptionId(subscription.id);
    if (dbSubscription) {
      await storage.updateSubscription(dbSubscription.id, {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      });
    }

    // Update user subscription info
    const tier = subscription.items.data[0]?.price.metadata?.tier || 'basic';
    await storage.updateUserSubscriptionInfo(userId, subscription.id, subscription.status, tier);
  }

  // Handle subscription deleted
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    if (typeof customer === 'string' || customer.deleted) return;

    const userId = parseInt(customer.metadata.userId);
    if (!userId) return;

    await storage.updateUserSubscriptionInfo(userId, '', 'canceled', 'free');
  }

  // Handle payment succeeded
  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    if (!invoice.payment_intent) return;

    const paymentIntentId = typeof invoice.payment_intent === 'string' 
      ? invoice.payment_intent 
      : invoice.payment_intent.id;

    await storage.updatePaymentStatus(paymentIntentId, 'succeeded');
  }

  // Handle payment failed
  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    if (!invoice.payment_intent) return;

    const paymentIntentId = typeof invoice.payment_intent === 'string' 
      ? invoice.payment_intent 
      : invoice.payment_intent.id;

    await storage.updatePaymentStatus(paymentIntentId, 'failed');
  }

  // Check user subscription status
  async checkUserSubscriptionStatus(userId: number): Promise<{
    hasActiveSubscription: boolean;
    tier: string;
    features: string[];
  }> {
    const user = await storage.getUser(userId);
    if (!user) {
      return { hasActiveSubscription: false, tier: 'free', features: SUBSCRIPTION_TIERS.free.features };
    }

    const isActive = user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing';
    const tier = user.subscriptionTier || 'free';
    const tierConfig = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS] || SUBSCRIPTION_TIERS.free;

    return {
      hasActiveSubscription: isActive,
      tier,
      features: tierConfig.features
    };
  }
}

export const paymentService = new PaymentService();