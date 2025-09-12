/**
 * Main App Component (DEPRECATED)
 * 
 * NOTE: This component is no longer the main entry point.
 * Routing is now handled via createBrowserRouter in router.tsx which is configured in main.tsx
 * 
 * @deprecated Use router.tsx for route definitions instead
 */

import React from 'react';
import { ClerkProvider } from './providers/ClerkProvider';
import { DatabaseProvider } from './contexts/DatabaseConnectionContext';
import Homepage from './pages/Homepage';

/**
 * App component wrapper - provides context providers
 * This component is no longer used for routing
 */
const App: React.FC = React.memo(() => {
  
  // Simply render the Homepage component directly
  // This is only kept for backward compatibility
  return (
    <ClerkProvider>
      <DatabaseProvider>
        <Homepage />
      </DatabaseProvider>
    </ClerkProvider>
  );
});

export default App;
