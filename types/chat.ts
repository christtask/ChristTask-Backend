import { SearchResult } from '@/lib/pinecone';
import { BibleVerse } from '@/lib/bible';
import { QuranVerse } from '@/lib/quran';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sources?: SearchResult[];
  scriptureReferences?: {
    bible: string[];
    quran: string[];
  };
  topic?: string;
  difficulty?: string;
  isLoading?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  topic?: string;
  difficulty?: string;
}

export interface ChatResponse {
  answer: string;
  sources: SearchResult[];
  scriptureReferences: {
    bible: string[];
    quran: string[];
  };
  topic: string;
  difficulty: string;
}

export interface StreamingChatResponse {
  content: string;
  sources?: SearchResult[];
  done: boolean;
}

export interface ChatOptions {
  topK?: number;
  temperature?: number;
  maxTokens?: number;
  filter?: {
    topic?: string;
    difficulty?: string;
    source?: string;
  };
}

export interface ScriptureReference {
  type: 'bible' | 'quran';
  reference: string;
  verse?: BibleVerse | QuranVerse;
}

export interface TopicCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface DifficultyLevel {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface DocumentMetadata {
  source: string;
  topic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  scriptureReferences: {
    bible: string[];
    quran: string[];
  };
  chunkIndex: number;
  totalChunks: number;
  createdAt: string;
}

export interface UploadedDocument {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  uploadedAt: Date;
  processed: boolean;
  chunks: number;
  topic?: string;
  difficulty?: string;
}

export interface ChatSettings {
  autoScroll: boolean;
  showSources: boolean;
  showScriptureReferences: boolean;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'All';
  topic: string | 'All';
  theme: 'light' | 'dark' | 'auto';
}

export interface QuranContradiction {
  verse1: QuranVerse;
  verse2: QuranVerse;
  contradiction: string;
  category: 'theological' | 'historical' | 'scientific' | 'moral' | 'legal';
  severity: 'minor' | 'moderate' | 'major';
}

export interface AbrogatedVerse {
  abrogated: QuranVerse;
  abrogating: QuranVerse;
  reason: string;
}

export interface ScriptureComparison {
  topic: string;
  bibleVerses: BibleVerse[];
  quranVerses: QuranVerse[];
  comparison: string;
}

export interface ChatError {
  type: 'api' | 'network' | 'validation' | 'unknown';
  message: string;
  details?: any;
}

export interface RateLimitInfo {
  remaining: number;
  reset: Date;
  limit: number;
}

export interface ChatStats {
  totalMessages: number;
  totalSessions: number;
  averageResponseTime: number;
  mostCommonTopics: string[];
  mostCommonDifficulties: string[];
}

// API Request/Response types
export interface ChatRequest {
  message: string;
  sessionId?: string;
  options?: ChatOptions;
}

export interface ChatResponse {
  answer: string;
  sources: SearchResult[];
  scriptureReferences: {
    bible: string[];
    quran: string[];
  };
  topic: string;
  difficulty: string;
  sessionId: string;
}

export interface UploadRequest {
  file: File;
  topic?: string;
  difficulty?: string;
}

export interface UploadResponse {
  success: boolean;
  documentId: string;
  chunks: number;
  message: string;
}

export interface ScriptureRequest {
  type: 'bible' | 'quran';
  reference: string;
}

export interface ScriptureResponse {
  success: boolean;
  verses: (BibleVerse | QuranVerse)[];
  message?: string;
}

// Component Props
export interface ApologeticsChatProps {
  initialSessionId?: string;
  onSessionChange?: (sessionId: string) => void;
  className?: string;
}

export interface MessageListProps {
  messages: ChatMessage[];
  onMessageClick?: (message: ChatMessage) => void;
  className?: string;
}

export interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export interface ScriptureDisplayProps {
  references: ScriptureReference[];
  onReferenceClick?: (reference: ScriptureReference) => void;
  className?: string;
}

export interface SourceDisplayProps {
  sources: SearchResult[];
  onSourceClick?: (source: SearchResult) => void;
  className?: string;
}

// Event types
export interface ChatEvents {
  messageSent: (message: ChatMessage) => void;
  messageReceived: (message: ChatMessage) => void;
  sessionCreated: (session: ChatSession) => void;
  sessionUpdated: (session: ChatSession) => void;
  error: (error: ChatError) => void;
} 