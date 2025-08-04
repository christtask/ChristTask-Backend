const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testPaymentEndpoints() {
  const baseUrl = 'http://localhost:4242';
  
  console.log('🧪 Testing Payment Functionality...\n');
  
  // Test 1: Health check
  try {
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${baseUrl}/`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
  
  // Test 2: Check subscription
  try {
    console.log('\n2. Testing subscription check...');
    const subResponse = await fetch(`${baseUrl}/check-subscription?email=test@example.com`);
    const subData = await subResponse.json();
    console.log('✅ Subscription check:', subData);
  } catch (error) {
    console.log('❌ Subscription check failed:', error.message);
  }
  
  // Test 3: Create subscription (this will fail without proper payment method)
  try {
    console.log('\n3. Testing subscription creation...');
    const createResponse = await fetch(`${baseUrl}/create-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        plan: 'monthly',
        paymentMethodId: 'pm_test_invalid',
        userId: 'test-user-123'
      })
    });
    const createData = await createResponse.json();
    console.log('✅ Subscription creation response:', createData);
  } catch (error) {
    console.log('❌ Subscription creation failed:', error.message);
  }
  
  // Test 4: Chat endpoint
  try {
    console.log('\n4. Testing chat endpoint...');
    const chatResponse = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello, can you help me with Christian apologetics?'
      })
    });
    const chatData = await chatResponse.json();
    console.log('✅ Chat response:', chatData);
  } catch (error) {
    console.log('❌ Chat endpoint failed:', error.message);
  }
}

// Run the tests
testPaymentEndpoints().catch(console.error); 