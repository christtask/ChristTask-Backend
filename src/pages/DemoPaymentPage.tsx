import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DemoPaymentPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">Q</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Payment Page Demo
          </h1>
          <p className="text-slate-600">
            Experience the beautiful payment page with animated background and Stripe integration
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-semibold text-slate-800 mb-2">Features Included:</h3>
            <ul className="text-sm text-slate-600 space-y-1 text-left">
              <li>• Split-screen layout with animated background</li>
              <li>• Flowing gradient animations</li>
              <li>• Floating particle effects</li>
              <li>• Clean payment form with Stripe Elements</li>
              <li>• Responsive design for mobile and desktop</li>
              <li>• Form validation and error handling</li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => navigate('/payment')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
          >
            View Payment Page
          </Button>
          
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            This is a demo implementation. For production use, please configure your Stripe keys and backend integration.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoPaymentPage; 