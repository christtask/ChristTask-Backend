import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

// Types
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ApologistProfile {
  system_prompt: string;
  [key: string]: any;
}

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
 * Load apologist profile from JSON file
 */
export function loadApologistProfile(): ApologistProfile {
  try {
    const profilePath = path.join(__dirname, '../config/apologist-profile.json');
    
    // Validate path to prevent directory traversal attacks
    const resolvedPath = path.resolve(profilePath);
    const expectedDir = path.resolve(__dirname, '..', 'config');
    
    if (!resolvedPath.startsWith(expectedDir)) {
      throw new Error('Invalid path access detected');
    }
    
    if (!fs.existsSync(resolvedPath)) {
      throw new Error('Profile file not found');
    }
    
    const profileData = fs.readFileSync(resolvedPath, 'utf8');
    return JSON.parse(profileData);
  } catch (error) {
    console.error('Error loading apologist profile:', error);
    // Return default profile if file cannot be loaded
    return {
      system_prompt: "You are a Christian apologetics AI assistant. Your role is to help defend the Christian faith with biblical wisdom, historical evidence, and logical reasoning.\n\nWhen answering questions:\n1. Use biblical references when appropriate\n2. Provide historical and archaeological evidence when relevant\n3. Use logical reasoning and philosophical arguments\n4. Be respectful and loving in your approach\n5. Acknowledge when certain questions may not have definitive answers\n6. Focus on building faith rather than just winning arguments\n7. Use the provided context from the apologetics database to give accurate, well-informed answers\n\nAlways respond in a helpful, informative, and Christ-like manner."
    };
  }
}

/**
 * Generate embedding for text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding: ' + (error as Error).message);
  }
}

/**
 * Generate chat completion using OpenAI
 */
export async function generateChatCompletion(
  messages: ChatMessage[], 
  temperature: number = 0.7, 
  maxTokens: number = 2000
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature,
      max_tokens: maxTokens,
    });
    
    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Error generating chat completion:', error);
    throw new Error('Failed to generate chat completion: ' + (error as Error).message);
  }
}

/**
 * Get system prompt for Christian apologetics
 */
export function getSystemPrompt(): string {
  const profile = loadApologistProfile();
  return profile.system_prompt;
} 