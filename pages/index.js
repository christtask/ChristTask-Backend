import { useState } from 'react';

export default function Home() {
  const [book, setBook] = useState('gn');
  const [chapter, setChapter] = useState('1');
  const [verse, setVerse] = useState('1');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVerse = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/verse?book=${book}&chapter=${chapter}&verse=${verse}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('Failed to fetch verse. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Bible Verse API Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label>
          Book (abbreviation): 
          <input 
            type="text" 
            value={book} 
            onChange={(e) => setBook(e.target.value)}
            placeholder="e.g., gn, ex, ps, jn"
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>
          Chapter: 
          <input 
            type="number" 
            value={chapter} 
            onChange={(e) => setChapter(e.target.value)}
            min="1"
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>
          Verse: 
          <input 
            type="number" 
            value={verse} 
            onChange={(e) => setVerse(e.target.value)}
            min="1"
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </label>
      </div>

      <button 
        onClick={fetchVerse} 
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#0070f3', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Loading...' : 'Get Verse'}
      </button>

      {error && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          borderRadius: '5px' 
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ 
          marginTop: '20px', 
          padding: '20px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '5px' 
        }}>
          <h3>{result.reference}</h3>
          <p style={{ fontSize: '18px', lineHeight: '1.6' }}>{result.text}</p>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Book: {result.book} | Chapter: {result.chapter} | Verse: {result.verse}
          </p>
        </div>
      )}

      <div style={{ marginTop: '40px', fontSize: '14px', color: '#666' }}>
        <h3>Common Book Abbreviations:</h3>
        <ul>
          <li><strong>gn</strong> - Genesis</li>
          <li><strong>ex</strong> - Exodus</li>
          <li><strong>ps</strong> - Psalms</li>
          <li><strong>mt</strong> - Matthew</li>
          <li><strong>jn</strong> - John</li>
          <li><strong>rom</strong> - Romans</li>
          <li><strong>rev</strong> - Revelation</li>
        </ul>
      </div>
    </div>
  );
} 