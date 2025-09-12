import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { adminAuth } from '@/services/adminAuth';
import { Loader2 } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const location = useLocation();
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (isLoaded && isSignedIn && user) {
        try {
          const adminStatus = await adminAuth.isAdmin(user.id);
          setIsAdminUser(adminStatus);
        } catch (error) {
          setIsAdminUser(false);
        } finally {
          setIsChecking(false);
        }
      } else if (isLoaded && !isSignedIn) {
        setIsChecking(false);
        setIsAdminUser(false);
      }
    };

    checkAdminAccess();
  }, [isLoaded, isSignedIn, user]);

  // Show loading state while checking auth and admin status
  if (!isLoaded || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-lg text-gray-700">Verifying access...</span>
      </div>
    );
  }

  // Not authenticated - redirect to sign in
  if (!isSignedIn) {
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  // Not an admin - redirect to dashboard
  if (isAdminUser === false) {
    return <Navigate to="/dashboard" replace />;
  }

  // Admin access granted - render children
  return <>{children}</>;
};

export default AdminRoute;
