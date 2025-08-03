require('dotenv').config();

console.log('🔍 Checking deployed environment variables...\n');

// Check all relevant environment variables
const envVars = [
  'NODE_ENV',
  'PORT',
  'OPENAI_API_KEY',
  'PINECONE_API_KEY', 
  'PINECONE_ENVIRONMENT',
  'PINECONE_INDEX_NAME',
  'STRIPE_SECRET_KEY',
  'SUPABASE_URL'
];

envVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Show first few characters for security
    const displayValue = value.length > 10 ? value.substring(0, 10) + '...' : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`❌ ${varName}: Not set`);
  }
});

console.log('\n🔍 Testing Pinecone connection...');

// Test Pinecone connection
try {
  const { searchSimilarChunks } = require('./lib/pinecone');
  console.log('✅ Pinecone module loaded');
  
  // Try a simple test
  const testEmbedding = new Array(1536).fill(0.1); // Dummy embedding
  const results = await searchSimilarChunks(testEmbedding, 1);
  console.log('✅ Pinecone search successful, found:', results.length, 'results');
  
} catch (error) {
  console.error('❌ Pinecone test failed:', error.message);
  console.log('This explains why RAG is falling back to simple responses.');
} 