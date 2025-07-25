const { generateEmbedding, generateChatCompletion, getSystemPrompt } = require('./openai');
const { searchSimilarChunks } = require('./pinecone');

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
 * Determine topic from search results
 */
function determineTopic(results) {
  if (!results || results.length === 0) {
    return 'General Apologetics';
  }

  // Analyze the content to determine topic
  const text = results.map(r => r.text).join(' ').toLowerCase();
  
  if (text.includes('trinity') || text.includes('god') || text.includes('father') || text.includes('son') || text.includes('holy spirit')) {
    return 'Trinity and God';
  }
  
  if (text.includes('jesus') || text.includes('christ') || text.includes('messiah')) {
    return 'Jesus Christ';
  }
  
  if (text.includes('bible') || text.includes('scripture') || text.includes('gospel')) {
    return 'Bible and Scripture';
  }
  
  if (text.includes('faith') || text.includes('belief') || text.includes('salvation')) {
    return 'Faith and Salvation';
  }
  
  if (text.includes('islam') || text.includes('muslim') || text.includes('quran')) {
    return 'Islam and Muslim Apologetics';
  }
  
  if (text.includes('atheism') || text.includes('atheist') || text.includes('evolution')) {
    return 'Atheism and Evolution';
  }
  
  return 'General Apologetics';
}

/**
 * Determine difficulty level from search results
 */
function determineDifficulty(results) {
  if (!results || results.length === 0) {
    return 'Intermediate';
  }

  // Analyze content complexity
  const text = results.map(r => r.text).join(' ');
  const wordCount = text.split(' ').length;
  const avgWordLength = text.replace(/[^a-zA-Z]/g, '').length / text.split(' ').length;
  
  // Check for complex theological terms
  const complexTerms = ['trinity', 'hypostatic', 'incarnation', 'atonement', 'justification', 'sanctification', 'eschatology'];
  const hasComplexTerms = complexTerms.some(term => text.toLowerCase().includes(term));
  
  if (hasComplexTerms || avgWordLength > 6) {
    return 'Advanced';
  } else if (wordCount > 500) {
    return 'Intermediate';
  } else {
    return 'Beginner';
  }
}

module.exports = {
  generateRAGResponse
}; 