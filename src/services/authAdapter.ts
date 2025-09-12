import { useAuth } from '../admin/components/hooks/useAuth';

/**
 * AuthAdapter provides a simplified interface for authentication operations
 * now primarily using Clerk authentication through the useAuth hook.
 */
export const authAdapter = {
  /**
   * Get current user info
   */
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Get user profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
      }

      return {
        id: user.id,
        email: user.email,
        name: profile?.display_name || user.email?.split('@')[0],
        role: profile?.role || 'user',
        status: profile?.status || 'active',
      };
    }

    return null;
  },

  /**
   * Check if user has admin privileges
   */
  async isAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === 'admin';
  },

  /**
   * Sign out and redirect to login
   */
  async signOut(): Promise<void> {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/admin-login';
    }
  }
};
