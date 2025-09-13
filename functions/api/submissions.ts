import { D1Database } from '@cloudflare/workers-types';
import { authenticateUser, createErrorResponse, createSuccessResponse } from './auth';

interface Env {
  DB: D1Database;
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
    const path = url.pathname.replace('/api/submissions', '');
    
    // Create new submission
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
      
      try {
        const body = await request.json();
        const submissionData = body.submission || body;
        
        // Validate required fields
        if (!submissionData.id || !submissionData.userId) {
          return createErrorResponse(
            'Missing required fields: id and userId', 
            400, 
            'MISSING_FIELDS'
          );
        }
        
        // Ensure the authenticated user matches the submission userId
        if (submissionData.userId !== authResult.userId) {
          return createErrorResponse(
            'You can only create submissions for yourself', 
            403, 
            'INSUFFICIENT_PERMISSIONS'
          );
        }
        
        // Insert submission into D1 database with enhanced schema
        const result = await env.DB.prepare(`
          INSERT INTO document_submissions (
            id, user_id, order_id, customer_name, customer_email,
            service_type, subject_area, word_count, study_level, due_date,
            module, instructions, price, files, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          submissionData.id,
          submissionData.userId,
          submissionData.metadata?.orderId || '',
          submissionData.metadata?.clientName || '',
          submissionData.metadata?.clientEmail || '',
          submissionData.metadata?.serviceType || '',
          submissionData.metadata?.subjectArea || '',
          submissionData.metadata?.wordCount || 0,
          submissionData.metadata?.studyLevel || '',
          submissionData.metadata?.dueDate || '',
          submissionData.metadata?.module || '',
          submissionData.metadata?.instructions || '',
          submissionData.metadata?.price || 0,
          JSON.stringify(submissionData.files || []),
          submissionData.status || 'submitted',
          new Date().toISOString()
        ).run();
        
        if (result.success) {
          return createSuccessResponse({
            submissionId: submissionData.id,
            message: 'Submission created successfully'
          }, 201);
        } else {
          return createErrorResponse(
            'Failed to save submission to database', 
            500, 
            'DATABASE_ERROR'
          );
        }
      } catch (error) {
        if (error instanceof SyntaxError) {
          return createErrorResponse(
            'Invalid JSON in request body', 
            400, 
            'INVALID_JSON'
          );
        }
        throw error;
      }
    }
    
    // Update submission status
    if (path.includes('/status') && request.method === 'PUT') {
      // Authenticate user
      const authResult = await authenticateUser(request, env);
      if (!authResult.success) {
        return createErrorResponse(
          authResult.error.message, 
          authResult.error.status, 
          authResult.error.code
        );
      }
      
      try {
        const pathParts = path.split('/');
        const submissionId = pathParts[pathParts.length - 2]; // Get ID before /status
        
        if (!submissionId) {
          return createErrorResponse(
            'Missing submission ID', 
            400, 
            'MISSING_ID'
          );
        }
        
        // Check if user owns this submission or is admin
        const submission = await env.DB.prepare(`
          SELECT user_id FROM document_submissions WHERE id = ?
        `).bind(submissionId).first<{ user_id: string }>();
        
        if (!submission) {
          return createErrorResponse(
            'Submission not found', 
            404, 
            'NOT_FOUND'
          );
        }
        
        // Check permissions
        if (submission.user_id !== authResult.userId) {
          // Check if user is admin
          const adminCheck = await isAdminUser(authResult.userId, env);
          if (!adminCheck.success || !adminCheck.isAdmin) {
            return createErrorResponse(
              'You do not have permission to update this submission', 
              403, 
              'INSUFFICIENT_PERMISSIONS'
            );
          }
        }
        
        const body = await request.json();
        const { status } = body;
        
        if (!status) {
          return createErrorResponse(
            'Missing status field', 
            400, 
            'MISSING_STATUS'
          );
        }
        
        const result = await env.DB.prepare(`
          UPDATE document_submissions SET status = ?, updated_at = ? WHERE id = ?
        `).bind(status, new Date().toISOString(), submissionId).run();
        
        if (result.success) {
          return createSuccessResponse({
            submissionId: submissionId,
            message: 'Submission status updated successfully'
          });
        } else {
          return createErrorResponse(
            'Failed to update submission status', 
            500, 
            'DATABASE_ERROR'
          );
        }
      } catch (error) {
        if (error instanceof SyntaxError) {
          return createErrorResponse(
            'Invalid JSON in request body', 
            400, 
            'INVALID_JSON'
          );
        }
        throw error;
      }
    }
    
    // Get submission by ID
    if (path.startsWith('/') && request.method === 'GET') {
      // Authenticate user
      const authResult = await authenticateUser(request, env);
      if (!authResult.success) {
        return createErrorResponse(
          authResult.error.message, 
          authResult.error.status, 
          authResult.error.code
        );
      }
      
      const submissionId = path.substring(1);
      
      if (!submissionId) {
        return createErrorResponse(
          'Missing submission ID', 
          400, 
          'MISSING_ID'
        );
      }
      
      if (submissionId.startsWith('user/')) {
        // Get submissions for a user
        const userId = submissionId.replace('user/', '');
        if (!userId) {
          return createErrorResponse(
            'Missing user ID', 
            400, 
            'MISSING_USER_ID'
          );
        }
        
        // Check if user is requesting their own submissions or is admin
        if (userId !== authResult.userId) {
          // Check if user is admin
          const adminCheck = await isAdminUser(authResult.userId, env);
          if (!adminCheck.success || !adminCheck.isAdmin) {
            return createErrorResponse(
              'You do not have permission to view these submissions', 
              403, 
              'INSUFFICIENT_PERMISSIONS'
            );
          }
        }
        
        const results = await env.DB.prepare(`
          SELECT * FROM document_submissions WHERE user_id = ? ORDER BY created_at DESC
        `).bind(userId).all();
        
        return createSuccessResponse({
          submissions: results.results || []
        });
      } else {
        // Get specific submission
        const result = await env.DB.prepare(`
          SELECT * FROM document_submissions WHERE id = ?
        `).bind(submissionId).first();
        
        if (!result) {
          return createErrorResponse(
            'Submission not found', 
            404, 
            'NOT_FOUND'
          );
        }
        
        // Check if user owns this submission or is admin
        if (result.user_id !== authResult.userId) {
          // Check if user is admin
          const adminCheck = await isAdminUser(authResult.userId, env);
          if (!adminCheck.success || !adminCheck.isAdmin) {
            return createErrorResponse(
              'You do not have permission to view this submission', 
              403, 
              'INSUFFICIENT_PERMISSIONS'
            );
          }
        }
        
        if (result) {
          return createSuccessResponse(result);
        } else {
          return createErrorResponse(
            'Submission not found', 
            404, 
            'NOT_FOUND'
          );
        }
      }
    }
    
    return createErrorResponse(
      'Endpoint not found', 
      404, 
      'NOT_FOUND'
    );
    
  } catch (error) {
    console.error('Submissions API error:', error);
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