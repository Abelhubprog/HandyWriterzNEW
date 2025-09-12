import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Loader } from '@/components/ui/Loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const location = useLocation();

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  // Redirect to admin login if not signed in
  if (!isSignedIn) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check if admin access is required
  if (requireAdmin) {
    const adminEmails = [
      'admin@handywriterz.com',
      'superadmin@handywriterz.com',
      'moderator@handywriterz.com'
    ];
    
    const userEmail = user?.emailAddresses[0]?.emailAddress;
    
    if (!userEmail || !adminEmails.includes(userEmail)) {
      return <Navigate to="/admin/unauthorized" replace />;
    }
  }

  // For development, allow basic authenticated users for content management
  // In production, you might want stricter role checking
  return <>{children}</>;
};

export default ProtectedRoute; 