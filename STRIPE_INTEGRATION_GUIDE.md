# Stripe Integration Guide for Mundo Tango

## Current Integration Status ✅

Your Stripe account is configured with:
- Test mode API keys (perfect for development)
- Webhook endpoint at: `https://api.mundotango.life/stripe-subscription-webhook`
- 12 events configured for the webhook

## Integration Points in Mundo Tango

### 1. Payment Processing
- **Location**: `/server/services/paymentService.ts`
- **Features**: 
  - One-time payments via `createPaymentIntent`
  - Subscription management via `createSubscription`
  - Customer management
  - Payment history tracking

### 2. Subscription Tiers
Current tiers configured:
- **Free**: Basic access
- **Plus**: $9.99/month - Enhanced features
- **Premium**: $19.99/month - Full access
- **Enterprise**: Custom pricing

### 3. API Endpoints
- `POST /api/payments/create-intent` - Create payment
- `POST /api/subscriptions/create` - Create subscription
- `POST /api/subscriptions/cancel` - Cancel subscription
- `POST /api/subscriptions/update` - Update subscription
- `POST /api/stripe/webhook` - Handle Stripe webhooks

### 4. Frontend Integration
- Payment forms in checkout process
- Subscription management in user settings
- Payment history in user dashboard

## Testing Your Integration

### 1. Test Cards
Use these test card numbers:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

### 2. Test Webhooks
Your webhook is listening for:
- `payment_intent.succeeded`
- `payment_intent.failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- And 7 more events

### 3. Verify Integration
1. Check webhook logs in Stripe Dashboard
2. Test a payment flow in your app
3. Monitor the webhook responses

## Next Steps

1. **Add the webhook signing secret** to verify webhook authenticity
2. **Test the payment flow** end-to-end
3. **Configure subscription products** in Stripe Dashboard
4. **Set up billing portal** for customer self-service

## Security Notes

- Never expose your secret key (sk_) in frontend code
- Always verify webhook signatures
- Use HTTPS for all API calls
- Implement proper error handling

## Going Live

When ready for production:
1. Switch to live mode keys
2. Update webhook endpoint for production
3. Create live subscription products
4. Test with real payment methods