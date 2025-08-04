const Stripe = require('stripe');
require('dotenv').config();

async function findCustomer() {
  console.log('🔍 Searching for customer: test1@example.com\n');
  
  try {
    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil',
    });
    
    console.log('✅ Stripe initialized successfully');
    
    // Search for the specific customer
    console.log('1. Searching for customer with email: test1@example.com');
    const customers = await stripe.customers.list({
      email: 'test1@example.com',
      limit: 10
    });
    
    if (customers.data.length > 0) {
      console.log(`✅ Found ${customers.data.length} customer(s) with this email:`);
      customers.data.forEach(customer => {
        console.log(`   - Customer ID: ${customer.id}`);
        console.log(`   - Email: ${customer.email}`);
        console.log(`   - Name: ${customer.name || 'N/A'}`);
        console.log(`   - Created: ${new Date(customer.created * 1000).toLocaleString()}`);
        console.log(`   - Metadata:`, customer.metadata);
        console.log('');
      });
      
      // Check for subscriptions for this customer
      const customer = customers.data[0];
      console.log('2. Checking subscriptions for this customer...');
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 10
      });
      
      if (subscriptions.data.length > 0) {
        console.log(`✅ Found ${subscriptions.data.length} subscription(s):`);
        subscriptions.data.forEach(sub => {
          console.log(`   - Subscription ID: ${sub.id}`);
          console.log(`   - Status: ${sub.status}`);
          console.log(`   - Current period end: ${new Date(sub.current_period_end * 1000).toLocaleString()}`);
          console.log(`   - Amount: ${sub.items.data[0]?.price.unit_amount} ${sub.items.data[0]?.price.currency}`);
          console.log('');
        });
      } else {
        console.log('❌ No subscriptions found for this customer');
      }
      
      // Check for payment intents
      console.log('3. Checking payment intents...');
      const paymentIntents = await stripe.paymentIntents.list({
        customer: customer.id,
        limit: 10
      });
      
      if (paymentIntents.data.length > 0) {
        console.log(`✅ Found ${paymentIntents.data.length} payment intent(s):`);
        paymentIntents.data.forEach(pi => {
          console.log(`   - Payment Intent ID: ${pi.id}`);
          console.log(`   - Status: ${pi.status}`);
          console.log(`   - Amount: ${pi.amount} ${pi.currency}`);
          console.log(`   - Created: ${new Date(pi.created * 1000).toLocaleString()}`);
          console.log('');
        });
      } else {
        console.log('❌ No payment intents found for this customer');
      }
      
    } else {
      console.log('❌ No customer found with email: test1@example.com');
      console.log('');
      console.log('💡 This means the payment might not have been processed successfully');
      console.log('💡 Or the email might be different');
      console.log('');
      console.log('📋 Let\'s check all recent customers:');
      const allCustomers = await stripe.customers.list({
        limit: 10,
        created: { gte: Math.floor(Date.now() / 1000) - 3600 } // Last hour
      });
      
      if (allCustomers.data.length > 0) {
        console.log(`✅ Found ${allCustomers.data.length} recent customer(s):`);
        allCustomers.data.forEach(customer => {
          console.log(`   - ${customer.email} (ID: ${customer.id}) - Created: ${new Date(customer.created * 1000).toLocaleString()}`);
        });
      } else {
        console.log('❌ No recent customers found');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the search
findCustomer().catch(console.error); 