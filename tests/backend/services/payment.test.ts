import { jest } from '@jest/globals';
import Stripe from 'stripe';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      del: jest.fn(),
      list: jest.fn()
    },
    subscriptions: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      cancel: jest.fn(),
      list: jest.fn()
    },
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn(),
      confirm: jest.fn(),
      cancel: jest.fn()
    },
    paymentMethods: {
      attach: jest.fn(),
      detach: jest.fn(),
      list: jest.fn()
    },
    invoices: {
      create: jest.fn(),
      retrieve: jest.fn(),
      pay: jest.fn(),
      list: jest.fn()
    },
    webhookEndpoints: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn()
    },
    prices: {
      list: jest.fn(),
      retrieve: jest.fn()
    }
  }));
});

describe('Payment Service Tests', () => {
  let paymentService: any;
  let mockStripe: any;
  let mockStorage: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Mock storage
    mockStorage = {
      getUserById: jest.fn(),
      updateUser: jest.fn(),
      createPayment: jest.fn(),
      updatePayment: jest.fn(),
      getPayment: jest.fn()
    };

    // Import after mocking
    const { PaymentService } = await import('../../../services/payment');
    paymentService = new PaymentService(mockStorage);
    mockStripe = paymentService.stripe;
  });

  describe('Customer Management', () => {
    it('should create Stripe customer for new user', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User'
      };

      mockStripe.customers.create.mockResolvedValue({
        id: 'cus_test123',
        email: user.email
      });

      const customerId = await paymentService.createCustomer(user);

      expect(customerId).toBe('cus_test123');
      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id }
      });
    });

    it('should handle existing Stripe customer', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        stripeCustomerId: 'cus_existing'
      };

      mockStripe.customers.retrieve.mockResolvedValue({
        id: 'cus_existing',
        email: user.email
      });

      const customerId = await paymentService.getOrCreateCustomer(user);

      expect(customerId).toBe('cus_existing');
      expect(mockStripe.customers.create).not.toHaveBeenCalled();
    });

    it('should update customer information', async () => {
      const customerId = 'cus_test123';
      const updates = {
        email: 'newemail@example.com',
        name: 'Updated Name'
      };

      mockStripe.customers.update.mockResolvedValue({
        id: customerId,
        ...updates
      });

      await paymentService.updateCustomer(customerId, updates);

      expect(mockStripe.customers.update).toHaveBeenCalledWith(
        customerId,
        updates
      );
    });
  });

  describe('Subscription Management', () => {
    it('should create subscription', async () => {
      const user = {
        id: 1,
        stripeCustomerId: 'cus_test123'
      };
      const priceId = 'price_professional';

      mockStripe.subscriptions.create.mockResolvedValue({
        id: 'sub_test123',
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
      });

      const subscription = await paymentService.createSubscription(
        user.stripeCustomerId,
        priceId
      );

      expect(subscription.id).toBe('sub_test123');
      expect(mockStripe.subscriptions.create).toHaveBeenCalledWith({
        customer: user.stripeCustomerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent']
      });
    });

    it('should handle trial periods', async () => {
      const customerId = 'cus_test123';
      const priceId = 'price_premium';
      const trialDays = 14;

      mockStripe.subscriptions.create.mockResolvedValue({
        id: 'sub_trial123',
        status: 'trialing',
        trial_end: Math.floor(Date.now() / 1000) + trialDays * 24 * 60 * 60
      });

      const subscription = await paymentService.createSubscription(
        customerId,
        priceId,
        { trial_period_days: trialDays }
      );

      expect(subscription.status).toBe('trialing');
      expect(mockStripe.subscriptions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          trial_period_days: trialDays
        })
      );
    });

    it('should update subscription', async () => {
      const subscriptionId = 'sub_test123';
      const newPriceId = 'price_premium';

      mockStripe.subscriptions.update.mockResolvedValue({
        id: subscriptionId,
        status: 'active',
        items: { data: [{ price: { id: newPriceId } }] }
      });

      await paymentService.updateSubscription(subscriptionId, newPriceId);

      expect(mockStripe.subscriptions.update).toHaveBeenCalled();
    });

    it('should cancel subscription', async () => {
      const subscriptionId = 'sub_test123';

      mockStripe.subscriptions.cancel.mockResolvedValue({
        id: subscriptionId,
        status: 'canceled',
        canceled_at: Math.floor(Date.now() / 1000)
      });

      const result = await paymentService.cancelSubscription(subscriptionId);

      expect(result.status).toBe('canceled');
      expect(mockStripe.subscriptions.cancel).toHaveBeenCalledWith(
        subscriptionId
      );
    });

    it('should handle subscription at period end', async () => {
      const subscriptionId = 'sub_test123';

      mockStripe.subscriptions.update.mockResolvedValue({
        id: subscriptionId,
        cancel_at_period_end: true
      });

      await paymentService.cancelSubscriptionAtPeriodEnd(subscriptionId);

      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(
        subscriptionId,
        { cancel_at_period_end: true }
      );
    });
  });

  describe('Payment Processing', () => {
    it('should create payment intent', async () => {
      const amount = 5000; // $50.00
      const currency = 'usd';

      mockStripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_test123',
        amount,
        currency,
        client_secret: 'pi_test123_secret',
        status: 'requires_payment_method'
      });

      const paymentIntent = await paymentService.createPaymentIntent(
        amount,
        currency
      );

      expect(paymentIntent.client_secret).toBe('pi_test123_secret');
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount,
        currency,
        automatic_payment_methods: { enabled: true }
      });
    });

    it('should handle payment confirmation', async () => {
      const paymentIntentId = 'pi_test123';

      mockStripe.paymentIntents.retrieve.mockResolvedValue({
        id: paymentIntentId,
        status: 'succeeded',
        amount: 5000,
        metadata: { userId: '1' }
      });

      const result = await paymentService.confirmPayment(paymentIntentId);

      expect(result.status).toBe('succeeded');
      expect(mockStorage.updatePayment).toHaveBeenCalled();
    });

    it('should handle failed payments', async () => {
      const paymentIntentId = 'pi_test123';

      mockStripe.paymentIntents.retrieve.mockResolvedValue({
        id: paymentIntentId,
        status: 'failed',
        last_payment_error: {
          message: 'Card declined'
        }
      });

      await expect(paymentService.confirmPayment(paymentIntentId))
        .rejects.toThrow('Payment failed: Card declined');
    });
  });

  describe('Payment Methods', () => {
    it('should attach payment method to customer', async () => {
      const paymentMethodId = 'pm_test123';
      const customerId = 'cus_test123';

      mockStripe.paymentMethods.attach.mockResolvedValue({
        id: paymentMethodId,
        customer: customerId
      });

      await paymentService.attachPaymentMethod(paymentMethodId, customerId);

      expect(mockStripe.paymentMethods.attach).toHaveBeenCalledWith(
        paymentMethodId,
        { customer: customerId }
      );
    });

    it('should list customer payment methods', async () => {
      const customerId = 'cus_test123';
      const mockPaymentMethods = {
        data: [
          { id: 'pm_1', type: 'card', card: { last4: '4242' } },
          { id: 'pm_2', type: 'card', card: { last4: '1234' } }
        ]
      };

      mockStripe.paymentMethods.list.mockResolvedValue(mockPaymentMethods);

      const methods = await paymentService.listPaymentMethods(customerId);

      expect(methods).toHaveLength(2);
      expect(mockStripe.paymentMethods.list).toHaveBeenCalledWith({
        customer: customerId,
        type: 'card'
      });
    });

    it('should set default payment method', async () => {
      const customerId = 'cus_test123';
      const paymentMethodId = 'pm_test123';

      mockStripe.customers.update.mockResolvedValue({
        id: customerId,
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });

      await paymentService.setDefaultPaymentMethod(customerId, paymentMethodId);

      expect(mockStripe.customers.update).toHaveBeenCalledWith(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });
    });
  });

  describe('Webhook Handling', () => {
    it('should verify webhook signature', () => {
      const payload = JSON.stringify({ type: 'payment_intent.succeeded' });
      const signature = 'test_signature';
      const secret = 'whsec_test';

      // Mock Stripe webhook verification
      const isValid = paymentService.verifyWebhookSignature(
        payload,
        signature,
        secret
      );

      expect(isValid).toBeDefined();
    });

    it('should handle payment success webhook', async () => {
      const event = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test123',
            amount: 5000,
            metadata: { userId: '1', orderId: '123' }
          }
        }
      };

      mockStorage.updatePayment.mockResolvedValue(true);
      mockStorage.updateUser.mockResolvedValue(true);

      await paymentService.handleWebhook(event);

      expect(mockStorage.updatePayment).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ status: 'succeeded' })
      );
    });

    it('should handle subscription updated webhook', async () => {
      const event = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test123',
            customer: 'cus_test123',
            status: 'active',
            current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
          }
        }
      };

      mockStorage.getUserById.mockResolvedValue({ id: 1 });
      mockStorage.updateUser.mockResolvedValue(true);

      await paymentService.handleWebhook(event);

      expect(mockStorage.updateUser).toHaveBeenCalledWith(
        expect.any(Number),
        expect.objectContaining({
          subscriptionStatus: 'active'
        })
      );
    });

    it('should handle subscription cancelled webhook', async () => {
      const event = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_test123',
            customer: 'cus_test123',
            status: 'canceled'
          }
        }
      };

      mockStorage.getUserById.mockResolvedValue({ id: 1 });
      mockStorage.updateUser.mockResolvedValue(true);

      await paymentService.handleWebhook(event);

      expect(mockStorage.updateUser).toHaveBeenCalledWith(
        expect.any(Number),
        expect.objectContaining({
          subscriptionStatus: 'canceled',
          subscriptionTier: 'free'
        })
      );
    });
  });

  describe('Invoice Management', () => {
    it('should create and send invoice', async () => {
      const customerId = 'cus_test123';
      const items = [
        { price: 'price_workshop', quantity: 1 }
      ];

      mockStripe.invoices.create.mockResolvedValue({
        id: 'inv_test123',
        customer: customerId,
        status: 'draft'
      });

      mockStripe.invoices.pay.mockResolvedValue({
        id: 'inv_test123',
        status: 'paid'
      });

      const invoice = await paymentService.createInvoice(customerId, items);

      expect(invoice.status).toBe('paid');
      expect(mockStripe.invoices.create).toHaveBeenCalledWith({
        customer: customerId,
        auto_advance: true
      });
    });

    it('should list customer invoices', async () => {
      const customerId = 'cus_test123';
      const mockInvoices = {
        data: [
          { id: 'inv_1', amount_paid: 5000, status: 'paid' },
          { id: 'inv_2', amount_paid: 3000, status: 'paid' }
        ]
      };

      mockStripe.invoices.list.mockResolvedValue(mockInvoices);

      const invoices = await paymentService.listInvoices(customerId);

      expect(invoices).toHaveLength(2);
      expect(mockStripe.invoices.list).toHaveBeenCalledWith({
        customer: customerId,
        limit: 100
      });
    });
  });

  describe('Refunds', () => {
    it('should process full refund', async () => {
      const paymentIntentId = 'pi_test123';

      mockStripe.refunds = { create: jest.fn() };
      mockStripe.refunds.create.mockResolvedValue({
        id: 'ref_test123',
        amount: 5000,
        status: 'succeeded'
      });

      const refund = await paymentService.createRefund(paymentIntentId);

      expect(refund.status).toBe('succeeded');
      expect(mockStripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: paymentIntentId
      });
    });

    it('should process partial refund', async () => {
      const paymentIntentId = 'pi_test123';
      const refundAmount = 2500; // $25.00

      mockStripe.refunds = { create: jest.fn() };
      mockStripe.refunds.create.mockResolvedValue({
        id: 'ref_test123',
        amount: refundAmount,
        status: 'succeeded'
      });

      const refund = await paymentService.createRefund(
        paymentIntentId,
        refundAmount
      );

      expect(refund.amount).toBe(refundAmount);
      expect(mockStripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: paymentIntentId,
        amount: refundAmount
      });
    });
  });

  describe('Price Management', () => {
    it('should list available subscription prices', async () => {
      const mockPrices = {
        data: [
          {
            id: 'price_basic',
            unit_amount: 1000,
            currency: 'usd',
            recurring: { interval: 'month' }
          },
          {
            id: 'price_premium',
            unit_amount: 2000,
            currency: 'usd',
            recurring: { interval: 'month' }
          }
        ]
      };

      mockStripe.prices.list.mockResolvedValue(mockPrices);

      const prices = await paymentService.listSubscriptionPrices();

      expect(prices).toHaveLength(2);
      expect(prices[0].unit_amount).toBe(1000);
    });
  });

  describe('Error Handling', () => {
    it('should handle Stripe API errors', async () => {
      mockStripe.customers.create.mockRejectedValue({
        type: 'StripeCardError',
        message: 'Card declined'
      });

      await expect(paymentService.createCustomer({
        email: 'test@example.com'
      })).rejects.toThrow('Card declined');
    });

    it('should handle network errors', async () => {
      mockStripe.subscriptions.create.mockRejectedValue(
        new Error('Network error')
      );

      await expect(paymentService.createSubscription(
        'cus_test',
        'price_test'
      )).rejects.toThrow('Network error');
    });

    it('should handle invalid webhook events', async () => {
      const invalidEvent = {
        type: 'unknown.event',
        data: {}
      };

      // Should not throw but log warning
      await expect(paymentService.handleWebhook(invalidEvent))
        .resolves.not.toThrow();
    });
  });
});