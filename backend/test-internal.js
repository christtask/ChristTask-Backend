// Test the payment functionality internally
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testStripeConnection() {
  console.log('🧪 Testing Stripe Connection...\n');
  
  try {
    // Test 1: Check if we can connect to Stripe
    console.log('1. Testing Stripe connection...');
    const account = await stripe.accounts.retrieve();
    console.log('✅ Stripe connection successful!');
    console.log('   Account ID:', account.id);
    console.log('   Account Type:', account.type);
  } catch (error) {
    console.log('❌ Stripe connection failed:', error.message);
  }
  
  try {
    // Test 2: List customers
    console.log('\n2. Testing customer list...');
    const customers = await stripe.customers.list({ limit: 5 });
    console.log('✅ Customer list successful!');
    console.log('   Found', customers.data.length, 'customers');
  } catch (error) {
    console.log('❌ Customer list failed:', error.message);
  }
  
  try {
    // Test 3: List subscriptions
    console.log('\n3. Testing subscription list...');
    const subscriptions = await stripe.subscriptions.list({ limit: 5 });
    console.log('✅ Subscription list successful!');
    console.log('   Found', subscriptions.data.length, 'subscriptions');
  } catch (error) {
    console.log('❌ Subscription list failed:', error.message);
  }
  
  try {
    // Test 4: Check prices
    console.log('\n4. Testing price list...');
    const prices = await stripe.prices.list({ limit: 5 });
    console.log('✅ Price list successful!');
    console.log('   Found', prices.data.length, 'prices');
    
    // Look for your specific prices
    const weeklyPrice = prices.data.find(p => p.id === 'price_1ReOQ7FEfjI8S6GYiTNrAvPb');
    const monthlyPrice = prices.data.find(p => p.id === 'price_1ReOLjFEfjI8S6GYAe7YSlOt');
    
    if (weeklyPrice) {
      console.log('   ✅ Weekly price found:', weeklyPrice.id);
    } else {
      console.log('   ⚠️ Weekly price not found');
    }
    
    if (monthlyPrice) {
      console.log('   ✅ Monthly price found:', monthlyPrice.id);
    } else {
      console.log('   ⚠️ Monthly price not found');
    }
  } catch (error) {
    console.log('❌ Price list failed:', error.message);
  }
}

// Run the tests
testStripeConnection().catch(console.error); 