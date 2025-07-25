require('dotenv').config();
const { generateEmbedding, generateChatCompletion } = require('./lib/openai');
const { searchSimilarChunks } = require('./lib/pinecone');

async function testRAGStepByStep() {
  console.log('🧪 Testing RAG system step by step...');
  
  try {
    // Step 1: Test OpenAI API key
    console.log('1. Testing OpenAI API key...');
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      throw new Error('Missing OpenAI API key');
    }
    console.log('✅ OpenAI API key found');
    
    // Step 2: Test embedding generation
    console.log('2. Testing embedding generation...');
    const testQuery = 'What is the Trinity?';
    const embedding = await generateEmbedding(testQuery);
    console.log('✅ Embedding generated, length:', embedding.length);
    
    // Step 3: Test Pinecone search
    console.log('3. Testing Pinecone search...');
    const searchResults = await searchSimilarChunks(embedding, 3);
    console.log('✅ Pinecone search completed, found:', searchResults.length, 'results');
    
    // Step 4: Test chat completion
    console.log('4. Testing chat completion...');
    const messages = [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: testQuery }
    ];
    const response = await generateChatCompletion(messages, 0.7, 500);
    console.log('✅ Chat completion successful');
    console.log('Response:', response.substring(0, 100) + '...');
    
    console.log('🎉 All RAG steps working!');
    
  } catch (error) {
    console.error('❌ RAG test failed at step:', error.message);
    console.error('Full error:', error);
  }
}

testRAGStepByStep(); 