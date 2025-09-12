import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

export const useAuthRedirect = () => {
  const { user } = useDynamicContext();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndRedirect = () => {
      const authSuccess = localStorage.getItem('auth_success');

      if (user && authSuccess) {
        if (window.location.pathname === '/') {
          navigate('/dashboard', { replace: true });
        } else {
        }
      } else if (!user && window.location.pathname.startsWith('/dashboard')) {
        navigate('/', { replace: true });
      }
    };

    // Check immediately
    checkAuthAndRedirect();

    // Set up interval to periodically check auth state
    const interval = setInterval(checkAuthAndRedirect, 2000);

    return () => clearInterval(interval);
  }, [user, navigate]);
};
