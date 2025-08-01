import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import RAGChatbotSimple from '../components/RAGChatbotSimple';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function ChatbotPage() {
  const { user, loading: authLoading } = useAuth();
  const { hasSubscription, loading: subscriptionLoading, checkSubscription } = useSubscription();
  const navigate = useNavigate();

  // Check subscription when user is logged in
  useEffect(() => {
    if (user && !subscriptionLoading) {
      checkSubscription();
    }
  }, [user, subscriptionLoading, checkSubscription]);

  // Show loading while checking auth and subscription
  if (authLoading || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Loading...</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">Checking your access...</p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  // If user is logged in but no subscription, show subscription message
  if (!hasSubscription) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Subscription Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">You need an active subscription to access the chatbot.</p>
            <Button onClick={() => navigate('/payment')} className="w-full">
              Get Subscription
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is logged in and has subscription, show chatbot
  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      {/* Show chatbot */}
      <RAGChatbotSimple />
    </div>
  );
} 