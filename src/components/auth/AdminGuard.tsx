import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Loader } from '@/components/ui/Loader';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import HandyWriterzLogo from '@/components/HandyWriterzLogo';
import { d1Client as db } from '@/lib/d1Client';
import { toast } from 'react-hot-toast';

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * AdminGuard component
 * 
 * Protects routes that should only be accessible to admin users.
 * Redirects to admin login if not authenticated as admin.
 * Uses Cloudflare D1 for admin role verification.
 */
const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  // Verify admin authentication on mount
  useEffect(() => {
    let isMounted = true;
    
    const verifyAdmin = async () => {
      try {
        if (!isSignedIn || !user) {
          setIsAuthorized(false);
          setIsChecking(false);
          return;
        }

        // Check if user has admin role directly in Cloudflare D1
        const { data: adminData, error: dbError } = await db
          .from('admin_users')
          .select('*')
          .eq('email', user.primaryEmailAddress?.emailAddress || '')
          .single();

        if (dbError) {
          setError('Failed to connect to the database. Please try again later.');
          setIsAuthorized(false);
        } else if (adminData) {
          setIsAuthorized(true);
          
          // Log admin access for audit purposes
          await db
            .from('admin_access_logs')
            .insert({
              admin_id: adminData.id,
              email: user.primaryEmailAddress?.emailAddress,
              name: user.fullName,
              access_time: new Date().toISOString(),
              page_accessed: location.pathname
            })
        } else {
          setIsAuthorized(false);
          toast.error('You do not have admin privileges.');
        }
        
        setIsChecking(false);
      } catch (err) {
        setError('Failed to verify your admin role. Please try logging in again.');
        setIsAuthorized(false);
        setIsChecking(false);
      }
    };
    
    if (isLoaded) {
      verifyAdmin();
    }
    
    return () => {
      isMounted = false;
    };
  }, [isLoaded, isSignedIn, user, location]);

  // Loading state while checking authentication
  if (!isLoaded || isChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <HandyWriterzLogo className="w-16 h-16 mb-6" />
        <Loader size="lg" />
        <p className="mt-4 text-gray-600">Verifying admin access...</p>
      </div>
    );
  }

  // Error state if authentication check failed
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex items-center justify-center mb-6">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-center mb-4">Authentication Error</h1>
          <p className="text-gray-700 text-center mb-6">{error}</p>
          <div className="flex flex-col space-y-2">
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => {
                window.location.href = '/auth/admin-login';
              }}
              className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
            >
              Go to Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // If not authorized, redirect to login page
  if (!isAuthorized) {
    return <Navigate to="/auth/admin-login" state={{ from: location }} replace />;
  }

  // User is authenticated as admin, render protected content
  return <>{children}</>;
};

export default AdminGuard; 