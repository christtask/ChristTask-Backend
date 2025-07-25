import * as fs from 'fs';
import * as path from 'path';
import { storeDocumentChunks, DocumentChunk } from '../lib/pinecone';
import { generateEmbeddings } from '../lib/openai';
import { v4 as uuidv4 } from 'uuid';

// Helper to chunk markdown content by topics/questions
function chunkMarkdownContent(md: string): DocumentChunk[] {
  const lines = md.split(/\r?\n/);
  const chunks: DocumentChunk[] = [];
  let currentChunk: Partial<DocumentChunk> = {};
  let buffer: string[] = [];
  let topic = '';
  let chunkIndex = 0;

  for (const line of lines) {
    if (line.startsWith('### ')) {
      // Save previous chunk
      if (buffer.length > 0 && topic) {
        chunks.push({
          id: uuidv4(),
          text: buffer.join('\n').trim(),
          metadata: {
            source: 'apologetics-content.md',
            topic,
            difficulty: 'Intermediate',
            scriptureReferences: { bible: [], quran: [] },
            chunkIndex,
            totalChunks: 0, // will set later
            createdAt: new Date().toISOString(),
          },
        });
        chunkIndex++;
      }
      buffer = [line];
      topic = line.replace('### ', '').trim();
    } else {
      buffer.push(line);
    }
  }
  // Push last chunk
  if (buffer.length > 0 && topic) {
    chunks.push({
      id: uuidv4(),
      text: buffer.join('\n').trim(),
      metadata: {
        source: 'apologetics-content.md',
        topic,
        difficulty: 'Intermediate',
        scriptureReferences: { bible: [], quran: [] },
        chunkIndex,
        totalChunks: 0,
        createdAt: new Date().toISOString(),
      },
    });
  }
  // Set totalChunks
  const total = chunks.length;
  for (const chunk of chunks) {
    chunk.metadata.totalChunks = total;
  }
  return chunks;
}

// Helper to load Bible verses
function loadBibleVerses(): DocumentChunk[] {
  const filePath = path.join(__dirname, '../data/bible-verses.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return data.verses.map((v: any, i: number) => ({
    id: uuidv4(),
    text: v.text,
    metadata: {
      source: 'bible-verses.json',
      topic: v.topic || 'General',
      difficulty: v.difficulty ? v.difficulty.charAt(0).toUpperCase() + v.difficulty.slice(1) : 'Intermediate',
      scriptureReferences: { bible: [v.reference], quran: [] },
      chunkIndex: i,
      totalChunks: data.verses.length,
      createdAt: new Date().toISOString(),
    },
  }));
}

async function main() {
  // Ingest apologetics markdown
  const mdPath = path.join(process.cwd(), 'data/apologetics-content.md');
  const mdContent = fs.readFileSync(mdPath, 'utf-8');
  const mdChunks = chunkMarkdownContent(mdContent);

  // Ingest new apologetics markdown from Answering Islam
  const aiMdPath = path.join(process.cwd(), 'data/apologetics-spirit-god-of-jesus.md');
  const aiMdContent = fs.existsSync(aiMdPath) ? fs.readFileSync(aiMdPath, 'utf-8') : '';
  const aiMdChunks = aiMdContent ? chunkMarkdownContent(aiMdContent) : [];

  // Ingest Bible verses
  const biblePath = path.join(process.cwd(), 'data/bible-verses.json');
  const data = JSON.parse(fs.readFileSync(biblePath, 'utf-8'));
  const bibleChunks = data.verses.map((v: any, i: number) => ({
    id: uuidv4(),
    text: v.text,
    metadata: {
      source: 'bible-verses.json',
      topic: v.topic || 'General',
      difficulty: v.difficulty ? v.difficulty.charAt(0).toUpperCase() + v.difficulty.slice(1) : 'Intermediate',
      scriptureReferences: { bible: [v.reference], quran: [] },
      chunkIndex: i,
      totalChunks: data.verses.length,
      createdAt: new Date().toISOString(),
    },
  }));

  // Combine all chunks
  const allChunks = [...mdChunks, ...aiMdChunks, ...bibleChunks];
  const texts = allChunks.map(chunk => chunk.text);

  // Generate embeddings
  console.log('Generating embeddings for', allChunks.length, 'chunks...');
  const embeddings = await generateEmbeddings(texts);

  // Store in Pinecone
  console.log('Uploading to Pinecone...');
  await storeDocumentChunks(allChunks, embeddings);
  console.log('Ingestion complete!');
}

main().catch(err => {
  console.error('Ingestion failed:', err);
  process.exit(1);
});
