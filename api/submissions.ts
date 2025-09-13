// Cloudflare D1 Submissions API endpoint
// This runs as a Cloudflare Worker function

export interface Env {
  DATABASE: D1Database;
  RESEND_API_KEY: string;
  ADMIN_EMAIL: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_ADMIN_CHAT_ID?: string;
  API_TOKEN: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Create new submission
      if (pathname === '/api/submissions' && request.method === 'POST') {
        const submissionData = await request.json();

        // Insert submission into D1 database with enhanced schema
        const result = await env.DATABASE.prepare(`
          INSERT INTO document_submissions (
            id, user_id, order_id, customer_name, customer_email,
            service_type, subject_area, word_count, study_level, due_date,
            module, instructions, price, files, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          submissionData.id,
          submissionData.userId,
          submissionData.metadata.orderId,
          submissionData.metadata.clientName || '',
          submissionData.metadata.clientEmail || '',
          submissionData.metadata.serviceType || '',
          submissionData.metadata.subjectArea || '',
          submissionData.metadata.wordCount || 0,
          submissionData.metadata.studyLevel || '',
          submissionData.metadata.dueDate || '',
          submissionData.metadata.module || '',
          submissionData.metadata.instructions || '',
          submissionData.metadata.price || 0,
          JSON.stringify(submissionData.files || []),
          submissionData.status || 'submitted',
          new Date().toISOString()
        ).run();

        if (result.success) {
          return new Response(JSON.stringify({
            success: true,
            submissionId: submissionData.id
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } else {
          throw new Error('Failed to save submission');
        }
      }

      // Update submission status
      if (pathname.includes('/status') && request.method === 'PUT') {
        const submissionId = pathname.replace('/api/submissions/', '').replace('/status', '');
        const { status } = await request.json();

        const result = await env.DATABASE.prepare(`
          UPDATE document_submissions SET status = ?, updated_at = ? WHERE id = ?
        `).bind(status, new Date().toISOString(), submissionId).run();

        if (result.success) {
          return new Response(JSON.stringify({
            success: true,
            submissionId: submissionId
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } else {
          throw new Error('Failed to update submission status');
        }
      }

      // Get submission by ID
      if (pathname.startsWith('/api/submissions/') && request.method === 'GET') {
        const submissionId = pathname.replace('/api/submissions/', '');
        
        if (submissionId.startsWith('user/')) {
          // Get submissions for a user
          const userId = submissionId.replace('user/', '');
          const results = await env.DATABASE.prepare(`
            SELECT * FROM document_submissions WHERE user_id = ? ORDER BY created_at DESC
          `).bind(userId).all();

          return new Response(JSON.stringify({
            submissions: results.results || []
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } else {
          // Get specific submission
          const result = await env.DATABASE.prepare(`
            SELECT * FROM document_submissions WHERE id = ?
          `).bind(submissionId).first();

          if (result) {
            return new Response(JSON.stringify(result), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          } else {
            return new Response(JSON.stringify({
              error: 'Submission not found'
            }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
        }
      }

      return new Response('Not Found', { 
        status: 404,
        headers: corsHeaders
      });

    } catch (error) {
      console.error('Submissions API error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },
};