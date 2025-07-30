const axios = require('axios');

async function testChat() {
  try {
    console.log('🧪 Testing chat endpoint...');
    
    const response = await axios.post('https://christtask-backend.onrender.com/api/chat', {
      message: 'What is the Trinity?'
    });
    
    console.log('✅ Response received:');
    console.log('Answer:', response.data.answer?.substring(0, 200) + '...');
    console.log('Sources:', response.data.sources?.length || 0);
    console.log('Scripture refs:', response.data.scriptureReferences);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testChat(); 