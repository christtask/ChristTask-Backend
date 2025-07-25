import * as fs from 'fs';
import * as path from 'path';
import { storeDocumentChunks, DocumentChunk } from '../lib/pinecone';
import { generateEmbeddings } from '../lib/openai';
import { v4 as uuidv4 } from 'uuid';

// List of URLs to scrape and ingest
const URLS_TO_INGEST = [
  'https://www.answering-islam.org/authors/shamoun/qa/spirit_god_of_jesus.html',
  'https://www.answering-islam.org/authors/shamoun/qa/appease_a.html',
  'https://www.answering-islam.org/authors/shamoun/qa/appease_b.html',
  'https://www.answering-islam.org/authors/shamoun/qa/appease_c.html',
  'https://www.answering-islam.org/authors/shamoun/qa/jesus_god_distinct.html',
  'https://www.answering-islam.org/authors/shamoun/qa/father_authority.html',
  'https://www.answering-islam.org/authors/shamoun/qa/jesusforgiving_lordsprayer.html',
  'https://www.answering-islam.org/authors/shamoun/qa/universal_mission.html',
  // Add more URLs here:
  // 'https://example.com/page1',
  // 'https://example.com/page2',
];

// Helper to scrape content from a URL
async function scrapeUrl(url: string): Promise<string> {
  try {
    console.log(`Scraping: ${url}`);
    
    // For now, we'll use a simple fetch approach
    // In production, you might want to use a proper web scraping library
    const response = await fetch(url);
    const html = await response.text();
    
    // Simple HTML to text conversion (remove HTML tags)
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles
      .replace(/<[^>]+>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return text;
  } catch (error) {
    console.error(`Failed to scrape ${url}:`, error);
    return '';
  }
}

// Helper to chunk content by paragraphs/sections
function chunkContent(content: string, source: string): DocumentChunk[] {
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 50);
  const chunks: DocumentChunk[] = [];
  
  paragraphs.forEach((paragraph, index) => {
    if (paragraph.trim().length > 100) { // Only chunks with substantial content
      // Split very long paragraphs into smaller chunks
      const maxChunkLength = 1000; // Limit chunk size to avoid token limits
      const text = paragraph.trim();
      
      if (text.length <= maxChunkLength) {
        chunks.push({
          id: uuidv4(),
          text: text,
          metadata: {
            source: source,
            topic: 'Web Content',
            difficulty: 'Intermediate',
            scriptureReferences: { bible: [], quran: [] },
            chunkIndex: index,
            totalChunks: paragraphs.length,
            createdAt: new Date().toISOString(),
            url: source,
          },
        });
      } else {
        // Split long paragraphs into smaller chunks
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
        let currentChunk = '';
        let chunkIndex = 0;
        
        for (const sentence of sentences) {
          if ((currentChunk + sentence).length > maxChunkLength && currentChunk.length > 0) {
            chunks.push({
              id: uuidv4(),
              text: currentChunk.trim(),
              metadata: {
                source: source,
                topic: 'Web Content',
                difficulty: 'Intermediate',
                scriptureReferences: { bible: [], quran: [] },
                chunkIndex: chunkIndex,
                totalChunks: paragraphs.length,
                createdAt: new Date().toISOString(),
                url: source,
              },
            });
            currentChunk = sentence;
            chunkIndex++;
          } else {
            currentChunk += (currentChunk ? ' ' : '') + sentence;
          }
        }
        
        // Add the last chunk
        if (currentChunk.trim().length > 0) {
          chunks.push({
            id: uuidv4(),
            text: currentChunk.trim(),
            metadata: {
              source: source,
              topic: 'Web Content',
              difficulty: 'Intermediate',
              scriptureReferences: { bible: [], quran: [] },
              chunkIndex: chunkIndex,
              totalChunks: paragraphs.length,
              createdAt: new Date().toISOString(),
              url: source,
            },
          });
        }
      }
    }
  });
  
  return chunks;
}

// Helper to save scraped content to file
function saveScrapedContent(url: string, content: string): void {
  const filename = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50) + '.md';
  const filepath = path.join(process.cwd(), 'data', filename);
  
  try {
    fs.writeFileSync(filepath, content);
    console.log(`Saved scraped content to: ${filepath}`);
  } catch (error) {
    console.error(`Failed to save content to ${filepath}:`, error);
  }
}

async function main() {
  console.log('Starting URL ingestion for RAG chatbot...');
  
  // Process URLs in batches to avoid rate limits
  const batchSize = 2; // Process 2 URLs at a time
  
  for (let i = 0; i < URLS_TO_INGEST.length; i += batchSize) {
    const batch = URLS_TO_INGEST.slice(i, i + batchSize);
    console.log(`\n--- Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(URLS_TO_INGEST.length/batchSize)} ---`);
    
    let batchChunks: DocumentChunk[] = [];
    
    for (const url of batch) {
      try {
        // Scrape content from URL
        const content = await scrapeUrl(url);
        
        if (content) {
          // Save to file for backup
          saveScrapedContent(url, content);
          
          // Chunk the content
          const chunks = chunkContent(content, url);
          batchChunks.push(...chunks);
          
          console.log(`✅ Scraped and chunked ${chunks.length} pieces from ${url}`);
        } else {
          console.log(`❌ No content found for ${url}`);
        }
      } catch (error) {
        console.error(`❌ Failed to process ${url}:`, error);
      }
    }
    
    if (batchChunks.length === 0) {
      console.log('No content in this batch. Continuing...');
      continue;
    }
    
    console.log(`\nGenerating embeddings for ${batchChunks.length} chunks in this batch...`);
    
    try {
      // Generate embeddings for this batch
      const texts = batchChunks.map(chunk => chunk.text);
      const embeddings = await generateEmbeddings(texts);
      
      console.log('Uploading to Pinecone...');
      
      // Store in Pinecone
      await storeDocumentChunks(batchChunks, embeddings);
      
      console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} complete!`);
      console.log(`📊 Added ${batchChunks.length} chunks from this batch`);
      
      // Wait a bit between batches to avoid rate limits
      if (i + batchSize < URLS_TO_INGEST.length) {
        console.log('⏳ Waiting 30 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
      
    } catch (error) {
      console.error(`❌ Batch ${Math.floor(i/batchSize) + 1} failed:`, error);
      console.log('Continuing with next batch...');
    }
  }
  
  console.log('\n🎉 URL ingestion process complete!');
}

// Run the script
main().catch(console.error); 