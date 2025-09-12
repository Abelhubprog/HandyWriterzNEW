import { d1Client } from '@/lib/d1Client';

export const adminAuth = {
  isAdmin: async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await d1Client
        .from('admin_users')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      return data?.role === 'admin' || false;
    } catch (error) {
      console.error('Error in adminAuth.isAdmin:', error);
      return false;
    }
  }
};
