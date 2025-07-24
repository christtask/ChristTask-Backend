import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Search, RefreshCw, Calendar, Star } from "lucide-react";
import { bibleApi, BibleVerse } from '@/services/bibleApi';
import { keyVerses, getVersesByCategory, getRandomVerse, getDailyVerse, searchVerses, bibleBooks } from '@/data/bibleData';

interface BibleIntegrationProps {
  className?: string;
}

export const BibleIntegration: React.FC<BibleIntegrationProps> = ({ className = "" }) => {
  const [currentVerse, setCurrentVerse] = useState<BibleVerse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedVerse, setSelectedVerse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'daily' | 'search' | 'browse' | 'random'>('daily');

  // Load daily verse on component mount
  useEffect(() => {
    loadDailyVerse();
  }, []);

  const loadDailyVerse = async () => {
    setLoading(true);
    setError(null);
    try {
      const dailyVerse = getDailyVerse();
      setCurrentVerse({
        book: dailyVerse.reference.split(' ')[0],
        chapter: parseInt(dailyVerse.reference.split(' ')[1].split(':')[0]),
        verse: parseInt(dailyVerse.reference.split(':')[1]),
        text: dailyVerse.text,
        reference: dailyVerse.reference
      });
    } catch (err) {
      setError('Failed to load daily verse');
    } finally {
      setLoading(false);
    }
  };

  const loadRandomVerse = async () => {
    setLoading(true);
    setError(null);
    try {
      const randomVerse = getRandomVerse();
      setCurrentVerse({
        book: randomVerse.reference.split(' ')[0],
        chapter: parseInt(randomVerse.reference.split(' ')[1].split(':')[0]),
        verse: parseInt(randomVerse.reference.split(':')[1]),
        text: randomVerse.text,
        reference: randomVerse.reference
      });
    } catch (err) {
      setError('Failed to load random verse');
    } finally {
      setLoading(false);
    }
  };

  const searchBibleVerses = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      // First try local search
      const localResults = searchVerses(searchQuery);
      if (localResults.length > 0) {
        const firstResult = localResults[0];
        setCurrentVerse({
          book: firstResult.reference.split(' ')[0],
          chapter: parseInt(firstResult.reference.split(' ')[1].split(':')[0]),
          verse: parseInt(firstResult.reference.split(':')[1]),
          text: firstResult.text,
          reference: firstResult.reference
        });
      } else {
        // Fallback to API search
        const apiResults = await bibleApi.searchVerses(searchQuery);
        if (apiResults.length > 0) {
          setCurrentVerse(apiResults[0]);
        } else {
          setError('No verses found for your search');
        }
      }
    } catch (err) {
      setError('Failed to search verses');
    } finally {
      setLoading(false);
    }
  };

  const loadSpecificVerse = async () => {
    if (!selectedBook || !selectedChapter || !selectedVerse) return;
    
    setLoading(true);
    setError(null);
    try {
      const verse = await bibleApi.getVerse(selectedBook, parseInt(selectedChapter), parseInt(selectedVerse));
      setCurrentVerse(verse);
    } catch (err) {
      setError('Failed to load verse');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryVerses = (category: string) => {
    return getVersesByCategory(category);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Mode Selection */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={mode === 'daily' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('daily')}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Daily Verse
          </Button>
          <Button
            variant={mode === 'search' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('search')}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Search
          </Button>
          <Button
            variant={mode === 'browse' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('browse')}
            className="flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Browse
          </Button>
          <Button
            variant={mode === 'random' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('random')}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Random
          </Button>
        </div>
      </Card>

      {/* Search Mode */}
      {mode === 'search' && (
        <Card className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search for verses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchBibleVerses()}
            />
            <Button onClick={searchBibleVerses} disabled={loading}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Browse Mode */}
      {mode === 'browse' && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedBook} onValueChange={setSelectedBook}>
              <SelectTrigger>
                <SelectValue placeholder="Select Book" />
              </SelectTrigger>
              <SelectContent>
                {bibleBooks.map((book) => (
                  <SelectItem key={book.abbreviation} value={book.name}>
                    {book.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input
              placeholder="Chapter"
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              type="number"
            />
            
            <Input
              placeholder="Verse"
              value={selectedVerse}
              onChange={(e) => setSelectedVerse(e.target.value)}
              type="number"
            />
          </div>
          <Button 
            onClick={loadSpecificVerse} 
            disabled={loading || !selectedBook || !selectedChapter || !selectedVerse}
            className="mt-4 w-full"
          >
            Load Verse
          </Button>
        </Card>
      )}

      {/* Verse Display */}
      {currentVerse && (
        <Card className="p-6">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full -translate-y-10 translate-x-10"></div>
            <blockquote className="text-slate-700 italic mb-4 leading-relaxed text-lg relative z-10">
              "{currentVerse.text}"
            </blockquote>
            <cite className="text-indigo-600 font-bold text-lg relative z-10">
              - {currentVerse.reference}
            </cite>
          </div>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="p-4">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading...</span>
          </div>
        </Card>
      )}

      {/* Quick Categories */}
      <Card className="p-4">
        <h4 className="font-bold text-slate-800 mb-3 text-lg">Quick Categories</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {['salvation', 'deity', 'apologetics', 'creation', 'trinity', 'prophecy', 'faith', 'resurrection'].map((category) => (
            <Button
              key={category}
              variant="outline"
              size="sm"
              onClick={() => {
                const verses = getCategoryVerses(category);
                if (verses.length > 0) {
                  const verse = verses[0];
                  setCurrentVerse({
                    book: verse.reference.split(' ')[0],
                    chapter: parseInt(verse.reference.split(' ')[1].split(':')[0]),
                    verse: parseInt(verse.reference.split(':')[1]),
                    text: verse.text,
                    reference: verse.reference
                  });
                }
              }}
              className="text-left"
            >
              <span className="capitalize">{category}</span>
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}; 