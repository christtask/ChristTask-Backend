# Stripe Checkout Integration Setup Guide

## 🚀 Complete Stripe Checkout Integration

This guide will help you set up a secure, production-ready Stripe Checkout integration with both card and Link payment options.

## 📋 Prerequisites

1. **Stripe Account**: Create a Stripe account at [stripe.com](https://stripe.com)
2. **Node.js**: Version 16 or higher
3. **Environment Variables**: Set up secure API keys

## 🔐 Environment Variables Setup

### 1. Create `.env` file in your backend directory:

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_live_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Frontend URL (for redirects)
FRONTEND_URL=https://yourdomain.com
```

### 2. Get Your Stripe Keys:

1. **Go to Stripe Dashboard** → Developers → API Keys
2. **Copy your keys**:
   - Publishable key (starts with `pk_live_`)
   - Secret key (starts with `sk_live_`)

### 3. Set Up Webhook Endpoint:

1. **Go to Stripe Dashboard** → Developers → Webhooks
2. **Add endpoint**: `https://yourdomain.com/api/webhook`
3. **Select events**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. **Copy webhook secret** (starts with `whsec_`)

## 🛠️ Backend Setup

### 1. Install Dependencies:

```bash
cd backend
npm install stripe express cors dotenv
```

### 2. Verify Backend Endpoints:

Your backend now includes these secure endpoints:

- `POST /api/create-checkout-session` - Creates Stripe Checkout sessions
- `POST /api/verify-session` - Verifies completed sessions
- `POST /api/webhook` - Handles Stripe webhooks
- `POST /create-subscription` - Legacy subscription endpoint

### 3. Test Backend:

```bash
cd backend
npm start
```

Visit `http://localhost:3000` - should see "Backend is running!"

## 🎨 Frontend Setup

### 1. Update Stripe Configuration:

In your frontend, make sure you're using the correct publishable key:

```javascript
// In your Stripe provider setup
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
```

### 2. Add Environment Variables:

Create `.env` in your frontend root:

```bash
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key_here
REACT_APP_BACKEND_URL=https://yourdomain.com
```

## 🔒 Security Best Practices

### 1. Environment Variables:
- ✅ Never commit `.env` files to git
- ✅ Use different keys for development/production
- ✅ Rotate keys regularly

### 2. Backend Security:
- ✅ Validate all input data
- ✅ Use HTTPS in production
- ✅ Implement rate limiting
- ✅ Log security events

### 3. Frontend Security:
- ✅ Never expose secret keys in frontend
- ✅ Validate user input
- ✅ Use HTTPS for all requests

## 🧪 Testing

### 1. Test Cards:

Use these test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

### 2. Test Link Payments:

1. Use test mode in Stripe Dashboard
2. Create test Link accounts
3. Test the complete flow

## 📱 Payment Flow

### 1. User Journey:
1. User selects plan (Weekly £4.50 or Monthly £11.99)
2. Enters email address
3. Clicks "Subscribe" button
4. Redirected to Stripe Checkout
5. Completes payment with card or Link
6. Redirected to success page
7. Webhook processes subscription

### 2. Success Page Features:
- ✅ Session verification
- ✅ Subscription details display
- ✅ Next steps guidance
- ✅ Direct links to dashboard/chat

## 🚨 Error Handling

### 1. Common Issues:

**Payment Declined:**
- Check card details
- Verify billing address
- Try different payment method

**Webhook Failures:**
- Check webhook endpoint URL
- Verify webhook secret
- Check server logs

**Session Verification Failed:**
- Ensure session ID is valid
- Check payment status
- Verify backend connectivity

### 2. Monitoring:

Set up monitoring for:
- Failed payments
- Webhook delivery failures
- API errors
- Subscription cancellations

## 🔄 Webhook Events

Your webhook handles these events:

- `checkout.session.completed` - Payment successful
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.deleted` - Subscription cancelled

## 📊 Analytics

Track these metrics:
- Conversion rate
- Payment success rate
- Average order value
- Customer lifetime value

## 🆘 Support

### 1. Stripe Support:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

### 2. Common Solutions:

**Payment Not Processing:**
- Check API keys
- Verify webhook setup
- Test with Stripe CLI

**Redirect Issues:**
- Check success/cancel URLs
- Verify domain configuration
- Test in incognito mode

## ✅ Checklist

- [ ] Environment variables configured
- [ ] Stripe keys set up
- [ ] Webhook endpoint configured
- [ ] Frontend updated with new keys
- [ ] Success page created
- [ ] Error handling implemented
- [ ] Testing completed
- [ ] Production deployment ready

## 🎯 Next Steps

1. **Deploy to production**
2. **Set up monitoring**
3. **Configure analytics**
4. **Test with real payments**
5. **Monitor webhook events**

Your Stripe Checkout integration is now complete and secure! 🎉 