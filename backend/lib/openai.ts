import OpenAI from 'openai';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
config({ path: '.env.local' });

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
 * Generate embeddings for text using OpenAI's text-embedding-3-small model
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
      encoding_format: 'float',
    });

    return response.data.map(item => item.embedding);
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error('Failed to generate embeddings');
  }
}

/**
 * Generate a single embedding for text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const embeddings = await generateEmbeddings([text]);
  return embeddings[0];
}

/**
 * Generate chat completion using GPT-4
 */
export async function generateChatCompletion(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  temperature: number = 0.7,
  maxTokens: number = 2000
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating chat completion:', error);
    throw new Error('Failed to generate chat completion');
  }
}

/**
 * Stream chat completion for real-time responses
 */
export async function* streamChatCompletion(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  temperature: number = 0.7,
  maxTokens: number = 2000
): AsyncGenerator<string, void, unknown> {
  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    console.error('Error streaming chat completion:', error);
    throw new Error('Failed to stream chat completion');
  }
}

/**
 * Extract topics and difficulty from text using GPT-4
 */
export async function analyzeDocumentContent(text: string): Promise<{
  topic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  scriptureReferences: {
    bible: string[];
    quran: string[];
  };
}> {
  try {
    const prompt = `
Analyze the following apologetics content and extract:
1. Main topic (e.g., "Trinity", "Resurrection", "Biblical Reliability", "Quranic Contradictions")
2. Difficulty level (Beginner, Intermediate, or Advanced)
3. Bible verse references (e.g., "John 3:16", "Romans 8:28")
4. Quran verse references (e.g., "Surah 2:106", "Quran 9:29")

Content: ${text}

Respond in JSON format:
{
  "topic": "topic_name",
  "difficulty": "Beginner|Intermediate|Advanced",
  "scriptureReferences": {
    "bible": ["verse1", "verse2"],
    "quran": ["verse1", "verse2"]
  }
}
`;

    const response = await generateChatCompletion([
      { role: 'user', content: prompt }
    ], 0.1, 500);

    try {
      const result = JSON.parse(response);
      return {
        topic: result.topic || 'General Apologetics',
        difficulty: result.difficulty || 'Intermediate',
        scriptureReferences: {
          bible: result.scriptureReferences?.bible || [],
          quran: result.scriptureReferences?.quran || [],
        },
      };
    } catch (parseError) {
      console.error('Error parsing analysis result:', parseError);
      return {
        topic: 'General Apologetics',
        difficulty: 'Intermediate',
        scriptureReferences: { bible: [], quran: [] },
      };
    }
  } catch (error) {
    console.error('Error analyzing document content:', error);
    return {
      topic: 'General Apologetics',
      difficulty: 'Intermediate',
      scriptureReferences: { bible: [], quran: [] },
    };
  }
}

/**
 * Load apologist profile from JSON file
 */
export function loadApologistProfile(): any {
  try {
    const profilePath = path.join(__dirname, '../config/apologist-profile.json');
    const profileData = fs.readFileSync(profilePath, 'utf8');
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
 * Generate a system prompt for the apologetics assistant
 */
export function getSystemPrompt(): string {
  const profile = loadApologistProfile();
  return profile.system_prompt;
}

export { openai }; 