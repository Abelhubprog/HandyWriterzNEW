// Environment variables handling
interface EnvVariables {
  CLERK_PUBLISHABLE_KEY: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_DATABASE_ID?: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

// Default values for local development
const defaults: EnvVariables = {
  CLERK_PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_placeholder',
  CLOUDFLARE_ACCOUNT_ID: import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_DATABASE_ID: import.meta.env.VITE_CLOUDFLARE_DATABASE_ID,
  NODE_ENV: import.meta.env.NODE_ENV as 'development' | 'production' | 'test' || 'development'
};

// Get environment variables with fallbacks to defaults
function getEnv(): EnvVariables {
  // For TypeScript's single-file compilation, just return defaults
  // This will be properly initialized at runtime in the browser/Node
  // This prevents TS errors related to import.meta
  return defaults;
}

export const env = getEnv();
export const isDev = env.NODE_ENV === 'development';
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
