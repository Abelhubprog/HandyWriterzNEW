import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import { adminAuthService } from '@/services/adminAuthService';
import { performLogout } from '@/utils/authLogout';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  refreshAdminStatus: () => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

const getDefaultPermissions = (role: string): string[] => {
  switch (role) {
    case 'admin':
      return [
        'content.create', 'content.edit', 'content.delete', 'content.publish',
        'users.view', 'users.edit', 'analytics.view'
      ];
    case 'moderator':
      return [
        'content.create', 'content.edit', 'content.publish',
        'users.view', 'analytics.view'
      ];
    case 'super_admin':
      return [
        'content.create', 'content.edit', 'content.delete', 'content.publish',
        'users.view', 'users.edit', 'users.delete', 'users.create',
        'analytics.view', 'system.admin', 'admin.manage'
      ];
    default:
      return [];
  }
};

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      checkAdminStatus();
    }
  }, [user, isLoaded]);

  const checkAdminStatus = async () => {
    try {
      setLoading(true);

      if (!user) {
        setAdminUser(null);
        return;
      }

      // Use adminAuthService to get current admin
      const adminData = await adminAuthService.getCurrentAdmin();

      if (adminData) {
        const adminUserData: AdminUser = {
          id: adminData.id,
          email: adminData.email,
          firstName: user.firstName || adminData.name.split(' ')[0] || '',
          lastName: user.lastName || adminData.name.split(' ')[1] || '',
          role: adminData.role as any,
          permissions: getDefaultPermissions(adminData.role),
          isActive: adminData.status === 'active',
          lastLogin: adminData.lastLogin,
          createdAt: new Date().toISOString()
        };

        setAdminUser(adminUserData);
      } else {
        // Fallback to mock data for development
        const mockAdminCheck = await checkMockAdminStatus(user.emailAddresses[0]?.emailAddress);
        setAdminUser(mockAdminCheck);
      }
    } catch (error) {

      // Fallback to mock data for development
      if (user) {
        const mockAdminCheck = await checkMockAdminStatus(user.emailAddresses[0]?.emailAddress);
        setAdminUser(mockAdminCheck);
      }
    } finally {
      setLoading(false);
    }
  };

  // Mock admin check for development - remove in production
  const checkMockAdminStatus = async (email: string): Promise<AdminUser | null> => {
    const mockAdmins = [
      'admin@handywriterz.com',
      'superadmin@handywriterz.com',
      'moderator@handywriterz.com'
    ];

    if (mockAdmins.includes(email)) {
      return {
        id: '1',
        email: email,
        firstName: user?.firstName || 'Admin',
        lastName: user?.lastName || 'User',
        role: email.includes('superadmin') ? 'super_admin' :
              email.includes('moderator') ? 'moderator' : 'admin',
        permissions: email.includes('superadmin') ? [
          'content.create', 'content.edit', 'content.delete', 'content.publish',
          'users.view', 'users.edit', 'users.delete', 'users.create',
          'analytics.view', 'system.admin', 'admin.manage'
        ] : email.includes('moderator') ? [
          'content.create', 'content.edit', 'content.publish',
          'users.view', 'analytics.view'
        ] : [
          'content.create', 'content.edit', 'content.delete', 'content.publish',
          'users.view', 'users.edit', 'analytics.view'
        ],
        isActive: true,
        lastLogin: new Date().toISOString(),
        createdAt: '2024-01-01T00:00:00Z'
      };
    }

    return null;
  };


  const refreshAdminStatus = async () => {
    await checkAdminStatus();
  };

  const hasPermission = (permission: string): boolean => {
    if (!adminUser) return false;
    return adminUser.permissions.includes(permission) || adminUser.role === 'super_admin';
  };

  const logout = async () => {
    try {
      await performLogout();
      setAdminUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const isAdmin = adminUser !== null && adminUser.isActive;
  const isSuperAdmin = adminUser?.role === 'super_admin';

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isAdmin,
        isSuperAdmin,
        loading,
        hasPermission,
        refreshAdminStatus,
        logout
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

// Admin Route Protection Component
interface AdminProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
  fallback?: ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({
  children,
  requiredPermission,
  fallback
}) => {
  const { user } = useUser();
  const { isAdmin, hasPermission, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access the admin dashboard.</p>
          <button
            onClick={() => window.location.href = '/auth/admin-login'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the admin dashboard. Please contact your administrator.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Insufficient Permissions</h2>
          <p className="text-gray-600 mb-6">
            You don't have the required permissions to access this feature.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Permission Guard Hook
export const usePermissionGuard = (permission: string) => {
  const { hasPermission } = useAdminAuth();
  return hasPermission(permission);
};

// Admin Role Guard Component
interface AdminRoleGuardProps {
  children: ReactNode;
  allowedRoles: ('super_admin' | 'admin' | 'moderator')[];
  fallback?: ReactNode;
}

export const AdminRoleGuard: React.FC<AdminRoleGuardProps> = ({
  children,
  allowedRoles,
  fallback
}) => {
  const { adminUser } = useAdminAuth();

  if (!adminUser || !allowedRoles.includes(adminUser.role)) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
          <p className="text-yellow-800">You don't have the required role to access this feature.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
