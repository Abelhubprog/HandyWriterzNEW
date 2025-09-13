import { R2Bucket } from '@cloudflare/workers-types';
import { authenticateUser, createErrorResponse, createSuccessResponse } from './auth';

interface Env {
  STORAGE: R2Bucket;
  CLERK_SECRET_KEY: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
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
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/upload', '');
    
    // Handle presigned URL generation
    if (path === '/presigned-url' && request.method === 'POST') {
      // Authenticate user
      const authResult = await authenticateUser(request, env);
      if (!authResult.success) {
        return createErrorResponse(
          authResult.error.message, 
          authResult.error.status, 
          authResult.error.code
        );
      }
      
      const body = await request.json();
      const { key, contentType } = body;
      
      // Generate presigned URL for R2
      // Note: This is a simplified version for Pages Functions
      // In a real implementation, you might want to generate actual presigned URLs
      const uploadUrl = `${url.origin}/api/upload/direct/${key}`;
      
      return createSuccessResponse({
        uploadUrl: uploadUrl,
        key: key,
        success: true
      });
    }
    
    // Handle direct file upload
    if (path === '/' && request.method === 'POST') {
      // Authenticate user
      const authResult = await authenticateUser(request, env);
      if (!authResult.success) {
        return createErrorResponse(
          authResult.error.message, 
          authResult.error.status, 
          authResult.error.code
        );
      }
      
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const key = formData.get('key') as string;
      
      if (!file || !key) {
        return createErrorResponse(
          'Missing file or key', 
          400, 
          'MISSING_FILE_OR_KEY'
        );
      }
      
      // Validate file size (50MB limit)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        return createErrorResponse(
          'File size exceeds 50MB limit', 
          400, 
          'FILE_TOO_LARGE'
        );
      }
      
      // Validate file type using both MIME type and extension
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/markdown',
        'text/csv',
        'application/rtf',
        'application/zip',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/svg+xml',
        'image/webp'
      ];
      
      // Additional extension-based validation
      const allowedExtensions = [
        '.pdf', '.doc', '.docx', '.txt', '.md', '.rtf', '.csv',
        '.xls', '.xlsx', '.ppt', '.pptx', '.zip',
        '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'
      ];
      
      // Check MIME type
      const isMimeTypeAllowed = allowedTypes.includes(file.type);
      
      // Check file extension
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const isExtensionAllowed = allowedExtensions.includes(fileExtension);
      
      // If either check fails, reject the file
      if (!isMimeTypeAllowed || !isExtensionAllowed) {
        return createErrorResponse(
          `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`, 
          400, 
          'INVALID_FILE_TYPE'
        );
      }
      
      // Upload to R2
      await env.STORAGE.put(key, file.stream(), {
        httpMetadata: {
          contentType: file.type,
          contentDisposition: `attachment; filename="${file.name}"`,
        },
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          fileSize: file.size.toString(),
          fileExtension: fileExtension,
          userId: authResult.userId
        },
      });
      
      return createSuccessResponse({
        success: true,
        key: key,
        url: `https://cdn.handywriterz.com/${key}`,
        size: file.size,
        type: file.type,
        name: file.name
      });
    }
    
    // Handle file deletion
    if (path.startsWith('/') && request.method === 'DELETE') {
      // Authenticate user
      const authResult = await authenticateUser(request, env);
      if (!authResult.success) {
        return createErrorResponse(
          authResult.error.message, 
          authResult.error.status, 
          authResult.error.code
        );
      }
      
      const key = path.substring(1);
      
      // Check if user owns this file or is admin
      const object = await env.STORAGE.head(key);
      if (object && object.customMetadata?.userId !== authResult.userId) {
        // Check if user is admin
        const adminCheck = await isAdminUser(authResult.userId, env);
        if (!adminCheck.success || !adminCheck.isAdmin) {
          return createErrorResponse(
            'You do not have permission to delete this file', 
            403, 
            'INSUFFICIENT_PERMISSIONS'
          );
        }
      }
      
      await env.STORAGE.delete(key);
      
      return createSuccessResponse({
        success: true
      });
    }
    
    // Handle file info
    if (path.startsWith('/info/') && request.method === 'GET') {
      // Authenticate user
      const authResult = await authenticateUser(request, env);
      if (!authResult.success) {
        return createErrorResponse(
          authResult.error.message, 
          authResult.error.status, 
          authResult.error.code
        );
      }
      
      const key = path.replace('/info/', '');
      
      const object = await env.STORAGE.head(key);
      
      if (!object) {
        return createErrorResponse(
          'File not found', 
          404, 
          'FILE_NOT_FOUND'
        );
      }
      
      // Check if user owns this file or is admin
      if (object.customMetadata?.userId !== authResult.userId) {
        // Check if user is admin
        const adminCheck = await isAdminUser(authResult.userId, env);
        if (!adminCheck.success || !adminCheck.isAdmin) {
          return createErrorResponse(
            'You do not have permission to access this file', 
            403, 
            'INSUFFICIENT_PERMISSIONS'
          );
        }
      }
      
      return createSuccessResponse({
        exists: true,
        size: object.size,
        lastModified: object.uploaded.toISOString(),
        contentType: object.httpMetadata?.contentType,
        customMetadata: object.customMetadata
      });
    }
    
    return createErrorResponse(
      'Endpoint not found', 
      404, 
      'ENDPOINT_NOT_FOUND'
    );
    
  } catch (error) {
    console.error('Upload API error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500,
      'INTERNAL_ERROR'
    );
  }
};

// Check if user is admin (helper function)
const isAdminUser = async (userId: string, env: Env) => {
  try {
    // In a real implementation, you would check against your user database
    // For now, we'll assume any user with an email containing @handywriterz.com is admin
    return {
      success: true,
      isAdmin: false // Default to false for now
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