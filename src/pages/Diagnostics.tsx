/**
 * src/pages/Diagnostics.tsx
 * Standalone diagnostics page for troubleshooting database issues
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { cloudflareDb } from '@/lib/cloudflare';

const Diagnostics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
    }
    
    // Check database connection on mount
    checkDbConnection();
  }, [user, navigate]);

  const checkDbConnection = async () => {
    try {
      // Try to make a simple query to check connection
      const result = await cloudflareDb.query('SELECT 1 as connected', []);
      setIsDbConnected(result && result.results && result.results.length > 0);
      return true;
    } catch (error) {
      setIsDbConnected(false);
      return false;
    }
  };

  const runDiagnostics = async () => {
    setIsChecking(true);
    try {
      // Test database connection with a simple query
      const isConnected = await checkDbConnection();
      
      if (!isConnected) {
        throw new Error('Database connection failed');
      }

      // Try a more comprehensive test with an actual table
      const healthCheck = await cloudflareDb.query(
        'SELECT name FROM sqlite_master WHERE type="table" LIMIT 1', 
        []
      );
      
      if (!healthCheck || !healthCheck.results || healthCheck.results.length === 0) {
        throw new Error('No tables found in database');
      }
      
      toast.success('All systems operational');
    } catch (error) {
      toast.error('System check failed. Please try again later.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">System Diagnostics</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Database Connection:</span>
              <span className={`px-3 py-1 rounded-full text-sm ${isDbConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isDbConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Authentication:</span>
              <span className={`px-3 py-1 rounded-full text-sm ${user ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {user ? 'Authenticated' : 'Not Authenticated'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={runDiagnostics}
            disabled={isChecking}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isChecking ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isChecking ? 'Checking...' : 'Run System Check'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Diagnostics;