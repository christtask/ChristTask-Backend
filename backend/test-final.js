const axios = require('axios');

async function testFinal() {
  console.log('🧪 Final deployment test...\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get('https://christtask-backend.onrender.com/');
    console.log('✅ Health check passed:', healthResponse.data.message);
    
    // Test 2: Chat endpoint
    console.log('\n2. Testing chat endpoint...');
    const chatResponse = await axios.post('https://christtask-backend.onrender.com/api/chat', {
      message: 'What is the Trinity?'
    });
    
    console.log('✅ Chat response received!');
    console.log('Answer length:', chatResponse.data.answer?.length || 0);
    console.log('First 150 chars:', chatResponse.data.answer?.substring(0, 150) + '...');
    console.log('Sources found:', chatResponse.data.sources?.length || 0);
    console.log('Topic:', chatResponse.data.topic);
    console.log('Difficulty:', chatResponse.data.difficulty);
    
    console.log('\n🎉 SUCCESS! Your RAG chatbot is working correctly!');
    console.log('\n💡 Your frontend should now receive proper RAG responses instead of static answers.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      console.log('\n🔧 Troubleshooting steps:');
      console.log('1. Check Render logs in the dashboard');
      console.log('2. Verify environment variables are set correctly');
      console.log('3. Make sure OpenAI and Pinecone keys are valid');
      console.log('4. Try redeploying the service');
    }
  }
}

testFinal(); 