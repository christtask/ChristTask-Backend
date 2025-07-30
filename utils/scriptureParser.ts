import { parseBibleReference, getBibleVerse } from '../lib/bible';
import { parseQuranReference, getQuranVerse } from '../lib/quran';

export interface ScriptureReference {
  type: 'bible' | 'quran';
  reference: string;
  parsed?: any;
}

/**
 * Extract all scripture references from text
 */
export function extractScriptureReferences(text: string): {
  bible: string[];
  quran: string[];
} {
  const bibleRefs = extractBibleReferences(text);
  const quranRefs = extractQuranReferences(text);
  
  return {
    bible: bibleRefs,
    quran: quranRefs,
  };
}

/**
 * Extract Bible references from text
 */
export function extractBibleReferences(text: string): string[] {
  const patterns = [
    // Standard format: "John 3:16", "Romans 8:28"
    /\b([1-3]?\s*[A-Za-z]+)\s+(\d+):(\d+)\b/g,
    // Chapter only: "John 3"
    /\b([1-3]?\s*[A-Za-z]+)\s+(\d+)\b/g,
    // Verse range: "John 3:16-18"
    /\b([1-3]?\s*[A-Za-z]+)\s+(\d+):(\d+)-(\d+)\b/g,
  ];
  
  const references = new Set<string>();
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const book = match[1].trim();
      const chapter = match[2];
      const verse = match[3];
      const endVerse = match[4];
      
      if (verse) {
        if (endVerse) {
          references.add(`${book} ${chapter}:${verse}-${endVerse}`);
        } else {
          references.add(`${book} ${chapter}:${verse}`);
        }
      } else {
        references.add(`${book} ${chapter}`);
      }
    }
  });
  
  return Array.from(references);
}

/**
 * Extract Quran references from text
 */
export function extractQuranReferences(text: string): string[] {
  const patterns = [
    // Standard format: "Surah 2:106", "Quran 9:29"
    /\b(?:Surah|Quran)\s+(\d+):(\d+)\b/gi,
    // Chapter only: "Surah 2"
    /\b(?:Surah|Quran)\s+(\d+)\b/gi,
    // Verse range: "Surah 2:106-108"
    /\b(?:Surah|Quran)\s+(\d+):(\d+)-(\d+)\b/gi,
  ];
  
  const references = new Set<string>();
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const surah = match[1];
      const ayah = match[2];
      const endAyah = match[3];
      
      if (ayah) {
        if (endAyah) {
          references.add(`Surah ${surah}:${ayah}-${endAyah}`);
        } else {
          references.add(`Surah ${surah}:${ayah}`);
        }
      } else {
        references.add(`Surah ${surah}`);
      }
    }
  });
  
  return Array.from(references);
}

/**
 * Parse and validate scripture references
 */
export function parseScriptureReferences(references: string[]): ScriptureReference[] {
  return references.map(ref => {
    // Try to parse as Bible reference first
    const bibleParsed = parseBibleReference(ref);
    if (bibleParsed) {
      return {
        type: 'bible' as const,
        reference: ref,
        parsed: bibleParsed,
      };
    }
    
    // Try to parse as Quran reference
    const quranParsed = parseQuranReference(ref);
    if (quranParsed) {
      return {
        type: 'quran' as const,
        reference: ref,
        parsed: quranParsed,
      };
    }
    
    // Return unparsed reference
    return {
      type: 'bible' as const, // Default to Bible
      reference: ref,
    };
  });
}

/**
 * Format scripture reference for display
 */
export function formatScriptureReference(reference: ScriptureReference): string {
  if (reference.type === 'bible') {
    return `📖 ${reference.reference}`;
  } else {
    return `☪️ ${reference.reference}`;
  }
}

/**
 * Get full scripture text for references
 */
export function getScriptureTexts(references: string[]): {
  bible: { reference: string; text: string }[];
  quran: { reference: string; text: string }[];
} {
  const bibleRefs = extractBibleReferences(references.join(' '));
  const quranRefs = extractQuranReferences(references.join(' '));
  
  const bibleTexts = bibleRefs.map(ref => {
    const verse = getBibleVerse(ref);
    return {
      reference: ref,
      text: verse ? verse.text : 'Verse not found',
    };
  });
  
  const quranTexts = quranRefs.map(ref => {
    const verse = getQuranVerse(ref);
    return {
      reference: ref,
      text: verse ? verse.text : 'Verse not found',
    };
  });
  
  return {
    bible: bibleTexts,
    quran: quranTexts,
  };
}

/**
 * Highlight scripture references in text
 */
