import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Star, ArrowRight, CheckCircle } from "lucide-react";

interface WelcomeToChatbotProps {
  onStartChat: () => void;
}

export const WelcomeToChatbot = ({ onStartChat }: WelcomeToChatbotProps) => {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Star className="h-8 w-8 text-yellow-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to ChristTask!
          </h1>
          <Star className="h-8 w-8 text-yellow-500" />
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your payment was successful! You now have full access to your AI Debate Buddy.
        </p>
        <Badge variant="secondary" className="px-4 py-2 text-sm">
          <CheckCircle className="w-4 h-4 mr-2" />
          Premium Access Activated
        </Badge>
      </div>

      {/* Direct Chat Card */}
      <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <span>Access AI Chatbot</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Jump straight into conversation with your AI Debate Buddy. Ask any question about Christianity, apologetics, or faith.
          </p>
          <Button 
            onClick={onStartChat}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            size="lg"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Access AI Chatbot
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
