import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { PaymentService } from '../../server/services/paymentService';
import Stripe from 'stripe';

// ESA-44x21 Layer 11: Testing & Observability Layer
// Comprehensive tests for PaymentService

// Mock Stripe
jest.mock('stripe');

// Mock storage
const mockStorage = {
  getUser: jest.fn(),
  getUserByReplitId: jest.fn(),
  createCustomer: jest.fn(),
  updateUserStripeInfo: jest.fn(),
  createSubscription: jest.fn(),
  getSubscriptionByUserId: jest.fn(),
  getSubscriptionByProviderSubscriptionId: jest.fn(),
  updateSubscription: jest.fn(),
  createPayment: jest.fn(),
  updatePaymentStatus: jest.fn(),
  createPaymentMethod: jest.fn(),
  getUserPaymentMethods: jest.fn(),
  setDefaultPaymentMethod: jest.fn(),
  getWebhookEventByStripeId: jest.fn(),
  createWebhookEvent: jest.fn(),
  markWebhookEventProcessed: jest.fn(),
  updateUserSubscriptionInfo: jest.fn()
};

// Mock Stripe instance
const mockStripeInstance = {
  customers: {
    create: jest.fn(),
    retrieve: jest.fn(),
    update: jest.fn()
  },
  subscriptions: {
    create: jest.fn(),
    retrieve: jest.fn(),
    update: jest.fn(),
    cancel: jest.fn()
  },
  paymentIntents: {
    create: jest.fn(),
    retrieve: jest.fn()
  },
  setupIntents: {
    create: jest.fn(),
    retrieve: jest.fn()
  },
  paymentMethods: {
    attach: jest.fn(),
    retrieve: jest.fn()
  },
  products: {
    list: jest.fn()
  },
  prices: {
    list: jest.fn()
  },
  webhooks: {
    constructEvent: jest.fn()
  }
};

