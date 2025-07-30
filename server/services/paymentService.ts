import Stripe from 'stripe';
import { db } from '../db';
import { subscriptions, paymentMethods, transactions } from '../../shared/subscriptionSchema';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Payment Provider Interface for multi-platform support
export interface PaymentProvider {
  processPayment(amount: number, currency: string, userId: number): Promise<PaymentResult>;
  createSubscription(planId: string, userId: number): Promise<SubscriptionResult>;
  cancelSubscription(subscriptionId: string): Promise<boolean>;
  supportedCountries: string[];
  supportedCurrencies: string[];
  providerName: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  provider: string;
  error?: string;
}

export interface SubscriptionResult {
  success: boolean;
  subscriptionId: string;
  provider: string;
  error?: string;
}

// Stripe Provider Implementation
export class StripeProvider implements PaymentProvider {
  private stripe: Stripe;
  supportedCountries = ['US', 'CA', 'GB', 'EU', 'AU', 'JP', 'SG', 'MX', 'BR'];
  supportedCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'SGD', 'MXN', 'BRL'];
  providerName = 'stripe';

  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is required');
    }
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
    });
  }

  async processPayment(amount: number, currency: string, userId: number): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: { userId: userId.toString() }
      });

      return {
        success: true,
        transactionId: paymentIntent.id,
        provider: this.providerName
      };
    } catch (error: any) {
      return {
        success: false,
        transactionId: '',
        provider: this.providerName,
        error: error.message
      };
    }
  }

  async createSubscription(planId: string, userId: number): Promise<SubscriptionResult> {
    try {
      // Get or create Stripe customer
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user[0]) throw new Error('User not found');

      // Get or create customer ID from raw SQL since column is new
      const customerQuery = await db.execute(sql`SELECT stripe_customer_id FROM users WHERE id = ${userId}`);
      let customerId = customerQuery.rows[0]?.stripe_customer_id;
      
      if (!customerId) {
        const customer = await this.stripe.customers.create({
          email: user[0].email,
          metadata: { userId: userId.toString() }
        });
        customerId = customer.id;
        // Update user with Stripe customer ID using raw SQL
        await db.execute(sql`UPDATE users SET stripe_customer_id = ${customerId} WHERE id = ${userId}`);
      }

      // Create subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: planId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent']
      });

      // Store subscription in database
      await db.insert(subscriptions).values({
        userId,
        planId,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : undefined,
        currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : undefined,
        paymentProvider: this.providerName,
        providerSubscriptionId: subscription.id
      });

      return {
        success: true,
        subscriptionId: subscription.id,
        provider: this.providerName
      };
    } catch (error: any) {
      return {
        success: false,
        subscriptionId: '',
        provider: this.providerName,
        error: error.message
      };
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });
      
      // Update database
      await db.update(subscriptions)
        .set({ cancelAtPeriodEnd: true })
        .where(eq(subscriptions.providerSubscriptionId, subscriptionId));
      
      return true;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return false;
    }
  }

  async createPaymentIntent(amount: number, currency: string): Promise<{ clientSecret: string }> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
    });
    return { clientSecret: paymentIntent.client_secret! };
  }
}

// Crypto Provider for universal fallback (USDT)
export class CryptoProvider implements PaymentProvider {
  supportedCountries = ['ALL']; // Works everywhere
  supportedCurrencies = ['USDT', 'BTC', 'ETH'];
  providerName = 'crypto';

  async processPayment(amount: number, currency: string, userId: number): Promise<PaymentResult> {
    // Implementation would integrate with crypto payment gateway
    // For now, return structure
    return {
      success: true,
      transactionId: `crypto_${Date.now()}`,
      provider: this.providerName
    };
  }

  async createSubscription(planId: string, userId: number): Promise<SubscriptionResult> {
    // Crypto subscriptions would use smart contracts or recurring payment requests
    return {
      success: true,
      subscriptionId: `crypto_sub_${Date.now()}`,
      provider: this.providerName
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    // Cancel crypto subscription
    return true;
  }
}

// Payment Provider Factory
export class PaymentProviderFactory {
  private static providers: Map<string, PaymentProvider> = new Map();

  static {
    // Initialize providers
    this.providers.set('stripe', new StripeProvider());
    this.providers.set('crypto', new CryptoProvider());
  }

  static getProvider(country: string): PaymentProvider {
    // Special cases for specific countries
    if (country === 'RU' || country === 'BY' || country === 'KZ') {
      // For Russia and CIS countries, use crypto
      return this.providers.get('crypto')!;
    }

    // Default to Stripe for supported countries
    const stripeProvider = this.providers.get('stripe')!;
    if (stripeProvider.supportedCountries.includes(country)) {
      return stripeProvider;
    }

    // Fallback to crypto for unsupported countries
    return this.providers.get('crypto')!;
  }

  static getProviderByName(name: string): PaymentProvider | undefined {
    return this.providers.get(name);
  }
}

// Import sql for raw queries
import { sql } from 'drizzle-orm';

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: ['basic_profile', 'view_events', 'join_groups', '5_posts_per_month'],
  },
  enthusiast: {
    id: 'price_enthusiast', // Stripe price ID
    name: 'Enthusiast',
    price: 9.99,
    currency: 'USD',
    features: ['unlimited_posts', 'priority_support', 'advanced_search', 'event_rsvp_priority'],
  },
  professional: {
    id: 'price_professional', // Stripe price ID
    name: 'Professional',
    price: 24.99,
    currency: 'USD',
    features: ['event_creation', 'analytics_dashboard', 'promotion_tools', 'verified_badge', 'custom_url'],
  },
  enterprise: {
    id: 'price_enterprise', // Stripe price ID
    name: 'Enterprise',
    price: 99.99,
    currency: 'USD',
    features: ['multi_city_management', 'api_access', 'white_label', 'dedicated_support', 'custom_features'],
  }
};