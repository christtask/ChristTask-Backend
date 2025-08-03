require('dotenv').config();

console.log('Testing RAG system...');

// Check environment variables
console.log('Environment check:');
console.log('- OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing');
console.log('- PINECONE_API_KEY:', process.env.PINECONE_API_KEY ? '✅ Set' : '❌ Missing');
console.log('- PINECONE_ENVIRONMENT:', process.env.PINECONE_ENVIRONMENT ? '✅ Set' : '❌ Missing');
console.log('- PINECONE_INDEX_NAME:', process.env.PINECONE_INDEX_NAME ? '✅ Set' : '❌ Missing');

// Test basic imports
try {
  console.log('\nTesting imports...');
  const { generateRAGResponse } = require('./lib/rag');
  console.log('✅ RAG module imported successfully');
} catch (error) {
  console.error('❌ Failed to import RAG module:', error.message);
  process.exit(1);
}

// Test OpenAI module
try {
  const { generateEmbedding } = require('./lib/openai');
  console.log('✅ OpenAI module imported successfully');
} catch (error) {
  console.error('❌ Failed to import OpenAI module:', error.message);
}

// Test Pinecone module
try {
  const { searchSimilarChunks } = require('./lib/pinecone');
  console.log('✅ Pinecone module imported successfully');
} catch (error) {
  console.error('❌ Failed to import Pinecone module:', error.message);
}

console.log('\n✅ Basic RAG system check completed'); 