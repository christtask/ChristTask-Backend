const fetch = require('node-fetch');

async function testDeployedAPI() {
  console.log('🧪 Testing deployed backend API...\n');
  
  try {
    const response = await fetch('https://christtask-backend.onrender.com/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'What is the evidence for Jesus being God?'
      })
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      console.error('❌ API call failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error body:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('\n✅ API Response:');
    console.log('- Answer:', data.answer ? data.answer.substring(0, 200) + '...' : 'No answer field');
    console.log('- Response:', data.response ? data.response.substring(0, 200) + '...' : 'No response field');
    console.log('- Context:', data.context);
    console.log('- Sources count:', data.sources ? data.sources.length : 'No sources');
    console.log('- Topic:', data.topic);
    console.log('- Difficulty:', data.difficulty);
    
    if (data.sources && data.sources.length > 0) {
      console.log('\n📚 Sample Source:');
      console.log('- Text:', data.sources[0].text ? data.sources[0].text.substring(0, 100) + '...' : 'No text');
      console.log('- Metadata:', data.sources[0].metadata);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDeployedAPI(); 