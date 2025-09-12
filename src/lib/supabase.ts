/**
 * Supabase compatibility layer
 * This file provides the same interface as the original Supabase client
 * but uses Cloudflare D1 under the hood
 */

// Re-export the database as supabase for compatibility
export { supabase, database as default } from './database';

// Additional compatibility exports
export * from './database';
