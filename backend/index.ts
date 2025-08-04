import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import helmet from 'helmet';
import { body, validationResult, ValidationChain } from 'express-validator';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Stripe with proper error handling
let stripe: Stripe | null = null;
try {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.warn('⚠️ STRIPE_SECRET_KEY not found in environment variables');
  } else {
    stripe = new Stripe(stripeKey, {
      apiVersion: '2025-05-28.basil',
    });
    console.log('✅ Stripe initialized successfully');
  }
} catch (error) {
  console.error('❌ Stripe initialization failed:', error);
  stripe = null;
}

const app = express();

// Types
interface SubscriptionRequest {
  email: string;
  userId?: string;
  plan: 'weekly' | 'monthly';
  paymentMethodId: string;
  couponCode?: string;
}

interface ChatRequest {
  message: string;
}

interface ChatResponse {
  success: boolean;
  answer: string;
  sources: any[];
  scriptureReferences: {
    bible: string[];
    quran: string[];
    torah: string[];
  };
  topic: string;
  difficulty: string;
  timestamp: string;
  context: string;
  response: string;
  error?: string;
}

interface SubscriptionResponse {
  success: boolean;
  subscriptionId?: string;
  customerId?: string;
  status?: string;
  currentPeriodEnd?: number;
  plan?: string;
  error?: string;
}

interface SubscriptionCheckResponse {
  hasSubscription: boolean;
  subscription?: {
    id: string;
    status: string;
    currentPeriodEnd: number;
    plan: string;
  };
  error?: string;
}

// Security headers with helmet
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
  },
}));

// Enhanced rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 chat requests per minute
  message: 'Too many chat requests, please slow down.'
});

const subscriptionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // limit each IP to 5 subscription attempts per 5 minutes
  message: 'Too many subscription attempts, please try again later.'
});

// Middleware
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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(generalLimiter);
app.use(express.json({ limit: '10mb' }));

// Input validation middleware
const validateSubscription: (ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[] = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('plan').isIn(['weekly', 'monthly']).withMessage('Plan must be weekly or monthly'),
  body('paymentMethodId').notEmpty().withMessage('Payment method ID is required'),
  body('userId').optional().isString().withMessage('User ID must be a string'),
  body('couponCode').optional().isString().withMessage('Coupon code must be a string'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }
    next();
  }
];

const validateChat: (ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[] = [
  body('message').notEmpty().trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }
    next();
  }
];

// Stripe Price IDs - Replace with your actual price IDs from Stripe Dashboard
const STRIPE_PRICES: Record<string, string> = {
  weekly: 'price_1ReOQ7FEfjI8S6GYiTNrAvPb',
  monthly: 'price_1ReOLjFEfjI8S6GYAe7YSlOt'
};

// Create recurring subscription
app.post('/create-subscription', subscriptionLimiter, validateSubscription, async (req: Request<{}, {}, SubscriptionRequest>, res: Response<SubscriptionResponse>) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        error: 'Payment system is temporarily unavailable. Please try again later or contact support.'
      });
    }

    const { email, userId, plan, paymentMethodId, couponCode } = req.body;
    
    console.log('Creating subscription for:', { email, plan, userId });
    
    // 1. Create or get customer
    let customer: Stripe.Customer;
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1
    });
    
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      console.log('Found existing customer:', customer.id);
    } else {
      customer = await stripe.customers.create({
        email: email,
        metadata: {
          userId: userId || 'no-user-id'
        }
      });
      console.log('Created new customer:', customer.id);
    }
    
    // 2. Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });
    
    // 3. Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    
    // 4. Create subscription with automatic renewal
    const subscriptionData: Stripe.SubscriptionCreateParams = {
      customer: customer.id,
      items: [{ price: STRIPE_PRICES[plan] }],
      payment_behavior: 'default_incomplete',
      payment_settings: { 
        save_default_payment_method: 'on_subscription' 
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: userId || 'no-user-id',
        plan: plan,
        email: email
      }
    };
    
    // Add coupon if provided
    if (couponCode && couponCode.trim()) {
      (subscriptionData as any).coupon = couponCode.trim();
    }
    
    const subscription = await stripe.subscriptions.create(subscriptionData);
    
    console.log('Subscription created:', subscription.id);
    
    res.json({
      success: true,
      subscriptionId: subscription.id,
      customerId: customer.id,
      status: subscription.status,
      currentPeriodEnd: (subscription as any).current_period_end,
      plan: plan
    });
    
  } catch (error) {
    console.error('Subscription creation error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while creating the subscription.'
    });
  }
});

