import { Pinecone } from '@pinecone-database/pinecone';

// Types
interface PineconeConfig {
  apiKey: string;
  environment: string;
  indexName: string;
}

interface SearchResult {
  id: string;
  score?: number;
  text: string;
  metadata: {
    source: string;
    scriptureReferences?: {
      bible: string[];
      quran: string[];
      torah?: string[];
    };
    [key: string]: any;
  };
}

interface DocumentStats {
  totalChunks: number;
  dimension: number;
  indexFullness: number;
}

// Validate Pinecone environment variables
const validatePineconeConfig = (): PineconeConfig => {
  const apiKey = process.env.PINECONE_API_KEY?.trim();
  const environment = process.env.PINECONE_ENVIRONMENT?.trim();
  const indexName = process.env.PINECONE_INDEX_NAME?.trim();
  
  if (!apiKey) {
    throw new Error('PINECONE_API_KEY is not set');
  }
  
  if (!environment) {
    throw new Error('PINECONE_ENVIRONMENT is not set');
  }
  
  if (!indexName) {
    throw new Error('PINECONE_INDEX_NAME is not set');
  }
  
  return { apiKey, environment, indexName };
};

// Initialize Pinecone client with validation
let pinecone: Pinecone | null = null;
let index: any = null;

try {
  const config = validatePineconeConfig();
  pinecone = new Pinecone({
    apiKey: config.apiKey,
    environment: config.environment,
  });
  index = pinecone.index(config.indexName);
  console.log('✅ Pinecone initialized successfully');
} catch (error) {
  console.error('❌ Pinecone initialization failed:', (error as Error).message);
  pinecone = null;
  index = null;
}

/**
 * Search for similar document chunks in Pinecone
 */
export async function searchSimilarChunks(
  queryEmbedding: number[], 
  topK: number = 5, 
  filter: Record<string, any> = {}
): Promise<SearchResult[]> {
  try {
    if (!pinecone || !index) {
      console.log('⚠️ Pinecone not initialized, skipping search');
      return [];
    }

    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
    });

    if (!queryResponse.matches) {
      console.log('No matches found in Pinecone');
      return [];
    }

    return queryResponse.matches.map(match => ({
      id: match.id,
      score: match.score,
      text: String(match.metadata?.text || ''),
      metadata: {
        ...match.metadata,
        source: match.metadata?.source || 'unknown',
        scriptureReferences: match.metadata?.scriptureReferences
          ? JSON.parse(String(match.metadata.scriptureReferences))
          : { bible: [], quran: [], torah: [] },
      }
    }));
  } catch (error) {
    console.error('Error searching Pinecone:', error);
    console.error('Pinecone error details:', {
      message: (error as Error).message,
      code: (error as any).code,
      status: (error as any).status
    });
    throw new Error('Failed to search Pinecone: ' + (error as Error).message);
  }
}

/**
 * Get document statistics from Pinecone
 */
export async function getDocumentStats(): Promise<DocumentStats> {
  try {
    if (!pinecone || !index) {
      console.log('⚠️ Pinecone not initialized, cannot get stats');
      return {
        totalChunks: 0,
        dimension: 0,
        indexFullness: 0,
      };
    }
    
    const stats = await index.describeIndexStats();
    
    return {
      totalChunks: stats.totalRecordCount || 0,
      dimension: stats.dimension || 0,
      indexFullness: stats.indexFullness || 0,
    };
  } catch (error) {
    console.error('Error getting Pinecone stats:', error);
    throw new Error('Failed to get Pinecone stats: ' + (error as Error).message);
  }
} 