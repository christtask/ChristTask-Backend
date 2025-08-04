require('dotenv').config();
const OpenAI = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');

async function testComponents() {
  console.log('🧪 Testing individual components...\n');

  // Test 1: Environment variables
  console.log('1. Environment Variables:');
  console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Found' : '❌ Missing');
  console.log('PINECONE_API_KEY:', process.env.PINECONE_API_KEY ? '✅ Found' : '❌ Missing');
  console.log('PINECONE_ENVIRONMENT:', process.env.PINECONE_ENVIRONMENT || 'us-east-1');
  console.log('PINECONE_INDEX_NAME:', process.env.PINECONE_INDEX_NAME || 'chatbot');
  console.log('');

  // Test 2: OpenAI initialization
  console.log('2. OpenAI Initialization:');
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('✅ OpenAI initialized successfully');
    
    // Test OpenAI call
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 50,
    });
    console.log('✅ OpenAI API call successful');
    console.log('Response:', completion.choices[0]?.message?.content);
  } catch (error) {
    console.error('❌ OpenAI test failed:', error.message);
  }
  console.log('');

  // Test 3: Pinecone initialization
  console.log('3. Pinecone Initialization:');
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT || 'us-east-1',
    });
    console.log('✅ Pinecone initialized successfully');
    
    // Test Pinecone index access
    const indexName = process.env.PINECONE_INDEX_NAME || 'chatbot';
    const index = pinecone.index(indexName);
    console.log('✅ Pinecone index accessed successfully');
    
    // Test a simple query
    const testEmbedding = new Array(1536).fill(0.1); // Simple test vector
    const queryResponse = await index.query({
      vector: testEmbedding,
      topK: 1,
      includeMetadata: true,
    });
    console.log('✅ Pinecone query successful');
    console.log('Matches found:', queryResponse.matches?.length || 0);
  } catch (error) {
    console.error('❌ Pinecone test failed:', error.message);
  }
  console.log('');

  // Test 4: Embedding generation
  console.log('4. Embedding Generation:');
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: 'test message',
      encoding_format: 'float',
    });
    console.log('✅ Embedding generation successful');
    console.log('Embedding length:', embedding.data[0].embedding.length);
  } catch (error) {
    console.error('❌ Embedding test failed:', error.message);
  }
}

testComponents().catch(console.error); 