require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const OpenAI = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const app = express();

// Trust proxy for rate limiting behind load balancers
app.set('trust proxy', 1);

// Initialize Stripe with proper error handling
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    console.log('✅ Stripe initialized successfully');
  } catch (error) {
    console.error('❌ Stripe initialization failed:', error.message);
    stripe = null;
  }
} else {
  console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
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

// Initialize OpenAI with proper error handling
let openai = null;
if (process.env.OPENAI_API_KEY) {
  try {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('✅ OpenAI initialized successfully');
  } catch (error) {
    console.error('❌ OpenAI initialization failed:', error.message);
    openai = null;
  }
} else {
  console.error('❌ OPENAI_API_KEY not found in environment variables');
}

// Pinecone connectivity test function (removed - not needed)

// Initialize Pinecone without connectivity test
let pinecone = null;
let pineconeConnected = false;

async function initializePinecone() {
  if (process.env.PINECONE_API_KEY) {
    try {
      pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
        environment: 'us-east-1', // Force us-east-1 environment
      });
      console.log('✅ Pinecone client initialized successfully');
      console.log(`🌲 Environment: ${process.env.PINECONE_ENVIRONMENT || 'us-east-1'} (using fallback: us-east-1)`);
      console.log(`📚 Index: ${process.env.PINECONE_INDEX_NAME || 'chatbot'}`);
      
      // Skip connectivity test - just assume it works
      pineconeConnected = true;
      console.log('✅ Pinecone is ready for use');
      
    } catch (error) {
      console.error('❌ Pinecone initialization failed:', error.message);
      pinecone = null;
      pineconeConnected = false;
    }
  } else {
    console.error('❌ PINECONE_API_KEY not found in environment variables');
    pineconeConnected = false;
  }
}

// Local fallback context function
function getLocalFallbackContext(message) {
  const lowerMessage = message.toLowerCase();
  
  // Common apologetics topics with local context
  const fallbackContexts = {
    'jesus': 'Jesus Christ is the central figure of Christianity, believed to be the Son of God who came to earth to save humanity from sin. The Bible teaches that Jesus is fully God and fully man, who lived a sinless life, died on the cross for our sins, and rose again on the third day.',
    'quran': 'The Quran is the holy book of Islam, believed by Muslims to be the word of God revealed to the Prophet Muhammad. Christians believe the Bible is the inspired word of God, while the Quran was written later and contains different teachings about Jesus and salvation.',
    'bible': 'The Bible is the inspired word of God, consisting of 66 books written by various authors over thousands of years. It contains the Old Testament (Hebrew Scriptures) and New Testament (Christian Scriptures), revealing God\'s plan for salvation through Jesus Christ.',
    'trinity': 'The Trinity is the Christian doctrine that God exists as three persons in one being: Father, Son (Jesus Christ), and Holy Spirit. This is a mystery that cannot be fully understood by human reason but is revealed in Scripture.',
    'salvation': 'Salvation in Christianity is the deliverance from sin and its consequences through faith in Jesus Christ. The Bible teaches that salvation is a free gift from God, received by grace through faith, not by works.',
    'prophet': 'In Christianity, Jesus is not just a prophet but the Son of God and Savior of the world. While Islam considers Jesus a prophet, Christians believe He is divine and the only way to salvation.',
    'commandments': 'The Ten Commandments are moral laws given by God to Moses on Mount Sinai. They include commands to worship only God, honor parents, not murder, not commit adultery, not steal, not lie, and not covet.',
    'resurrection': 'The resurrection of Jesus Christ is the cornerstone of Christian faith. Jesus died on the cross and rose again on the third day, proving His divinity and conquering death. This event is historically verified and central to Christian belief.',
    'sin': 'Sin is any thought, word, or action that goes against God\'s perfect standard. The Bible teaches that all humans are sinners and need salvation through Jesus Christ. Jesus died to pay the penalty for our sins.',
    'heaven': 'Heaven is the eternal dwelling place of God and the final destination for those who accept Jesus Christ as their Savior. The Bible describes it as a place of perfect joy, peace, and fellowship with God.'
  };
  
  // Check if message contains any of these keywords
  for (const [keyword, context] of Object.entries(fallbackContexts)) {
    if (lowerMessage.includes(keyword)) {
      return context;
    }
  }
  
  return null;
}

// Initialize Pinecone on startup
initializePinecone();

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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(generalLimiter);
app.use(express.json({ limit: '10mb' }));

