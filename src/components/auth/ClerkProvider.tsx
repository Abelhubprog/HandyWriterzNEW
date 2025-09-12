import React from 'react';
import { ClerkProvider as ClerkProviderBase } from '@clerk/clerk-react';
import { clerkConfig } from '@/config/clerk';

interface ClerkProviderProps {
  children: React.ReactNode;
}

/**
 * Clerk Authentication Provider
 * 
 * Wraps the application with Clerk authentication provider using
 * centralized configuration from config/clerk.ts
 */
const ClerkProvider: React.FC<ClerkProviderProps> = ({ children }) => {
  return (
    <ClerkProviderBase
      publishableKey={clerkConfig.publishableKey}
      appearance={clerkConfig.appearance}
      navigate={(to) => window.history.pushState(null, '', to)}
    >
      {children}
    </ClerkProviderBase>
  );
};

export default ClerkProvider;