/**
 * Production Configuration
 * 
 * Centralizes all production-related configuration settings and provides
 * environment-specific validation.
 * 
 * @file src/config/production.ts
 */

// Production URLs
export const PRODUCTION_URLS = {
  APP_URL: import.meta.env.VITE_APP_URL || 'https://handywriterz.com',
  API_URL: import.meta.env.VITE_API_URL || 'https://api.handywriterz.com',
  ADMIN_URL: import.meta.env.VITE_ADMIN_URL || 'https://admin.handywriterz.com',
  ACCOUNTS_URL: import.meta.env.VITE_ACCOUNTS_URL || 'https://accounts.handywriterz.com',
} as const;

// Required environment variables for production
const REQUIRED_PROD_ENV = {
  // Supabase configuration
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  
  // Production URLs
  APP_URL: PRODUCTION_URLS.APP_URL,
  API_URL: PRODUCTION_URLS.API_URL,
  ADMIN_URL: PRODUCTION_URLS.ADMIN_URL,
} as const;

/**
 * Validates production environment variables
 * Throws an error if any required variables are missing
 */
export function validateProductionEnv() {
  if (import.meta.env.PROD) {
    const missingVars = Object.entries(REQUIRED_PROD_ENV)
      .filter(([_, value]) => !value)
      .map(([key]) => `VITE_${key}`);

    if (missingVars.length > 0) {
      throw new Error(
        'Missing required production environment variables:\n' +
        missingVars.join('\n') +
        '\n\nPlease check your deployment configuration.'
      );
    }
  }
}

// Supabase Table Names
export const SUPABASE_TABLES = {
  ADMIN_USERS: 'admin_users',
  PROFILES: 'profiles',
  POSTS: 'posts',
  CATEGORIES: 'categories',
  TAGS: 'tags',
  MEDIA: 'media',
  COMMENTS: 'comments',
  ORDERS: 'orders',
  SERVICES: 'services',
  POST_LIKES: 'post_likes',
  POST_SHARES: 'post_shares',
  POST_VIEWS: 'post_views',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages'
} as const;

// Production Security Headers
export const PRODUCTION_SECURITY = {
  headers: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self' ${import.meta.env.VITE_SUPABASE_URL};
    `.replace(/\s+/g, ' ').trim(),
  },
  cors: {
    origin: [
      PRODUCTION_URLS.APP_URL,
      PRODUCTION_URLS.API_URL,
      PRODUCTION_URLS.ADMIN_URL,
      PRODUCTION_URLS.ACCOUNTS_URL,
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
} as const; 