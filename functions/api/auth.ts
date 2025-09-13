import { createClerkClient } from '@clerk/backend';

interface Env {
  CLERK_SECRET_KEY: string;
}

// Create Clerk client
const createClerk = (env: Env) => {
  if (!env.CLERK_SECRET_KEY) {
    throw new Error('Missing CLERK_SECRET_KEY environment variable');
  }
  
  return createClerkClient({
    secretKey: env.CLERK_SECRET_KEY,
  });
};

// Extract session token from request
const getSessionToken = (request: Request): string | null => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  
  return parts[1];
};

// Authenticate user
export const authenticateUser = async (request: Request, env: Env) => {
  try {
    const token = getSessionToken(request);
    if (!token) {
      return {
        success: false,
        error: {
          message: 'Missing authentication token',
          code: 'MISSING_AUTH_TOKEN',
          status: 401
        }
      };
    }

    const clerk = createClerk(env);
    const session = await clerk.sessions.verifySessionToken(token);
    
    if (!session) {
      return {
        success: false,
        error: {
          message: 'Invalid or expired session token',
          code: 'INVALID_SESSION',
          status: 401
        }
      };
    }

    return {
      success: true,
      userId: session.userId,
      session
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Authentication failed',
        code: 'AUTHENTICATION_FAILED',
        status: 401
      }
    };
  }
};

// Check if user is admin
export const isAdminUser = async (userId: string, env: Env) => {
  try {
    const clerk = createClerk(env);
    const user = await clerk.users.getUser(userId);
    
    // Check if user has admin role in public metadata
    const isAdmin = user.publicMetadata?.role === 'admin' || 
                   user.privateMetadata?.role === 'admin' ||
                   user.emailAddresses.some(email => 
                     email.emailAddress.includes('@handywriterz.com'));
    
    return {
      success: true,
      isAdmin
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to check admin status',
        code: 'ADMIN_CHECK_FAILED',
        status: 500
      }
    };
  }
};

// Helper function to create structured error responses
export const createErrorResponse = (message: string, status: number = 500, code?: string) => {
  return new Response(JSON.stringify({
    success: false,
    error: {
      message,
      code,
      status
    }
  }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
};

// Helper function to create success responses
export const createSuccessResponse = (data: any, status: number = 200) => {
  return new Response(JSON.stringify({
    success: true,
    ...data
  }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
};