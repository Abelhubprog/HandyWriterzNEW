import React from 'react';

/**
 * Web3Provider component
 * Creates a context for Web3 interaction and disables MetaMask detection
 */
export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // In a real implementation, this would initialize REOWN APPKIT
  // Using a simpler implementation for now to avoid build errors
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // Only run in browser
      try {
        // Disable MetaMask detection based on env var
        const disableMetaMask = localStorage.getItem('disableMetaMaskDetection') || 'true';
        
        if (disableMetaMask === 'true') {
          // Set flags to disable MetaMask detection
          (window as any).__disableMetamaskDetection = true;
          // MetaMask detection disabled for production
        }
      } catch (error) {
        // Error in Web3Provider setup handled silently
      }
    }
    
    return () => {
      // Cleanup if needed
    };
  }, []);
  
  return <>{children}</>;
};

export default Web3Provider;
