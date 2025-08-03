require('dotenv').config();

console.log('🔍 Testing server startup...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('- PINECONE_API_KEY:', process.env.PINECONE_API_KEY ? '✅ Set' : '❌ Missing');
console.log('- PINECONE_ENVIRONMENT:', process.env.PINECONE_ENVIRONMENT ? '✅ Set' : '❌ Missing');
console.log('- PINECONE_INDEX_NAME:', process.env.PINECONE_INDEX_NAME ? '✅ Set' : '❌ Missing');
console.log('- OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing');

// Test imports
try {
  console.log('\n📦 Testing imports...');
  const express = require('express');
  const cors = require('cors');
  const Stripe = require('stripe');
  const OpenAI = require('openai');
  const { Pinecone } = require('@pinecone-database/pinecone');
  console.log('✅ All imports successful');
} catch (error) {
  console.error('❌ Import failed:', error.message);
  process.exit(1);
}

// Test Pinecone initialization
try {
  console.log('\n🌲 Testing Pinecone initialization...');
  const { Pinecone } = require('@pinecone-database/pinecone');
  
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
  });
  
  const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
  console.log('✅ Pinecone initialized successfully');
} catch (error) {
  console.error('❌ Pinecone initialization failed:', error.message);
  process.exit(1);
}

console.log('\n✅ Server startup test passed!'); 