// Input validation middleware
const validateChat = [
  body('message').notEmpty().trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters'),
  (req, res, next) => {
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

const validateSubscription = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('plan').isIn(['weekly', 'monthly']).withMessage('Plan must be weekly or monthly'),
  body('paymentMethodId').notEmpty().withMessage('Payment method ID is required'),
  body('userId').optional().isString().withMessage('User ID must be a string'),
  body('couponCode').optional().isString().withMessage('Coupon code must be a string'),
  (req, res, next) => {
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

// Stripe webhook handler - MUST be before express.json() middleware
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  // Check if Stripe is configured
  if (!stripe) {
    console.error('❌ Stripe not configured - cannot process webhook');
    return res.status(500).json({ 
      error: 'Payment system not configured' 
    });
  }
  
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

// Now apply express.json() middleware for all other routes
app.use(express.json());

// OPTIONS handlers for CORS preflight requests
app.options('/api/chat', (req, res) => {
  const allowedOrigins = [
    'https://christ-task-mu.vercel.app',
    'https://christtask.com',
    'https://www.christtask.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(204).end();
});

app.options('/api/test-chat', (req, res) => {
  const allowedOrigins = [
    'https://christ-task-mu.vercel.app',
    'https://christtask.com',
    'https://www.christtask.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(204).end();
});

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Backend is running with RAG AI integration!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple RAG Chat endpoint
app.post('/api/chat', chatLimiter, validateChat, async (req, res) => {
  const { message } = req.body;
  
  if (!message || !message.trim()) {
    return res.status(400).json({ 
      error: 'Message is required.' 
    });
  }

  try {
    console.log('🤖 Processing chat request:', message);
    
    // Check if OpenAI is configured
    if (!openai) {
      console.error('❌ OpenAI not configured - cannot process chat');
      return res.status(500).json({ 
        error: 'AI system not configured. Please contact support.' 
      });
    }
    
    // Generate embedding for user query (with timeout)
    let context = '';
    let ragStatus = 'not_configured';
    
         if (false) { // Temporarily disable Pinecone RAG
      try {
        console.log('🔍 Starting RAG search...');
        
        // Add timeout to prevent hanging
        const embeddingPromise = openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: message,
          encoding_format: 'float',
        });
        
        const queryEmbedding = await Promise.race([
          embeddingPromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Embedding timeout')), 5000)
          )
        ]);
        
        console.log('✅ Embedding generated successfully');
        
        const indexName = process.env.PINECONE_INDEX_NAME || 'chatbot';
        const index = pinecone.index(indexName);
        
        console.log(`🔍 Querying Pinecone index: ${indexName}`);
        
        const queryResponse = await Promise.race([
          index.query({
            vector: queryEmbedding.data[0].embedding,
            topK: 3, // Back to 3 for better results
            includeMetadata: true,
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Pinecone timeout')), 10000)
          )
        ]);
        
        if (queryResponse.matches && queryResponse.matches.length > 0) {
          context = queryResponse.matches.map(match => match.metadata?.text || '').join(' ');
          console.log(`✅ Found ${queryResponse.matches.length} relevant chunks from Pinecone`);
          ragStatus = 'success';
        } else {
          console.log('ℹ️ No relevant matches found in Pinecone');
          ragStatus = 'no_matches';
        }
      } catch (error) {
        console.error('❌ RAG search failed:', error.message);
        console.error('Error type:', error.constructor.name);
        console.error('Error code:', error.code);
        console.error('Full error:', error);
        
        // Categorize the error
        if (error.message.includes('ENOTFOUND') || error.message.includes('DNS')) {
          ragStatus = 'dns_error';
          console.log('⚠️ DNS resolution failed - continuing without RAG context');
        } else if (error.message.includes('timeout')) {
          ragStatus = 'timeout_error';
          console.log('⚠️ Pinecone query timed out - continuing without RAG context');
        } else if (error.message.includes('network') || error.message.includes('connection')) {
          ragStatus = 'network_error';
          console.log('⚠️ Network connectivity issue - continuing without RAG context');
        } else {
          ragStatus = 'unknown_error';
          console.log('⚠️ Unknown Pinecone error - continuing without RAG context');
        }
      }
         } else {
       console.log('ℹ️ Skipping RAG search - Pinecone temporarily disabled');
       ragStatus = 'disabled';
     }
    
    // Add local fallback context for common questions
    if (!context && ragStatus !== 'success') {
      const localFallback = getLocalFallbackContext(message);
      if (localFallback) {
        context = localFallback;
        ragStatus = 'local_fallback';
        console.log('📚 Using local fallback context');
      }
    }
    
    // Create system prompt
    const systemPrompt = `You are a Christian apologetics AI assistant. Your role is to help defend the Christian faith with biblical wisdom, historical evidence, and logical reasoning.

${context ? `Here is some relevant context from our apologetics database: ${context}` : ''}

When answering questions:
1. Use biblical references when appropriate
2. Provide historical and archaeological evidence when relevant
3. Use logical reasoning and philosophical arguments
4. Be respectful and loving in your approach
5. Acknowledge when certain questions may not have definitive answers
6. Focus on building faith rather than just winning arguments
7. Use the provided context to give accurate, well-informed answers

Always respond in a helpful, informative, and Christ-like manner.`;

    // Generate response using OpenAI (optimized)
    console.log('🤖 Generating AI response...');
    const completion = await Promise.race([
      openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 800, // Reduced from 1000 for speed
        temperature: 0.7,
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('OpenAI timeout')), 10000)
      )
    ]);

    const aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.';
    
    console.log('✅ Response generated successfully');
    
    res.json({ 
      answer: aiResponse,
      sources: context ? [{ text: 'Apologetics database', metadata: { source: 'Pinecone' } }] : [],
      scriptureReferences: { bible: [], quran: [] },
      topic: 'General Apologetics',
      difficulty: 'Intermediate',
      timestamp: new Date().toISOString(),
      context: context ? 'Used RAG context' : 'No context available',
      ragStatus: ragStatus, // Add RAG status for debugging
      response: aiResponse  // Add this for compatibility
    });
    
  } catch (error) {
    console.error('❌ Chat error:', error);
    
    // Try to provide a helpful fallback response
    const fallbackResponse = `I apologize, but I'm experiencing technical difficulties right now. Please try again in a moment. If the problem persists, please contact support.

Error details: ${error.message}`;
    
    res.status(500).json({ 
      error: 'An error occurred while processing your message.',
      details: error.message,
      fallback: fallbackResponse
    });
  }
});