export function highlightScriptureReferences(text: string): string {
  let highlightedText = text;
  
  // Highlight Bible references
  const bibleRefs = extractBibleReferences(text);
  bibleRefs.forEach(ref => {
    const regex = new RegExp(`\\b${ref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    highlightedText = highlightedText.replace(regex, `<span class="bible-ref">📖 ${ref}</span>`);
  });
  
  // Highlight Quran references
  const quranRefs = extractQuranReferences(text);
  quranRefs.forEach(ref => {
    const regex = new RegExp(`\\b${ref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    highlightedText = highlightedText.replace(regex, `<span class="quran-ref">☪️ ${ref}</span>`);
  });
  
  return highlightedText;
}

/**
 * Create scripture comparison table
 */
export function createScriptureComparison(
  bibleRefs: string[],
  quranRefs: string[]
): string {
  const bibleTexts = getScriptureTexts(bibleRefs).bible;
  const quranTexts = getScriptureTexts(quranRefs).quran;
  
  let comparison = '## Scripture Comparison\n\n';
  
  if (bibleTexts.length > 0) {
    comparison += '### Biblical References\n\n';
    bibleTexts.forEach(({ reference, text }) => {
      comparison += `**${reference}**\n${text}\n\n`;
    });
  }
  
  if (quranTexts.length > 0) {
    comparison += '### Quranic References\n\n';
    quranTexts.forEach(({ reference, text }) => {
      comparison += `**${reference}**\n${text}\n\n`;
    });
  }
  
  return comparison;
}

/**
 * Validate scripture reference format
 */
export function validateScriptureReference(reference: string): {
  isValid: boolean;
  type: 'bible' | 'quran' | 'unknown';
  error?: string;
} {
  // Try Bible format
  if (parseBibleReference(reference)) {
    return { isValid: true, type: 'bible' };
  }
  
  // Try Quran format
  if (parseQuranReference(reference)) {
    return { isValid: true, type: 'quran' };
  }
  
  return {
    isValid: false,
    type: 'unknown',
    error: 'Invalid scripture reference format',
  };
}

/**
 * Get common scripture reference patterns
 */
export function getCommonScripturePatterns(): {
  bible: string[];
  quran: string[];
} {
  return {
    bible: [
      'John 3:16',
      'Romans 8:28',
      '2 Timothy 3:16',
      'John 1:1',
      'John 1:14',
      'Colossians 2:9',
      'Philippians 2:6-7',
      '1 Corinthians 15:3-4',
      'Romans 1:20',
      'Psalm 19:1',
    ],
    quran: [
      'Surah 2:106',
      'Surah 9:5',
      'Surah 9:29',
      'Surah 47:4',
      'Surah 4:34',
      'Surah 5:116',
      'Surah 112:1-4',
      'Surah 19:88-92',
      'Surah 7:54',
      'Surah 41:9-12',
    ],
  };
}

/**
 * Extract and categorize scripture references by topic
 */
export function categorizeScriptureReferences(references: string[]): {
  trinity: string[];
  resurrection: string[];
  violence: string[];
  women: string[];
  creation: string[];
  salvation: string[];
  other: string[];
} {
  const categories = {
    trinity: [] as string[],
    resurrection: [] as string[],
    violence: [] as string[],
    women: [] as string[],
    creation: [] as string[],
    salvation: [] as string[],
    other: [] as string[],
  };
  
  const trinityRefs = ['John 1:1', 'John 1:14', 'Colossians 2:9', 'Philippians 2:6-7', 'Surah 5:116', 'Surah 4:171', 'Surah 112:1-4'];
  const resurrectionRefs = ['1 Corinthians 15:3-4', 'John 20:1-31', 'Matthew 28:1-10'];
  const violenceRefs = ['Surah 9:5', 'Surah 9:29', 'Surah 47:4', 'Surah 8:12', 'Surah 8:39'];
  const womenRefs = ['Surah 4:34', 'Surah 4:3', 'Surah 4:11', 'Surah 2:223'];
  const creationRefs = ['Genesis 1:1', 'Surah 7:54', 'Surah 41:9-12', 'Surah 25:59'];
  const salvationRefs = ['John 3:16', 'Romans 10:9', 'Surah 2:62', 'Surah 3:85'];
  
  references.forEach(ref => {
    if (trinityRefs.some(r => ref.includes(r))) {
      categories.trinity.push(ref);
    } else if (resurrectionRefs.some(r => ref.includes(r))) {
      categories.resurrection.push(ref);
    } else if (violenceRefs.some(r => ref.includes(r))) {
      categories.violence.push(ref);
    } else if (womenRefs.some(r => ref.includes(r))) {
      categories.women.push(ref);
    } else if (creationRefs.some(r => ref.includes(r))) {
      categories.creation.push(ref);
    } else if (salvationRefs.some(r => ref.includes(r))) {
      categories.salvation.push(ref);
    } else {
      categories.other.push(ref);
    }
  });
  
  return categories;
} 