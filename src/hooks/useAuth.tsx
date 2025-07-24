
import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  testConnection: () => Promise<boolean>;
}

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }: { children: any }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const testConnection = async () => {
    try {
      console.log('Testing Supabase connection...');
      
      // First try a simple ping
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) {
        console.error('Supabase connection test failed:', error);
        return false;
      }
      console.log('Supabase connection test successful');
      return true;
    } catch (err) {
      console.error('Supabase connection test exception:', err);
      return false;
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      console.log('Starting signup process...');
      console.log('Email:', email);
      
      const redirectUrl = `${window.location.origin}/payment`;
      console.log('Redirect URL:', redirectUrl);
    
      const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || email
        }
      }
    });

      console.log('Signup response:', { data, error });

      if (error) {
        console.error('Signup error:', error);
        return { data: null, error };
      }

      // Check if email confirmation is required
      if (data?.user && !data?.session) {
        // Email confirmation required
        return { 
          data: { 
            user: data.user, 
            requiresEmailConfirmation: true 
          }, 
          error: null 
        };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Signup exception:', err);
      return { 
        data: null, 
        error: { 
          message: 'Network error or service unavailable. Please try again.' 
        } 
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      testConnection
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