describe('PaymentService', () => {
  let paymentService: PaymentService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup Stripe mock
    (Stripe as unknown as jest.Mock).mockReturnValue(mockStripeInstance);
    
    // Setup environment
    process.env.STRIPE_SECRET_KEY = 'test_stripe_key';
    process.env.STRIPE_WEBHOOK_SECRET = 'test_webhook_secret';
    
    // Override the storage import in PaymentService
    jest.doMock('../../server/storage', () => ({
      storage: mockStorage
    }));
    
    paymentService = new PaymentService();
  });

  afterEach(() => {
    jest.resetModules();
  });

  describe('createCustomer', () => {
    it('should create a Stripe customer and update user info', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User'
      };
      
      const mockStripeCustomer = {
        id: 'cus_test123',
        email: 'test@example.com'
      };

      mockStorage.getUser.mockResolvedValue(mockUser);
      mockStripeInstance.customers.create.mockResolvedValue(mockStripeCustomer);
      mockStorage.updateUserStripeInfo.mockResolvedValue(undefined);

      const customerId = await paymentService.createCustomer(1);

      expect(customerId).toBe('cus_test123');
      expect(mockStripeInstance.customers.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        metadata: { userId: '1' }
      });
      expect(mockStorage.updateUserStripeInfo).toHaveBeenCalledWith(1, 'cus_test123', '', '', 'free');
    });

    it('should throw error if user not found', async () => {
      mockStorage.getUser.mockResolvedValue(null);

      await expect(paymentService.createCustomer(1)).rejects.toThrow('User not found');
    });

    it('should return existing customer ID if already exists', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        stripeCustomerId: 'cus_existing'
      };

      mockStorage.getUser.mockResolvedValue(mockUser);

      const customerId = await paymentService.createCustomer(1);

      expect(customerId).toBe('cus_existing');
      expect(mockStripeInstance.customers.create).not.toHaveBeenCalled();
    });
  });

  describe('createSubscription', () => {
    it('should create a subscription with valid tier', async () => {
      const mockUser = {
        id: 1,
        stripeCustomerId: 'cus_test123'
      };
      
      const mockSubscription = {
        id: 'sub_test123',
        status: 'active',
        current_period_start: 1234567890,
        current_period_end: 1234567890,
        cancel_at_period_end: false,
        items: {
          data: [{
            price: {
              id: 'price_basic',
              unit_amount: 900
            }
          }]
        }
      };

      mockStorage.getUser.mockResolvedValue(mockUser);
      mockStripeInstance.subscriptions.create.mockResolvedValue(mockSubscription);
      mockStorage.createSubscription.mockResolvedValue({ id: 1 });
      mockStorage.updateUserStripeInfo.mockResolvedValue(undefined);

      const result = await paymentService.createSubscription(1, 'basic');

      expect(result).toBeDefined();
      expect(mockStripeInstance.subscriptions.create).toHaveBeenCalledWith({
        customer: 'cus_test123',
        items: [{
          price: expect.any(String)
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription'
        },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId: '1',
          tier: 'basic'
        }
      });
    });

    it('should throw error for invalid tier', async () => {
      const mockUser = { id: 1, stripeCustomerId: 'cus_test123' };
      mockStorage.getUser.mockResolvedValue(mockUser);

      await expect(paymentService.createSubscription(1, 'invalid')).rejects.toThrow('Invalid subscription tier');
    });

    it('should create customer if not exists', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const mockSubscription = {
        id: 'sub_test123',
        status: 'active',
        items: { data: [{ price: { id: 'price_basic' } }] }
      };

      mockStorage.getUser.mockResolvedValue(mockUser);
      mockStripeInstance.customers.create.mockResolvedValue({ id: 'cus_new' });
      mockStorage.updateUserStripeInfo.mockResolvedValue(undefined);
      mockStripeInstance.subscriptions.create.mockResolvedValue(mockSubscription);
      mockStorage.createSubscription.mockResolvedValue({ id: 1 });

      await paymentService.createSubscription(1, 'basic');

      expect(mockStripeInstance.customers.create).toHaveBeenCalled();
    });
  });

  describe('processWebhook', () => {
    it('should verify webhook signature and process event', async () => {
      const mockEvent = {
        id: 'evt_test123',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_test123',
            customer: 'cus_test123',
            status: 'active',
            current_period_start: 1234567890,
            current_period_end: 1234567890,
            cancel_at_period_end: false,
            items: {
              data: [{
                price: {
                  metadata: { tier: 'basic' }
                }
              }]
            }
          }
        }
      };

      const signature = 'test_signature';
      const payload = JSON.stringify(mockEvent);

      mockStripeInstance.webhooks.constructEvent.mockReturnValue(mockEvent);
      mockStorage.getWebhookEventByStripeId.mockResolvedValue(null);
      mockStorage.createWebhookEvent.mockResolvedValue({ id: 1 });
      mockStripeInstance.customers.retrieve.mockResolvedValue({
        id: 'cus_test123',
        metadata: { userId: '1' }
      });
      mockStorage.getSubscriptionByProviderSubscriptionId.mockResolvedValue({ id: 1 });
      mockStorage.updateSubscription.mockResolvedValue(undefined);
      mockStorage.updateUserSubscriptionInfo.mockResolvedValue(undefined);
      mockStorage.markWebhookEventProcessed.mockResolvedValue(undefined);

      await paymentService.processWebhook(signature, payload);

      expect(mockStripeInstance.webhooks.constructEvent).toHaveBeenCalledWith(
        payload,
        signature,
        'test_webhook_secret'
      );
      expect(mockStorage.createWebhookEvent).toHaveBeenCalled();
      expect(mockStorage.markWebhookEventProcessed).toHaveBeenCalled();
    });

    it('should throw error for invalid signature', async () => {
      mockStripeInstance.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      await expect(
        paymentService.processWebhook('bad_sig', 'payload')
      ).rejects.toThrow('Invalid webhook signature');
    });

    it('should skip already processed events', async () => {
      const mockEvent = {
        id: 'evt_test123',
        type: 'customer.subscription.created',
        data: { object: {} }
      };

      mockStripeInstance.webhooks.constructEvent.mockReturnValue(mockEvent);
      mockStorage.getWebhookEventByStripeId.mockResolvedValue({
        id: 1,
        processed: true
      });

      await paymentService.processWebhook('sig', 'payload');

      expect(mockStorage.createWebhookEvent).not.toHaveBeenCalled();
    });

    it('should handle payment succeeded webhook', async () => {
      const mockEvent = {
        id: 'evt_test123',
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            payment_intent: 'pi_test123'
          }
        }
      };

      mockStripeInstance.webhooks.constructEvent.mockReturnValue(mockEvent);
      mockStorage.getWebhookEventByStripeId.mockResolvedValue(null);
      mockStorage.createWebhookEvent.mockResolvedValue({ id: 1 });
      mockStorage.updatePaymentStatus.mockResolvedValue(undefined);
      mockStorage.markWebhookEventProcessed.mockResolvedValue(undefined);

      await paymentService.processWebhook('sig', JSON.stringify(mockEvent));

      expect(mockStorage.updatePaymentStatus).toHaveBeenCalledWith('pi_test123', 'succeeded');
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription at period end', async () => {
      const mockUser = {
        id: 1,
        stripeSubscriptionId: 'sub_test123'
      };
      
      const cancelledSubscription = {
        id: 'sub_test123',
        cancel_at_period_end: true
      };

      mockStorage.getUser.mockResolvedValue(mockUser);
      mockStripeInstance.subscriptions.update.mockResolvedValue(cancelledSubscription);
      mockStorage.getSubscriptionByUserId.mockResolvedValue({ id: 1 });
      mockStorage.updateSubscription.mockResolvedValue(undefined);

      await paymentService.cancelSubscription(1);

      expect(mockStripeInstance.subscriptions.update).toHaveBeenCalledWith(
        'sub_test123',
        { cancel_at_period_end: true }
      );
      expect(mockStorage.updateSubscription).toHaveBeenCalledWith(1, {
        cancelAtPeriodEnd: true
      });
    });

    it('should throw error if no active subscription', async () => {
      const mockUser = { id: 1 };
      mockStorage.getUser.mockResolvedValue(mockUser);

      await expect(paymentService.cancelSubscription(1)).rejects.toThrow('No active subscription found');
    });
  });

  describe('addPaymentMethod', () => {
    it('should attach payment method and save to database', async () => {
      const mockUser = {
        id: 1,
        stripeCustomerId: 'cus_test123'
      };
      
      const mockPaymentMethod = {
        id: 'pm_test123',
        type: 'card',
        card: {
          last4: '4242',
          brand: 'visa',
          country: 'US',
          exp_month: 12,
          exp_year: 2025
        }
      };

      mockStorage.getUser.mockResolvedValue(mockUser);
      mockStripeInstance.paymentMethods.attach.mockResolvedValue(mockPaymentMethod);
      mockStripeInstance.paymentMethods.retrieve.mockResolvedValue(mockPaymentMethod);
      mockStorage.createPaymentMethod.mockResolvedValue({ id: 1 });
      mockStripeInstance.customers.update.mockResolvedValue({});
      mockStorage.setDefaultPaymentMethod.mockResolvedValue(undefined);

      const result = await paymentService.addPaymentMethod(1, 'pm_test123', true);

      expect(result).toBeDefined();
      expect(mockStripeInstance.paymentMethods.attach).toHaveBeenCalledWith('pm_test123', {
        customer: 'cus_test123'
      });
      expect(mockStorage.createPaymentMethod).toHaveBeenCalled();
      expect(mockStripeInstance.customers.update).toHaveBeenCalled();
    });

    it('should create customer if not exists', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      mockStorage.getUser.mockResolvedValue(mockUser);
      mockStripeInstance.customers.create.mockResolvedValue({ id: 'cus_new' });
      mockStorage.updateUserStripeInfo.mockResolvedValue(undefined);
      mockStripeInstance.paymentMethods.attach.mockResolvedValue({ id: 'pm_test' });
      mockStripeInstance.paymentMethods.retrieve.mockResolvedValue({ 
        id: 'pm_test',
        type: 'card'
      });
      mockStorage.createPaymentMethod.mockResolvedValue({ id: 1 });

      await paymentService.addPaymentMethod(1, 'pm_test123', false);

      expect(mockStripeInstance.customers.create).toHaveBeenCalled();
    });
  });
});