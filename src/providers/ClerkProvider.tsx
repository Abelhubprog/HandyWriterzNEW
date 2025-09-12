import { ClerkProvider as BaseClerkProvider } from '@clerk/clerk-react';
import { useTheme } from '@/hooks/useTheme';
import { toast } from 'react-hot-toast';
import { clerkConfig } from '@/config/clerk';

if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key');
}

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Check if we're in development mode
const isDevelopment = import.meta.env.MODE === 'development';
const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1'
);

// Function to check if a key is a development key
const isDevKey = (key: string | undefined) => {
  return key?.includes('pk_test_') || key?.includes('clerk.daring-goshawk-70.accounts.dev');
};

// Check if using development key in production
if (!isDevelopment && !isLocalhost && isDevKey(publishableKey)) {
  // We'll show a toast but not throw an error to avoid breaking the app
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      toast.error(
        'Using development authentication keys in production. This has strict usage limits. Please update to production keys. Learn more: https://clerk.com/docs/deployments/overview', 
        {
          duration: 10000,
          id: 'clerk-dev-key-warning',
        }
      );
    }, 2000);
  }
}

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <BaseClerkProvider
      publishableKey={clerkConfig.publishableKey}
      domain={clerkConfig.domain}
      signInUrl={clerkConfig.signInUrl}
      signUpUrl={clerkConfig.signUpUrl}
      afterSignInUrl={clerkConfig.afterSignInUrl}
      afterSignUpUrl={clerkConfig.afterSignUpUrl}
      appearance={{
        ...clerkConfig.appearance,
        variables: { 
          ...clerkConfig.appearance.variables,
          colorBackground: theme === 'dark' ? '#0F172A' : '#FFFFFF',
          colorInputBackground: theme === 'dark' ? '#1E293B' : '#FFFFFF',
          colorText: theme === 'dark' ? '#F1F5F9' : '#0F172A'
        },
      }}
    >
      {children}
    </BaseClerkProvider>
  );
}
