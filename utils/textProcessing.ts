import { DocumentChunk } from '@/lib/pinecone';
import { analyzeDocumentContent } from '@/lib/openai';
import { extractScriptureReferences } from './scriptureParser';

/**
 * Split text into chunks with overlap for better context preservation
 */
export function chunkText(
  text: string,
  chunkSize: number = 800,
  overlap: number = 100
): string[] {
  const chunks: string[] = [];
  const sentences = splitIntoSentences(text);
  
  let currentChunk = '';
  let sentenceIndex = 0;
  
  while (sentenceIndex < sentences.length) {
    const sentence = sentences[sentenceIndex];
    
    // If adding this sentence would exceed chunk size
    if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      
      // Start new chunk with overlap
      const overlapSentences = getOverlapSentences(sentences, sentenceIndex, overlap);
      currentChunk = overlapSentences + sentence;
    } else {
      currentChunk += sentence;
    }
    
    sentenceIndex++;
  }
  
  // Add the last chunk if it has content
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

/**
 * Split text into sentences while preserving punctuation
 */
function splitIntoSentences(text: string): string[] {
  // Remove extra whitespace and normalize
  const normalized = text.replace(/\s+/g, ' ').trim();
  
  // Split on sentence endings while preserving abbreviations
  const sentences = normalized.split(/(?<=[.!?])\s+/);
  
  return sentences.filter(sentence => sentence.trim().length > 0);
}

/**
 * Get sentences for overlap from previous chunk
 */
function getOverlapSentences(sentences: string[], currentIndex: number, overlapSize: number): string {
  let overlapText = '';
  let index = currentIndex - 1;
  
  while (index >= 0 && overlapText.length < overlapSize) {
    const sentence = sentences[index];
    if (overlapText.length + sentence.length <= overlapSize) {
      overlapText = sentence + ' ' + overlapText;
    } else {
      break;
    }
    index--;
  }
  
  return overlapText;
}

/**
 * Process document and create chunks with metadata
 */
export async function processDocument(
  text: string,
  source: string,
  options: {
    chunkSize?: number;
    overlap?: number;
    autoAnalyze?: boolean;
  } = {}
): Promise<DocumentChunk[]> {
  const {
    chunkSize = 800,
    overlap = 100,
    autoAnalyze = true,
  } = options;
  
  // Split text into chunks
  const textChunks = chunkText(text, chunkSize, overlap);
  
  // Analyze the entire document for metadata
  let documentMetadata = {
    topic: 'General Apologetics',
    difficulty: 'Intermediate' as const,
    scriptureReferences: { bible: [] as string[], quran: [] as string[] },
  };
  
  if (autoAnalyze) {
    try {
      documentMetadata = await analyzeDocumentContent(text);
    } catch (error) {
      console.warn('Failed to auto-analyze document, using defaults:', error);
    }
  }
  
  // Create document chunks with metadata
  const chunks: DocumentChunk[] = [];
  
  for (let i = 0; i < textChunks.length; i++) {
    const chunk = textChunks[i];
    
    // Extract scripture references from this specific chunk
    const chunkScriptureRefs = extractScriptureReferences(chunk);
    
    // Merge with document-level references
    const mergedScriptureRefs = {
      bible: [...new Set([...documentMetadata.scriptureReferences.bible, ...chunkScriptureRefs.bible])],
      quran: [...new Set([...documentMetadata.scriptureReferences.quran, ...chunkScriptureRefs.quran])],
    };
    
    chunks.push({
      id: `${source}-chunk-${i}`,
      text: chunk,
      metadata: {
        source,
        topic: documentMetadata.topic,
        difficulty: documentMetadata.difficulty,
        scriptureReferences: mergedScriptureRefs,
        chunkIndex: i,
        totalChunks: textChunks.length,
        createdAt: new Date().toISOString(),
      },
    });
  }
  
  return chunks;
}

/**
 * Clean and normalize text for processing
 */
export function cleanText(text: string): string {
  return text
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Remove special characters that might interfere with processing
    .replace(/[^\w\s.,!?;:()'"-]/g, '')
    // Normalize quotes
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    // Normalize dashes
    .replace(/[–—]/g, '-')
    // Trim whitespace
    .trim();
}

/**
 * Extract key phrases and terms from text
 */
export function extractKeyPhrases(text: string, maxPhrases: number = 10): string[] {
  // Simple key phrase extraction based on frequency and importance
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3); // Filter out short words
  
  const wordFreq: { [key: string]: number } = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  
  // Sort by frequency and return top phrases
  return Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxPhrases)
    .map(([word]) => word);
}

/**
 * Detect document language (simplified)
 */
export function detectLanguage(text: string): string {
  // Simple language detection based on common words
  const englishWords = ['the', 'and', 'of', 'to', 'in', 'is', 'that', 'it', 'with', 'as'];
  const arabicWords = ['في', 'من', 'إلى', 'على', 'أن', 'هذا', 'التي', 'كان', 'له', 'عن'];
  
  const textLower = text.toLowerCase();
  const englishCount = englishWords.filter(word => textLower.includes(word)).length;
  const arabicCount = arabicWords.filter(word => text.includes(word)).length;
  
  if (arabicCount > englishCount) {
    return 'arabic';
  }
  return 'english';
}

/**
 * Extract document structure (headings, sections, etc.)
 */
export function extractDocumentStructure(text: string): {
  headings: string[];
  sections: { title: string; content: string }[];
} {
  const lines = text.split('\n');
  const headings: string[] = [];
  const sections: { title: string; content: string }[] = [];
  
  let currentSection = { title: '', content: '' };
  
  lines.forEach(line => {
    const trimmed = line.trim();
    
    // Detect headings (lines that are all caps, start with numbers, or are short)
    if (
      trimmed.length > 0 &&
      (trimmed === trimmed.toUpperCase() ||
       /^\d+\.\s/.test(trimmed) ||
       (trimmed.length < 100 && trimmed.endsWith(':')))
    ) {
      headings.push(trimmed);
      
      // Start new section
      if (currentSection.title) {
        sections.push({ ...currentSection });
      }
      currentSection = { title: trimmed, content: '' };
    } else if (trimmed.length > 0) {
      currentSection.content += line + '\n';
    }
  });
  
  // Add the last section
  if (currentSection.title) {
    sections.push(currentSection);
  }
  
  return { headings, sections };
}

/**
 * Calculate text similarity using simple cosine similarity
 */
export function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

/**
 * Remove duplicate or very similar chunks
 */
export function deduplicateChunks(chunks: DocumentChunk[], similarityThreshold: number = 0.8): DocumentChunk[] {
  const uniqueChunks: DocumentChunk[] = [];
  
  chunks.forEach(chunk => {
    const isDuplicate = uniqueChunks.some(existingChunk => 
      calculateTextSimilarity(chunk.text, existingChunk.text) > similarityThreshold
    );
    
    if (!isDuplicate) {
      uniqueChunks.push(chunk);
    }
  });
  
  return uniqueChunks;
} 