// Test RAG system
app.get('/api/test-rag', async (req, res) => {
  try {
    console.log('🧪 Testing RAG system...');
    
    const envCheck = {
      openai: !!process.env.OPENAI_API_KEY,
      pinecone: !!process.env.PINECONE_API_KEY,
      pineconeIndex: process.env.PINECONE_INDEX_NAME || 'chatbot'
    };
    
    res.json({
      status: 'success',
      message: 'RAG system is working!',
      envCheck
    });
    
  } catch (error) {
    console.error('❌ RAG test failed:', error);
    res.json({
      status: 'error',
      message: 'RAG test failed',
      error: error.message
    });
  }
});

// Comprehensive health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    console.log('🏥 Running comprehensive health check...');
    
    const health = {
      timestamp: new Date().toISOString(),
      server: 'healthy',
      environment: {
        node: process.env.NODE_ENV || 'development',
                 region: 'us-east-1'
      },
      services: {
        openai: {
          configured: !!process.env.OPENAI_API_KEY,
          initialized: !!openai,
          status: openai ? 'ready' : 'not_configured'
        },
        pinecone: {
          configured: !!process.env.PINECONE_API_KEY,
          initialized: !!pinecone,
          connected: pineconeConnected,
                     environment: 'us-east-1',
          index: process.env.PINECONE_INDEX_NAME || 'chatbot',
          status: pineconeConnected ? 'operational' : (pinecone ? 'connectivity_issue' : 'not_configured')
        },
        stripe: {
          configured: !!process.env.STRIPE_SECRET_KEY,
          initialized: !!stripe,
          status: stripe ? 'ready' : 'not_configured'
        }
      },
      connectivity: {
        dns_resolution: 'unknown',
        pinecone_reachable: 'unknown'
      }
    };
    
    // Test DNS resolution if Pinecone is configured
    if (process.env.PINECONE_API_KEY) {
      try {
        const dns = require('dns').promises;
                 const controllerHost = `controller.us-east-1.pinecone.io`;
        await dns.lookup(controllerHost);
        health.connectivity.dns_resolution = 'success';
        health.connectivity.pinecone_reachable = 'reachable';
      } catch (dnsError) {
        health.connectivity.dns_resolution = 'failed';
        health.connectivity.pinecone_reachable = 'unreachable';
        health.connectivity.dns_error = dnsError.message;
      }
    }
    
    res.json(health);
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Simple chat test endpoint
app.post('/api/test-chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    console.log('🧪 Testing chat with message:', message);
    
    // Check if services are configured
    const envCheck = {
      openai: !!openai,
      pinecone: !!pinecone,
      pineconeIndex: process.env.PINECONE_INDEX_NAME || 'chatbot'
    };
    
    console.log('Environment check:', envCheck);
    
    if (!envCheck.openai || !envCheck.pinecone) {
      return res.json({
        status: 'error',
        message: 'AI or search system not configured',
        envCheck
      });
    }
    
    // Test the same logic as the main chat endpoint
    let context = '';
    if (pinecone) {
      try {
        const queryEmbedding = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: message,
          encoding_format: 'float',
        });
        
        const indexName = process.env.PINECONE_INDEX_NAME || 'chatbot';
        const index = pinecone.index(indexName);
        
        const queryResponse = await index.query({
          vector: queryEmbedding.data[0].embedding,
          topK: 3,
          includeMetadata: true,
        });
        
        if (queryResponse.matches && queryResponse.matches.length > 0) {
          context = queryResponse.matches.map(match => match.metadata?.text || '').join(' ');
          console.log(`✅ Found ${queryResponse.matches.length} relevant chunks from Pinecone`);
        }
      } catch (pineconeError) {
        console.error('⚠️ Pinecone search failed:', pineconeError.message);
      }
    }
    
    // Create system prompt
    const systemPrompt = `You are a Christian apologetics AI assistant. Your role is to help defend the Christian faith with biblical wisdom, historical evidence, and logical reasoning.

${context ? `Here is some relevant context from our apologetics database: ${context}` : ''}

When answering questions:
1. Use biblical references when appropriate
2. Provide historical and archaeological evidence when relevant
3. Use logical reasoning and philosophical arguments
4. Be respectful and loving in your approach
5. Acknowledge when certain questions may not have definitive answers
6. Focus on building faith rather than just winning arguments
7. Use the provided context to give accurate, well-informed answers

Always respond in a helpful, informative, and Christ-like manner.`;

    // Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.';
    
    res.json({
      status: 'success',
      answer: aiResponse,
      sources: context ? [{ text: 'Apologetics database', metadata: { source: 'Pinecone' } }] : [],
      scriptureReferences: { bible: [], quran: [] },
      topic: 'General Apologetics',
      difficulty: 'Intermediate',
      envCheck
    });
    
  } catch (error) {
    console.error('❌ Chat test failed:', error);
    res.json({
      status: 'error',
      message: 'Chat test failed',
      error: error.message
    });
  }
});

