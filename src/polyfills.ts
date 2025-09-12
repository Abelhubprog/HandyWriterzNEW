// Disable MetaMask detection and warnings
if (typeof window !== 'undefined') {
  // Check if we should disable MetaMask detection based on environment variable
  // Access env vars more safely with type assertions and existence checks
  const metaMaskDetection = import.meta.env ? String(import.meta.env.VITE_DISABLE_METAMASK_DETECTION || '') : '';
  const disableMetaMask = metaMaskDetection === 'true';
  
  if (disableMetaMask) {
    // Set flag to disable MetaMask detection
    window.__disableMetamaskDetection = true;
    
    // Override console.error to filter MetaMask warnings
    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      // Filter out MetaMask-related errors
      const isMetaMaskError = args.some(arg => 
        typeof arg === 'string' && (
          arg.includes('MetaMask') ||
          arg.includes('ethereum') ||
          arg.includes('web3modal') ||
          arg.includes('wallet')
        )
      );
      
      if (!isMetaMaskError) {
        originalConsoleError(...args);
      }
    };
    
    // Provide dummy ethereum object to prevent errors
    if (!window.ethereum) {
      window.ethereum = {
        isMetaMask: false,
        _isDisabled: true,
        request: async () => { throw new Error('MetaMask is disabled'); },
        on: () => {},
        removeListener: () => {},
        autoRefreshOnNetworkChange: false
      };
    }
  }
}

// Global process polyfill
if (typeof window !== 'undefined') {
  // Ensure process exists
  if (!window.process) {
    window.process = {} as NodeJS.Process;
  }
  
  // Ensure process.env exists
  if (!window.process.env) {
    window.process.env = {
      NODE_ENV: import.meta.env.MODE,
      VITE_DYNAMIC_ENVIRONMENT_ID: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID
    };
  }

  // Copy all VITE_ prefixed env variables
  Object.keys(import.meta.env).forEach(key => {
    if (key.startsWith('VITE_')) {
      window.process.env[key] = import.meta.env[key];
    }
  });
}

// Add globalThis polyfill
if (typeof window !== 'undefined' && !window.global) {
  window.global = window;
}

export {};
