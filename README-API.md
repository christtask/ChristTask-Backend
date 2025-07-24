# Bible Verse API

A Next.js API route that provides access to the King James Version (KJV) Bible text.

## Setup

1. **Install Next.js dependencies:**
   ```bash
   npm install next react react-dom
   ```

2. **Ensure your `data/kjv.json` file is complete and valid JSON**

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## API Usage

### Endpoint
`GET /api/verse`

### Query Parameters
- `book` (required): Book abbreviation (e.g., "gn", "ex", "ps", "jn")
- `chapter` (required): Chapter number
- `verse` (required): Verse number

### Example Requests

```bash
# Get Genesis 1:1
GET /api/verse?book=gn&chapter=1&verse=1

# Get John 3:16
GET /api/verse?book=jn&chapter=3&verse=16

# Get Psalms 23:1
GET /api/verse?book=ps&chapter=23&verse=1
```

### Response Format

**Success Response (200):**
```json
{
  "book": "Genesis",
  "chapter": 1,
  "verse": 1,
  "text": "In the beginning God created the heaven and the earth.",
  "reference": "Genesis 1:1"
}
```

**Error Responses:**

Missing parameters (400):
```json
{
  "error": "Missing required parameters. Please provide book, chapter, and verse."
}
```

Book not found (404):
```json
{
  "error": "Book 'invalid' not found. Please check the book name or abbreviation."
}
```

Invalid chapter/verse (400):
```json
{
  "error": "Invalid chapter number. Genesis has 50 chapters."
}
```

## Common Book Abbreviations

- `gn` - Genesis
- `ex` - Exodus
- `lv` - Leviticus
- `nm` - Numbers
- `dt` - Deuteronomy
- `js` - Joshua
- `jg` - Judges
- `rt` - Ruth
- `1sm` - 1 Samuel
- `2sm` - 2 Samuel
- `1kg` - 1 Kings
- `2kg` - 2 Kings
- `1ch` - 1 Chronicles
- `2ch` - 2 Chronicles
- `ezr` - Ezra
- `ne` - Nehemiah
- `et` - Esther
- `jb` - Job
- `ps` - Psalms
- `prv` - Proverbs
- `ec` - Ecclesiastes
- `ss` - Song of Solomon
- `is` - Isaiah
- `jr` - Jeremiah
- `lm` - Lamentations
- `ezk` - Ezekiel
- `dn` - Daniel
- `hs` - Hosea
- `jl` - Joel
- `am` - Amos
- `ob` - Obadiah
- `jn` - Jonah
- `mc` - Micah
- `na` - Nahum
- `hk` - Habakkuk
- `zp` - Zephaniah
- `hg` - Haggai
- `zc` - Zechariah
- `ml` - Malachi
- `mt` - Matthew
- `mk` - Mark
- `lk` - Luke
- `jn` - John
- `ac` - Acts
- `rom` - Romans
- `1co` - 1 Corinthians
- `2co` - 2 Corinthians
- `gl` - Galatians
- `eph` - Ephesians
- `php` - Philippians
- `col` - Colossians
- `1th` - 1 Thessalonians
- `2th` - 2 Thessalonians
- `1tm` - 1 Timothy
- `2tm` - 2 Timothy
- `tt` - Titus
- `phm` - Philemon
- `heb` - Hebrews
- `jas` - James
- `1pe` - 1 Peter
- `2pe` - 2 Peter
- `1jn` - 1 John
- `2jn` - 2 John
- `3jn` - 3 John
- `jd` - Jude
- `rev` - Revelation

## Testing

Visit `http://localhost:3000` to use the interactive test interface.

## Error Handling

The API includes comprehensive error handling for:
- Missing or invalid parameters
- Non-existent books, chapters, or verses
- Corrupted or missing Bible data file
- Invalid JSON format in the data file

## Notes

- The API is case-insensitive for book names and abbreviations
- Chapter and verse numbers must be positive integers
- The API validates that the requested chapter and verse exist within the book 