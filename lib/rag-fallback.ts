import { generateChatCompletion, getSystemPrompt } from './openai';
import { extractScriptureReferences } from '../utils/scriptureParser';

// Only load content on server-side
let apologeticsContent = '';

if (typeof window === 'undefined') {
  // Server-side only
  const { readFileSync } = require('fs');
  const { join } = require('path');
  
  try {
    apologeticsContent = readFileSync(join(process.cwd(), 'data', 'apologetics-content.md'), 'utf-8');
  } catch (error) {
    console.error('Error loading apologetics content:', error);
    apologeticsContent = '';
  }
}

export interface RAGResponse {
  answer: string;
  sources: any[];
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
  sources?: any[];
  scriptureReferences?: {
    bible: string[];
    quran: string[];
  };
}

// Content is loaded above in server-side check

/**
 * Simple RAG response without Pinecone
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
    // Extract scripture references from user query
    const scriptureReferences = extractScriptureReferences(userQuery);

    // Build context from local content
    const context = buildContextFromLocalContent(userQuery, apologeticsContent);

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
    throw new Error('Failed to generate RAG response');
  }
}

/**
 * Build context from local content
 */
function buildContextFromLocalContent(userQuery: string, content: string): string {
  // Simple keyword matching to find relevant sections
  const queryLower = userQuery.toLowerCase();
  const contentLines = content.split('\n');
  const relevantLines: string[] = [];

  // Find lines that contain keywords from the query
  const keywords = queryLower.split(' ').filter(word => word.length > 3);
  
  for (const line of contentLines) {
    const lineLower = line.toLowerCase();
    const matches = keywords.some(keyword => lineLower.includes(keyword));
    if (matches && line.trim().length > 20) {
      relevantLines.push(line);
    }
  }

  // Take the first 10 relevant lines
  const selectedLines = relevantLines.slice(0, 10);

  return `User Question: ${userQuery}

Relevant Information from Apologetics Database:
${selectedLines.join('\n')}

Please provide a comprehensive apologetics response based on the information above.`;
}

/**
 * Build chat messages for GPT-3.5-turbo
 */
function buildChatMessages(
  userQuery: string,
  context: string,
  chatHistory: ChatMessage[]
): any[] {
  const messages = [
    { role: 'system', content: getSystemPrompt() },
  ];

  // Add recent chat history (last 5 messages to avoid token limits)
  const recentHistory = chatHistory.slice(-5);
  messages.push(...recentHistory.map(msg => ({
    role: msg.role,
    content: msg.content,
  })));

  // Add current query with context
  messages.push({
    role: 'user',
    content: `${context}\n\nPlease provide a comprehensive apologetics response to: ${userQuery}`,
  });

  return messages;
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
): AsyncGenerator<{ content: string; sources?: any[] }, void, unknown> {
  try {
    // Build context from local content
    const context = buildContextFromLocalContent(userQuery, apologeticsContent);

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
        yield { content: chunk, sources: [{ text: 'Local apologetics content', metadata: { source: 'apologetics-content.md' } }] };
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