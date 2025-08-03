require('dotenv').config();

console.log('🔍 Testing RAG deployment environment...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('- OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing');
console.log('- PINECONE_API_KEY:', process.env.PINECONE_API_KEY ? '✅ Set' : '❌ Missing');
console.log('- PINECONE_ENVIRONMENT:', process.env.PINECONE_ENVIRONMENT ? '✅ Set' : '❌ Missing');
console.log('- PINECONE_INDEX_NAME:', process.env.PINECONE_INDEX_NAME ? '✅ Set' : '❌ Missing');

// Test RAG system
async function testRAG() {
  try {
    console.log('\n🤖 Testing RAG system...');
    
    const { generateRAGResponse } = require('./lib/rag');
    
    // Test with a simple question
    const testQuestion = "What is the evidence for Jesus being God?";
    console.log(`Question: ${testQuestion}`);
    
    const response = await generateRAGResponse(testQuestion, [], {
      topK: 5,
      temperature: 0.7,
      maxTokens: 2000
    });
    
    console.log('\n✅ RAG Response:');
    console.log('Answer:', response.answer.substring(0, 200) + '...');
    console.log('Sources found:', response.sources.length);
    console.log('Topic:', response.topic);
    console.log('Difficulty:', response.difficulty);
    
    if (response.sources.length > 0) {
      console.log('\n📚 Sample Source:');
      console.log('- Text:', response.sources[0].text.substring(0, 100) + '...');
      console.log('- Metadata:', response.sources[0].metadata);
    }
    
  } catch (error) {
    console.error('❌ RAG Test Failed:', error.message);
    console.log('This means the system will use fallback responses.');
  }
}

testRAG(); 