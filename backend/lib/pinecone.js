const { Pinecone } = require('@pinecone-database/pinecone');

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
  environment: process.env.PINECONE_ENVIRONMENT || 'gcp-starter',
});

/**
 * Search for similar document chunks in Pinecone
 */
async function searchSimilarChunks(queryEmbedding, topK = 5, filter = {}) {
  try {
    const indexName = process.env.PINECONE_INDEX_NAME || 'chatbot';
    const index = pinecone.index(indexName);

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
    throw new Error('Failed to search Pinecone: ' + error.message);
  }
}

/**
 * Get document statistics from Pinecone
 */
async function getDocumentStats() {
  try {
    const indexName = process.env.PINECONE_INDEX_NAME || 'chatbot';
    const index = pinecone.index(indexName);
    
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