import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const { book, chapter, verse } = req.query;

  // Validate required parameters
  if (!book || !chapter || !verse) {
    return res.status(400).json({ 
      error: 'Missing required parameters. Please provide book, chapter, and verse.' 
    });
  }

  try {
    // Read the KJV Bible JSON file
    const biblePath = path.join(process.cwd(), 'data', 'kjv.json');
    
    if (!fs.existsSync(biblePath)) {
      return res.status(500).json({ error: 'Bible data file not found.' });
    }

    const bibleData = JSON.parse(fs.readFileSync(biblePath, 'utf8'));

    // Find the requested book
    const requestedBook = bibleData.find(b => 
      b.abbrev.toLowerCase() === book.toLowerCase() || 
      b.name?.toLowerCase() === book.toLowerCase()
    );

    if (!requestedBook) {
      return res.status(404).json({ 
        error: `Book '${book}' not found. Please check the book name or abbreviation.` 
      });
    }

    // Validate chapter number
    const chapterNum = parseInt(chapter);
    if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > requestedBook.chapters.length) {
      return res.status(400).json({ 
        error: `Invalid chapter number. ${requestedBook.name || book} has ${requestedBook.chapters.length} chapters.` 
      });
    }

    // Validate verse number
    const verseNum = parseInt(verse);
    const chapterVerses = requestedBook.chapters[chapterNum - 1];
    if (isNaN(verseNum) || verseNum < 1 || verseNum > chapterVerses.length) {
      return res.status(400).json({ 
        error: `Invalid verse number. Chapter ${chapterNum} has ${chapterVerses.length} verses.` 
      });
    }

    // Get the requested verse
    const verseText = chapterVerses[verseNum - 1];

    // Return the verse data
    res.status(200).json({
      book: requestedBook.name || requestedBook.abbrev.toUpperCase(),
      chapter: chapterNum,
      verse: verseNum,
      text: verseText,
      reference: `${requestedBook.name || requestedBook.abbrev.toUpperCase()} ${chapterNum}:${verseNum}`
    });

  } catch (error) {
    console.error('Error reading Bible data:', error);
    
    if (error instanceof SyntaxError) {
      return res.status(500).json({ 
        error: 'Bible data file is corrupted or invalid JSON format.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error while processing your request.' 
    });
  }
} 