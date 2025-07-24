import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ExpiredSubscriptionNoticeProps {
  variant?: 'banner' | 'card' | 'inline';
  className?: string;
}

export const ExpiredSubscriptionNotice = ({ 
  variant = 'banner', 
  className = '' 
}: ExpiredSubscriptionNoticeProps) => {
  const navigate = useNavigate();

  const handleRenew = () => {
    navigate('/payment');
  };

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-4 ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm text-yellow-800">
              <strong>Subscription Expired:</strong> Your premium access has expired. 
              <button 
                onClick={handleRenew}
                className="ml-2 underline hover:no-underline font-medium"
              >
                Renew now
              </button>
              to continue with unlimited access.
            </p>
          </div>
          <Button 
            onClick={handleRenew}
            size="sm"
            className="ml-4 bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Renew
          </Button>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={`bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Crown className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">Premium Access Expired</h3>
              <p className="text-sm text-yellow-700">Renew your subscription to continue enjoying unlimited features</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="text-sm text-yellow-700">
              <p>• Unlimited AI conversations</p>
              <p>• Advanced Bible study tools</p>
              <p>• Priority support</p>
            </div>
            
            <Button 
              onClick={handleRenew}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Renew Subscription
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // inline variant
  return (
    <div className={`inline-flex items-center text-sm text-yellow-700 ${className}`}>
      <AlertTriangle className="h-4 w-4 mr-2" />
      <span>Subscription expired. </span>
      <button 
        onClick={handleRenew}
        className="ml-1 underline hover:no-underline font-medium"
      >
        Renew now
      </button>
    </div>
  );
}; 