// Check subscription status
app.get('/check-subscription', async (req: Request, res: Response<SubscriptionCheckResponse>) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        hasSubscription: false,
        error: 'Payment system is temporarily unavailable. Please try again later.'
      });
    }

    const { email } = req.query;
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ 
        hasSubscription: false,
        error: 'Valid email required'
      });
    }
    
    // Find customer by email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });
    
    if (customers.data.length === 0) {
      return res.json({
        hasSubscription: false,
        subscription: undefined
      });
    }
    
    const customer = customers.data[0];
    
    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1
    });
    
    if (subscriptions.data.length === 0) {
      return res.json({
        hasSubscription: false,
        subscription: undefined
      });
    }
    
    const subscription = subscriptions.data[0];
    
    res.json({
      hasSubscription: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: (subscription as any).current_period_end,
        plan: subscription.metadata.plan || 'unknown'
      }
    });
    
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({
      hasSubscription: false,
      error: 'An error occurred while checking subscription status.'
    });
  }
});

// Webhook handler for subscription events
app.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  if (!stripe) {
    return res.status(500).send('Stripe is not configured');
  }

  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!endpointSecret) {
    console.error('Webhook secret not configured');
    return res.status(500).send('Webhook secret not configured');
  }
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  console.log('Webhook event received:', event.type);
  
  switch (event.type) {
    case 'customer.subscription.created':
      console.log('Subscription created:', event.data.object.id);
      break;
      
    case 'customer.subscription.updated':
      console.log('Subscription updated:', event.data.object.id);
      break;
      
    case 'customer.subscription.deleted':
      console.log('Subscription cancelled:', event.data.object.id);
      break;
      
    case 'invoice.payment_succeeded':
      console.log('Payment succeeded for subscription:', (event.data.object as any).subscription);
      break;
      
    case 'invoice.payment_failed':
      console.log('Payment failed for subscription:', (event.data.object as any).subscription);
      // You could send an email to the customer here
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  res.json({ received: true });
});

// OPTIONS handlers for CORS preflight requests
app.options('/api/chat', (req: Request, res: Response) => {
  res.header('Access-Control-Allow-Origin', 'https://www.christtask.com');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(204).end();
});

// Chat endpoint
app.post('/api/chat', chatLimiter, validateChat, async (req: Request<{}, {}, ChatRequest>, res: Response<ChatResponse>) => {
  try {
    const { message } = req.body;
    
    console.log('🤖 Processing chat request:', message);
    
    // Check if environment variables are set
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not set');
      return res.status(500).json({ 
        success: false,
        answer: '',
        sources: [],
        scriptureReferences: { bible: [], quran: [], torah: [] },
        topic: '',
        difficulty: '',
        timestamp: new Date().toISOString(),
        context: '',
        response: '',
        error: 'OpenAI API key not configured'
      });
    }
    
    // For now, return a simple response
    // In the future, you can integrate with your RAG system
    const aiResponse = `Thank you for your message: "${message}". This is a Christian apologetics AI assistant. I'm here to help you defend your faith with biblical wisdom and evidence. How can I assist you today?`;
    
    console.log('✅ Response generated successfully');
    
    res.json({ 
      success: true,
      answer: aiResponse,
      sources: [],
      scriptureReferences: { bible: [], quran: [], torah: [] },
      topic: 'General Apologetics',
      difficulty: 'Intermediate',
      timestamp: new Date().toISOString(),
      context: 'Simple response',
      response: aiResponse
    });
    
  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({ 
      success: false,
      answer: '',
      sources: [],
      scriptureReferences: { bible: [], quran: [], torah: [] },
      topic: '',
      difficulty: '',
      timestamp: new Date().toISOString(),
      context: '',
      response: '',
      error: 'An error occurred while processing your message.'
    });
  }
});

// Health check
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Backend is running!' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'An unexpected error occurred.'
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 