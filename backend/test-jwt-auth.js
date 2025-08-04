const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:3000';

async function testJWT() {
  console.log('🧪 Testing JWT Authentication...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health check...');
    const healthResponse = await fetch(`${BASE_URL}/`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.message);

    // Test 2: Register a new user
    console.log('\n2️⃣ Testing user registration...');
    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const registerData = await registerResponse.json();
    if (registerData.success) {
      console.log('✅ Registration successful:', registerData.message);
      console.log('Token:', registerData.token.substring(0, 20) + '...');
    } else {
      console.log('❌ Registration failed:', registerData.error);
      return;
    }

    // Test 3: Login
    console.log('\n3️⃣ Testing user login...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    if (loginData.success) {
      console.log('✅ Login successful:', loginData.message);
      console.log('Token:', loginData.token.substring(0, 20) + '...');
    } else {
      console.log('❌ Login failed:', loginData.error);
      return;
    }

    // Test 4: Chat with token
    console.log('\n4️⃣ Testing chat with authentication...');
    const chatResponse = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify({
        message: 'Hello, this is a test message'
      })
    });
    
    const chatData = await chatResponse.json();
    if (chatData.success) {
      console.log('✅ Chat successful:', chatData.answer.substring(0, 50) + '...');
    } else {
      console.log('❌ Chat failed:', chatData.error);
    }

    // Test 5: Chat without token (should fail)
    console.log('\n5️⃣ Testing chat without authentication (should fail)...');
    const chatNoAuthResponse = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'This should fail'
      })
    });
    
    const chatNoAuthData = await chatNoAuthResponse.json();
    if (chatNoAuthResponse.status === 401) {
      console.log('✅ Chat without token correctly failed:', chatNoAuthData.error);
    } else {
      console.log('❌ Chat without token should have failed but didn\'t');
    }

    console.log('\n🎉 JWT Authentication test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testJWT(); 