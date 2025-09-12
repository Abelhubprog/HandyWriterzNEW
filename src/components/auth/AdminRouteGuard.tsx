import React from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

/**
 * AdminRouteGuard - Protects admin routes using Clerk session claims
 * 
 * This component checks if the user has admin role in their session claims.
 * It should be used with React Router's nested routing to protect admin areas.
 * 
 * Prerequisites:
 * 1. JWT Template configured in Clerk Dashboard with custom claims
 * 2. User metadata with role: "admin" set for admin users
 * 
 * Usage with React Router:
 * <Route element={<AdminRouteGuard />}>
 *   <Route path="/admin/dashboard" element={<AdminDashboard />} />
 *   <Route path="/admin/users" element={<UserManagement />} />
 * </Route>
 */

const AdminRouteGuard: React.FC = () => {
  const { isLoaded, isSignedIn, sessionClaims } = useAuth();

  // Extract role from session claims (set via JWT template)
  const userRole = sessionClaims?.metadata?.role;
  const isAdmin = userRole === 'admin';

  // Show loading state while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Not signed in - redirect to sign in with return URL
  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  // Signed in but not admin - redirect to regular dashboard
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access the admin area. Please contact an administrator if you believe this is an error.
            </p>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is admin - render the nested admin routes
  return <Outlet />;
};

export default AdminRouteGuard;