'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  sources?: string[];
  scriptureReferences?: string[];
  topic?: string;
  difficulty?: string;
}

interface ApologeticsChatProps {
  className?: string;
}

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

// Example questions for Christian apologetics
const exampleQuestions: string[] = [];

export default function ApologeticsChat({ className = '' }: ApologeticsChatProps) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, loadingMessage]);
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Send message to your backend API
      const response = await fetch('https://christtask-backend.onrender.com/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      console.log('API Response data:', data);
      console.log('Answer field:', data.answer);
      console.log('Response field:', data.response);

      // Update loading message with actual response
      const assistantMessage: ChatMessage = {
        id: loadingMessage.id,
        role: 'assistant',
        content: data.answer || data.response || 'No response received', // Try 'answer' first, fallback to 'response'
        timestamp: new Date(),
        sources: data.sources,
        scriptureReferences: data.scriptureReferences,
        topic: data.topic,
        difficulty: data.difficulty,
      };
      
      console.log('Assistant message content:', assistantMessage.content);

      setMessages(prev => 
        prev.map(msg => msg.id === loadingMessage.id ? assistantMessage : msg)
      );

    } catch (error) {
      console.error('Error sending message:', error);
      // Update loading message with error
      const errorMessage: ChatMessage = {
        id: loadingMessage.id,
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
        timestamp: new Date(),
      };

      setMessages(prev => 
        prev.map(msg => msg.id === loadingMessage.id ? errorMessage : msg)
      );
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        sendMessage(inputValue);
      }
    }
  };

  const handleExampleClick = (question: string) => {
    setInputValue(question);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-col h-screen bg-black text-white ${className}`}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8 sm:py-12 px-4">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-sm font-bold text-white">ChristTask</span>
            </div>
            <p className="text-gray-400 mb-6 text-sm sm:text-base">Debate Ready?</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-500 ease-out`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`flex items-start space-x-2 sm:space-x-3 max-w-[85%] sm:max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                message.role === 'user' 
                  ? 'bg-gray-600 text-white' 
                  : 'bg-gray-800 text-white'
              }`}>
                {message.role === 'user' ? 'U' : 'ChristTask'}
              </div>
              
              {/* Message Bubble */}
                                <div className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 relative ${
                    message.role === 'user'
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-800 text-white'
                  }`}>
                {message.isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-400">Typing...</span>
                  </div>
                ) : (
                  <div>
                    <div 
                      className="text-sm sm:text-base leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: message.content }}
                    />
                    

                    
                    {/* Scripture References */}
                    {message.scriptureReferences && message.scriptureReferences.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs font-medium text-gray-400 mb-1">Scripture References:</div>
                        <div className="text-xs text-gray-500">
                          {message.scriptureReferences.join(', ')}
                        </div>
                      </div>
                    )}
                    
                    {/* Topic and Difficulty */}
                    {(message.topic || message.difficulty) && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {message.topic && (
                          <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded">
                            {message.topic}
                          </span>
                        )}
                        {message.difficulty && (
                          <span className="text-xs bg-green-900 text-green-200 px-2 py-1 rounded">
                            {message.difficulty}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 mt-2">
                      {formatTime(message.timestamp)}
                    </div>
                    
                    {/* Copy Button - Only for chatbot messages */}
                    {message.role === 'assistant' && (
                      <button
                        onClick={() => navigator.clipboard.writeText(message.content)}
                        className="absolute bottom-2 right-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white p-1.5 rounded-md text-xs transition-all duration-200"
                        title="Copy message"
                      >
                        Copy
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        

        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Claude Style */}
      <div className="pt-3 pb-6 px-6 bg-black">
        <div className="w-full max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about Christian apologetics..."
              className="w-full rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-base"
              rows={2}
              disabled={isLoading}
              style={{
                resize: 'none',
                overflow: 'hidden',
                minHeight: '56px',
                padding: '16px 20px',
                fontSize: '16px',
                lineHeight: '1.5',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="absolute disabled:cursor-not-allowed text-white transition-all duration-200 rounded-full flex items-center justify-center"
              style={{
                width: '40px',
                height: '40px',
                right: '8px',
                bottom: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18M8 8h8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 