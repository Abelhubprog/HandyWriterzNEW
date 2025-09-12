import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useUser, useClerk, useSession, useSignIn, useSignUp } from '@clerk/clerk-react';

interface User {
  id: string;
  email: string;
  role?: string;
  displayName?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const { session } = useSession();
  const { signIn: clerkSignIn } = useSignIn() || {};
  const { signUp: clerkSignUp } = useSignUp() || {};
  const clerk = useClerk();
  const [state, setState] = useState<Omit<AuthContextType, 'signIn' | 'signUp' | 'signOut' | 'refreshUser'>>({
    user: null,
    isLoading: true,
    error: null
  });

  const refreshUser = async () => {
    try {
      if (clerkUser) {
        setState(s => ({
          ...s,
          user: {
            id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            role: clerkUser.publicMetadata?.role as string || 'user',
            displayName: clerkUser.username || clerkUser.primaryEmailAddress?.emailAddress?.split('@')[0] || ''
          },
          error: null
        }));
      } else {
        setState(s => ({ ...s, user: null }));
      }
    } catch (error) {
      setState(s => ({ ...s, error: error as Error }));
    }
  };

  useEffect(() => {
    if (isLoaded) {
      refreshUser();
      setState(s => ({ ...s, isLoading: false }));
    } else {
      setState(s => ({ ...s, isLoading: true }));
    }
    // Clerk handles auth state changes internally
  }, [clerkUser, isLoaded, isSignedIn]);

  const handleSignIn = async (email: string, password: string) => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      if (!clerkSignIn) throw new Error('Clerk signIn not ready');
      const result = await clerkSignIn.create({ identifier: email, password });
      if (result.status === 'complete') {
        await clerk.setActive({ session: result.createdSessionId });
        await refreshUser();
      } else {
        throw new Error('Sign in not complete');
      }
    } catch (error) {
      setState(s => ({ ...s, error: error as Error }));
      throw error;
    } finally {
      setState(s => ({ ...s, isLoading: false }));
    }
  };

  const handleSignUp = async (email: string, password: string, displayName?: string) => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      if (!clerkSignUp) throw new Error('Clerk signUp not ready');
      const result = await clerkSignUp.create({ emailAddress: email, password });
      if (result.status === 'complete') {
        await clerk.setActive({ session: result.createdSessionId });
        await refreshUser();
      } else {
        throw new Error('Sign up not complete');
      }
    } catch (error) {
      setState(s => ({ ...s, error: error as Error }));
      throw error;
    } finally {
      setState(s => ({ ...s, isLoading: false }));
    }
  };

  const handleSignOut = async () => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      await clerkSignOut();
      setState(s => ({ ...s, user: null }));
    } catch (error) {
      setState(s => ({ ...s, error: error as Error }));
      throw error;
    } finally {
      setState(s => ({ ...s, isLoading: false }));
    }
  };

  const value: AuthContextType = {
    ...state,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Default export
export default useAuth;
