# ESA Life CEO 44x21s: Payment Flow Test Guide
Date: August 2, 2025

## 🟢 Payment Flow Testing Instructions

Since you're currently viewing the app, here's how to test the Stripe payment integration:

### Step 1: Navigate to Subscribe Page
Go to: **https://[your-app-url]/subscribe**

You should see 5 subscription tiers:
- **Free** - $0/month
- **Basic** - $5/month  
- **Enthusiast** - $9.99/month
- **Professional** - $24.99/month
- **Enterprise** - $99.99/month

### Step 2: Select a Paid Tier
Click "Upgrade" on any paid tier (Basic, Enthusiast, Professional, or Enterprise)

### Step 3: Checkout Page
You'll be redirected to the checkout page where you'll see:
- Stripe Payment Element (card input form)
- Secure payment indicators
- Back button to return to plans

### Step 4: Enter Test Payment Details
Use these test card details:
- **Card Number**: 4242 4242 4242 4242
- **Expiry Date**: Any future date (e.g., 12/34)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP/Postal Code**: Any 5 digits (e.g., 10001)
- **Email**: Your email (for receipt)

### Step 5: Complete Payment
Click "Complete Payment" button

### Expected Results:
✅ Payment processes successfully
✅ Success toast notification appears
✅ Redirect to billing dashboard
✅ Subscription active in your account
✅ Payment appears in Stripe dashboard
✅ Webhook event logged in Stripe

### Test Different Scenarios:

**Test Card Numbers**:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Insufficient funds: `4000 0000 0000 9995`
- Processing error: `4000 0000 0000 0119`

### Troubleshooting:
If you encounter any issues:
1. Check browser console for errors
2. Verify all 3 Stripe keys are set
3. Check Stripe dashboard for webhook events
4. Ensure you're using test mode keys

### What Happens Behind the Scenes:
1. POST to `/api/payments/subscribe` creates subscription
2. Client secret returned for payment confirmation
3. Stripe Elements securely handles card details
4. Payment confirmed via Stripe API
5. Webhook updates subscription status
6. User redirected to billing dashboard

Ready to test? Navigate to /subscribe to begin!