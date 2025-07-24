const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Stripe payment intent creation
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { plan, email, name, couponCode } = req.body;
    
    // Define plan price IDs from Stripe
    const planPriceIds = {
      weekly: 'price_1ReOQ7FEfjI8S6GYiTNrAvPb', // £4.50
      monthly: 'price_1ReOLjFEfjI8S6GYAe7YSlOt' // £11.99
    };
    
    const priceId = planPriceIds[plan];
    
    if (!priceId) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    // Default amount in pence
    let amount = plan === 'weekly' ? 450 : 1199;
    let appliedCoupon = null;
    if (couponCode) {
      try {
        const coupon = await stripe.coupons.retrieve(couponCode);
        if (!coupon.valid) {
          return res.status(400).json({ error: 'Invalid or expired coupon' });
        }
        appliedCoupon = coupon;
        if (coupon.percent_off) {
          amount = Math.round(amount * (1 - coupon.percent_off / 100));
        } else if (coupon.amount_off) {
          amount = Math.max(0, amount - coupon.amount_off);
        }
      } catch (err) {
        return res.status(400).json({ error: 'Invalid coupon code' });
      }
    }

    // Create payment intent using Stripe price ID
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Discounted amount if coupon applied
      currency: 'gbp',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        plan: plan,
        customer_email: email,
        customer_name: name,
        stripe_price_id: priceId,
        coupon: couponCode || ''
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      priceId: priceId,
      discountedAmount: amount,
      coupon: appliedCoupon
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Stripe webhook handler
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
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      console.log('Plan:', paymentIntent.metadata.plan);
      console.log('Customer:', paymentIntent.metadata.customer_email);
      console.log('Price ID:', paymentIntent.metadata.stripe_price_id);
      
      // Here you would typically:
      // 1. Update user subscription in your database
      // 2. Send confirmation email
      // 3. Grant access to premium features based on plan
      if (paymentIntent.metadata.plan === 'weekly') {
        console.log('Granting weekly access to ChristTask');
      } else if (paymentIntent.metadata.plan === 'monthly') {
        console.log('Granting monthly access to ChristTask');
      }
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      console.log('Customer:', failedPayment.metadata.customer_email);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Stripe Checkout session creation endpoint
app.post('/api/create-checkout-session', async (req, res) => {
  const { plan, email } = req.body;

  // Define plan price IDs from Stripe
  const planPriceIds = {
    weekly: 'price_1ReOQ7FEfjI8S6GYiTNrAvPb', // £4.50
    monthly: 'price_1ReOLjFEfjI8S6GYAe7YSlOt' // £11.99
  };

  const priceId = planPriceIds[plan];
  if (!priceId) {
    return res.status(400).json({ error: 'Invalid plan selected' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email,
      allow_promotion_codes: true, // Enables promo code field
      success_url: 'http://localhost:8080/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:8080/cancel',
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('Error creating Stripe Checkout session:', err);
    res.status(500).json({ error: 'Failed to create Stripe Checkout session' });
  }
});

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hello World from the backend!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

module.exports = app; 