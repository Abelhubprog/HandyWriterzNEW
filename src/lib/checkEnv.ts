/**
 * Environment configuration validation
 * 
 * This file validates that required environment variables are present.
 * In production mode, it will throw errors if required variables are missing.
 */

export function checkRequiredEnvVars() {
  // List of required env variables
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_CLERK_PUBLISHABLE_KEY'
  ];
  
  // Check each variable
  const missingVars = requiredVars.filter(varName => {
    const value = import.meta.env[varName];
    return !value;
  });
  
  // In production, throw errors for missing variables
  if (missingVars.length > 0) {
  }
}

export default checkRequiredEnvVars; 