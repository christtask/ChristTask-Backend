import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MessageSquare, Clock, TrendingUp, Target, BarChart3 } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  feedback?: 'positive' | 'negative' | null;
  topic?: string;
}

interface ConversationAnalyticsProps {
  messages: Message[];
  remainingMessages: number;
  selectedTopic?: string | null;
}

export const ConversationAnalytics = ({ messages, remainingMessages, selectedTopic }: ConversationAnalyticsProps) => {
  const userMessages = messages.filter(m => m.sender === 'user');
  const botMessages = messages.filter(m => m.sender === 'bot');
  const positiveFeedback = messages.filter(m => m.feedback === 'positive').length;
  const negativeFeedback = messages.filter(m => m.feedback === 'negative').length;
  const totalWords = messages.reduce((acc, msg) => acc + msg.content.split(' ').length, 0);
  const averageWordsPerMessage = messages.length > 0 ? Math.round(totalWords / messages.length) : 0;
  
  // Calculate conversation duration
  const firstMessage = messages[0];
  const lastMessage = messages[messages.length - 1];
  const duration = firstMessage && lastMessage 
    ? Math.round((lastMessage.timestamp.getTime() - firstMessage.timestamp.getTime()) / 1000 / 60)
    : 0;

  // Calculate engagement score (based on feedback and message frequency)
  const engagementScore = Math.min(100, Math.max(0, 
    (positiveFeedback * 20) - (negativeFeedback * 10) + (userMessages.length * 5)
  ));

  // Calculate usage percentage
  const totalDailyMessages = 15;
  const usedMessages = totalDailyMessages - remainingMessages;
  const usagePercentage = (usedMessages / totalDailyMessages) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Conversation Analytics</h3>
        <Badge variant="outline" className="text-xs">
          {selectedTopic || 'General Chat'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Message Count */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
            <p className="text-xs text-muted-foreground">
              {userMessages.length} from you, {botMessages.length} from AI
            </p>
          </CardContent>
        </Card>

        {/* Duration */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{duration}m</div>
            <p className="text-xs text-muted-foreground">
              {duration > 0 ? `${Math.round(duration / userMessages.length)}m per message` : 'Just started'}
            </p>
          </CardContent>
        </Card>

        {/* Engagement Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementScore}%</div>
            <Progress value={engagementScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Based on feedback & activity
            </p>
          </CardContent>
        </Card>

        {/* Word Count */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Words</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWords}</div>
            <p className="text-xs text-muted-foreground">
              ~{averageWordsPerMessage} per message
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Feedback Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Feedback Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Positive Feedback</span>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  👍 {positiveFeedback}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {messages.length > 0 ? Math.round((positiveFeedback / messages.length) * 100) : 0}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Negative Feedback</span>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  👎 {negativeFeedback}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {messages.length > 0 ? Math.round((negativeFeedback / messages.length) * 100) : 0}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">No Feedback</span>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {messages.filter(m => m.sender === 'bot' && !m.feedback).length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Daily Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Messages Used</span>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  {usedMessages} / {totalDailyMessages}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Usage Progress</span>
                <span>{Math.round(usagePercentage)}%</span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
            </div>
            <div className="text-xs text-muted-foreground">
              {remainingMessages > 0 
                ? `${remainingMessages} messages remaining today`
                : 'Daily limit reached'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      {messages.length > 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Conversation Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {engagementScore > 70 && (
                <div className="flex items-center space-x-2 text-green-700">
                  <Target className="h-4 w-4" />
                  <span>High engagement! You're actively participating in the conversation.</span>
                </div>
              )}
              {positiveFeedback > negativeFeedback && positiveFeedback > 0 && (
                <div className="flex items-center space-x-2 text-blue-700">
                  <TrendingUp className="h-4 w-4" />
                  <span>Great feedback! The AI responses are meeting your needs.</span>
                </div>
              )}
              {averageWordsPerMessage > 20 && (
                <div className="flex items-center space-x-2 text-purple-700">
                  <BarChart3 className="h-4 w-4" />
                  <span>Detailed conversation with {averageWordsPerMessage} words per message on average.</span>
                </div>
              )}
              {usagePercentage > 80 && (
                <div className="flex items-center space-x-2 text-amber-700">
                  <Clock className="h-4 w-4" />
                  <span>You're close to your daily limit. Consider saving some messages for later.</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
