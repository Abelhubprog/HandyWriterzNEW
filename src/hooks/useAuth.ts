import { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { cloudflareDb } from '@/lib/cloudflare';
import { performLogout } from '@/utils/authLogout';

// Define Session type for D1 compatibility
export interface Session {
  user: any;
}

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export const useAuth = () => {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const clerk = useClerk();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    const syncUserData = async () => {
      try {
        setIsLoading(true);
        
        if (isSignedIn && clerkUser) {
          // Create session object
          const userSession = { user: clerkUser };
          setSession(userSession);

          // Fetch user profile data from D1
          const profiles = await cloudflareDb.select('user_profiles', { id: clerkUser.id }, 1);
          const profile = profiles?.[0];
          
          setUser({
            id: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            name: profile?.full_name || `${clerkUser.firstName} ${clerkUser.lastName}`.trim() || 'User',
            avatarUrl: profile?.avatar_url || clerkUser.imageUrl
          });
        } else {
          setUser(null);
          setSession(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown authentication error'));
      } finally {
        setIsLoading(false);
      }
    };

    syncUserData();
  }, [isLoaded, isSignedIn, clerkUser]);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await clerk.client.signIn.create({
        identifier: email,
        password
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to sign in'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithMagicLink = async (email: string) => {
    try {
      setIsLoading(true);
      await clerk.client.signIn.create({
        identifier: email,
        strategy: 'email_link',
        redirectUrl: window.location.origin
      });
      return { success: true, message: "Magic link sent to your email" };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send magic link'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      
      // Create auth user with Clerk
      const result = await clerk.client.signUp.create({
        emailAddress: email,
        password,
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || ''
      });
      
      if (result.createdUserId) {
        // Create user profile in D1
        await cloudflareDb.insert('user_profiles', {
          id: result.createdUserId,
          full_name: name,
          email,
          created_at: new Date().toISOString()
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to sign up'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await performLogout();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to sign out'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      setIsLoading(true);
      await clerk.user?.updatePassword({ newPassword });
      return { success: true, message: "Password updated successfully" };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update password'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    session,
    isLoading,
    error,
    signIn,
    signUp,
    logout,
    signInWithMagicLink,
    updatePassword,
    isAdmin: user?.email?.includes('admin') || false
  };
};
