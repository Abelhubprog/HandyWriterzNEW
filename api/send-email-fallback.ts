// Simple fallback email API for when Resend service is unavailable

export interface Env {
  // Environment variables for fallback email service
  FALLBACK_EMAIL_SERVICE?: string;
  ADMIN_EMAIL: string;
}

interface FallbackEmailData {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (request.method === 'POST') {
        const emailData: FallbackEmailData = await request.json();

        // Log the email attempt for admin review
        console.log('Fallback email attempt:', {
          to: emailData.to,
          subject: emailData.subject,
          timestamp: new Date().toISOString(),
        });

        // In a real implementation, this would use a secondary email service
        // For now, we'll just log it and return success since this is a fallback
        // The admin can check logs for manual follow-up

        return new Response(JSON.stringify({
          success: true,
          message: 'Fallback email logged for manual processing',
          logged: true,
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });

    } catch (error) {
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
