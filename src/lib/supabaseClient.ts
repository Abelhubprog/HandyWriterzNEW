/**
 * Supabase Client Compatibility Layer
 * This provides a Supabase-compatible interface using Cloudflare D1
 */

import { database } from './database';

// Export the database with Supabase-compatible interface
export const supabase = database;

// Additional compatibility exports
export default database;

// Helper function for backward compatibility
export const createClient = () => database;

// Environment check for debugging
if (import.meta.env.DEV) {
}
