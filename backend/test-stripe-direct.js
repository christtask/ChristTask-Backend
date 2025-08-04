const Stripe = require('stripe');
require('dotenv').config();

async function testStripeDirect() {
  console.log('🧪 Testing Stripe Connection Directly...\n');
  
  try {
    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil',
    });
    
    console.log('✅ Stripe initialized successfully');
    
    // Test 1: Get account info
    console.log('\n1. Testing Stripe account connection...');
    const account = await stripe.accounts.retrieve();
    console.log('✅ Account ID:', account.id);
    console.log('✅ Account name:', account.business_profile?.name || 'N/A');
    
    // Test 2: List existing customers
    console.log('\n2. Checking existing customers...');
    const customers = await stripe.customers.list({ limit: 5 });
    console.log(`✅ Found ${customers.data.length} customers`);
    customers.data.forEach(customer => {
      console.log(`   - ${customer.email} (ID: ${customer.id})`);
    });
    
    // Test 3: List existing subscriptions
    console.log('\n3. Checking existing subscriptions...');
    const subscriptions = await stripe.subscriptions.list({ limit: 5 });
    console.log(`✅ Found ${subscriptions.data.length} subscriptions`);
    subscriptions.data.forEach(sub => {
      console.log(`   - ${sub.id} (Status: ${sub.status})`);
    });
    
    // Test 4: List prices
    console.log('\n4. Checking available prices...');
    const prices = await stripe.prices.list({ limit: 10 });
    console.log(`✅ Found ${prices.data.length} prices`);
    prices.data.forEach(price => {
      console.log(`   - ${price.id}: ${price.unit_amount} ${price.currency} (${price.recurring?.interval || 'one-time'})`);
    });
    
    // Test 5: Create a test customer
    console.log('\n5. Creating a test customer...');
    const testCustomer = await stripe.customers.create({
      email: 'test-direct@example.com',
      name: 'Test Customer',
      metadata: {
        test: 'true',
        source: 'direct-test'
      }
    });
    console.log('✅ Created test customer:', testCustomer.id);
    console.log('   Email:', testCustomer.email);
    
    // Test 6: Create a test payment method using proper Stripe test data
    console.log('\n6. Creating a test payment method...');
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: '4242424242424242',
        exp_month: 12,
        exp_year: 2025,
        cvc: '123',
      },
    });
    console.log('✅ Created payment method:', paymentMethod.id);
    
    // Test 7: Attach payment method to customer
    console.log('\n7. Attaching payment method to customer...');
    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: testCustomer.id,
    });
    console.log('✅ Payment method attached');
    
    // Test 8: Set as default payment method
    console.log('\n8. Setting as default payment method...');
    await stripe.customers.update(testCustomer.id, {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    });
    console.log('✅ Default payment method set');
    
    // Test 9: Create a subscription (if we have a price)
    if (prices.data.length > 0) {
      console.log('\n9. Creating a test subscription...');
      const price = prices.data[0]; // Use the first available price
      
      const subscription = await stripe.subscriptions.create({
        customer: testCustomer.id,
        items: [{ price: price.id }],
        payment_behavior: 'default_incomplete',
        payment_settings: { 
          save_default_payment_method: 'on_subscription' 
        },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          test: 'true',
          source: 'direct-test'
        }
      });
      
      console.log('✅ Created subscription:', subscription.id);
      console.log('   Status:', subscription.status);
      console.log('   Current period end:', new Date(subscription.current_period_end * 1000));
    } else {
      console.log('\n❌ No prices found - cannot create subscription');
    }
    
    console.log('\n🎉 All Stripe tests completed successfully!');
    console.log('📊 Check your Stripe dashboard for the new test customer and subscription');
    
  } catch (error) {
    console.error('❌ Stripe test failed:', error.message);
    if (error.type) {
      console.error('   Error type:', error.type);
    }
    if (error.code) {
      console.error('   Error code:', error.code);
    }
  }
}

// Run the test
testStripeDirect().catch(console.error); 