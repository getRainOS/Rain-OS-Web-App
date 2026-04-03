# Complete Stripe Payment Setup Guide

## Overview
This guide will walk you through setting up Stripe to enable user payments in your Rain OS Headless AEO Analysis Engine application.

## Prerequisites
- Stripe account (create one at https://stripe.com)
- Node.js application with Stripe SDK installed
- Environment variables properly configured

## Step-by-Step Stripe Dashboard Setup

### 1. Get Your API Keys
1. Log in to your Stripe Dashboard: https://dashboard.stripe.com
2. Navigate to **Developers → API keys**
3. Copy your keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

### 2. Create Products and Pricing
1. Go to **Products** in the Stripe Dashboard
2. Click **"+ Add product"**
3. Create your subscription tiers:

#### Free Tier (Optional - handled in code)
- Name: "Free Plan"
- Description: "5 analyses per month"
- Skip pricing (handled by application logic)

#### Basic Plan Example
- Name: "Basic Plan"
- Description: "50 analyses per month"
- Pricing:
  - Model: Recurring
  - Amount: $9.99/month (or your price)
  - Billing period: Monthly
- After creating, click on the price and add metadata:
  - Key: `analysis_limit`
  - Value: `50`

#### Pro Plan Example
- Name: "Pro Plan"
- Description: "200 analyses per month"
- Pricing:
  - Model: Recurring
  - Amount: $29.99/month
  - Billing period: Monthly
- Add metadata:
  - Key: `analysis_limit`
  - Value: `200`

#### Enterprise Plan Example
- Name: "Enterprise Plan"
- Description: "Unlimited analyses"
- Pricing:
  - Model: Recurring
  - Amount: $99.99/month
  - Billing period: Monthly
- Add metadata:
  - Key: `analysis_limit`
  - Value: `999999` (or a very high number)

### 3. Configure Webhooks
1. Go to **Developers → Webhooks**
2. Click **"+ Add endpoint"**
3. Configure endpoint:
   - **Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`
   - **Events to send**: Select the following:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
4. After creating, reveal and copy the **Signing secret** (starts with `whsec_`)

### 4. Configure Customer Portal
1. Go to **Settings → Billing → Customer portal**
2. Enable the customer portal
3. Configure settings:
   - **Functionality**:
     - ✅ Allow customers to update payment methods
     - ✅ Allow customers to update billing addresses
     - ✅ Allow customers to cancel subscriptions
     - ✅ Allow customers to switch plans (if you want this feature)
   - **Business information**:
     - Add your company name
     - Add support email
     - Add privacy policy and terms of service URLs
4. Save settings

### 5. Set Up Test Mode (Recommended First)
1. Toggle to **Test mode** in the Stripe Dashboard (top right)
2. Use test API keys for development
3. Test cards for payments:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Requires authentication: `4000 0025 0000 3155`
   - Any future expiry date and any 3-digit CVC

## Environment Variables Configuration

Add these to your `.env` file:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_... # Your secret key from Step 1
STRIPE_PUBLISHABLE_KEY=pk_test_... # Your publishable key from Step 1
STRIPE_WEBHOOK_SECRET=whsec_... # Your webhook signing secret from Step 3

# Application URLs
APP_URL=https://yourdomain.com # Your application URL (no trailing slash)
```

## Application Integration

### Frontend Integration

1. **Install Stripe.js**:
```html
<!-- Add to your HTML head -->
<script src="https://js.stripe.com/v3/"></script>
```

Or with npm:
```bash
npm install @stripe/stripe-js
```

2. **Create Checkout Button**:
```javascript
// Example: Creating a subscription checkout session
async function subscribe(priceId) {
  try {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userApiKey}` // User's API key
      },
      body: JSON.stringify({ priceId })
    });

    const { url } = await response.json();

    // Redirect to Stripe Checkout
    window.location.href = url;
  } catch (error) {
    console.error('Error:', error);
  }
}
```

3. **Manage Subscription Button**:
```javascript
// Example: Opening the customer portal
async function manageSubscription() {
  try {
    const response = await fetch('/api/stripe/create-portal-session', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userApiKey}`
      }
    });

    const { url } = await response.json();

    // Redirect to Stripe Customer Portal
    window.location.href = url;
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Backend API Endpoints (Already Implemented)

Your application already has these endpoints configured:

1. **POST /api/stripe/create-checkout-session**
   - Creates a new subscription checkout session
   - Requires: `priceId` in request body
   - Returns: `{ url: "checkout_url" }`

2. **POST /api/stripe/create-portal-session**
   - Creates a billing portal session for subscription management
   - Returns: `{ url: "portal_url" }`

3. **POST /api/stripe/webhook**
   - Handles Stripe webhook events
   - Automatically updates user subscription status

## Testing Your Integration

### 1. Test Checkout Flow
1. Use test mode and test cards
2. Create a checkout session with a test price ID
3. Complete the checkout with card `4242 4242 4242 4242`
4. Verify user subscription status is updated in your database

### 2. Test Webhook Events
1. Use Stripe CLI for local testing:
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe # macOS
# or download from https://stripe.com/docs/stripe-cli

# Login to your Stripe account
stripe login

# Forward events to your local webhook endpoint
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test events
stripe trigger checkout.session.completed
```

### 3. Test Subscription Management
1. Create a test subscription
2. Access the customer portal
3. Try updating payment method
4. Try canceling subscription
5. Verify database updates correctly

## Going Live Checklist

- [ ] Replace test API keys with live keys in production
- [ ] Update webhook endpoint URL to production domain
- [ ] Configure production webhook signing secret
- [ ] Test with real payment method (can refund after)
- [ ] Set up proper error handling and logging
- [ ] Configure retry logic for failed webhooks
- [ ] Set up monitoring and alerts for payment failures
- [ ] Ensure SSL certificate is valid (required for production)
- [ ] Add proper CORS headers if frontend is on different domain
- [ ] Configure rate limiting for API endpoints
- [ ] Set up backup payment recovery emails

## Common Issues and Solutions

### Webhook Signature Verification Failing
- Ensure you're using the raw request body (not parsed JSON)
- Verify the webhook secret matches exactly
- Check that Express middleware isn't modifying the body

### Customer Not Found Errors
- Ensure `stripeCustomerId` is saved to user record after first purchase
- Check that customer wasn't deleted in Stripe Dashboard

### Subscription Status Not Updating
- Verify webhook events are being received (check Stripe Dashboard logs)
- Ensure database update functions are working correctly
- Check for any async/await issues in webhook handler

### Price Metadata Not Found
- Add `analysis_limit` metadata to each price in Stripe Dashboard
- Handle missing metadata with sensible defaults

## Security Best Practices

1. **Never expose secret keys** - Only use publishable keys in frontend
2. **Validate webhook signatures** - Always verify webhooks are from Stripe
3. **Use HTTPS everywhere** - Required for production Stripe integration
4. **Implement idempotency** - Prevent duplicate charges
5. **Log everything** - Keep audit trail of all payment events
6. **Regular security audits** - Review integration periodically

## Support Resources

- Stripe Documentation: https://stripe.com/docs
- API Reference: https://stripe.com/docs/api
- Testing Guide: https://stripe.com/docs/testing
- Webhook Events: https://stripe.com/docs/webhooks/stripe-events
- Support: https://support.stripe.com

## Next Steps

1. Configure your products and prices in Stripe Dashboard
2. Update environment variables
3. Test the complete payment flow
4. Implement frontend UI for subscription selection
5. Add subscription status display in user dashboard
6. Set up email notifications for subscription events