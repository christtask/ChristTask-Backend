require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const axios = require('axios');
const OpenAI = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');

// Local fallback function
function fallback() {
  return "This is a fallback response. The full RAG system is temporarily unavailable.";
}

const app = express();
const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Initialize OpenAI
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Initialize Pinecone
const pinecone = process.env.PINECONE_API_KEY ? new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
}) : null;

// Configure CORS to allow your frontend domain
app.use(cors({
  origin: [
    'https://christ-task-mu.vercel.app',
    'https://christtask.com',
    'https://www.christtask.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Health check
app.get('/', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({
    message: 'Backend is running with AI integration - Updated!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    status: 'healthy'
  });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  console.log('🧪 Test endpoint requested');
  res.json({
    message: 'Backend API is working!',
    timestamp: new Date().toISOString(),
    endpoints: ['/api/chat', '/api/test-rag', '/api/test-chat', '/create-subscription', '/check-subscription']
  });
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

// AI Chat endpoint
app.post('/api/chat', async (req, res) => {
  console.log('📨 Received chat request');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  const { message } = req.body;
  
  if (!message || !message.trim()) {
    console.log('❌ No message provided');
    return res.status(400).json({ 
      error: 'Message is required.' 
    });
  }

  try {
    console.log('🤖 Processing chat request:', message);
    
    // For now, return a simple response
    res.json({
      answer: `Thank you for your message: "${message}". This is a Christian apologetics AI assistant. I'm here to help you defend your faith with biblical wisdom and evidence. How can I assist you today?`,
      sources: [],
      scriptureReferences: [],
      topic: 'General',
      difficulty: 'Beginner',
      timestamp: new Date().toISOString(),
      context: 'Simple response'
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'An error occurred while processing your message.',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
}); 