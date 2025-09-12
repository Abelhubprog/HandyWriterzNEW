import databaseService from '@/services/databaseService';
import { useClerk } from '@clerk/clerk-react';

// Add Clerk to the Window interface
declare global {
  interface Window {
    Clerk?: {
      user?: {
        id?: string;
        fullName?: string;
        imageUrl?: string;
        primaryEmailAddress?: {
          emailAddress?: string;
        };
      };
    };
  }
}

// Check if a user is an admin
const checkIfUserIsAdmin = async (userId: string): Promise<boolean> => {
  try {
    // First try to get from the admin_users table
    const admins = await databaseService.read('admin_users', { user_id: userId });
    
    if (admins && admins.length > 0) {
      const adminRole = admins[0]?.role;
      return adminRole === 'super_admin' || adminRole === 'admin' || adminRole === 'moderator';
    }
    
    // Fallback to checking email for development purposes
    // In production, you would remove this and rely solely on the database
    if (window.Clerk?.user?.primaryEmailAddress?.emailAddress) {
      const email = window.Clerk.user.primaryEmailAddress.emailAddress;
      const adminEmails = [
        'admin@handywriterz.com',
        'superadmin@handywriterz.com',
        'moderator@handywriterz.com'
      ];
      
      return adminEmails.includes(email);
    }
    
    return false;
  } catch (error) {
    // For development, return true if the error is related to missing tables
    if (error instanceof Error && error.message.includes('no such table')) {
      return true;
    }
    return false;
  }
};

export const adminAuthService = {
  // Login is handled by Clerk but we need to verify admin status
  async login(userId: string) {
    try {
      const isAdmin = await checkIfUserIsAdmin(userId);
      if (!isAdmin) {
        throw new Error('User does not have admin privileges');
      }
      return { success: true };
    } catch (error) {
      throw error;
    }
  },
  
  // Logout function
  async logout() {
    try {
      // We'll still use Clerk for actual logout, but this function can do additional cleanup
      // Clear any admin-specific local storage or session data
      sessionStorage.removeItem('last_admin_redirect');
      return { success: true };
    } catch (error) {
      throw error;
    }
  },
  
  // Verify admin status
  async isAdmin(userId: string): Promise<boolean> {
    return await checkIfUserIsAdmin(userId);
  },
  
  // Get current admin user details
  async getCurrentAdmin() {
    try {
      // Get current user from Clerk
      const userId = window.Clerk?.user?.id;
      
      if (!userId) {
        return null;
      }
      
      // Check admin status
      const isAdmin = await checkIfUserIsAdmin(userId);
      
      if (!isAdmin) {
        return null;
      }
      
      // Get admin details from database
      const admins = await databaseService.read('admin_users', { user_id: userId });
      
      let role = 'admin'; // Default role
      let data: any = {};
      
      // If we found admin data in the database, use it
      if (admins && admins.length > 0) {
        data = admins[0];
        role = data.role || role;
      } 
      // Otherwise use Clerk data with mock role for development
      else if (window.Clerk?.user?.primaryEmailAddress?.emailAddress) {
        const email = window.Clerk.user.primaryEmailAddress.emailAddress;
        if (email.includes('superadmin')) {
          role = 'super_admin';
        } else if (email.includes('moderator')) {
          role = 'moderator';
        }
      }
      
      return {
        id: userId,
        name: window.Clerk?.user?.fullName || data.name || 'Admin User',
        email: window.Clerk?.user?.primaryEmailAddress?.emailAddress || data.email || '',
        role: role,
        permissions: getDefaultPermissions(role),
        avatar: window.Clerk?.user?.imageUrl || data.avatar || '',
        status: data.status || 'active',
        lastLogin: new Date().toISOString()
      };
    } catch (error) {
      
      // For development, provide a mock admin if database tables don't exist
      if (error instanceof Error && error.message.includes('no such table')) {
        const userId = window.Clerk?.user?.id;
        if (userId) {
          const email = window.Clerk?.user?.primaryEmailAddress?.emailAddress || '';
          let role = 'admin';
          
          if (email.includes('superadmin')) {
            role = 'super_admin';
          } else if (email.includes('moderator')) {
            role = 'moderator';
          }
          
          return {
            id: userId,
            name: window.Clerk?.user?.fullName || 'Admin User',
            email: email,
            role: role,
            permissions: getDefaultPermissions(role),
            avatar: window.Clerk?.user?.imageUrl || '',
            status: 'active',
            lastLogin: new Date().toISOString()
          };
        }
      }
      
      return null;
    }
  }
}; 