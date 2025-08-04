const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testRealPayment() {
  const baseUrl = 'http://localhost:4242';
  
  console.log('🧪 Testing Real Payment Flow...\n');
  
  // Test 1: Health check
  try {
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${baseUrl}/`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return;
  }
  
  // Test 2: Check subscription before payment
  try {
    console.log('\n2. Checking subscription status before payment...');
    const subResponse = await fetch(`${baseUrl}/check-subscription?email=test@example.com`);
    const subData = await subResponse.json();
    console.log('✅ Subscription check:', subData);
  } catch (error) {
    console.log('❌ Subscription check failed:', error.message);
  }
  
  // Test 3: Create a real test subscription
  try {
    console.log('\n3. Creating real test subscription...');
    console.log('📝 Note: This will create a real test customer and subscription in Stripe');
    
    // First, we need to create a payment method through Stripe directly
    // For this test, we'll use a test payment method ID that Stripe provides
    const createResponse = await fetch(`${baseUrl}/create-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        plan: 'monthly',
        paymentMethodId: 'pm_card_visa', // This is a Stripe test payment method ID
        userId: 'test-user-123'
      })
    });
    const createData = await createResponse.json();
    console.log('✅ Subscription creation response:', createData);
    
    if (createData.success) {
      console.log('🎉 Payment successful! Check your Stripe dashboard for:');
      console.log('   - Customer: test@example.com');
      console.log('   - Subscription ID:', createData.subscriptionId);
      console.log('   - Customer ID:', createData.customerId);
    } else {
      console.log('❌ Payment failed:', createData.error);
      console.log('💡 This might be because the payment method ID is not valid for your account');
      console.log('💡 The frontend payment flow should work better as it creates real payment methods');
    }
  } catch (error) {
    console.log('❌ Subscription creation failed:', error.message);
  }
  
  // Test 4: Check subscription after payment
  try {
    console.log('\n4. Checking subscription status after payment...');
    const subResponse = await fetch(`${baseUrl}/check-subscription?email=test@example.com`);
    const subData = await subResponse.json();
    console.log('✅ Subscription check after payment:', subData);
  } catch (error) {
    console.log('❌ Subscription check failed:', error.message);
  }
}

// Run the tests
testRealPayment().catch(console.error); 