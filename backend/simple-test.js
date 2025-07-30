const axios = require('axios');

async function testBackend() {
  console.log('🔍 Testing backend connection...\n');
  
  try {
    // Test 1: Basic health check
    console.log('1. Testing basic health check...');
    const response = await axios.get('https://christtask-backend.onrender.com/', {
      timeout: 10000 // 10 second timeout
    });
    console.log('✅ Health check passed:', response.data);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      console.log('💡 Request timed out - server might be starting up');
    }
    
    if (error.code === 'ENOTFOUND') {
      console.log('💡 Could not find the server - check the URL');
    }
    
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

testBackend(); 