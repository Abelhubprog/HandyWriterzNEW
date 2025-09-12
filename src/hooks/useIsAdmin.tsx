import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { adminAuth } from '../services/adminAuth';

/**
 * A hook to check if the current user is an admin
 * Uses Clerk for authentication and Cloudflare D1 for role management
 */
export const useIsAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const checkAdmin = async () => {
      setIsLoading(true);
      try {
        if (isLoaded && user?.id) {
          const adminStatus = await adminAuth.isAdmin(user.id);
          setIsAdmin(adminStatus);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoaded) {
      checkAdmin();
    }
  }, [user, isLoaded]);

  return { isAdmin, isLoading };
};

export default useIsAdmin;
