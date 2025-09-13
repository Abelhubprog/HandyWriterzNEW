import { createErrorResponse, createSuccessResponse } from './auth';

interface Env {
  // Add any environment variables your function needs
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request } = context;
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }
  
  try {
    // Simple test endpoint
    if (request.method === 'GET') {
      return createSuccessResponse({
        message: 'API test endpoint is working',
        timestamp: new Date().toISOString()
      });
    }
    
    return createErrorResponse(
      'Method not allowed', 
      405, 
      'METHOD_NOT_ALLOWED'
    );
    
  } catch (error) {
    console.error('Test API error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500,
      'INTERNAL_ERROR'
    );
  }
};