import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    if (sessionId) {
      // Verify the session with your backend
      fetch('/api/verify-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })
        .then(res => res.json())
        .then(data => {
          setSessionData(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error verifying session:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto mb-4"></div>
          <p className="text-slate-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              Payment Successful! 🎉
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Welcome to ChristTask! Your subscription is now active.
            </p>
          </motion.div>

          {/* Session Details */}
          {sessionData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-lg p-6 mb-8"
            >
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Subscription Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Plan:</span>
                  <span className="font-medium text-slate-800">{sessionData.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Status:</span>
                  <span className="font-medium text-green-600">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Session ID:</span>
                  <span className="font-mono text-xs text-slate-500">{sessionId}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* What's Next */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-lg p-6 mb-8"
          >
            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
              What's Next?
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-purple-600 text-sm font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Access Your Dashboard</h3>
                  <p className="text-slate-600">Start exploring ChristTask features and apologetics training.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-purple-600 text-sm font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Join the Community</h3>
                  <p className="text-slate-600">Connect with 1000+ Christians and share your faith journey.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-purple-600 text-sm font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Start Learning</h3>
                  <p className="text-slate-600">Begin your apologetics training and defend your faith confidently.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={() => window.location.href = '/chatbot'}
              className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 text-lg font-semibold"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Start Chatting Now
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/dashboard'}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-3 text-lg font-semibold"
            >
              Go to Dashboard
            </Button>
          </motion.div>

          {/* Support Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center mt-12"
          >
            <p className="text-slate-500 mb-2">
              Need help? Contact our support team
            </p>
            <p className="text-sm text-slate-400">
              You'll receive a confirmation email shortly with your subscription details.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage; 