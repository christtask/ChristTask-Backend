// Only load Bible data on server-side
let bibleData: any[] = [];

if (typeof window === 'undefined') {
  // Server-side only
  const { readFileSync } = require('fs');
  const { join } = require('path');

  try {
    bibleData = JSON.parse(
  readFileSync(join(process.cwd(), 'data', 'kjv.json'), 'utf-8')
);
  } catch (error) {
    console.error('Error loading Bible data:', error);
    bibleData = [];
  }
}

export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
}

export interface BibleReference {
  book: string;
  chapter: number;
  verse?: number;
  endVerse?: number;
}

/**
 * Parse Bible reference string (e.g., "John 3:16", "Romans 8:28-30")
 */
export function parseBibleReference(reference: string): BibleReference | null {
  const patterns = [
    // Full reference: "John 3:16"
    /^([1-3]?\s*[A-Za-z]+)\s+(\d+):(\d+)$/,
    // Chapter only: "John 3"
    /^([1-3]?\s*[A-Za-z]+)\s+(\d+)$/,
    // Verse range: "John 3:16-18"
    /^([1-3]?\s*[A-Za-z]+)\s+(\d+):(\d+)-(\d+)$/,
  ];

  for (const pattern of patterns) {
    const match = reference.trim().match(pattern);
    if (match) {
      const book = match[1].trim();
      const chapter = parseInt(match[2]);
      const verse = match[3] ? parseInt(match[3]) : undefined;
      const endVerse = match[4] ? parseInt(match[4]) : undefined;

      return { book, chapter, verse, endVerse };
    }
  }

  return null;
}

/**
 * Get Bible verse by reference
 */
export function getBibleVerse(reference: string): BibleVerse | null {
  const parsed = parseBibleReference(reference);
  if (!parsed) return null;

  const { book, chapter, verse } = parsed;
  
  // Find the book in the Bible data
  const bookData = bibleData.find((b: any) => 
    b.name.toLowerCase() === book.toLowerCase() ||
    b.abbreviation.toLowerCase() === book.toLowerCase()
  );

  if (!bookData) return null;

  // Find the chapter
  const chapterData = bookData.chapters[chapter - 1];
  if (!chapterData || !verse) return null;

  // Find the verse
  const verseText = chapterData[verse - 1];
  if (!verseText) return null;

  return {
    book: bookData.name,
    chapter,
    verse,
    text: verseText,
    reference: `${bookData.name} ${chapter}:${verse}`,
  };
}

/**
 * Get multiple Bible verses by reference
 */
export function getBibleVerses(references: string[]): BibleVerse[] {
  return references
    .map(ref => getBibleVerse(ref))
    .filter((verse): verse is BibleVerse => verse !== null);
}

/**
 * Get Bible verses in a range
 */
export function getBibleVerseRange(reference: string): BibleVerse[] {
  const parsed = parseBibleReference(reference);
  if (!parsed || !parsed.verse || !parsed.endVerse) return [];

  const { book, chapter, verse, endVerse } = parsed;
  
  const bookData = bibleData.find((b: any) => 
    b.name.toLowerCase() === book.toLowerCase() ||
    b.abbreviation.toLowerCase() === book.toLowerCase()
  );

  if (!bookData) return [];

  const chapterData = bookData.chapters[chapter - 1];
  if (!chapterData) return [];

  const verses: BibleVerse[] = [];
  
  for (let v = verse; v <= endVerse; v++) {
    const verseText = chapterData[v - 1];
    if (verseText) {
      verses.push({
        book: bookData.name,
        chapter,
        verse: v,
        text: verseText,
        reference: `${bookData.name} ${chapter}:${v}`,
      });
    }
  }

  return verses;
}

/**
 * Search Bible for keywords
 */
export function searchBible(keywords: string): BibleVerse[] {
  const searchTerms = keywords.toLowerCase().split(' ');
  const results: BibleVerse[] = [];

  bibleData.forEach((book: any) => {
    book.chapters.forEach((chapter: string[], chapterIndex: number) => {
      chapter.forEach((verse: string, verseIndex: number) => {
        const verseLower = verse.toLowerCase();
        const matches = searchTerms.every(term => verseLower.includes(term));
        
        if (matches) {
          results.push({
            book: book.name,
            chapter: chapterIndex + 1,
            verse: verseIndex + 1,
            text: verse,
            reference: `${book.name} ${chapterIndex + 1}:${verseIndex + 1}`,
          });
        }
      });
    });
  });

  return results.slice(0, 20); // Limit results
}

/**
 * Get common apologetics Bible verses
 */
export function getCommonApologeticsVerses(): BibleVerse[] {
  const commonReferences = [
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
    'Hebrews 11:1',
    '1 Peter 3:15',
    'Matthew 28:19-20',
    'Acts 4:12',
    'John 14:6',
  ];

  return getBibleVerses(commonReferences);
}

/**
 * Format Bible verse for display
 */
export function formatBibleVerse(verse: BibleVerse, includeReference: boolean = true): string {
  if (includeReference) {
    return `**${verse.reference}**\n${verse.text}`;
  }
  return verse.text;
}

/**
 * Get all books of the Bible
 */
export function getBibleBooks(): string[] {
  return bibleData.map((book: any) => book.name);
}

/**
 * Get chapters in a book
 */
export function getBibleChapters(bookName: string): number {
  const book = bibleData.find((b: any) => 
    b.name.toLowerCase() === bookName.toLowerCase() ||
    b.abbreviation.toLowerCase() === bookName.toLowerCase()
  );
  
  return book ? book.chapters.length : 0;
} 