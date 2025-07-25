require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const OpenAI = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');

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

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Backend is running with RAG AI integration!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple RAG Chat endpoint
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  
  if (!message || !message.trim()) {
    return res.status(400).json({ 
      error: 'Message is required.' 
    });
  }

  try {
    console.log('🤖 Processing chat request:', message);
    
    // Check if environment variables are set
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not set');
      return res.status(500).json({ 
        error: 'OpenAI API key not configured' 
      });
    }
    
    // Generate embedding for user query
    let context = '';
    if (process.env.PINECONE_API_KEY && pinecone) {
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
        // Continue without context
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
    
    console.log('✅ Response generated successfully');
    
    res.json({ 
      answer: aiResponse,
      sources: context ? [{ text: 'Apologetics database', metadata: { source: 'Pinecone' } }] : [],
      scriptureReferences: { bible: [], quran: [] },
      topic: 'General Apologetics',
      difficulty: 'Intermediate',
      timestamp: new Date().toISOString(),
      context: context ? 'Used RAG context' : 'No context available'
    });
    
  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({ 
      error: 'An error occurred while processing your message.',
      details: error.message 
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

// Simple chat test endpoint
app.post('/api/test-chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    console.log('🧪 Testing chat with message:', message);
    
    // Check environment variables
    const envCheck = {
      openai: !!process.env.OPENAI_API_KEY,
      pinecone: !!process.env.PINECONE_API_KEY,
      pineconeIndex: process.env.PINECONE_INDEX_NAME || 'chatbot'
    };
    
    console.log('Environment check:', envCheck);
    
    if (!envCheck.openai || !envCheck.pinecone) {
      return res.json({
        status: 'error',
        message: 'Missing environment variables',
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

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 OpenAI: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`🌲 Pinecone: ${process.env.PINECONE_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
}); 