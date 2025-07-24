// Bible API service using external APIs
export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
}

export interface BibleChapter {
  book: string;
  chapter: number;
  verses: BibleVerse[];
}

class BibleApiService {
  private baseUrl = 'https://bible-api.com';
  private fallbackUrl = 'https://api.scripture.api.bible/v1';

  // Get a single verse
  async getVerse(book: string, chapter: number, verse: number): Promise<BibleVerse> {
    try {
      const response = await fetch(`${this.baseUrl}/${book}+${chapter}:${verse}?formatting=plain`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch verse');
      }

      const data = await response.json();
      
      return {
        book: data.book_name,
        chapter: data.chapter,
        verse: data.verses[0].verse,
        text: data.verses[0].text,
        reference: `${data.book_name} ${data.chapter}:${data.verses[0].verse}`
      };
    } catch (error) {
      console.error('Error fetching verse:', error);
      throw error;
    }
  }

  // Get an entire chapter
  async getChapter(book: string, chapter: number): Promise<BibleChapter> {
    try {
      const response = await fetch(`${this.baseUrl}/${book}+${chapter}?formatting=plain`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch chapter');
      }

      const data = await response.json();
      
      return {
        book: data.book_name,
        chapter: data.chapter,
        verses: data.verses.map((v: any) => ({
          book: data.book_name,
          chapter: data.chapter,
          verse: v.verse,
          text: v.text,
          reference: `${data.book_name} ${data.chapter}:${v.verse}`
        }))
      };
    } catch (error) {
      console.error('Error fetching chapter:', error);
      throw error;
    }
  }

  // Search for verses containing specific text
  async searchVerses(query: string): Promise<BibleVerse[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}&formatting=plain`);
      
      if (!response.ok) {
        throw new Error('Failed to search verses');
      }

      const data = await response.json();
      
      return data.verses.map((v: any) => ({
        book: v.book_name,
        chapter: v.chapter,
        verse: v.verse,
        text: v.text,
        reference: `${v.book_name} ${v.chapter}:${v.verse}`
      }));
    } catch (error) {
      console.error('Error searching verses:', error);
      throw error;
    }
  }

  // Get random verse
  async getRandomVerse(): Promise<BibleVerse> {
    const popularBooks = ['John', 'Romans', 'Psalms', 'Proverbs', 'Matthew', 'Genesis'];
    const randomBook = popularBooks[Math.floor(Math.random() * popularBooks.length)];
    const randomChapter = Math.floor(Math.random() * 50) + 1;
    const randomVerse = Math.floor(Math.random() * 20) + 1;
    
    return this.getVerse(randomBook, randomChapter, randomVerse);
  }

  // Get daily verse (based on date)
  async getDailyVerse(): Promise<BibleVerse> {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    const verses = [
      { book: 'John', chapter: 3, verse: 16 },
      { book: 'Romans', chapter: 8, verse: 28 },
      { book: 'Philippians', chapter: 4, verse: 13 },
      { book: 'Jeremiah', chapter: 29, verse: 11 },
      { book: 'Psalm', chapter: 23, verse: 1 },
      { book: 'Isaiah', chapter: 40, verse: 31 },
      { book: 'Matthew', chapter: 28, verse: 19 },
      { book: '2 Timothy', chapter: 3, verse: 16 }
    ];
    
    const selectedVerse = verses[dayOfYear % verses.length];
    return this.getVerse(selectedVerse.book, selectedVerse.chapter, selectedVerse.verse);
  }
}

export const bibleApi = new BibleApiService(); 