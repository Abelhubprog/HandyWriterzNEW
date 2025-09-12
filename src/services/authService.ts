import { toast } from 'react-hot-toast';
import { useClerk, useUser, useAuth } from '@clerk/clerk-react';
import databaseService from '@/services/databaseService';

// Define types for D1 compatibility
export interface User {
  id: string;
  email?: string;
  user_metadata?: any;
}
export interface AuthError extends Error {}
export interface Session {
  user: User;
}
export interface UserResponse {
  data: { user: User | null };
  error: AuthError | null;
}

// Import the canonical AuthUser type from types/auth
import type { AuthUser } from '@/types/auth';

export const authService = {
  /**
   * Sign in with email and password and get user profile
   * Note: Clerk handles authentication automatically via hooks
   */
  async signIn(email: string, password: string) {
    try {
      // Note: Clerk sign in is handled via the useAuth hook and ClerkProvider
      // This method is kept for compatibility but Clerk handles auth differently
      throw new Error('Use Clerk authentication components for sign in');
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get current user from Clerk and database profile
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      // This would be used in components with Clerk hooks
      // For now, return null - components should use useUser() hook
      return null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Reset password with email
   * Note: Clerk handles password reset differently
   */
  async resetPassword(email: string) {
    // Clerk handles password reset through their components
    throw new Error('Use Clerk password reset components');
  },

  /**
   * Update user password
   * Note: Clerk handles password updates differently
   */
  async updatePassword(password: string) {
    // Clerk handles password updates through their components
    throw new Error('Use Clerk password update components');
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: Partial<AuthUser>) {
    try {
      const result = await databaseService.update('profiles', userId, {
        display_name: data.name,
        avatar_url: data.avatarUrl,
        status: data.status,
        role: data.role,
      });

      return !!result;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get user profile from database
   */
  async getUserProfile(userId: string): Promise<AuthUser | null> {
    try {
      const profiles = await databaseService.read('profiles', { user_id: userId });
      const profile = profiles?.[0];
      
      if (!profile) return null;

      return {
        id: profile.user_id || userId,
        email: profile.email || '',
        name: profile.display_name || profile.full_name || 'User',
        role: profile.role || 'user',
        avatarUrl: profile.avatar_url,
        status: profile.status || 'active',
      } as AuthUser;
    } catch (error) {
      return null;
    }
  },
};
