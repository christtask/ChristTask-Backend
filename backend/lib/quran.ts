import { readFileSync } from 'fs';
import { join } from 'path';

// Import Quran data directly
import { quranVerses } from '../data/quranVerses';

// Use the imported data
const quranData = quranVerses;

export interface QuranVerse {
  surah: number;
  ayah: number;
  text: string;
  translation: string;
  reference: string;
  juz: number;
  revelation: 'Meccan' | 'Medinan';
}

export interface QuranReference {
  surah: number;
  ayah?: number;
  endAyah?: number;
}

export interface QuranContradiction {
  verse1: QuranVerse;
  verse2: QuranVerse;
  contradiction: string;
  category: 'theological' | 'historical' | 'scientific' | 'moral' | 'legal';
  severity: 'minor' | 'moderate' | 'major';
}

/**
 * Parse Quran reference string (e.g., "Surah 2:106", "Quran 9:29")
 */
export function parseQuranReference(reference: string): QuranReference | null {
  const patterns = [
    // Full reference: "Surah 2:106" or "Quran 2:106"
    /^(?:Surah|Quran)\s+(\d+):(\d+)$/i,
    // Chapter only: "Surah 2"
    /^(?:Surah|Quran)\s+(\d+)$/i,
    // Verse range: "Surah 2:106-108"
    /^(?:Surah|Quran)\s+(\d+):(\d+)-(\d+)$/i,
  ];

  for (const pattern of patterns) {
    const match = reference.trim().match(pattern);
    if (match) {
      const surah = parseInt(match[1]);
      const ayah = match[2] ? parseInt(match[2]) : undefined;
      const endAyah = match[3] ? parseInt(match[3]) : undefined;

      return { surah, ayah, endAyah };
    }
  }

  return null;
}

/**
 * Get Quran verse by reference
 */
export function getQuranVerse(reference: string): QuranVerse | null {
  const parsed = parseQuranReference(reference);
  if (!parsed || !parsed.ayah) return null;

  const { surah, ayah } = parsed;
  
  // Find the verse in Quran data
  const verseData = quranData.find((v: any) => 
    v.surah === surah && v.ayah === ayah
  );

  if (!verseData) return null;

  return {
    surah: verseData.surah,
    ayah: verseData.ayah,
    text: verseData.text,
    translation: verseData.translation,
    reference: `Surah ${surah}:${ayah}`,
    juz: verseData.juz,
    revelation: verseData.revelation,
  };
}

/**
 * Get multiple Quran verses by reference
 */
export function getQuranVerses(references: string[]): QuranVerse[] {
  return references
    .map(ref => getQuranVerse(ref))
    .filter((verse): verse is QuranVerse => verse !== null);
}

/**
 * Get Quran verses in a range
 */
export function getQuranVerseRange(reference: string): QuranVerse[] {
  const parsed = parseQuranReference(reference);
  if (!parsed || !parsed.ayah || !parsed.endAyah) return [];

  const { surah, ayah, endAyah } = parsed;
  
  const verses: QuranVerse[] = [];
  
  for (let a = ayah; a <= endAyah; a++) {
    const verseData = quranData.find((v: any) => 
      v.surah === surah && v.ayah === a
    );
    
    if (verseData) {
      verses.push({
        surah: verseData.surah,
        ayah: verseData.ayah,
        text: verseData.text,
        translation: verseData.translation,
        reference: `Surah ${surah}:${a}`,
        juz: verseData.juz,
        revelation: verseData.revelation,
      });
    }
  }

  return verses;
}

/**
 * Get problematic Quran verses for apologetics
 */
export function getProblematicQuranVerses(): QuranVerse[] {
  const problematicReferences = [
    'Surah 2:106', // Abrogation principle
    'Surah 9:5',   // Sword verse
    'Surah 9:29',  // Jizya verse
    'Surah 47:4',  // Behead unbelievers
    'Surah 4:34',  // Beat wives
    'Surah 4:3',   // Polygamy
    'Surah 4:11',  // Inheritance inequality
    'Surah 2:223', // Women as fields
    'Surah 5:51',  // Don't take Jews/Christians as friends
    'Surah 3:85',  // Only Islam accepted
    'Surah 2:62',  // Contradicts 3:85
    'Surah 5:116', // Trinity misunderstanding
    'Surah 19:88-92', // God has a son
    'Surah 112:3', // God has no son
    'Surah 7:54',  // 6-day creation
    'Surah 41:9-12', // 8-day creation
  ];

  return getQuranVerses(problematicReferences);
}

/**
 * Get Quran contradictions
 */
