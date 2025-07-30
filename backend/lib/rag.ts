import { generateEmbedding, generateChatCompletion, getSystemPrompt } from './openai';
import { searchSimilarChunks, SearchResult } from './pinecone';
import { extractScriptureReferences } from '../utils/scriptureParser';

export interface RAGResponse {
  answer: string;
  sources: SearchResult[];
  scriptureReferences: {
    bible: string[];
    quran: string[];
  };
  topic: string;
  difficulty: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sources?: SearchResult[];
  scriptureReferences?: {
    bible: string[];
    quran: string[];
  };
}

/**
 * Main RAG function that searches for relevant content and generates a response
 */
export async function generateRAGResponse(
  userQuery: string,
  chatHistory: ChatMessage[] = [],
  options: {
    topK?: number;
    temperature?: number;
    maxTokens?: number;
    filter?: {
      topic?: string;
      difficulty?: string;
      source?: string;
    };
  } = {}
): Promise<RAGResponse> {
  try {
    // Generate embedding for user query
    const queryEmbedding = await generateEmbedding(userQuery);

    // Search for relevant document chunks
    const searchResults = await searchSimilarChunks(
      queryEmbedding,
      options.topK || 5,
      options.filter
    );

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
    console.error('Error in RAG response generation:', error);
    throw new Error('Failed to generate RAG response');
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
      `Source ${index + 1} (${result.metadata.source} - ${result.metadata.topic}):`,
      result.text,
      `Difficulty: ${result.metadata.difficulty}`,
      `Bible References: ${result.metadata.scriptureReferences.bible.join(', ') || 'None'}`,
      `Quran References: ${result.metadata.scriptureReferences.quran.join(', ') || 'None'}`,
      ''
    );
  });

  return contextParts.join('\n');
}

/**
 * Build chat messages for GPT-4
 */
function buildChatMessages(
  userQuery: string,
  context: string,
  chatHistory: ChatMessage[]
): any[] {
  // Load the full apologist profile
  const fs = require('fs');
  const path = require('path');
  
  const profilePath = path.join(__dirname, '..', 'config', 'apologist-profile.json');
  const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
  
  const messages = [
    { 
      role: 'system', 
      content: `${profile.system_prompt}\n\n${context}` 
    },
  ];

  // Add recent chat history (last 10 messages to avoid token limits)
  const recentHistory = chatHistory.slice(-10);
  messages.push(...recentHistory.map(msg => ({
    role: msg.role,
    content: msg.content,
  })));

  // Add current query with context
  messages.push({
    role: 'user',
    content: `Context:\n${context}\n\nPlease provide a comprehensive apologetics response to: ${userQuery}`,
  });

  return messages;
}

/**
 * Determine the main topic from search results
 */
function determineTopic(results: SearchResult[]): string {
  if (results.length === 0) return 'General Apologetics';

  // Count topic occurrences
  const topicCounts: { [key: string]: number } = {};
  results.forEach(result => {
    const topic = result.metadata.topic;
    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
  });

  // Return most common topic
  return Object.entries(topicCounts)
    .sort(([, a], [, b]) => b - a)[0][0];
}

/**
 * Determine difficulty level from search results
 */
function determineDifficulty(results: SearchResult[]): string {
  if (results.length === 0) return 'Intermediate';

  const difficulties = results.map(r => r.metadata.difficulty);
  const difficultyCounts: { [key: string]: number } = {};
  
  difficulties.forEach(diff => {
    difficultyCounts[diff] = (difficultyCounts[diff] || 0) + 1;
  });

  // Return most common difficulty
  return Object.entries(difficultyCounts)
    .sort(([, a], [, b]) => b - a)[0][0];
}

/**
 * Generate streaming RAG response for real-time chat
 */
export async function* generateStreamingRAGResponse(
  userQuery: string,
  chatHistory: ChatMessage[] = [],
  options: {
    topK?: number;
    temperature?: number;
    maxTokens?: number;
    filter?: {
      topic?: string;
      difficulty?: string;
      source?: string;
    };
  } = {}
): AsyncGenerator<{ content: string; sources?: SearchResult[] }, void, unknown> {
  try {
    // Generate embedding for user query
    const queryEmbedding = await generateEmbedding(userQuery);

    // Search for relevant document chunks
    const searchResults = await searchSimilarChunks(
      queryEmbedding,
      options.topK || 5,
      options.filter
    );

    // Build context from search results
    const context = buildContextFromResults(searchResults, userQuery);

    // Build chat messages
    const messages = buildChatMessages(userQuery, context, chatHistory);

    // Stream response
    let isFirstChunk = true;
    for await (const chunk of generateStreamingChatCompletion(
      messages,
      options.temperature || 0.7,
      options.maxTokens || 2000
    )) {
      if (isFirstChunk) {
        // Send sources with first chunk
        yield { content: chunk, sources: searchResults };
        isFirstChunk = false;
      } else {
        yield { content: chunk };
      }
    }
  } catch (error) {
    console.error('Error in streaming RAG response:', error);
    throw new Error('Failed to generate streaming RAG response');
  }
}

// Import the streaming function from openai.ts
import { streamChatCompletion as generateStreamingChatCompletion } from './openai'; 