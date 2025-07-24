import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen } from "lucide-react";
import { bibleApi, BibleVerse } from '@/services/bibleApi';
import { bibleBooks } from '@/data/bibleData';

interface BibleReaderProps {
  className?: string;
}

export const BibleReader = ({ className = "" }: BibleReaderProps) => {
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [currentChapter, setCurrentChapter] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('browse');

  // Get the selected book info
  const selectedBookInfo = bibleBooks.find(book => book.name === selectedBook);

  // Load chapter when book or chapter changes
  useEffect(() => {
    if (selectedBook && selectedChapter) {
      loadChapter(selectedBook, selectedChapter);
    }
  }, [selectedBook, selectedChapter]);

  const loadChapter = async (book: string, chapter: number) => {
    setLoading(true);
    setError(null);
    try {
      const chapterData = await bibleApi.getChapter(book, chapter);
      setCurrentChapter(chapterData.verses);
      setViewMode('reading');
    } catch (err) {
      setError('Failed to load chapter. Please try again.');
      console.error('Error loading chapter:', err);
    } finally {
      setLoading(false);
    }
  };

  const nextChapter = () => {
    if (selectedBookInfo && selectedChapter < selectedBookInfo.chapters) {
      setSelectedChapter(selectedChapter + 1);
    }
  };

  const prevChapter = () => {
    if (selectedChapter > 1) {
      setSelectedChapter(selectedChapter - 1);
    }
  };

  const goToBook = (bookName: string) => {
    setSelectedBook(bookName);
    setSelectedChapter(1);
  };

  const backToBrowse = () => {
    setViewMode('browse');
    setCurrentChapter([]);
  };

  // Group books by Testament
  const oldTestamentBooks = bibleBooks.filter(book => 
    ['law', 'history', 'wisdom', 'prophets'].includes(book.category)
  );
  
  const newTestamentBooks = bibleBooks.filter(book => 
    ['gospels', 'epistles', 'apocalypse'].includes(book.category)
  );

  const testamentNames = {
    'old': 'Old Testament',
    'new': 'New Testament'
  };

  if (viewMode === 'reading' && selectedBook) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Reading Header */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={backToBrowse}
                className="flex items-center space-x-2"
              >
                <span>← Back to Books</span>
              </Button>
              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-800">{selectedBook}</h2>
                <p className="text-sm text-slate-600">Chapter {selectedChapter}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevChapter}
                disabled={selectedChapter <= 1}
              >
                ← Previous
              </Button>
              <span className="text-sm text-slate-600">
                {selectedChapter} of {selectedBookInfo?.chapters}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={nextChapter}
                disabled={selectedChapter >= (selectedBookInfo?.chapters || 1)}
              >
                Next →
              </Button>
            </div>
          </div>
        </Card>

        {/* Chapter Content */}
        {loading ? (
          <Card className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-slate-600">Loading chapter...</span>
            </div>
          </Card>
        ) : error ? (
          <Card className="p-6 border-red-200 bg-red-50">
            <p className="text-red-600">{error}</p>
            <Button 
              onClick={() => loadChapter(selectedBook, selectedChapter)}
              className="mt-3"
            >
              Try Again
            </Button>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="space-y-4">
              {currentChapter.map((verse, index) => (
                <div key={index} className="flex space-x-3">
                  <span className="text-sm font-bold text-blue-600 min-w-[3rem]">
                    {verse.verse}
                  </span>
                  <p className="text-slate-700 leading-relaxed flex-1">
                    {verse.text}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Chapter Navigation */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevChapter}
              disabled={selectedChapter <= 1}
              className="flex items-center space-x-2"
            >
              ← Chapter {selectedChapter - 1}
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-slate-600">
                {selectedBook} - Chapter {selectedChapter}
              </p>
            </div>
            
            <Button
              variant="outline"
              onClick={nextChapter}
              disabled={selectedChapter >= (selectedBookInfo?.chapters || 1)}
              className="flex items-center space-x-2"
            >
              Chapter {selectedChapter + 1} →
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Holy Bible</h1>
          <p className="text-slate-600">Select a book to begin reading</p>
        </div>
      </Card>

      {/* Old Testament */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
          {testamentNames.old}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {oldTestamentBooks.map((book) => (
            <Button
              key={book.abbreviation}
              variant="outline"
              onClick={() => goToBook(book.name)}
              className="h-auto p-3 flex flex-col items-start text-left hover:bg-blue-50 hover:border-blue-300"
            >
              <span className="font-semibold text-slate-800">{book.name}</span>
              <span className="text-xs text-slate-500">{book.chapters} chapters</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* New Testament */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
          {testamentNames.new}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {newTestamentBooks.map((book) => (
            <Button
              key={book.abbreviation}
              variant="outline"
              onClick={() => goToBook(book.name)}
              className="h-auto p-3 flex flex-col items-start text-left hover:bg-blue-50 hover:border-blue-300"
            >
              <span className="font-semibold text-slate-800">{book.name}</span>
              <span className="text-xs text-slate-500">{book.chapters} chapters</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Quick Navigation */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Navigation</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            variant="outline"
            onClick={() => goToBook('Genesis')}
            className="flex items-center space-x-2"
          >
            <BookOpen className="h-4 w-4" />
            <span>Genesis</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => goToBook('Psalms')}
            className="flex items-center space-x-2"
          >
            <BookOpen className="h-4 w-4" />
            <span>Psalms</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => goToBook('Matthew')}
            className="flex items-center space-x-2"
          >
            <BookOpen className="h-4 w-4" />
            <span>Matthew</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => goToBook('John')}
            className="flex items-center space-x-2"
          >
            <BookOpen className="h-4 w-4" />
            <span>John</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}; 