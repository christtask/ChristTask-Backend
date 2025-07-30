import { Pinecone } from '@pinecone-database/pinecone';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

// Get the index
const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

export interface DocumentChunk {
  id: string;
  text: string;
  metadata: {
    source: string;
    topic: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    scriptureReferences: {
      bible: string[];
      quran: string[];
    };
    chunkIndex: number;
    totalChunks: number;
    createdAt: string;
    url?: string;
  };
}

export interface SearchResult {
  id: string;
  score: number;
  metadata: DocumentChunk['metadata'];
  text: string;
}

/**
 * Store document chunks in Pinecone with embeddings
 */
export async function storeDocumentChunks(
  chunks: DocumentChunk[],
  embeddings: number[][]
): Promise<void> {
  try {
    // In storeDocumentChunks, flatten scriptureReferences to a string
    const vectors = chunks.map((chunk, index) => ({
      id: chunk.id,
      values: embeddings[index],
      metadata: {
        ...chunk.metadata,
        scriptureReferences: JSON.stringify(chunk.metadata.scriptureReferences),
        text: chunk.text,
      },
    }));

    // Upsert in batches of 100
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await index.upsert(batch);
    }

    console.log(`Stored ${chunks.length} document chunks in Pinecone`);
  } catch (error) {
    console.error('Error storing document chunks:', error);
    throw new Error('Failed to store document chunks in Pinecone');
  }
}

/**
 * Search for similar document chunks
 */
export async function searchSimilarChunks(
  queryEmbedding: number[],
  topK: number = 5,
  filter?: {
    topic?: string;
    difficulty?: string;
    source?: string;
  }
): Promise<SearchResult[]> {
  try {
    const searchOptions: any = {
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    };

    // Add filters if provided
    if (filter) {
      searchOptions.filter = {};
      if (filter.topic) searchOptions.filter.topic = { $eq: filter.topic };
      if (filter.difficulty) searchOptions.filter.difficulty = { $eq: filter.difficulty };
      if (filter.source) searchOptions.filter.source = { $eq: filter.source };
    }

    const results = await index.query(searchOptions);

    return results.matches.map((match) => ({
      id: match.id,
      score: match.score || 0,
      metadata: {
        ...match.metadata,
        scriptureReferences: match.metadata?.scriptureReferences
          ? JSON.parse(String(match.metadata.scriptureReferences))
          : { bible: [], quran: [] },
      } as DocumentChunk['metadata'],
      text: String(
        Array.isArray(match.metadata?.text)
          ? match.metadata.text.join(' ')
          : match.metadata?.text ?? ''
      ),
    }));
  } catch (error) {
    console.error('Error searching Pinecone:', error);
    throw new Error('Failed to search document chunks');
  }
}

/**
 * Delete document chunks by source
 */
export async function deleteDocumentChunks(source: string): Promise<void> {
  try {
    await index.deleteMany({
      filter: {
        source: { $eq: source },
      },
    });
    console.log(`Deleted document chunks for source: ${source}`);
  } catch (error) {
    console.error('Error deleting document chunks:', error);
    throw new Error('Failed to delete document chunks');
  }
}

/**
 * Get statistics about stored documents
 */
export async function getDocumentStats(): Promise<{
  totalChunks: number;
  topics: string[];
  sources: string[];
}> {
  try {
    const stats = await index.describeIndexStats();
    
    // Extract unique topics and sources from metadata
    const topics = new Set<string>();
    const sources = new Set<string>();
    
    // Note: Pinecone doesn't provide detailed stats in describeIndexStats
    // This is a placeholder - you might need to implement this differently
    // based on your specific needs
    
    // In getDocumentStats, use totalRecordCount
    return {
      totalChunks: stats.totalRecordCount || 0,
      topics: Array.from(topics),
      sources: Array.from(sources),
    };
  } catch (error) {
    console.error('Error getting document stats:', error);
    throw new Error('Failed to get document statistics');
  }
}

export { pinecone, index }; 