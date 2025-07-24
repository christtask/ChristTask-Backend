import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Brain, 
  BookOpen, 
  Users, 
  Shield, 
  Heart, 
  ArrowRight,
  Zap,
  Star,
  Globe
} from "lucide-react";
import { AIChatbot } from './AIChatbot';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/hooks/useAuth";
import { useMessageUsage } from "@/hooks/useMessageUsage";
import { supabase } from "@/integrations/supabase/client";

interface ChatbotSuiteProps {
  selectedTopic?: string;
}

type ChatType = 'debate' | 'lifecoach' | null;

interface ChatOption {
  id: ChatType;
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  gradient: string;
  bgGradient: string;
  features: string[];
  badge?: string;
  color: string;
}

const chatOptions: ChatOption[] = [
  // ... (unchanged)
];

export const ChatbotSuite = ({ selectedTopic = "debate" }: ChatbotSuiteProps) => {
  const { user } = useAuth();
  const { remainingMessages, refreshUsage } = useMessageUsage();
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Generate conversation ID for this session
  React.useEffect(() => {
    if (!conversationId) {
      setConversationId(`conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    }
  }, [conversationId]);

  // Get chat title based on topic
  const getChatTitle = (topic: string) => {
    const chatTitles: Record<string, string> = {
      'debate': 'Debate AI Chat',
      'lifecoach': 'Life Coach AI',
      'atheists': 'Answering Atheists',
      'muslim': 'Muslim Arguments',
      'faith': 'Faith Builder',
      'study': 'Bible Study Assistant',
      'counseling': 'Spiritual Counselor',
      'evangelism': 'Evangelism Coach',
      'apologetics': 'Apologetics Expert',
      'prayer': 'Prayer Partner'
    };
    
    return chatTitles[topic] || `${topic} Assistant`;
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex flex-col">
      {/* Header with usage info */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900">
            {getChatTitle(selectedTopic)}
          </h2>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {selectedTopic}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Messages left:</span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            remainingMessages <= 3 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {remainingMessages}
          </span>
        </div>
      </div>

      {/* AIChatbot Component */}
      <div className="flex-1 p-4">
        <AIChatbot 
          className="h-full"
          onSendMessage={async (message: string) => {
            try {
              const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
              });
              
              if (!response.ok) {
                throw new Error('Failed to get response');
              }
              
              const data = await response.json();
              // Use 'answer' from your backend, not 'response'
              return data.answer || "Sorry, I couldn't process that request.";
            } catch (error) {
              console.error('Chat error:', error);
              return 'Sorry, I encountered an error. Please try again.';
            }
          }}
        />
      </div>
    </div>
  );
};