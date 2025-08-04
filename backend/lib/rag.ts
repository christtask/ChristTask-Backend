import { generateEmbedding, generateChatCompletion } from './openai';
import { searchSimilarChunks } from './pinecone';
import * as fs from 'fs';
import * as path from 'path';

// Types
interface ScriptureReferences {
  bible: string[];
  quran: string[];
  torah: string[];
}

interface SearchResult {
  text: string;
  metadata: {
    source: string;
    [key: string]: any;
  };
  score?: number;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface RAGOptions {
  topK?: number;
  filter?: any;
  temperature?: number;
  maxTokens?: number;
}

interface RAGResponse {
  answer: string;
  sources: SearchResult[];
  scriptureReferences: ScriptureReferences;
  topic: string;
  difficulty: string;
}

interface ApologistProfile {
  system_prompt: string;
  [key: string]: any;
}

/**
 * Extract scripture references from text
 */
function extractScriptureReferences(text: string): ScriptureReferences {
  const bibleRefs: string[] = [];
  const quranRefs: string[] = [];
  const torahRefs: string[] = [];

  // Enhanced regex patterns for scripture references
  const biblePattern = /(?:John|Matthew|Mark|Luke|Acts|Romans|Corinthians|Galatians|Ephesians|Philippians|Colossians|Thessalonians|Timothy|Titus|Philemon|Hebrews|James|Peter|John|Jude|Revelation|Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|Samuel|Kings|Chronicles|Ezra|Nehemiah|Esther|Job|Psalms|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi)\s+\d+:\d+/gi;
  const quranPattern = /(?:Surah|Quran|Sura)\s+\d+(?::\d+)?/gi;
  const torahPattern = /(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy)\s+\d+:\d+/gi;

  const bibleMatches = text.match(biblePattern) || [];
  const quranMatches = text.match(quranPattern) || [];
  const torahMatches = text.match(torahPattern) || [];

  bibleRefs.push(...bibleMatches);
  quranRefs.push(...quranMatches);
  torahRefs.push(...torahMatches);

  return {
    bible: [...new Set(bibleRefs)],
    quran: [...new Set(quranRefs)],
    torah: [...new Set(torahRefs)]
  };
}

/**
 * Main RAG function that searches for relevant content and generates a response
 */
export async function generateRAGResponse(
  userQuery: string,
  chatHistory: ChatMessage[] = [],
  options: RAGOptions = {}
): Promise<RAGResponse> {
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
    throw new Error('Failed to generate RAG response: ' + (error as Error).message);
  }
}

/**
 * Build context string from search results
 */
function buildContextFromResults(results: SearchResult[], userQuery: string): string {
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
function buildChatMessages(userQuery: string, context: string, chatHistory: ChatMessage[]): ChatMessage[] {
  try {
    const profilePath = path.join(__dirname, '..', 'config', 'apologist-profile.json');
    
    // Validate path to prevent directory traversal attacks
    const resolvedPath = path.resolve(profilePath);
    const expectedDir = path.resolve(__dirname, '..', 'config');
    
    if (!resolvedPath.startsWith(expectedDir)) {
      throw new Error('Invalid path access detected');
    }
    
    if (!fs.existsSync(resolvedPath)) {
      throw new Error('Profile file not found');
    }
    
    const profile: ApologistProfile = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
    
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `${profile.system_prompt}\n\n${context}`
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
  } catch (error) {
    console.error('Error loading apologist profile:', error);
    // Return default messages if profile cannot be loaded
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are a Christian apologetics AI assistant. Your role is to help defend the Christian faith with biblical wisdom, historical evidence, and logical reasoning.\n\n${context}`
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
}

/**
 * Determine topic from search results
 */
function determineTopic(results: SearchResult[]): string {
  if (!results || results.length === 0) {
    return 'General Apologetics';
  }

  // Analyze the content to determine topic
  const text = results.map(r => r.text).join(' ').toLowerCase();
  
  // Comparative apologetics topics
  if (text.includes('quran') || text.includes('surah') || text.includes('islam') || text.includes('muslim')) {
    if (text.includes('jesus') || text.includes('christ') || text.includes('divinity')) {
      return 'Quran-Christianity Comparison';
    }
    return 'Islam and Muslim Apologetics';
  }
  
  if (text.includes('torah') || text.includes('pentateuch') || text.includes('messianic prophecy')) {
    if (text.includes('jesus') || text.includes('christ')) {
      return 'Torah-Christianity Comparison';
    }
    return 'Jewish-Christian Dialogue';
  }
  
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
  
  if (text.includes('atheism') || text.includes('atheist') || text.includes('evolution')) {
    return 'Atheism and Evolution';
  }
  
  if (text.includes('comparison') || text.includes('versus') || text.includes('debate')) {
    return 'Comparative Apologetics';
  }
  
  return 'General Apologetics';
}

/**
 * Determine difficulty level from search results
 */
function determineDifficulty(results: SearchResult[]): string {
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