const { Pinecone } = require('@pinecone-database/pinecone');

// Validate Pinecone environment variables
const validatePineconeConfig = () => {
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
let pinecone;
let index;

try {
  const config = validatePineconeConfig();
  pinecone = new Pinecone({
    apiKey: config.apiKey,
    environment: config.environment,
  });
  index = pinecone.index(config.indexName);
  console.log('✅ Pinecone initialized successfully');
} catch (error) {
  console.error('❌ Pinecone initialization failed:', error.message);
  pinecone = null;
  index = null;
}

/**
 * Search for similar document chunks in Pinecone
 */
async function searchSimilarChunks(queryEmbedding, topK = 5, filter = {}) {
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
        scriptureReferences: match.metadata?.scriptureReferences
          ? JSON.parse(String(match.metadata.scriptureReferences))
          : { bible: [], quran: [] },
      }
    }));
  } catch (error) {
    console.error('Error searching Pinecone:', error);
    console.error('Pinecone error details:', {
      message: error.message,
      code: error.code,
      status: error.status
    });
    throw new Error('Failed to search Pinecone: ' + error.message);
  }
}

/**
 * Get document statistics from Pinecone
 */
async function getDocumentStats() {
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
    throw new Error('Failed to get Pinecone stats: ' + error.message);
  }
}

module.exports = {
  searchSimilarChunks,
  getDocumentStats
}; 
