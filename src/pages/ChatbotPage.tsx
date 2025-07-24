import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import RAGChatbotSimple from '../components/RAGChatbotSimple';
import { ExpiredSubscriptionNotice } from '../components/ExpiredSubscriptionNotice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export default function ChatbotPage() {
  const { user } = useAuth();
  const { hasSubscription, isExpired, loading, error } = useSubscription();
  const navigate = useNavigate();

  // If user is not logged in, redirect to login
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">Please log in to access the chatbot.</p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Show error state only if there's a specific error (not network issues)
  if (error && !error.includes('Network error')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">Unable to load subscription status.</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is logged in, show chatbot with subscription status
  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      {/* Show expired subscription notice if applicable */}
      {isExpired && (
        <ExpiredSubscriptionNotice variant="banner" className="mb-4" />
      )}
      
      {/* Show chatbot */}
      <RAGChatbotSimple />
    </div>
  );
} 