require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

async function testPineconeEnvironments() {
  console.log('🔍 Testing different Pinecone environments...');
  
  const possibleEnvironments = [
    'us-east-1',
    'aped-4627-b74a',
    'gcp-starter',
    'us-west1-gcp',
    'us-east1-gcp'
  ];
  
  for (const env of possibleEnvironments) {
    try {
      console.log(`\n🧪 Testing environment: ${env}`);
      
      const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
        environment: env,
      });
      
      console.log(`✅ Successfully created client for ${env}`);
      
      // Try to get index info
      const index = pinecone.index('chatbot');
      console.log(`✅ Successfully created index reference for ${env}`);
      
      // Try a simple query
      const testVector = new Array(1536).fill(0.1);
      const result = await index.query({
        vector: testVector,
        topK: 1,
        includeMetadata: false
      });
      
      console.log(`✅ SUCCESS! Environment ${env} works!`);
      console.log(`📊 Query returned ${result.matches?.length || 0} matches`);
      return env;
      
    } catch (error) {
      console.log(`❌ Environment ${env} failed: ${error.message}`);
      if (error.message.includes('ENOTFOUND')) {
        console.log(`   DNS resolution failed for controller.${env}.pinecone.io`);
      }
    }
  }
  
  console.log('\n❌ No working environment found');
  return null;
}

testPineconeEnvironments().then(workingEnv => {
  if (workingEnv) {
    console.log(`\n🎉 Use this environment: ${workingEnv}`);
  } else {
    console.log('\n❌ No working environment found');
  }
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
}); 