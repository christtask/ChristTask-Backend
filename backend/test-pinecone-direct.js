require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

async function testPineconeDirect() {
  console.log('🔍 Testing Pinecone with direct query approach...');
  
  // Get your actual environment from .env
  const actualEnv = process.env.PINECONE_ENVIRONMENT;
  console.log(`📋 Your configured environment: ${actualEnv}`);
  
  if (!process.env.PINECONE_API_KEY) {
    console.log('❌ PINECONE_API_KEY not found');
    return;
  }
  
  try {
    console.log('🧪 Creating Pinecone client...');
    
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
      environment: actualEnv,
    });
    
    console.log(`✅ Client created with environment: ${actualEnv}`);
    
    // Get the index
    const indexName = process.env.PINECONE_INDEX_NAME || 'chatbot';
    const index = pinecone.index(indexName);
    console.log(`✅ Index reference created: ${indexName}`);
    
    // Try a direct query without initialization
    console.log('🧪 Testing direct query...');
    const testVector = new Array(1536).fill(0.1);
    
    const result = await index.query({
      vector: testVector,
      topK: 1,
      includeMetadata: false
    });
    
    console.log(`✅ SUCCESS! Query worked!`);
    console.log(`📊 Found ${result.matches?.length || 0} matches`);
    console.log(`🎉 Your environment ${actualEnv} is working!`);
    
    return actualEnv;
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    console.log(`Error type: ${error.constructor.name}`);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('🔍 DNS resolution failed - check your environment string');
    } else if (error.message.includes('404')) {
      console.log('🔍 404 error - endpoint not found for this environment');
    } else if (error.message.includes('whoami')) {
      console.log('🔍 whoami endpoint issue - this environment might not support it');
    }
    
    return null;
  }
}

testPineconeDirect().then(workingEnv => {
  if (workingEnv) {
    console.log(`\n🎉 Your environment ${workingEnv} works!`);
    console.log(`💡 Use this in your code: environment: '${workingEnv}'`);
  } else {
    console.log('\n❌ Environment test failed');
    console.log('💡 Check your Pinecone dashboard for the correct environment string');
  }
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
}); 