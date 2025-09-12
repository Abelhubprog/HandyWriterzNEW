import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { adminAuth } from '@/services/adminAuth';
import toast from 'react-hot-toast';


interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  allowPublicAccess?: boolean;
}


export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  allowPublicAccess = false
}) => {
  const { user, isSignedIn } = useUser();
  const { isLoaded } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  // Enhanced admin status check with proper error handling
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user || !requireAdmin) {
        setIsChecking(false);
        return;
      }

      try {
        // Check both session claims and database
        const sessionClaims = user.publicMetadata;
        const isSessionAdmin = sessionClaims?.role === 'admin';
        let isDatabaseAdmin = false;
        if (!isSessionAdmin) {
          isDatabaseAdmin = await adminAuth.isAdmin(user.id);
        }
        setIsAdmin(isSessionAdmin || isDatabaseAdmin);
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setIsChecking(false);
      }
    };

    if (isLoaded) {
      checkAdminStatus();
    }
  }, [user, requireAdmin, isLoaded]);

  // Show loading state while checking auth
  if (!isLoaded || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }


  // Allow public access if specified
  if (allowPublicAccess) {
    return <>{children}</>;
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    const redirectUrl = `${location.pathname}${location.search}`;
    return <Navigate to={`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`} replace />;
  }

  // Check admin requirements
  if (requireAdmin && !isAdmin) {
    toast.error("Administrator access required");
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
