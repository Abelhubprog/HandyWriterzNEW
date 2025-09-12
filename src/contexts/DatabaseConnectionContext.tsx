import React, { createContext, useContext, useEffect, useState } from 'react';
import { cloudflareDb } from '@/lib/cloudflare';
import { toast } from 'react-hot-toast';

interface DatabaseContextType {
  isConnected: boolean;
}

const DatabaseContext = createContext<DatabaseContextType>({ isConnected: false });

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Test Cloudflare D1 connection
    const testConnection = async () => {
      try {
        // Simple health check query
        await cloudflareDb.query('SELECT 1 as health_check', []);
        setIsConnected(true);
        toast.success('Connected to Cloudflare D1 database');
      } catch (error) {
        setIsConnected(false);
        // Don't show error toast for mock data fallback
      }
    };

    testConnection();

    // Optional: Set up periodic health checks
    const healthCheckInterval = setInterval(testConnection, 5 * 60 * 1000); // Every 5 minutes

    return () => {
      clearInterval(healthCheckInterval);
    };
  }, []);

  return (
    <DatabaseContext.Provider value={{ isConnected }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}