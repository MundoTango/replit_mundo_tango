import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import {
  validateCSRFToken,
  paymentRateLimiter,
  subscriptionRateLimiter,
  sanitizeError,
  createWebhookSignatureVerifier,
  auditPaymentEvent
} from '../../server/middleware/security';

// ESA-44x21 Layer 11: Testing & Observability Layer
// Critical security tests for payment protection

describe('Payment Security Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
      body: {},
      session: {},
      path: '/api/payments/subscribe',
      ip: '127.0.0.1'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn()
    };
    next = jest.fn();
  });

  describe('CSRF Token Validation', () => {
    it('should pass validation with matching CSRF tokens', () => {
      const token = 'valid-csrf-token';
      req.session = { csrfToken: token };
      req.headers = { 'x-csrf-token': token };

      validateCSRFToken(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject request with missing CSRF token', () => {
      req.session = { csrfToken: 'token' };
      req.headers = {};

      validateCSRFToken(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid CSRF token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request with mismatched CSRF tokens', () => {
      req.session = { csrfToken: 'token1' };
      req.headers = { 'x-csrf-token': 'token2' };

      validateCSRFToken(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid CSRF token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should skip CSRF validation for webhook endpoints', () => {
      req.path = '/api/payments/webhooks/stripe';
      
      validateCSRFToken(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('Webhook Signature Verification', () => {
    it('should verify valid webhook signature', () => {
      const secret = 'webhook_secret';
      const body = JSON.stringify({ event: 'test' });
      const crypto = require('crypto');
      const signature = crypto
        .createHmac('sha256', secret)
        .update(body, 'utf8')
        .digest('hex');

      req.headers = { 'x-webhook-signature': signature };
      req.body = JSON.parse(body);

      const verifier = createWebhookSignatureVerifier(secret, 'x-webhook-signature');
      verifier(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject webhook with invalid signature', () => {
      const verifier = createWebhookSignatureVerifier('secret', 'x-webhook-signature');
      req.headers = { 'x-webhook-signature': 'invalid' };
      req.body = { event: 'test' };

      verifier(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid signature' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject webhook with missing signature', () => {
      const verifier = createWebhookSignatureVerifier('secret', 'x-webhook-signature');
      req.headers = {};
      req.body = { event: 'test' };

      verifier(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing signature' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('PII Sanitization', () => {
    it('should remove sensitive data from error messages', () => {
      const error = new Error('Failed to process stripeCustomerId_cus_123456 for user@email.com');
      error.code = 'PAYMENT_ERROR';

      const sanitized = sanitizeError(error);

      expect(sanitized.message).not.toContain('cus_123456');
      expect(sanitized.message).not.toContain('user@email.com');
      expect(sanitized.message).toContain('[REDACTED]');
      expect(sanitized.code).toBe('PAYMENT_ERROR');
    });

    it('should handle errors without messages', () => {
      const error = { code: 'UNKNOWN' };
      
      const sanitized = sanitizeError(error);

      expect(sanitized.message).toBe('An error occurred');
      expect(sanitized.code).toBe('UNKNOWN');
    });

    it('should sanitize multiple sensitive fields', () => {
      const error = new Error(
        'Payment failed for email test@example.com with card ending in 4242 and stripeCustomerId cus_123'
      );

      const sanitized = sanitizeError(error);

      expect(sanitized.message).not.toContain('test@example.com');
      expect(sanitized.message).not.toContain('4242');
      expect(sanitized.message).not.toContain('cus_123');
      expect(sanitized.message.match(/\[REDACTED\]/g)?.length).toBeGreaterThan(2);
    });
  });

  describe('Audit Logging', () => {
    it('should log payment events without PII', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      auditPaymentEvent(123, 'payment_intent_created', {
        amount: 1000,
        currency: 'usd',
        email: 'user@example.com', // Should not be logged
        stripeCustomerId: 'cus_123' // Should not be logged
      });

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][1];
      expect(logCall).toMatchObject({
        userId: 123,
        action: 'payment_intent_created',
        metadata: {
          amount: 1000,
          currency: 'usd'
        }
      });
      expect(logCall.metadata.email).toBeUndefined();
      expect(logCall.metadata.stripeCustomerId).toBeUndefined();

      consoleSpy.mockRestore();
    });
  });
});

describe('Rate Limiting', () => {
  it('should limit payment requests to 5 per 15 minutes', () => {
    expect(paymentRateLimiter).toBeDefined();
    expect(paymentRateLimiter.windowMs).toBe(15 * 60 * 1000);
    expect(paymentRateLimiter.max).toBe(5);
  });

  it('should limit subscription requests to 10 per 15 minutes', () => {
    expect(subscriptionRateLimiter).toBeDefined();
    expect(subscriptionRateLimiter.windowMs).toBe(15 * 60 * 1000);
    expect(subscriptionRateLimiter.max).toBe(10);
  });
});