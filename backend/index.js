require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const axios = require('axios');

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Stripe Checkout session creation endpoint
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { plan, email, successUrl, cancelUrl, country } = req.body;

    // Validate required fields
    if (!plan) {
      return res.status(400).json({ error: 'Plan is required' });
    }

    // Define plan price IDs from Stripe
    const planPriceIds = {
      weekly: 'price_1ReOQ7FEfjI8S6GYiTNrAvPb', // £4.50
      monthly: 'price_1ReOLjFEfjI8S6GYAe7YSlOt', // £11.99
    };

    const priceId = planPriceIds[plan];
    if (!priceId) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'link'], // Enable both card and Link payments
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription', // Use subscription mode for recurring payments
      customer_email: email,
      allow_promotion_codes: true, // Enable coupon codes
      billing_address_collection: 'required',
      success_url: successUrl || `${req.headers.origin || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.origin || 'http://localhost:3000'}/payment`,
      locale: country === 'US' ? 'en' : 'auto', // Set locale based on country
      metadata: {
        plan: plan,
        customer_email: email,
        country: country || 'GB',
      },
      subscription_data: {
        metadata: {
          plan: plan,
          customer_email: email,
          country: country || 'GB',
        },
      },
    });

    res.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error('Error creating Stripe Checkout session:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message 
    });
  }
});

// Verify Stripe Checkout session endpoint
app.post('/api/verify-session', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Return session data
    res.json({
      sessionId: session.id,
      plan: session.metadata.plan,
      customerEmail: session.customer_email,
      paymentStatus: session.payment_status,
      subscriptionId: session.subscription?.id,
      customerId: session.customer?.id,
      amountTotal: session.amount_total,
      currency: session.currency,
      createdAt: session.created,
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    res.status(500).json({ 
      error: 'Failed to verify session',
      details: error.message 
    });
  }
});

// Stripe webhook handler for checkout events
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Checkout completed:', session.id);
      console.log('Customer:', session.customer_email);
      console.log('Plan:', session.metadata.plan);
      
      // Here you would typically:
      // 1. Update user subscription in your database
      // 2. Send confirmation email
      // 3. Grant access to premium features
      break;
      
    case 'customer.subscription.created':
      const subscription = event.data.object;
      console.log('Subscription created:', subscription.id);
      console.log('Plan:', subscription.metadata.plan);
      console.log('Current period end:', new Date(subscription.current_period_end * 1000));
      break;
      
    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object;
      console.log('Subscription updated:', updatedSubscription.id);
      console.log('Status:', updatedSubscription.status);
      console.log('Current period end:', new Date(updatedSubscription.current_period_end * 1000));
      
      // Handle subscription status changes
      if (updatedSubscription.status === 'active') {
        console.log('Subscription is active');
        // Update user's subscription status in database
      } else if (updatedSubscription.status === 'past_due') {
        console.log('Subscription is past due - payment failed');
        // Notify user about payment failure
      } else if (updatedSubscription.status === 'canceled') {
        console.log('Subscription was canceled');
        // Update user's subscription status to expired
      } else if (updatedSubscription.status === 'unpaid') {
        console.log('Subscription is unpaid');
        // Update user's subscription status to expired
      }
      break;
      
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      console.log('Subscription deleted:', deletedSubscription.id);
      console.log('Deletion reason:', deletedSubscription.cancellation_reason);
      
      // Update user's subscription status to expired
      // This is the main event for subscription expiration
      break;
      
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      console.log('Payment failed for invoice:', failedInvoice.id);
      console.log('Customer:', failedInvoice.customer);
      console.log('Amount due:', failedInvoice.amount_due);
      
      // Handle failed payment - subscription will be marked as past_due
      break;
      
    case 'invoice.payment_succeeded':
      const successfulInvoice = event.data.object;
      console.log('Payment succeeded for invoice:', successfulInvoice.id);
      console.log('Customer:', successfulInvoice.customer);
      
      // Handle successful payment - subscription will be marked as active
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Validate coupon code endpoint
app.post('/validate-coupon', async (req, res) => {
  const { couponCode } = req.body;
  
  if (!couponCode || !couponCode.trim()) {
    return res.status(400).json({ 
      valid: false, 
      error: 'Coupon code is required.' 
    });
  }

  const trimmedCode = couponCode.trim().toUpperCase();
  
  // For now, only SALAMOVIC is valid
  // In production, you'd look this up in your database or Stripe
  if (trimmedCode === 'SALAMOVIC') {
    res.json({ 
      valid: true, 
      code: trimmedCode,
      message: 'Coupon code is valid!' 
    });
  } else {
    res.json({ 
      valid: false, 
      error: 'Invalid coupon code.' 
    });
  }
});

