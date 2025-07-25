const OpenAI = require('openai');

// Validate OpenAI API key
const apiKey = process.env.OPENAI_API_KEY?.trim();
if (!apiKey) {
  throw new Error("Missing OpenAI API key");
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey,
});

/**
 * Generate embedding for text using OpenAI
 */
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding: ' + error.message);
  }
}

/**
 * Generate chat completion using OpenAI
 */
async function generateChatCompletion(messages, temperature = 0.7, maxTokens = 2000) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature,
      max_tokens: maxTokens,
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating chat completion:', error);
    throw new Error('Failed to generate chat completion: ' + error.message);
  }
}

/**
 * Get system prompt for Christian apologetics
 */
function getSystemPrompt() {
  return `You are a Christian apologetics AI assistant. Your role is to help defend the Christian faith with biblical wisdom, historical evidence, and logical reasoning.

When answering questions:
1. Use biblical references when appropriate
2. Provide historical and archaeological evidence when relevant
3. Use logical reasoning and philosophical arguments
4. Be respectful and loving in your approach
5. Acknowledge when certain questions may not have definitive answers
6. Focus on building faith rather than just winning arguments
7. Use the provided context from the apologetics database to give accurate, well-informed answers

Always respond in a helpful, informative, and Christ-like manner.`;
}

module.exports = {
  generateEmbedding,
  generateChatCompletion,
  getSystemPrompt
}; 