import { AuthUser } from './user';
import { Database } from './database.types';

// There is no 'profiles' table in Supabase. Use a minimal placeholder for profile data if needed.
export type Profile = {
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  // Add more fields as required by the app UI
};

/**
 * AuthState: Used for global auth/session state.
 * User is always AuthUser (from Clerk or Supabase).
 */
export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * AuthContextType: Auth context for React providers.
 */
export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