export function getQuranContradictions(): QuranContradiction[] {
  const contradictions: QuranContradiction[] = [
    {
      verse1: getQuranVerse('Surah 2:62')!,
      verse2: getQuranVerse('Surah 3:85')!,
      contradiction: 'Surah 2:62 says Jews and Christians will be saved, but Surah 3:85 says only Islam is accepted',
      category: 'theological',
      severity: 'major',
    },
    {
      verse1: getQuranVerse('Surah 19:88-92')!,
      verse2: getQuranVerse('Surah 112:3')!,
      contradiction: 'Surah 19:88-92 condemns saying God has a son, but Surah 112:3 says God has no son',
      category: 'theological',
      severity: 'major',
    },
    {
      verse1: getQuranVerse('Surah 7:54')!,
      verse2: getQuranVerse('Surah 41:9-12')!,
      contradiction: 'Surah 7:54 says creation took 6 days, but Surah 41:9-12 suggests 8 days',
      category: 'scientific',
      severity: 'moderate',
    },
    {
      verse1: getQuranVerse('Surah 2:256')!,
      verse2: getQuranVerse('Surah 9:5')!,
      contradiction: 'Surah 2:256 says no compulsion in religion, but Surah 9:5 commands fighting unbelievers',
      category: 'legal',
      severity: 'major',
    },
  ];

  return contradictions.filter(c => c.verse1 && c.verse2);
}

/**
 * Get abrogated verses (later verses canceling earlier ones)
 */
export function getAbrogatedVerses(): { abrogated: QuranVerse; abrogating: QuranVerse; reason: string }[] {
  const abrogations = [
    {
      abrogated: 'Surah 2:256', // No compulsion in religion
      abrogating: 'Surah 9:5',  // Fight unbelievers
      reason: 'The peaceful verse was abrogated by the sword verse',
    },
    {
      abrogated: 'Surah 73:2-4', // Pray most of the night
      abrogating: 'Surah 73:20', // Pray what is easy
      reason: 'The difficult prayer requirement was abrogated by an easier one',
    },
  ];

  return abrogations
    .map(ab => ({
      abrogated: getQuranVerse(ab.abrogated),
      abrogating: getQuranVerse(ab.abrogating),
      reason: ab.reason,
    }))
    .filter(ab => ab.abrogated && ab.abrogating) as { abrogated: QuranVerse; abrogating: QuranVerse; reason: string }[];
}

/**
 * Search Quran for keywords
 */
export function searchQuran(keywords: string): QuranVerse[] {
  const searchTerms = keywords.toLowerCase().split(' ');
  const results: QuranVerse[] = [];

  quranData.forEach((verse: any) => {
    const textLower = verse.text.toLowerCase();
    const translationLower = verse.translation.toLowerCase();
    
    const matches = searchTerms.every(term => 
      textLower.includes(term) || translationLower.includes(term)
    );
    
    if (matches) {
      results.push({
        surah: verse.surah,
        ayah: verse.ayah,
        text: verse.text,
        translation: verse.translation,
        reference: `Surah ${verse.surah}:${verse.ayah}`,
        juz: verse.juz,
        revelation: verse.revelation,
      });
    }
  });

  return results.slice(0, 20); // Limit results
}

/**
 * Get verses by category
 */
export function getQuranVersesByCategory(category: 'violence' | 'women' | 'trinity' | 'creation' | 'salvation'): QuranVerse[] {
  const categoryMap = {
    violence: ['Surah 9:5', 'Surah 9:29', 'Surah 47:4', 'Surah 8:12', 'Surah 8:39'],
    women: ['Surah 4:34', 'Surah 4:3', 'Surah 4:11', 'Surah 2:223', 'Surah 4:24'],
    trinity: ['Surah 5:116', 'Surah 4:171', 'Surah 5:73', 'Surah 112:1-4'],
    creation: ['Surah 7:54', 'Surah 41:9-12', 'Surah 25:59', 'Surah 32:4'],
    salvation: ['Surah 2:62', 'Surah 3:85', 'Surah 5:69', 'Surah 22:17'],
  };

  const references = categoryMap[category] || [];
  return getQuranVerses(references);
}

/**
 * Format Quran verse for display
 */
export function formatQuranVerse(verse: QuranVerse, includeReference: boolean = true): string {
  if (includeReference) {
    return `**${verse.reference}**\n${verse.text}\n\n*${verse.translation}*`;
  }
  return `${verse.text}\n\n*${verse.translation}*`;
}

/**
 * Get all Surahs
 */
export function getQuranSurahs(): number[] {
  return Array.from(new Set(quranData.map((v: any) => v.surah))).sort((a, b) => a - b);
}

/**
 * Get verses in a Surah
 */
export function getQuranVersesInSurah(surah: number): QuranVerse[] {
  return quranData
    .filter((v: any) => v.surah === surah)
    .map((v: any) => ({
      surah: v.surah,
      ayah: v.ayah,
      text: v.text,
      translation: v.translation,
      reference: `Surah ${v.surah}:${v.ayah}`,
      juz: v.juz,
      revelation: v.revelation,
    }));
} 