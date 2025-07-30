const axios = require('axios');

const BASE_URL = 'https://christtask-backend.onrender.com';

async function testDeployment() {
  console.log('🧪 Testing deployment...\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ Health check passed:', healthResponse.data.message);
    
    // Test 2: RAG system test
    console.log('\n2. Testing RAG system...');
    const ragTestResponse = await axios.get(`${BASE_URL}/api/test-rag`);
    console.log('✅ RAG test result:', ragTestResponse.data);
    
    // Test 3: Chat endpoint
    console.log('\n3. Testing chat endpoint...');
    const chatResponse = await axios.post(`${BASE_URL}/api/chat`, {
      message: 'What is the Trinity?'
    });
    console.log('✅ Chat response received');
    console.log('Answer length:', chatResponse.data.answer?.length || 0);
    console.log('Sources found:', chatResponse.data.sources?.length || 0);
    console.log('First 100 chars:', chatResponse.data.answer?.substring(0, 100) + '...');
    
    console.log('\n🎉 All tests passed! Your RAG chatbot is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      console.log('\n💡 This might be an environment variable issue. Check your Render dashboard:');
      console.log('1. Go to your service in Render');
      console.log('2. Click on "Environment" tab');
      console.log('3. Verify these variables are set:');
      console.log('   - OPENAI_API_KEY');
      console.log('   - PINECONE_API_KEY');
      console.log('   - PINECONE_INDEX_NAME');
    }
  }
}

testDeployment(); 