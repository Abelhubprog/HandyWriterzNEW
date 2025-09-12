import { cloudflare } from '@/lib/cloudflareClient';

/**
 * Deployment readiness check utility
 * Verifies that all required configurations and services are properly set up
 */

interface CheckResult {
  passed: boolean;
  message: string;
}

export async function verifyDatabaseConnection(): Promise<CheckResult> {
  try {
    // Simple query to check if database is accessible
    const { data, error } = await cloudflare.from('profiles').select('count').execute();
    
    if (error) {
      return {
        passed: false,
        message: `Supabase connection failed: ${error.message}`
      };
    }
    
    return {
      passed: true,
      message: 'Supabase connection verified successfully'
    };
  } catch (error) {
    return {
      passed: false,
      message: `Supabase connection check error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

export async function verifyStorageBuckets(): Promise<CheckResult> {
  try {
    // Check if required storage buckets exist
    const requiredBuckets = ['media', 'documents', 'avatars', 'assignments'];
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      return {
        passed: false,
        message: `Storage buckets check failed: ${error.message}`
      };
    }
    
    const bucketNames = buckets?.map(b => b.name) || [];
    const missingBuckets = requiredBuckets.filter(name => !bucketNames.includes(name));
    
    if (missingBuckets.length > 0) {
      return {
        passed: false,
        message: `Missing required storage buckets: ${missingBuckets.join(', ')}`
      };
    }
    
    return {
      passed: true,
      message: 'All required storage buckets are available'
    };
  } catch (error) {
    return {
      passed: false,
      message: `Storage buckets check error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

export async function verifyEnvironmentVariables(): Promise<CheckResult> {
  const requiredVariables = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_APP_URL',
    'VITE_ENABLE_PUBLIC_ACCESS',
    'VITE_ENABLE_ANONYMOUS_LIKES',
    'VITE_ENABLE_ANONYMOUS_SHARES',
    'VITE_ENABLE_SOCIAL_SHARING'
  ];
  
  const missingVariables = requiredVariables.filter(
    name => !import.meta.env[name]
  );
  
  if (missingVariables.length > 0) {
    return {
      passed: false,
      message: `Missing required environment variables: ${missingVariables.join(', ')}`
    };
  }
  
  return {
    passed: true,
    message: 'All required environment variables are configured'
  };
}

export async function verifyAdminFunctions(): Promise<CheckResult> {
  try {
    // Check if admin-specific RPC functions exist
    const { data, error } = await supabase.rpc('is_admin');
    
    // We don't care about the result, just that the function exists
    if (error && !error.message.includes('permission denied')) {
      // If error is not about permissions, the function likely doesn't exist
      return {
        passed: false,
        message: `Admin function check failed: ${error.message}`
      };
    }
    
    return {
      passed: true,
      message: 'Admin functions are properly configured'
    };
  } catch (error) {
    return {
      passed: false,
      message: `Admin function check error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

export async function runDeploymentChecks(): Promise<{
  allPassed: boolean;
  results: Record<string, CheckResult>;
}> {
  const results = {
    supabaseConnection: await verifySupabaseConnection(),
    storageBuckets: await verifyStorageBuckets(),
    environmentVariables: await verifyEnvironmentVariables(),
    adminFunctions: await verifyAdminFunctions()
  };
  
  const allPassed = Object.values(results).every(result => result.passed);
  
  return {
    allPassed,
    results
  };
}

export default runDeploymentChecks;