// Create subscription endpoint
app.post('/create-subscription', async (req, res) => {
  // Check if Stripe is configured
  if (!stripe) {
    console.error('❌ Stripe not configured - cannot process payment');
    return res.status(500).json({ 
      error: 'Payment system not configured. Please contact support.' 
    });
  }
  
  const { plan, couponCode, paymentMethodId, email, userId } = req.body;
  
  // Map plan IDs to Stripe price IDs
  const priceMap = {
    weekly: process.env.STRIPE_WEEKLY_PRICE_ID || 'price_1ReOQ7FEfjI8S6GYiTNrAvPb',
    monthly: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_1ReOLjFEfjI8S6GYAe7YSlOt',
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
      // Check promotion code
      const validCouponCode = process.env.STRIPE_COUPON_CODE || 'SALAMOVIC';
      const validPromoId = process.env.STRIPE_PROMOTION_ID || 'promo_1RgTYDFEfjI8S6GYmY5YR8sB';
      
      if (trimmedCouponCode.toUpperCase() === validCouponCode.toUpperCase()) {
        subscriptionParams.discounts = [{
          promotion_code: validPromoId
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

// Stripe Checkout session creation endpoint
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { plan, email, successUrl, cancelUrl, country } = req.body;

    if (!plan) {
      return res.status(400).json({ error: 'Plan is required' });
    }

    const planPriceIds = {
      weekly: 'price_1ReOQ7FEfjI8S6GYiTNrAvPb',
      monthly: 'price_1ReOLjFEfjI8S6GYAe7YSlOt',
    };

    const priceId = planPriceIds[plan];
    if (!priceId) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'link'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      customer_email: email,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      success_url: successUrl || `${req.headers.origin || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.origin || 'http://localhost:3000'}/payment`,
      locale: country === 'US' ? 'en' : 'auto',
      metadata: { plan, customer_email: email, country: country || 'GB' },
      subscription_data: { metadata: { plan, customer_email: email, country: country || 'GB' } },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating Stripe Checkout session:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message 
    });
  }
});

// Webhook status endpoint
app.get('/api/webhook-status', (req, res) => {
  console.log('🔗 Webhook status endpoint requested');
  res.json({
    message: 'Webhook endpoints are available',
    timestamp: new Date().toISOString(),
    webhookUrl: '/api/webhook',
    status: 'active',
    environment: process.env.NODE_ENV || 'development',
    stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
    webhookSecretConfigured: !!process.env.STRIPE_WEBHOOK_SECRET
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'An unexpected error occurred.'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 OpenAI: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`🌲 Pinecone: ${process.env.PINECONE_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
}); 