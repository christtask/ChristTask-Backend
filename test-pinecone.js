require('dotenv').config({ path: '.env.local' });
const { Pinecone } = require('@pinecone-database/pinecone');

async function testPinecone() {
  try {
    console.log('Testing Pinecone connection...');
    console.log('API Key:', process.env.PINECONE_API_KEY ? 'Present' : 'Missing');
    console.log('Index Name:', process.env.PINECONE_INDEX_NAME);
    
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
    
    // Try to describe the index to test the connection
    const stats = await index.describeIndexStats();
    console.log('✅ Pinecone connection successful!');
    console.log('Index stats:', stats);
    
  } catch (error) {
    console.error('❌ Pinecone connection failed:', error.message);
  }
}

testPinecone(); 