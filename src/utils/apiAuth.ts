import { useAuth } from '@/hooks/useAuth';

// Get authentication headers for API requests
export const getAuthHeaders = (token: string) => {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Check if user is authenticated
export const isAuthenticated = (session: any) => {
  return !!session;
};

// Check if user is admin
export const isAdmin = (user: any) => {
  if (!user) return false;
  
  // Check if user has admin role
  return user.role === 'admin' || 
         user.email?.includes('@handywriterz.com') ||
         user.emailAddresses?.some((email: any) => 
           email.emailAddress.includes('@handywriterz.com'));
};

// Wrapper for fetch requests with authentication
export const authenticatedFetch = async (
  url: string, 
  options: RequestInit = {}, 
  token: string
) => {
  const authHeaders = getAuthHeaders(token);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...authHeaders,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};