import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useMessageUsage = () => {
  const [remainingMessages, setRemainingMessages] = useState<number>(15);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUsage = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('user_message_usage')
        .select('message_count')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching usage:', error);
        return;
      }

      const usedMessages = data?.message_count || 0;
      setRemainingMessages(15 - usedMessages);
    } catch (error) {
      console.error('Error fetching message usage:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, [user]);

  return {
    remainingMessages,
    loading,
    refreshUsage: fetchUsage
  };
};