// Create subscription endpoint
app.post('/create-subscription', async (req, res) => {
  const { plan, couponCode, paymentMethodId, email, userId } = req.body;
  
  // Map plan IDs to Stripe price IDs
  const priceMap = {
    weekly: 'price_1ReOQ7FEfjI8S6GYiTNrAvPb',
    monthly: 'price_1ReOLjFEfjI8S6GYAe7YSlOt',
  };
  
  const priceId = priceMap[plan];
  if (!priceId) {
    return res.status(400).json({ error: 'Invalid plan selected.' });
  }

  if (!paymentMethodId) {
    return res.status(400).json({ error: 'Payment method ID is required.' });
  }

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  // Validate coupon code (trim whitespace and check if empty)
  const trimmedCouponCode = couponCode ? couponCode.trim() : '';
  const hasValidCoupon = trimmedCouponCode.length > 0;

  try {
    // Create a new customer with email and metadata
    const customer = await stripe.customers.create({
      email: email,
      metadata: {
        supabase_user_id: userId || '',
        signup_email: email
      }
    });
    
    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    // Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    
    // Prepare subscription parameters
    const subscriptionParams = {
      customer: customer.id,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        supabase_user_id: userId || '',
        signup_email: email,
        plan: plan
      }
    };

    // Handle promotion code if provided
    if (hasValidCoupon) {
      // For now, use the specific promotion code ID you provided
      // In production, you might want to look this up dynamically
      if (trimmedCouponCode.toUpperCase() === 'SALAMOVIC') {
        subscriptionParams.discounts = [{
          promotion_code: 'promo_1RgTYDFEfjI8S6GYmY5YR8sB'
        }];
      } else {
        return res.status(400).json({ error: 'Invalid promotion code.' });
      }
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create(subscriptionParams);
    
    console.log(`Created customer: ${customer.id} for user: ${userId || 'anonymous'}`);
    if (hasValidCoupon) {
      console.log(`Applied promotion code: ${trimmedCouponCode} (Active: true)`);
    }
    console.log(`Created subscription: ${subscription.id}`);
    
    res.json({ 
      success: true,
      subscriptionId: subscription.id,
      customerId: customer.id,
      status: subscription.status,
      appliedCoupon: hasValidCoupon ? trimmedCouponCode : null
    });
  } catch (err) {
    console.error('Stripe error:', err);
    
    // Provide more specific error messages
    let errorMessage = 'An error occurred while creating your subscription.';
    
    if (err.type === 'StripeCardError') {
      errorMessage = err.message || 'Your card was declined. Please try a different card.';
    } else if (err.type === 'StripeInvalidRequestError') {
      errorMessage = 'Invalid request. Please check your payment details.';
    } else if (err.type === 'StripeAPIError') {
      errorMessage = 'Payment service error. Please try again later.';
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

// AI Chat endpoint
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  
  if (!message || !message.trim()) {
    return res.status(400).json({ 
      error: 'Message is required.' 
    });
  }

  try {
    // For now, return a simple response
    // In production, you'd integrate with OpenAI, Anthropic, or another AI service
    const response = `Thank you for your message: "${message}". This is a Christian apologetics AI assistant. I'm here to help you defend your faith with biblical wisdom and evidence. How can I assist you today?`;
    
    res.json({ 
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'An error occurred while processing your message.' 
    });
  }
});

// Check subscription status endpoint
app.post('/check-subscription', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    console.log('Checking subscription for email:', email);
    
    // Find customer by email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    if (customers.data.length === 0) {
      console.log('No customer found for email:', email);
      return res.json({ 
        hasSubscription: false, 
        subscription: null 
      });
    }

    const customer = customers.data[0];
    console.log('Found customer:', customer.id);

    // Get all subscriptions for this customer (not just active ones)
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 1,
      status: 'all' // Get all statuses to check for expired/canceled
    });

    if (subscriptions.data.length === 0) {
      console.log('No subscriptions found for customer:', customer.id);
      return res.json({ 
        hasSubscription: false, 
        subscription: null 
      });
    }

    const subscription = subscriptions.data[0];
    console.log('Found subscription:', subscription.id, 'Status:', subscription.status);
    console.log('Current period end:', new Date(subscription.current_period_end * 1000));
    console.log('Current time:', new Date());

    // Check if subscription is actually active and not expired
    const now = Math.floor(Date.now() / 1000);
    const isExpired = subscription.current_period_end < now;
    const isActive = subscription.status === 'active' && !isExpired;
    const isPastDue = subscription.status === 'past_due';
    const isCanceled = subscription.status === 'canceled';
    const isUnpaid = subscription.status === 'unpaid';

    console.log('Subscription analysis:', {
      status: subscription.status,
      isExpired,
      isActive,
      isPastDue,
      isCanceled,
      isUnpaid,
      currentPeriodEnd: subscription.current_period_end,
      now
    });

    // Determine if user has an active subscription
    const hasSubscription = isActive || isPastDue; // Allow past_due as they might fix payment

    res.json({
      hasSubscription,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan: subscription.metadata.plan || 'unknown',
        currentPeriodEnd: subscription.current_period_end,
        customerId: customer.id,
        isExpired,
        isPastDue,
        isCanceled,
        isUnpaid
      }
    });

  } catch (err) {
    console.error('Error checking subscription:', err);
    res.status(500).json({ error: 'Failed to check subscription status.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
}); 