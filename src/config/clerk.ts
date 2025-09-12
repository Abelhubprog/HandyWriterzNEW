/**
 * Clerk Authentication Configuration
 *
 * Centralizes all Clerk-related configuration settings and provides
 * type-safe access to Clerk services.
 *
 * @file src/config/clerk.ts
 */

// Environment variables

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const CLERK_DOMAIN = import.meta.env.VITE_CLERK_DOMAIN;
const isProduction = import.meta.env.PROD;
// Enhanced domain logic for better production support
const isUsingAccountPortal = CLERK_DOMAIN && CLERK_DOMAIN.includes('accounts.handywriterz.com');
const shouldUseDomain = isProduction && CLERK_DOMAIN;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing required Clerk environment variable: VITE_CLERK_PUBLISHABLE_KEY');
}

// Clerk configuration - optimized for public signup and social login
export const clerkConfig = {
  publishableKey: CLERK_PUBLISHABLE_KEY,
  domain: shouldUseDomain ? CLERK_DOMAIN : undefined,
  signInUrl: '/sign-in',
  signUpUrl: '/sign-up',
  afterSignInUrl: '/dashboard',
  afterSignUpUrl: '/dashboard',
  appearance: {
    layout: {
      socialButtonsPlacement: 'top',
      socialButtonsVariant: 'blockButton',
      termsPageUrl: '/terms',
      privacyPageUrl: '/privacy',
    },
    variables: {
      colorPrimary: '#2563eb',
      colorTextOnPrimaryBackground: '#ffffff',
      borderRadius: '0.5rem',
    },
    elements: {
      formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg',
      socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
      card: 'shadow-lg border border-gray-200 rounded-xl',
      headerTitle: 'text-2xl font-bold text-gray-900',
      headerSubtitle: 'text-gray-600',
    },
  },
  // Enable social connections and public signup
  allowedRedirectOrigins: [
    'http://localhost:5173',
    'https://handywriterz.com',
    'https://*.handywriterz.com'
  ]
} as const;

export default clerkConfig;
