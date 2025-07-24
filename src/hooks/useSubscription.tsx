import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface Subscription {
  id: string;
  status: string;
  plan: string;
  currentPeriodEnd: number;
  customerId: string;
}

interface SubscriptionStatus {
  hasSubscription: boolean;
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
  isExpired: boolean;
  daysUntilExpiry: number | null;
  canUseUnlimitedFeatures: boolean;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    hasSubscription: false,
    subscription: null,
    loading: false,
    error: null,
    isExpired: false,
    daysUntilExpiry: null,
    canUseUnlimitedFeatures: false
  });

  const checkSubscription = async () => {
    if (!user?.email) {
      console.log('No user email available for subscription check');
      setSubscriptionStatus(prev => ({ 
        ...prev, 
        loading: false,
        hasSubscription: false,
        isExpired: false,
        canUseUnlimitedFeatures: false
      }));
      return;
    }

    console.log('Checking subscription for email:', user.email);
    setSubscriptionStatus(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log('Making request to check-subscription endpoint...');
      const response = await fetch('http://localhost:3000/check-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        const now = Math.floor(Date.now() / 1000);
        const isExpired = data.hasSubscription && data.subscription?.currentPeriodEnd < now;
        const daysUntilExpiry = data.hasSubscription && data.subscription?.currentPeriodEnd 
          ? Math.ceil((data.subscription.currentPeriodEnd - now) / (24 * 60 * 60))
          : null;

        console.log('Subscription check successful:', {
          hasSubscription: data.hasSubscription,
          isExpired,
          daysUntilExpiry
        });

        setSubscriptionStatus({
          hasSubscription: data.hasSubscription,
          subscription: data.subscription,
          loading: false,
          error: null,
          isExpired,
          daysUntilExpiry,
          canUseUnlimitedFeatures: data.hasSubscription && !isExpired
        });
      } else {
        console.error('Subscription check failed with status:', response.status, 'Error:', data.error);
        setSubscriptionStatus({
          hasSubscription: false,
          subscription: null,
          loading: false,
          error: data.error || 'Failed to check subscription',
          isExpired: false,
          daysUntilExpiry: null,
          canUseUnlimitedFeatures: false
        });
      }
    } catch (error) {
      console.error('Network error while checking subscription:', error);
      
      // Fallback: Assume user has access if backend is unavailable
      // This prevents blocking users when there are network issues
      console.log('Backend unavailable, allowing access as fallback');
      setSubscriptionStatus({
        hasSubscription: true, // Assume they have access
        subscription: null,
        loading: false,
        error: null, // Don't show error to user
        isExpired: false,
        daysUntilExpiry: null,
        canUseUnlimitedFeatures: true // Allow full access as fallback
      });
    }
  };

  useEffect(() => {
    if (user?.email) {
      checkSubscription();
    } else {
      setSubscriptionStatus({
        hasSubscription: false,
        subscription: null,
        loading: false,
        error: null,
        isExpired: false,
        daysUntilExpiry: null,
        canUseUnlimitedFeatures: false
      });
    }
  }, [user?.email]);

  return {
    ...subscriptionStatus,
    checkSubscription
  };
};
