const { generateChatCompletion, getSystemPrompt } = require('./openai');

/**
 * Extract scripture references from text
 */
function extractScriptureReferences(text) {
  const bibleRefs = [];
  const quranRefs = [];

  // Simple regex patterns for scripture references
  const biblePattern = /(?:John|Matthew|Mark|Luke|Acts|Romans|Corinthians|Galatians|Ephesians|Philippians|Colossians|Thessalonians|Timothy|Titus|Philemon|Hebrews|James|Peter|John|Jude|Revelation)\s+\d+:\d+/gi;
  const quranPattern = /(?:Surah|Quran)\s+\d+(?::\d+)?/gi;

  const bibleMatches = text.match(biblePattern) || [];
  const quranMatches = text.match(quranPattern) || [];

  bibleRefs.push(...bibleMatches);
  quranRefs.push(...quranMatches);

  return {
    bible: [...new Set(bibleRefs)],
    quran: [...new Set(quranRefs)]
  };
}

/**
 * Simple RAG response without Pinecone
 */
async function generateRAGResponse(
  userQuery,
  chatHistory = [],
  options = {}
) {
  try {
    console.log('🔄 Using fallback RAG response for:', userQuery);
    
    // Extract scripture references from user query
    const scriptureReferences = extractScriptureReferences(userQuery);

    // Build context from local content
    const context = buildContextFromLocalContent(userQuery);

    // Generate response using GPT-3.5-turbo
    const messages = buildChatMessages(userQuery, context, chatHistory);
    
    const response = await generateChatCompletion(
      messages,
      options.temperature || 0.7,
      options.maxTokens || 2000
    );

    return {
      answer: response,
      sources: [{ text: 'Local apologetics content', metadata: { source: 'apologetics-content.md' } }],
      scriptureReferences,
      topic: 'General Apologetics',
      difficulty: 'Intermediate',
    };
  } catch (error) {
    console.error('Error in fallback RAG response generation:', error);
    throw new Error('Failed to generate RAG response: ' + error.message);
  }
}

/**
 * Build context from local content
 */
function buildContextFromLocalContent(userQuery) {
  // Simple context based on the query
  const queryLower = userQuery.toLowerCase();
  
  let context = 'You are a Christian apologetics AI assistant. ';
  
  if (queryLower.includes('trinity')) {
    context += 'The Trinity is the Christian doctrine that God exists as three distinct persons: Father, Son, and Holy Spirit, yet is one God. This is a central mystery of the Christian faith. ';
  }
  
  if (queryLower.includes('jesus') || queryLower.includes('christ')) {
    context += 'Jesus Christ is the Son of God, fully divine and fully human. He came to earth to save humanity from sin through his death and resurrection. ';
  }
  
  if (queryLower.includes('bible') || queryLower.includes('scripture')) {
    context += 'The Bible is the inspired Word of God, containing the Old and New Testaments. It is the primary source of Christian doctrine and practice. ';
  }
  
  if (queryLower.includes('faith') || queryLower.includes('belief')) {
    context += 'Christian faith is trust in Jesus Christ for salvation. It involves both intellectual assent and personal commitment to follow Christ. ';
  }
  
  return context;
}

/**
 * Build chat messages for OpenAI API
 */
function buildChatMessages(userQuery, context, chatHistory) {
  const systemPrompt = getSystemPrompt();
  
  const messages = [
    {
      role: 'system',
      content: `${systemPrompt}\n\n${context}`
    }
  ];

  // Add chat history (last 5 messages to avoid token limits)
  const recentHistory = chatHistory.slice(-5);
  messages.push(...recentHistory);

  // Add current user query
  messages.push({
    role: 'user',
    content: userQuery
  });

  return messages;
}

module.exports = {
  generateRAGResponse
}; 