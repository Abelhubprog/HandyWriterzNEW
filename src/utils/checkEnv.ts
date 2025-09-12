/**
 * Environment validation utility
 * Ensures required environment variables are available
 */

export function validateEnvironment(): { valid: boolean; missing: string[] } {
  const required = [
    'VITE_CLERK_PUBLISHABLE_KEY'
  ];
  
  // Optional but recommended for production
  const optional = [
    'VITE_CLOUDFLARE_DATABASE_URL',
    'VITE_CLOUDFLARE_API_TOKEN'
  ];
  
  const missing = required.filter(env => !import.meta.env[env]);
  const optionalMissing = optional.filter(env => !import.meta.env[env]);
  
  if (optionalMissing.length > 0) {
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Log environment validation results
 * Useful for debugging deployment issues
 */
export function logEnvironmentStatus(): void {
  const { valid, missing } = validateEnvironment();
  
  if (valid) {
  } else {
    
    // Log the available environment variables (without sensitive values)
    const safeEnvs = Object.keys(import.meta.env)
      .filter(key => !key.includes('SECRET') && !key.includes('KEY'))
      .reduce((acc, key) => {
        acc[key] = import.meta.env[key] ? '✅ Present' : '❌ Missing';
        return acc;
      }, {} as Record<string, string>);
    
  }
}

export default validateEnvironment; 