const axios = require('axios');

async function testLiveRAG() {
  console.log('🧪 Testing RAG on live website...');
  
  const testQuestions = [
    'What does the Bible say about Jesus being the Son of God?',
    'How do Christians respond to claims that Jesus was just a prophet?',
    'What is the Trinity and how is it explained in the Bible?'
  ];

  for (const question of testQuestions) {
    try {
      console.log(`\n📝 Testing: "${question}"`);
      
      const response = await axios.post('https://christtask-backend.onrender.com/api/chat', {
        message: question
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });

      console.log('✅ Response received:');
      console.log(`📊 Status: ${response.status}`);
      console.log(`🤖 AI Response: ${response.data.response.substring(0, 200)}...`);
      
      if (response.data.ragStatus) {
        console.log(`🔍 RAG Status: ${response.data.ragStatus}`);
      }
      
      if (response.data.context) {
        console.log(`📚 Context Used: ${response.data.context.substring(0, 100)}...`);
      }

    } catch (error) {
      console.log('❌ Error:');
      if (error.response) {
        console.log(`Status: ${error.response.status}`);
        console.log(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
      } else {
        console.log(`Error: ${error.message}`);
      }
    }
    
    // Wait 2 seconds between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

// Test the health endpoint first
async function testHealth() {
  try {
    console.log('🏥 Testing health endpoint...');
    const response = await axios.get('https://christtask-backend.onrender.com/api/health');
    console.log('✅ Health check response:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
}

async function runTests() {
  await testHealth();
  console.log('\n' + '='.repeat(50));
  await testLiveRAG();
}

runTests().catch(console.error); 