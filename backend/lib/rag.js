const { generateEmbedding, generateChatCompletion, getSystemPrompt } = require('./openai');
const { searchSimilarChunks } = require('./pinecone');

/**
 * Main RAG function that searches for relevant content and generates a response
 */
async function generateRAGResponse(
  userQuery,
  chatHistory = [],
  options = {}
) {
  try {
    console.log('🔍 Generating RAG response for:', userQuery);
    
    // Generate embedding for user query
    const queryEmbedding = await generateEmbedding(userQuery);
    console.log('✅ Generated embedding');

    // Search for relevant document chunks
    const searchResults = await searchSimilarChunks(
      queryEmbedding,
      options.topK || 5,
      options.filter
    );
    console.log(`✅ Found ${searchResults.length} relevant chunks`);

    // Extract scripture references from search results
    const scriptureReferences = extractScriptureReferences(
      searchResults.map(result => result.text).join(' ')
    );

    // Build context from search results
    const context = buildContextFromResults(searchResults, userQuery);

    // Generate response using GPT-4
    const messages = buildChatMessages(userQuery, context, chatHistory);
    
    const response = await generateChatCompletion(
      messages,
      options.temperature || 0.7,
      options.maxTokens || 2000
    );
    console.log('✅ Generated response');

    // Determine topic and difficulty from search results
    const topic = determineTopic(searchResults);
    const difficulty = determineDifficulty(searchResults);

    return {
      answer: response,
      sources: searchResults,
      scriptureReferences,
      topic,
      difficulty,
    };
  } catch (error) {
    console.error('❌ Error in RAG response generation:', error);
    throw new Error('Failed to generate RAG response: ' + error.message);
  }
}

/**
 * Build context string from search results
 */
function buildContextFromResults(results, userQuery) {
  const contextParts = [
    `User Question: ${userQuery}`,
    '',
    'Relevant Information from Apologetics Database:',
  ];

  results.forEach((result, index) => {
    contextParts.push(
      `Source ${index + 1} (${result.metadata.source}):`,
      result.text,
      ''
    );
  });

  return contextParts.join('\n');
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
 * Determine topic from search results
 */
function determineTopic(results) {
  if (results.length === 0) return 'General';
  
  const topics = results.map(r => r.metadata.topic).filter(Boolean);
  if (topics.length === 0) return 'General';
  
  // Return most common topic
  const topicCounts = {};
  topics.forEach(topic => {
    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
  });
  
  return Object.keys(topicCounts).reduce((a, b) => 
    topicCounts[a] > topicCounts[b] ? a : b
  );
}

/**
 * Determine difficulty from search results
 */
function determineDifficulty(results) {
  if (results.length === 0) return 'Beginner';
  
  const difficulties = results.map(r => r.metadata.difficulty).filter(Boolean);
  if (difficulties.length === 0) return 'Beginner';
  
  // Return most common difficulty
  const diffCounts = {};
  difficulties.forEach(diff => {
    diffCounts[diff] = (diffCounts[diff] || 0) + 1;
  });
  
  return Object.keys(diffCounts).reduce((a, b) => 
    diffCounts[a] > diffCounts[b] ? a : b
  );
}

module.exports = {
  generateRAGResponse
}; 