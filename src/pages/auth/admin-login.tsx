import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, AlertTriangle, Shield, ArrowLeft, Settings } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { useSignIn, useUser } from '@clerk/clerk-react';
import { adminAuthService } from '@/services/adminAuthService';

/**
 * Admin Login Component
 * Secure login page for admin access
 */
const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);

  const { isSignedIn, user } = useUser();
  
  // Check if we're already logged in - with fix for blinking issue
  useEffect(() => {
    // Prevent multiple session checks
    if (hasInitialized) return;
    setHasInitialized(true);
    
    // Check for redirections in progress
    const lastRedirect = sessionStorage.getItem('last_admin_redirect');
    const now = Date.now();
    
    // If we redirected in the last 3 seconds, don't trigger another redirect
    if (lastRedirect && now - parseInt(lastRedirect, 10) < 3000) {
      return;
    }
    
    const checkSession = async () => {
      try {
        // Check if user is already signed in with Clerk
        if (isSignedIn && user) {
          // Verify if the user is an admin
          const isAdmin = await adminAuthService.isAdmin(user.id);
          
          // Only redirect if user is admin and on the admin login page
          const isAdminLoginPage = 
            location.pathname === '/auth/admin-login' || 
            location.pathname === '/admin/login';
            
          if (isAdmin && isAdminLoginPage) {
            
            // Store the timestamp of this redirect
            sessionStorage.setItem('last_admin_redirect', Date.now().toString());
            
            // Navigate to admin dashboard
            navigate('/admin');
          }
        }
      } catch (err) {
      }
    };
    
    checkSession();
  }, [navigate, hasInitialized, isSignedIn, user]);

  // Test API connectivity to identify potential issues
  const testApiConnectivity = async () => {
    try {
      setError('');
      // Test connection to Cloudflare D1 database
      const response = await fetch('/api/admin/test-connection', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        toast.success('Successfully connected to Cloudflare D1 database');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Connection failed');
      }
    } catch (err) {
      setError(`API Connection Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      toast.error(`API Connection Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const { signIn, isLoaded: clerkLoaded } = useSignIn();
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error and set loading state
    setError('');
    setIsLoggingIn(true);

    try {
      
      // Simple validation
      if (!email.trim() || !password.trim()) {
        throw new Error('Please enter both email and password');
      }
      
      if (!clerkLoaded) {
        throw new Error('Authentication system is still loading');
      }
      
      // Attempt to sign in with Clerk
      const result = await signIn.create({
        identifier: email,
        password,
      });
      
      // Check if the user is in admin database
      const adminCheck = await adminAuthService.isAdmin(result.createdSessionId);
      
      if (!adminCheck) {
        throw new Error('You do not have admin privileges');
      }
      
      // Success - user is authenticated and is an admin
      toast.success('Admin login successful! Redirecting to dashboard...');
      
      // Store the timestamp of this redirect to prevent loops
      sessionStorage.setItem('last_admin_redirect', Date.now().toString());
      
      // Navigate to admin dashboard
      navigate('/admin');
      
      // Use navigate instead of direct URL change for better handling
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-4">
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '8px',
          },
          success: {
            style: {
              background: '#1e3a8a',
            },
          },
          error: {
            style: {
              background: '#991b1b',
            },
          },
        }}
      />

      {/* Back to site link */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 text-gray-400 hover:text-white flex items-center gap-2 transition-colors duration-300"
      >
        <ArrowLeft size={18} />
        <span>Back to site</span>
      </Link>

      <div className="w-full max-w-md relative z-10">
        {/* Animated Card */}
        <div 
          className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl overflow-hidden p-8 transform transition-all duration-500 hover:shadow-blue-900/20"
        >
          {/* Logo and Header */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          
        <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Administration Portal</h1>
            <p className="text-gray-400 text-sm">Secure access for authorized personnel only</p>
        </div>
        
        {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-800/50 text-red-200 rounded-lg flex items-center gap-3 text-sm animate-pulse">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}
        
          <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label 
                htmlFor="email" 
                  className="block text-sm font-medium text-gray-300 mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-gray-800/50 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 transition-all duration-200"
                    placeholder="admin@handywriterz.com"
                  required
                  autoComplete="email"
                  disabled={isLoggingIn}
                />
              </div>
            </div>
            
            <div>
              <label 
                htmlFor="password" 
                  className="block text-sm font-medium text-gray-300 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 transition-all duration-200"
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  disabled={isLoggingIn}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoggingIn}
            className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg text-white ${
              isLoggingIn
                ? 'bg-blue-700 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            } transition-colors duration-200`}
          >
            {isLoggingIn ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
          
          <div className="pt-4 border-t border-gray-700/40">
            <button
              type="button"
              onClick={testApiConnectivity}
              className="w-full flex items-center justify-center py-2 px-4 bg-gray-800/60 hover:bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white focus:outline-none transition-colors duration-200 text-sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              Test API Connection
            </button>
          </div>
        </form>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Need help? Contact <a href="mailto:support@handywriterz.com" className="text-blue-400 hover:text-blue-300">IT Support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
