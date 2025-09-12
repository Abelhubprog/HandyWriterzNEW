import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminLogin: React.FC = () => {
  const { signIn, isLoaded } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Redirect if already signed in
  useEffect(() => {
    if (user) {
      checkAdminStatusAndRedirect();
    }
  }, [user]);

  const checkAdminStatusAndRedirect = async () => {
    try {
      // Check if user is admin
      const response = await fetch('/api/admin/check-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkUserId: user?.id,
          email: user?.emailAddresses[0]?.emailAddress
        })
      });

      if (response.ok) {
        const adminData = await response.json();
        if (adminData.isAdmin) {
          navigate('/admin');
          return;
        }
      }

      // Fallback check for development
      const adminEmails = [
        'admin@handywriterz.com',
        'superadmin@handywriterz.com',
        'moderator@handywriterz.com'
      ];

      if (user && adminEmails.includes(user.emailAddresses[0]?.emailAddress)) {
        navigate('/admin');
      } else {
        toast.error('Access denied. Admin privileges required.');
      }
    } catch (error) {
      
      // Fallback for development
      const adminEmails = [
        'admin@handywriterz.com',
        'superadmin@handywriterz.com',
        'moderator@handywriterz.com'
      ];

      if (user && adminEmails.includes(user.emailAddresses[0]?.emailAddress)) {
        navigate('/admin');
      } else {
        toast.error('Access denied. Admin privileges required.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded || !signIn) {
      return;
    }

    setLoading(true);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        // Sign in successful
        await checkAdminStatusAndRedirect();
      } else if (result.status === 'needs_second_factor') {
        // Handle 2FA if enabled
        setVerificationStep(true);
        toast.info('Please enter your verification code');
      } else {
        // Handle other statuses
        toast.error('Sign in failed. Please try again.');
      }
    } catch (error: any) {
      
      if (error.errors) {
        const errorMessage = error.errors[0]?.message || 'Sign in failed';
        toast.error(errorMessage);
      } else {
        toast.error('Sign in failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded || !signIn) {
      return;
    }

    setLoading(true);

    try {
      const result = await signIn.attemptSecondFactor({
        strategy: 'totp',
        code: verificationCode,
      });

      if (result.status === 'complete') {
        await checkAdminStatusAndRedirect();
      } else {
        toast.error('Verification failed. Please try again.');
      }
    } catch (error: any) {
      
      if (error.errors) {
        const errorMessage = error.errors[0]?.message || 'Verification failed';
        toast.error(errorMessage);
      } else {
        toast.error('Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // If user is already signed in and is admin, redirect
  if (user) {
    return <Navigate to="/admin" replace />;
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Admin Dashboard
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to access the administration panel
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Security Notice */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <Lock className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Secure Admin Access</h3>
                <p className="mt-1 text-sm text-blue-600">
                  This area is restricted to authorized administrators only. All login attempts are monitored.
                </p>
              </div>
            </div>
          </div>

          {!verificationStep ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="admin@handywriterz.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleVerificationSubmit}>
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Two-Factor Authentication
                </h3>
                <p className="text-sm text-gray-600">
                  Please enter the verification code from your authenticator app.
                </p>
              </div>

              <div>
                <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <div className="mt-1">
                  <input
                    id="verification-code"
                    name="verification-code"
                    type="text"
                    maxLength={6}
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-center text-2xl font-mono"
                    placeholder="000000"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setVerificationStep(false);
                    setVerificationCode('');
                  }}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    'Verify'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Development Info */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Development Mode</h3>
                <p className="mt-1 text-sm text-yellow-600">
                  Test admin accounts:
                </p>
                <ul className="mt-2 text-xs text-yellow-600 space-y-1">
                  <li>• admin@handywriterz.com</li>
                  <li>• superadmin@handywriterz.com</li>
                  <li>• moderator@handywriterz.com</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Need help?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <a
                href="/support"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Contact System Administrator
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;