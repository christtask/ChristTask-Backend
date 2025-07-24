// Compact Bible data with key verses and references
export interface CompactVerse {
  reference: string;
  text: string;
  category?: string;
}

export interface BibleBook {
  name: string;
  abbreviation: string;
  chapters: number;
  category: 'law' | 'history' | 'wisdom' | 'prophets' | 'gospels' | 'epistles' | 'apocalypse';
}

// Key verses for apologetics and Christian defense
export const keyVerses: CompactVerse[] = [
  {
    reference: "John 1:1",
    text: "In the beginning was the Word, and the Word was with God, and the Word was God.",
    category: "deity"
  },
  {
    reference: "John 3:16",
    text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
    category: "salvation"
  },
  {
    reference: "John 14:6",
    text: "Jesus answered, 'I am the way and the truth and the life. No one comes to the Father except through me.'",
    category: "exclusivity"
  },
  {
    reference: "Colossians 2:9",
    text: "For in Christ all the fullness of the Deity lives in bodily form.",
    category: "deity"
  },
  {
    reference: "2 Timothy 3:16",
    text: "All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness.",
    category: "scripture"
  },
  {
    reference: "1 Peter 3:15",
    text: "But in your hearts revere Christ as Lord. Always be prepared to give an answer to everyone who asks you to give the reason for the hope that you have. But do this with gentleness and respect.",
    category: "apologetics"
  },
  {
    reference: "Romans 1:20",
    text: "For since the creation of the world God's invisible qualities—his eternal power and divine nature—have been clearly seen, being understood from what has been made, so that people are without excuse.",
    category: "creation"
  },
  {
    reference: "Genesis 1:1",
    text: "In the beginning God created the heavens and the earth.",
    category: "creation"
  },
  {
    reference: "Matthew 28:19",
    text: "Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit.",
    category: "trinity"
  },
  {
    reference: "Romans 10:9",
    text: "If you declare with your mouth, 'Jesus is Lord,' and believe in your heart that God raised him from the dead, you will be saved.",
    category: "salvation"
  },
  {
    reference: "Isaiah 53:5",
    text: "But he was pierced for our transgressions, he was crushed for our iniquities; the punishment that brought us peace was on him, and by his wounds we are healed.",
    category: "prophecy"
  },
  {
    reference: "Psalm 14:1",
    text: "The fool says in his heart, 'There is no God.' They are corrupt, their deeds are vile; there is no one who does good.",
    category: "atheism"
  },
  {
    reference: "Acts 4:12",
    text: "Salvation is found in no one else, for there is no other name under heaven given to mankind by which we must be saved.",
    category: "exclusivity"
  },
  {
    reference: "Hebrews 11:1",
    text: "Now faith is confidence in what we hope for and assurance about what we do not see.",
    category: "faith"
  },
  {
    reference: "1 Corinthians 15:3-4",
    text: "For what I received I passed on to you as of first importance: that Christ died for our sins according to the Scriptures, that he was buried, that he was raised on the third day according to the Scriptures.",
    category: "resurrection"
  }
];

