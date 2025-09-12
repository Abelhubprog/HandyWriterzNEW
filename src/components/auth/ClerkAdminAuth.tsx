import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router-dom';
import { d1Client as db } from '@/lib/d1Client';
import { toast } from 'react-hot-toast';
import { Loader } from '@/components/ui/Loader';

interface ClerkAdminAuthProps {
  children: React.ReactNode;
}

/**
 * ClerkAdminAuth - Component that verifies if a user has admin privileges
 * This component checks both Clerk authentication and admin role in the database
 */
const ClerkAdminAuth: React.FC<ClerkAdminAuthProps> = ({ children }) => {
  const { isSignedIn, user } = useUser();
  const { isLoaded } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isLoaded) return;

      if (!isSignedIn || !user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Check if user is an admin in Cloudflare D1
        const { data: adminData, error } = await db
          .from('admin_users')
          .select('*')
          .eq('email', user.primaryEmailAddress?.emailAddress || '')
          .single();

        if (error) {
          setIsAdmin(false);
        } else {
          // User is admin if they exist in the admin_users table
          setIsAdmin(!!adminData);
          
          // Log admin access for audit purposes
          if (adminData) {
            await db
              .from('admin_access_logs')
              .insert({
                admin_id: adminData.id,
                email: user.primaryEmailAddress?.emailAddress,
                name: user.fullName,
                access_time: new Date().toISOString(),
                page_accessed: location.pathname
              });
          }
        }
      } catch (err) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [isSignedIn, isLoaded, user, location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader size="lg" />
        <p className="text-gray-600 ml-2">Verifying admin privileges...</p>
      </div>
    );
  }

  if (!isSignedIn || !isAdmin) {
    toast.error('Admin access required. Please sign in with an admin account.');
    return <Navigate to="/auth/admin-login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ClerkAdminAuth;
