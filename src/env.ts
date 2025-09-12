import { z } from 'zod';

const envSchema = z.object({
  // API
  VITE_API_URL: z.string().url().default('http://localhost:5173/api'),

  // Application Settings
  VITE_APP_NAME: z.string().min(1).default('HandyWriterz'),
  VITE_APP_URL: z.string().url().default('http://localhost:5173'),
  VITE_APP_DESCRIPTION: z.string().default('Professional academic services platform'),

  // Cloudflare Database (optional for development)
  VITE_CLOUDFLARE_DATABASE_URL: z.string().optional(),
  VITE_CLOUDFLARE_API_TOKEN: z.string().optional(),
  VITE_CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  VITE_CLOUDFLARE_DATABASE_ID: z.string().optional(),

  // Clerk
  VITE_CLERK_PUBLISHABLE_KEY: z.string().min(1).default('pk_test_default'),
  VITE_CLERK_DOMAIN: z.string().optional(),
  VITE_CLERK_SIGN_IN_URL: z.string().default('/sign-in'),
  VITE_CLERK_SIGN_UP_URL: z.string().default('/sign-up'),
  VITE_CLERK_AFTER_SIGN_IN_URL: z.string().default('/dashboard'),
  VITE_CLERK_AFTER_SIGN_UP_URL: z.string().default('/dashboard'),

  // StableLink.xyz Integration
  VITE_STABLELINK_API_KEY: z.string().optional().default(''),
  VITE_STABLELINK_WEBHOOK_SECRET: z.string().optional().default(''),
  VITE_STABLELINK_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),

  // Public Features
  VITE_ENABLE_PUBLIC_ACCESS: z.string().transform((val: string) => val === 'true').default(true),
  VITE_ENABLE_PUBLIC_ROUTES: z.string().transform((val: string) => val === 'true').default(true),
  VITE_ENABLE_COMMENTS: z.string().transform((val: string) => val === 'true').default(true),

  // Admin Features
  VITE_ENABLE_ADMIN_DASHBOARD: z.string().transform((val: string) => val === 'true').default(true),
  VITE_ENABLE_USER_MANAGEMENT: z.string().transform((val: string) => val === 'true').default(true),
  VITE_ENABLE_CONTENT_MANAGEMENT: z.string().transform((val: string) => val === 'true').default(true),
  VITE_ENABLE_ROLE_MANAGEMENT: z.string().transform((val: string) => val === 'true').default(true),

  // Service configuration
  VITE_TURNITIN_MAX_FILE_SIZE: z.string().transform((val: string) => parseInt(val, 10)).default(20971520),
  VITE_TURNITIN_ALLOWED_TYPES: z.string().default('application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'),

  // Feature flags
  VITE_ENABLE_TURNITIN: z.string().transform((val: string) => val === 'true').default(true),
  VITE_ENABLE_TELEGRAM: z.string().transform((val: string) => val === 'true').default(true),

  // Web3 Configuration
  VITE_DISABLE_METAMASK_DETECTION: z.string().transform((val: string) => val === 'true').optional().default(false),
  VITE_PREFERRED_WALLET: z.string().optional().default('metamask')
});

function getEnvVars() {
  // Use import.meta.env directly with type safety
  const envVars = {
    // API
    VITE_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5173/api',

    // Application Settings
    VITE_APP_NAME: import.meta.env.VITE_APP_NAME || 'HandyWriterz',
    VITE_APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
    VITE_APP_DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || 'Professional academic services platform',

    // Cloudflare Database
    VITE_CLOUDFLARE_DATABASE_URL: import.meta.env.VITE_CLOUDFLARE_DATABASE_URL,
    VITE_CLOUDFLARE_API_TOKEN: import.meta.env.VITE_CLOUDFLARE_API_TOKEN,
    VITE_CLOUDFLARE_ACCOUNT_ID: import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID,
    VITE_CLOUDFLARE_DATABASE_ID: import.meta.env.VITE_CLOUDFLARE_DATABASE_ID,

    // Clerk
    VITE_CLERK_PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_default',
    VITE_CLERK_DOMAIN: import.meta.env.VITE_CLERK_DOMAIN || '',
    VITE_CLERK_SIGN_IN_URL: import.meta.env.VITE_CLERK_SIGN_IN_URL || '/sign-in',
    VITE_CLERK_SIGN_UP_URL: import.meta.env.VITE_CLERK_SIGN_UP_URL || '/sign-up',
    VITE_CLERK_AFTER_SIGN_IN_URL: import.meta.env.VITE_CLERK_AFTER_SIGN_IN_URL || '/dashboard',
    VITE_CLERK_AFTER_SIGN_UP_URL: import.meta.env.VITE_CLERK_AFTER_SIGN_UP_URL || '/dashboard',

    // StableLink.xyz Integration
    VITE_STABLELINK_API_KEY: import.meta.env.VITE_STABLELINK_API_KEY || '',
    VITE_STABLELINK_WEBHOOK_SECRET: import.meta.env.VITE_STABLELINK_WEBHOOK_SECRET || '',
    VITE_STABLELINK_ENVIRONMENT: import.meta.env.VITE_STABLELINK_ENVIRONMENT || 'sandbox',

    // Public Features
    VITE_ENABLE_PUBLIC_ACCESS: import.meta.env.VITE_ENABLE_PUBLIC_ACCESS || 'true',
    VITE_ENABLE_PUBLIC_ROUTES: import.meta.env.VITE_ENABLE_PUBLIC_ROUTES || 'true',
    VITE_ENABLE_COMMENTS: import.meta.env.VITE_ENABLE_COMMENTS || 'true',

    // Admin Features
    VITE_ENABLE_ADMIN_DASHBOARD: import.meta.env.VITE_ENABLE_ADMIN_DASHBOARD || 'true',
    VITE_ENABLE_USER_MANAGEMENT: import.meta.env.VITE_ENABLE_USER_MANAGEMENT || 'true',
    VITE_ENABLE_CONTENT_MANAGEMENT: import.meta.env.VITE_ENABLE_CONTENT_MANAGEMENT || 'true',
    VITE_ENABLE_ROLE_MANAGEMENT: import.meta.env.VITE_ENABLE_ROLE_MANAGEMENT || 'true',

    // Service configuration
    VITE_TURNITIN_MAX_FILE_SIZE: import.meta.env.VITE_TURNITIN_MAX_FILE_SIZE || '20971520',
    VITE_TURNITIN_ALLOWED_TYPES: import.meta.env.VITE_TURNITIN_ALLOWED_TYPES || 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',

    // Feature flags
    VITE_ENABLE_TURNITIN: import.meta.env.VITE_ENABLE_TURNITIN || 'true',
    VITE_ENABLE_TELEGRAM: import.meta.env.VITE_ENABLE_TELEGRAM || 'true',

    // Web3 Configuration
    VITE_DISABLE_METAMASK_DETECTION: import.meta.env.VITE_DISABLE_METAMASK_DETECTION || 'false',
    VITE_PREFERRED_WALLET: import.meta.env.VITE_PREFERRED_WALLET || 'metamask'
  };

  const result = envSchema.safeParse(envVars);

  if (!result.success) {
    // Instead of throwing, try to parse with defaults
    return envSchema.parse(envVars);
  }

  return result.data;
}

export const env = getEnvVars();