// Bible books structure
export const bibleBooks: BibleBook[] = [
  // Old Testament
  { name: "Genesis", abbreviation: "Gen", chapters: 50, category: "law" },
  { name: "Exodus", abbreviation: "Ex", chapters: 40, category: "law" },
  { name: "Leviticus", abbreviation: "Lev", chapters: 27, category: "law" },
  { name: "Numbers", abbreviation: "Num", chapters: 36, category: "law" },
  { name: "Deuteronomy", abbreviation: "Deut", chapters: 34, category: "law" },
  { name: "Joshua", abbreviation: "Josh", chapters: 24, category: "history" },
  { name: "Judges", abbreviation: "Judg", chapters: 21, category: "history" },
  { name: "Ruth", abbreviation: "Ruth", chapters: 4, category: "history" },
  { name: "1 Samuel", abbreviation: "1 Sam", chapters: 31, category: "history" },
  { name: "2 Samuel", abbreviation: "2 Sam", chapters: 24, category: "history" },
  { name: "1 Kings", abbreviation: "1 Kings", chapters: 22, category: "history" },
  { name: "2 Kings", abbreviation: "2 Kings", chapters: 25, category: "history" },
  { name: "1 Chronicles", abbreviation: "1 Chron", chapters: 29, category: "history" },
  { name: "2 Chronicles", abbreviation: "2 Chron", chapters: 36, category: "history" },
  { name: "Ezra", abbreviation: "Ezra", chapters: 10, category: "history" },
  { name: "Nehemiah", abbreviation: "Neh", chapters: 13, category: "history" },
  { name: "Esther", abbreviation: "Est", chapters: 10, category: "history" },
  { name: "Job", abbreviation: "Job", chapters: 42, category: "wisdom" },
  { name: "Psalms", abbreviation: "Ps", chapters: 150, category: "wisdom" },
  { name: "Proverbs", abbreviation: "Prov", chapters: 31, category: "wisdom" },
  { name: "Ecclesiastes", abbreviation: "Eccl", chapters: 12, category: "wisdom" },
  { name: "Song of Solomon", abbreviation: "Song", chapters: 8, category: "wisdom" },
  { name: "Isaiah", abbreviation: "Isa", chapters: 66, category: "prophets" },
  { name: "Jeremiah", abbreviation: "Jer", chapters: 52, category: "prophets" },
  { name: "Lamentations", abbreviation: "Lam", chapters: 5, category: "prophets" },
  { name: "Ezekiel", abbreviation: "Ezek", chapters: 48, category: "prophets" },
  { name: "Daniel", abbreviation: "Dan", chapters: 12, category: "prophets" },
  { name: "Hosea", abbreviation: "Hos", chapters: 14, category: "prophets" },
  { name: "Joel", abbreviation: "Joel", chapters: 3, category: "prophets" },
  { name: "Amos", abbreviation: "Amos", chapters: 9, category: "prophets" },
  { name: "Obadiah", abbreviation: "Obad", chapters: 1, category: "prophets" },
  { name: "Jonah", abbreviation: "Jonah", chapters: 4, category: "prophets" },
  { name: "Micah", abbreviation: "Micah", chapters: 7, category: "prophets" },
  { name: "Nahum", abbreviation: "Nahum", chapters: 3, category: "prophets" },
  { name: "Habakkuk", abbreviation: "Hab", chapters: 3, category: "prophets" },
  { name: "Zephaniah", abbreviation: "Zeph", chapters: 3, category: "prophets" },
  { name: "Haggai", abbreviation: "Hag", chapters: 2, category: "prophets" },
  { name: "Zechariah", abbreviation: "Zech", chapters: 14, category: "prophets" },
  { name: "Malachi", abbreviation: "Mal", chapters: 4, category: "prophets" },
  
  // New Testament
  { name: "Matthew", abbreviation: "Matt", chapters: 28, category: "gospels" },
  { name: "Mark", abbreviation: "Mark", chapters: 16, category: "gospels" },
  { name: "Luke", abbreviation: "Luke", chapters: 24, category: "gospels" },
  { name: "John", abbreviation: "John", chapters: 21, category: "gospels" },
  { name: "Acts", abbreviation: "Acts", chapters: 28, category: "history" },
  { name: "Romans", abbreviation: "Rom", chapters: 16, category: "epistles" },
  { name: "1 Corinthians", abbreviation: "1 Cor", chapters: 16, category: "epistles" },
  { name: "2 Corinthians", abbreviation: "2 Cor", chapters: 13, category: "epistles" },
  { name: "Galatians", abbreviation: "Gal", chapters: 6, category: "epistles" },
  { name: "Ephesians", abbreviation: "Eph", chapters: 6, category: "epistles" },
  { name: "Philippians", abbreviation: "Phil", chapters: 4, category: "epistles" },
  { name: "Colossians", abbreviation: "Col", chapters: 4, category: "epistles" },
  { name: "1 Thessalonians", abbreviation: "1 Thess", chapters: 5, category: "epistles" },
  { name: "2 Thessalonians", abbreviation: "2 Thess", chapters: 3, category: "epistles" },
  { name: "1 Timothy", abbreviation: "1 Tim", chapters: 6, category: "epistles" },
  { name: "2 Timothy", abbreviation: "2 Tim", chapters: 4, category: "epistles" },
  { name: "Titus", abbreviation: "Titus", chapters: 3, category: "epistles" },
  { name: "Philemon", abbreviation: "Phlm", chapters: 1, category: "epistles" },
  { name: "Hebrews", abbreviation: "Heb", chapters: 13, category: "epistles" },
  { name: "James", abbreviation: "James", chapters: 5, category: "epistles" },
  { name: "1 Peter", abbreviation: "1 Pet", chapters: 5, category: "epistles" },
  { name: "2 Peter", abbreviation: "2 Pet", chapters: 3, category: "epistles" },
  { name: "1 John", abbreviation: "1 John", chapters: 5, category: "epistles" },
  { name: "2 John", abbreviation: "2 John", chapters: 1, category: "epistles" },
  { name: "3 John", abbreviation: "3 John", chapters: 1, category: "epistles" },
  { name: "Jude", abbreviation: "Jude", chapters: 1, category: "epistles" },
  { name: "Revelation", abbreviation: "Rev", chapters: 22, category: "apocalypse" }
];

// Helper functions
export const getVersesByCategory = (category: string): CompactVerse[] => {
  return keyVerses.filter(verse => verse.category === category);
};

export const getRandomVerse = (): CompactVerse => {
  return keyVerses[Math.floor(Math.random() * keyVerses.length)];
};

export const getDailyVerse = (): CompactVerse => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return keyVerses[dayOfYear % keyVerses.length];
};

export const searchVerses = (query: string): CompactVerse[] => {
  const lowercaseQuery = query.toLowerCase();
  return keyVerses.filter(verse => 
    verse.text.toLowerCase().includes(lowercaseQuery) ||
    verse.reference.toLowerCase().includes(lowercaseQuery) ||
    (verse.category && verse.category.toLowerCase().includes(lowercaseQuery))
  );
}; 