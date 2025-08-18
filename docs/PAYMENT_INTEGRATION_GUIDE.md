# Payment Integration Guide
## ESA-44x21 Compliant Implementation

### Table of Contents
1. [Overview](#overview)
2. [Security Requirements](#security-requirements)
3. [Frontend Integration](#frontend-integration)
4. [Backend Implementation](#backend-implementation)
5. [Testing Guide](#testing-guide)
6. [Troubleshooting](#troubleshooting)

## Overview

The Mundo Tango payment system is built on Stripe and implements comprehensive security measures following the ESA-44x21 framework. This guide covers integration requirements and best practices.

### Architecture
- **Payment Provider**: Stripe
- **Supported Payment Methods**: Credit/Debit Cards
- **Subscription Tiers**: Basic, Enthusiast, Professional, Enterprise
- **Security**: CSRF protection, rate limiting, webhook signature verification

## Security Requirements

### 1. CSRF Protection
All payment endpoints require a valid CSRF token:

```javascript
// Frontend: Get CSRF token
const response = await fetch('/api/auth/csrf-token');
const { csrfToken } = await response.json();

// Include in payment requests
const headers = {
  'Content-Type': 'application/json',
  'X-CSRF-Token': csrfToken
};
```

### 2. Rate Limiting
- Payment endpoints: 5 requests per 15 minutes
- Subscription endpoints: 10 requests per 15 minutes
- General API: 100 requests per 15 minutes

### 3. Authentication
All payment endpoints (except webhooks) require authentication via Replit OAuth.

## Frontend Integration

### 1. Load Stripe.js
```javascript
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
```

### 2. Create Subscription
```javascript
// Get available tiers
const tiersResponse = await fetch('/api/payments/subscription-tiers');
const { data: tiers } = await tiersResponse.json();

// Create subscription
const response = await fetch('/api/payments/subscribe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify({ tier: 'enthusiast' })
});

const { clientSecret, subscriptionId } = await response.json();

// Confirm payment with Stripe Elements
const stripe = await stripePromise;
const result = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: elements.getElement(CardElement),
    billing_details: {
      name: 'User Name',
      email: 'user@example.com'
    }
  }
});
```

### 3. Manage Subscription
```javascript
// Get current subscription
const subResponse = await fetch('/api/payments/subscription');
const { subscription, paymentMethods } = await subResponse.json();

// Cancel subscription
await fetch('/api/payments/cancel-subscription', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken
  }
});

// Resume subscription
await fetch('/api/payments/resume-subscription', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken
  }
});
```

### 4. Payment Methods
```javascript
// Add payment method
const { paymentMethod } = await stripe.createPaymentMethod({
  type: 'card',
  card: elements.getElement(CardElement)
});

await fetch('/api/payments/payment-method', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify({
    paymentMethodId: paymentMethod.id,
    setAsDefault: true
  })
});

// Remove payment method
await fetch(`/api/payments/payment-method/${paymentMethodId}`, {
  method: 'DELETE',
  headers: {
    'X-CSRF-Token': csrfToken
  }
});
```

## Backend Implementation

### 1. Environment Variables
```env
STRIPE_SECRET_KEY=sk_live_... # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_... # Webhook endpoint secret
VITE_STRIPE_PUBLIC_KEY=pk_live_... # Public key for frontend
```

### 2. Webhook Configuration
1. In Stripe Dashboard, add webhook endpoint: `https://yourdomain.com/api/payments/webhook`
2. Select events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
3. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 3. Database Schema
The payment system requires these tables:
- `users` - With stripeCustomerId, stripeSubscriptionId fields
- `subscriptions` - Subscription details
- `payments` - Payment history
- `payment_methods` - Stored payment methods
- `webhook_events` - Webhook processing log

## Testing Guide

### 1. Test Cards
Use these Stripe test cards in development:
- Success: `4242 4242 4242 4242`
- Declined: `4000 0000 0000 0002`
- Insufficient funds: `4000 0000 0000 0341`
- 3D Secure required: `4000 0000 0000 3220`

### 2. Unit Tests
```bash
# Run payment service tests
npm test tests/services/paymentService.test.ts

# Run security middleware tests
npm test tests/security/paymentSecurity.test.ts
```

### 3. Integration Tests
```bash
# Set test key
export STRIPE_TEST_SECRET_KEY=sk_test_...
export RUN_INTEGRATION_TESTS=true

# Run integration tests
npm test tests/services/paymentService.integration.test.ts
```

### 4. Webhook Testing
Use Stripe CLI for local webhook testing:
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5000/api/payments/webhook

# Trigger test events
stripe trigger payment_intent.succeeded
```

## Troubleshooting

### Common Issues

#### 1. CSRF Token Errors
- **Error**: "Invalid CSRF token"
- **Solution**: Ensure you're fetching and including the CSRF token in headers
- **Debug**: Check session configuration and cookie settings

#### 2. Rate Limit Errors
- **Error**: "Too many payment requests"
- **Solution**: Implement exponential backoff or queue requests
- **Debug**: Check rate limit headers in response

#### 3. Webhook Signature Failures
- **Error**: "Invalid webhook signature"
- **Solution**: Verify webhook secret is correct
- **Debug**: Check raw body parsing for webhooks

#### 4. Subscription Creation Failures
- **Error**: "Failed to create subscription"
- **Solution**: Ensure customer has default payment method
- **Debug**: Check Stripe dashboard for detailed error logs

### Security Audit Checklist
- [ ] All payment endpoints use HTTPS
- [ ] CSRF tokens are validated
- [ ] Rate limiting is enforced
- [ ] Webhook signatures are verified
- [ ] PII is not logged
- [ ] Error messages are sanitized
- [ ] Authentication is required
- [ ] Payment methods are tokenized
- [ ] Audit logs exclude sensitive data

### Support
For issues or questions:
1. Check Stripe documentation: https://stripe.com/docs
2. Review ESA-44x21 security guidelines
3. Contact Life CEO support team

---

**Last Updated**: August 2, 2025
**Framework Version**: ESA-44x21s
**Compliance Level**: Payment Security P0 ✅