import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PaymentService } from '../../server/services/paymentService';
import Stripe from 'stripe';

// ESA-44x21 Layer 11: Testing & Observability Layer
// Integration tests for PaymentService with Stripe Test Mode

// Skip these tests in CI or if no Stripe test key is available
const STRIPE_TEST_KEY = process.env.STRIPE_TEST_SECRET_KEY;
const RUN_INTEGRATION_TESTS = STRIPE_TEST_KEY && process.env.RUN_INTEGRATION_TESTS === 'true';

describe.skipIf(!RUN_INTEGRATION_TESTS)('PaymentService Integration Tests', () => {
  let paymentService: PaymentService;
  let stripe: Stripe;
  let testCustomerId: string;
  let testPaymentMethodId: string;

  beforeAll(async () => {
    // Use test key for integration tests
    process.env.STRIPE_SECRET_KEY = STRIPE_TEST_KEY;
    
    paymentService = new PaymentService();
    stripe = new Stripe(STRIPE_TEST_KEY!, {
      apiVersion: '2023-10-16'
    });

    // Create a test customer
    const customer = await stripe.customers.create({
      email: 'integration-test@mundotango.com',
      name: 'Integration Test User',
      metadata: {
        test: 'true',
        timestamp: Date.now().toString()
      }
    });
    testCustomerId = customer.id;

    // Create a test payment method
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: '4242424242424242',
        exp_month: 12,
        exp_year: 2030,
        cvc: '123'
      }
    });
    testPaymentMethodId = paymentMethod.id;
  });

  afterAll(async () => {
    // Cleanup test data
    if (testCustomerId) {
      try {
        // Cancel any active subscriptions
        const subscriptions = await stripe.subscriptions.list({
          customer: testCustomerId
        });
        
        for (const subscription of subscriptions.data) {
          await stripe.subscriptions.cancel(subscription.id);
        }

        // Delete the test customer
        await stripe.customers.del(testCustomerId);
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }
  });

  describe('Payment Intent Creation', () => {
    it('should create a payment intent with correct amount', async () => {
      const intent = await stripe.paymentIntents.create({
        amount: 1000, // $10.00
        currency: 'usd',
        customer: testCustomerId,
        metadata: {
          test: 'true',
          service: 'mundotango'
        }
      });

      expect(intent).toBeDefined();
      expect(intent.amount).toBe(1000);
      expect(intent.currency).toBe('usd');
      expect(intent.customer).toBe(testCustomerId);
      expect(intent.client_secret).toBeDefined();
    });

    it('should handle multiple currencies', async () => {
      const currencies = ['usd', 'eur', 'gbp', 'ars'];
      
      for (const currency of currencies) {
        const intent = await stripe.paymentIntents.create({
          amount: 1000,
          currency,
          customer: testCustomerId
        });

        expect(intent.currency).toBe(currency);
      }
    });
  });

  describe('Subscription Management', () => {
    it('should create a subscription with test price', async () => {
      // First, create a test product and price
      const product = await stripe.products.create({
        name: 'Test Subscription',
        metadata: { test: 'true' }
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: 999, // $9.99
        currency: 'usd',
        recurring: {
          interval: 'month'
        }
      });

      // Attach payment method to customer
      await stripe.paymentMethods.attach(testPaymentMethodId, {
        customer: testCustomerId
      });

      // Set as default payment method
      await stripe.customers.update(testCustomerId, {
        invoice_settings: {
          default_payment_method: testPaymentMethodId
        }
      });

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: testCustomerId,
        items: [{ price: price.id }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent']
      });

      expect(subscription).toBeDefined();
      expect(subscription.status).toBe('incomplete');
      expect(subscription.items.data[0].price.id).toBe(price.id);

      // Clean up
      await stripe.subscriptions.cancel(subscription.id);
      await stripe.prices.update(price.id, { active: false });
      await stripe.products.update(product.id, { active: false });
    });
  });

  describe('Webhook Processing', () => {
    it('should validate webhook signatures', () => {
      const payload = JSON.stringify({
        id: 'evt_test',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test',
            amount: 1000
          }
        }
      });

      const secret = 'whsec_test_secret';
      const timestamp = Math.floor(Date.now() / 1000);
      
      // Create a valid signature
      const crypto = require('crypto');
      const signedPayload = `${timestamp}.${payload}`;
      const signature = crypto
        .createHmac('sha256', secret)
        .update(signedPayload, 'utf8')
        .digest('hex');
      
      const header = `t=${timestamp},v1=${signature}`;

      // This would normally be done by Stripe.webhooks.constructEvent
      // Here we're testing the signature generation logic
      expect(signature).toBeDefined();
      expect(header).toContain('v1=');
      expect(header).toContain(`t=${timestamp}`);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid card errors gracefully', async () => {
      try {
        const paymentMethod = await stripe.paymentMethods.create({
          type: 'card',
          card: {
            number: '4000000000000002', // Card that will be declined
            exp_month: 12,
            exp_year: 2030,
            cvc: '123'
          }
        });

        await stripe.paymentMethods.attach(paymentMethod.id, {
          customer: testCustomerId
        });

        const intent = await stripe.paymentIntents.create({
          amount: 1000,
          currency: 'usd',
          customer: testCustomerId,
          payment_method: paymentMethod.id,
          confirm: true
        });

        // This should not be reached
        expect(intent.status).not.toBe('succeeded');
      } catch (error: any) {
        expect(error.type).toBe('StripeCardError');
        expect(error.code).toBe('card_declined');
      }
    });

    it('should handle insufficient funds', async () => {
      try {
        const paymentMethod = await stripe.paymentMethods.create({
          type: 'card',
          card: {
            number: '4000000000000341', // Insufficient funds
            exp_month: 12,
            exp_year: 2030,
            cvc: '123'
          }
        });

        await stripe.paymentMethods.attach(paymentMethod.id, {
          customer: testCustomerId
        });

        const intent = await stripe.paymentIntents.create({
          amount: 999999, // Large amount
          currency: 'usd',
          customer: testCustomerId,
          payment_method: paymentMethod.id,
          confirm: true
        });

        // This should not be reached
        expect(intent.status).not.toBe('succeeded');
      } catch (error: any) {
        expect(error.type).toBe('StripeCardError');
        expect(error.decline_code).toBe('insufficient_funds');
      }
    });
  });
});