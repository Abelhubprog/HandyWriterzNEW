import { z } from 'zod';

// Define environment schema with Zod
const envSchema = z.object({
  // App
  VITE_APP_NAME: z.string().default('HandyWriterz'),
  VITE_APP_URL: z.string().url().default('http://localhost:5173'),
  
  // API
  VITE_API_URL: z.string().url().default('http://localhost:3000'),
  
  // Clerk
  VITE_CLERK_PUBLISHABLE_KEY: z.string(),
  
  // Feature Flags
  VITE_ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
  VITE_ENABLE_PUBLIC_ACCESS: z.string().transform(val => val === 'true').default('true'),
  // Cloudflare D1 Database
  VITE_CLOUDFLARE_DATABASE_URL: z.string().url().optional(),
  VITE_CLOUDFLARE_API_TOKEN: z.string().optional(),
  VITE_CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  VITE_CLOUDFLARE_DATABASE_ID: z.string().optional(),
  
  // Cloudflare R2 Storage
  VITE_CLOUDFLARE_R2_API_URL: z.string().url().optional(),
  VITE_CLOUDFLARE_R2_API_TOKEN: z.string().optional(), 
  VITE_CLOUDFLARE_R2_PUBLIC_URL: z.string().url().optional(),
});

// Parse environment variables using the schema
const env = {
  // App
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME || 'HandyWriterz',
  VITE_APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  
  // API
  VITE_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  
  // Clerk
  VITE_CLERK_PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  
  // Feature Flags
  VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  VITE_ENABLE_PUBLIC_ACCESS: import.meta.env.VITE_ENABLE_PUBLIC_ACCESS !== 'false',

  // Cloudflare D1 Database
  VITE_CLOUDFLARE_DATABASE_URL: import.meta.env.VITE_CLOUDFLARE_DATABASE_URL,
  VITE_CLOUDFLARE_API_TOKEN: import.meta.env.VITE_CLOUDFLARE_API_TOKEN,
  VITE_CLOUDFLARE_ACCOUNT_ID: import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID,
  VITE_CLOUDFLARE_DATABASE_ID: import.meta.env.VITE_CLOUDFLARE_DATABASE_ID,
  
  // Cloudflare R2 Storage
  VITE_CLOUDFLARE_R2_API_URL: import.meta.env.VITE_CLOUDFLARE_R2_API_URL,
  VITE_CLOUDFLARE_R2_API_TOKEN: import.meta.env.VITE_CLOUDFLARE_R2_API_TOKEN,
  VITE_CLOUDFLARE_R2_PUBLIC_URL: import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL,
};

export default env;
