import OpenAI from 'openai';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
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
 * Generate a system prompt for the apologetics assistant
 */
export function getSystemPrompt(): string {
  return `You are a Christian apologetics assistant providing concise, direct responses to faith questions.

Key guidelines:
- Keep responses brief and to the point (2-3 paragraphs max)
- Provide direct biblical support with specific verses
- Include relevant Quranic contradictions when applicable
- Use clear, simple language
- Avoid repetition and verbose explanations
- Focus on the most important points only

Format responses as:
1. Direct answer (1 paragraph)
2. Key biblical support (1-2 verses)
3. Brief counter-evidence if applicable (1 paragraph max)

For Bible references: John 3:16, Romans 8:28
For Quran references: Surah 2:106, Quran 9:5`;
}

export { openai }; 