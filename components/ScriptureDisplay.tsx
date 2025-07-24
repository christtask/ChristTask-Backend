'use client';

import React, { useState, useEffect } from 'react';
import { ScriptureReference } from '@/types/chat';
import { getBibleVerse, getBibleVerses } from '@/lib/bible';
import { getQuranVerse, getQuranVerses } from '@/lib/quran';
import { BookOpen, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface ScriptureDisplayProps {
  references: ScriptureReference[];
  onReferenceClick?: (reference: ScriptureReference) => void;
  className?: string;
}

export default function ScriptureDisplay({
  references,
  onReferenceClick,
  className = '',
}: ScriptureDisplayProps) {
  const [expandedVerses, setExpandedVerses] = useState<Set<string>>(new Set());
  const [verseData, setVerseData] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    // Load verse data for all references
    const loadVerseData = async () => {
      const newVerseData = new Map();

      for (const ref of references) {
        try {
          if (ref.type === 'bible') {
            const verse = getBibleVerse(ref.reference);
            if (verse) {
              newVerseData.set(ref.reference, verse);
            }
          } else if (ref.type === 'quran') {
            const verse = getQuranVerse(ref.reference);
            if (verse) {
              newVerseData.set(ref.reference, verse);
            }
          }
        } catch (error) {
          console.error(`Error loading verse for ${ref.reference}:`, error);
        }
      }

      setVerseData(newVerseData);
    };

    loadVerseData();
  }, [references]);

  const toggleVerse = (reference: string) => {
    const newExpanded = new Set(expandedVerses);
    if (newExpanded.has(reference)) {
      newExpanded.delete(reference);
    } else {
      newExpanded.add(reference);
    }
    setExpandedVerses(newExpanded);
  };

  const getVerseIcon = (type: 'bible' | 'quran') => {
    return type === 'bible' ? '📖' : '☪️';
  };

  const getVerseColor = (type: 'bible' | 'quran') => {
    return type === 'bible' 
      ? 'border-blue-200 bg-blue-50 text-blue-900' 
      : 'border-red-200 bg-red-50 text-red-900';
  };

  const getVerseAccent = (type: 'bible' | 'quran') => {
    return type === 'bible' ? 'border-l-blue-500' : 'border-l-red-500';
  };

  const renderBibleVerse = (verse: any) => (
    <div className="space-y-2">
      <div className="font-semibold text-sm">{verse.reference}</div>
      <div className="text-sm leading-relaxed">{verse.text}</div>
    </div>
  );

  const renderQuranVerse = (verse: any) => (
    <div className="space-y-2">
      <div className="font-semibold text-sm">{verse.reference}</div>
      <div className="text-sm leading-relaxed font-arabic">{verse.text}</div>
      <div className="text-sm italic text-gray-600">{verse.translation}</div>
      <div className="text-xs text-gray-500">
        Juz {verse.juz} • {verse.revelation} Revelation
      </div>
    </div>
  );

  const renderVerse = (reference: ScriptureReference) => {
    const verse = verseData.get(reference.reference);
    const isExpanded = expandedVerses.has(reference.reference);

    return (
      <div
        key={reference.reference}
        className={`border rounded-lg p-3 ${getVerseColor(reference.type)} ${getVerseAccent(reference.type)} border-l-4`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getVerseIcon(reference.type)}</span>
            <span className="font-medium">{reference.reference}</span>
            <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50">
              {reference.type === 'bible' ? 'Bible' : 'Quran'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {onReferenceClick && (
              <button
                onClick={() => onReferenceClick(reference)}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                title="View full context"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}
            
            {verse && (
              <button
                onClick={() => toggleVerse(reference.reference)}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                title={isExpanded ? 'Hide verse' : 'Show verse'}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {verse && isExpanded && (
          <div className="mt-3 pt-3 border-t border-current border-opacity-20">
            {reference.type === 'bible' 
              ? renderBibleVerse(verse)
              : renderQuranVerse(verse)
            }
          </div>
        )}
      </div>
    );
  };

  const bibleRefs = references.filter(ref => ref.type === 'bible');
  const quranRefs = references.filter(ref => ref.type === 'quran');

  if (references.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <BookOpen className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Scripture References</h3>
        <span className="text-sm text-gray-500">({references.length} total)</span>
      </div>

      {/* Bible References */}
      {bibleRefs.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-blue-800 flex items-center">
            <span className="mr-2">📖</span>
            Biblical References ({bibleRefs.length})
          </h4>
          <div className="space-y-2">
            {bibleRefs.map(renderVerse)}
          </div>
        </div>
      )}

      {/* Quran References */}
      {quranRefs.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-red-800 flex items-center">
            <span className="mr-2">☪️</span>
            Quranic References ({quranRefs.length})
          </h4>
          <div className="space-y-2">
            {quranRefs.map(renderVerse)}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 pt-2">
        <button
          onClick={() => {
            const allRefs = Array.from(expandedVerses);
            if (allRefs.length === references.length) {
              setExpandedVerses(new Set());
            } else {
              setExpandedVerses(new Set(references.map(ref => ref.reference)));
            }
          }}
          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
        >
          {expandedVerses.size === references.length ? 'Collapse All' : 'Expand All'}
        </button>
        
        {bibleRefs.length > 0 && quranRefs.length > 0 && (
          <button
            onClick={() => {
              // This could open a comparison view
              console.log('Open comparison view');
            }}
            className="px-3 py-1 text-xs bg-primary-100 text-primary-700 rounded-full hover:bg-primary-200 transition-colors"
          >
            Compare Verses
          </button>
        )}
      </div>
    </div>
  );
} 