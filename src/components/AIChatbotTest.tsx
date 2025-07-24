import React from "react";
import { AIChatbot } from "./AIChatbot";
import { useAuth } from "@/hooks/useAuth";
import { useMessageUsage } from "@/hooks/useMessageUsage";
import { supabase } from "@/integrations/supabase/client";

export const AIChatbotTest: React.FC = () => {
  const { user } = useAuth();
  const { remainingMessages, refreshUsage } = useMessageUsage();

  const handleSendMessage = async (message: string): Promise<string> => {
    if (!user) {
      throw new Error("Please log in to use the chatbot");
    }

    if (remainingMessages <= 0) {
      throw new Error("You've used all your daily messages. Try again tomorrow!");
    }

    try {
      const { data, error } = await supabase.functions.invoke('chat-gpt', {
        body: {
          message,
          topic: 'debate',
          conversationId: `test_${Date.now()}`
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to get response");
      }

      await refreshUsage();
      return data.response || "Sorry, I couldn't process that request.";
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Please Sign In
          </h3>
          <p className="text-gray-600">
            You need to be signed in to test the chatbot.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            AIChatbot Test
          </h1>
          <p className="text-lg text-gray-600">
            Testing the new compact-to-expanded chatbot component
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Messages remaining: {remainingMessages}
          </div>
        </div>
        
        <div className="h-[600px]">
          <AIChatbot 
            onSendMessage={handleSendMessage}
            placeholder="Test the new chatbot..."
            title="Test AI Assistant"
            aiName="TestBot"
          />
        </div>
      </div>
    </div>
  );
}; 