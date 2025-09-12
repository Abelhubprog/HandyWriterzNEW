import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './src/contexts/AuthContext';
import { AppRoutes } from './src/routes';
import { Toaster } from 'react-hot-toast';
import { ClerkProvider } from '@clerk/clerk-react';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
          <AppRoutes />
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </Router>
  );
}

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export default function RootApp() {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <App />
    </ClerkProvider>
  );
}
