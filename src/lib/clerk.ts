// Get environment variables with proper error handling
function getClerkConfig() {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  if (!publishableKey || publishableKey === 'YOUR_PUBLISHABLE_KEY') {
    throw new Error('Missing or invalid Clerk publishable key. Please check your .env file and Vercel environment settings.');
  }
  
  return {
    publishableKey,
    signInUrl: import.meta.env.VITE_CLERK_SIGN_IN_URL || '/sign-in',
    signUpUrl: import.meta.env.VITE_CLERK_SIGN_UP_URL || '/sign-up',
    afterSignInUrl: import.meta.env.VITE_CLERK_AFTER_SIGN_IN_URL || '/dashboard',
    afterSignUpUrl: import.meta.env.VITE_CLERK_AFTER_SIGN_UP_URL || '/dashboard',
    fallbackRedirectUrl: '/dashboard'
  };
}

// Export the config getter for use in other files
export function getClerkPublishableKey() {
  const config = getClerkConfig();
  return config.publishableKey;
}

// Export the full config
export function getFullClerkConfig() {
  const config = getClerkConfig();
  return {
    ...config,
    appearance: {
      variables: {
        colorPrimary: '#2563eb', // blue-600
        colorBackground: '#ffffff',
        colorInputBackground: '#ffffff',
        colorText: '#0f172a'
      },
      elements: {
        formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
        footerActionLink: 'text-blue-600 hover:text-blue-700',
        card: 'bg-white shadow-xl rounded-lg',
      },
    },
  };
}
