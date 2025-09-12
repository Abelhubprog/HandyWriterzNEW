// Cloudflare D1 Messages API endpoint
// Handles admin-user messaging system

export interface Env {
  DATABASE: D1Database;
  RESEND_API_KEY: string;
  ADMIN_EMAIL: string;
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
      // Send new message
      if (pathname === '/api/messages' && request.method === 'POST') {
        const messageData = await request.json();

        // Insert message into D1 database
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const result = await env.DATABASE.prepare(`
          INSERT INTO messages (
            id, user_id, order_id, content, sender_type, attachments, created_at, is_read
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          messageId,
          messageData.userId,
          messageData.orderId || null,
          messageData.content,
          messageData.senderType || 'admin',
          JSON.stringify(messageData.attachments || []),
          new Date().toISOString(),
          false
        ).run();

        if (result.success) {
          // Send email notification to user if admin sent the message
          if (messageData.senderType === 'admin' && messageData.userEmail) {
            try {
              await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: 'HandyWriterz <notifications@handywriterz.com>',
                  to: [messageData.userEmail],
                  subject: `New Message - Order #${messageData.orderId || 'General'}`,
                  html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <style>
                        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
                        .container { background: white; border-radius: 8px; padding: 30px; border: 1px solid #e2e8f0; }
                        .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
                        .message-content { background: #f8fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #2563eb; margin: 20px 0; }
                        .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
                      </style>
                    </head>
                    <body>
                      <div class="container">
                        <div class="header">
                          <h1>💬 New Message from HandyWriterz</h1>
                        </div>
                        
                        <p>Hello!</p>
                        <p>You have received a new message regarding your order:</p>
                        
                        <div class="message-content">
                          <strong>Message:</strong><br>
                          ${messageData.content}
                        </div>
                        
                        ${messageData.orderId ? `<p><strong>Order ID:</strong> ${messageData.orderId}</p>` : ''}
                        
                        <p><a href="https://handywriterz.com/dashboard/messages" class="button">Reply to Message</a></p>
                        
                        <p>Best regards,<br>The HandyWriterz Team</p>
                      </div>
                    </body>
                    </html>
                  `
                })
              });
            } catch (emailError) {
              console.error('Failed to send email notification:', emailError);
            }
          }

          return new Response(JSON.stringify({
            success: true,
            messageId: messageId
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } else {
          throw new Error('Failed to save message');
        }
      }

      // Get messages for a conversation
      if (pathname.includes('/api/messages/') && request.method === 'GET') {
        const userId = pathname.replace('/api/messages/', '');
        
        const result = await env.DATABASE.prepare(`
          SELECT * FROM messages 
          WHERE user_id = ? 
          ORDER BY created_at ASC
        `).bind(userId).all();

        return new Response(JSON.stringify({
          messages: result.results || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Mark messages as read
      if (pathname.includes('/read') && request.method === 'PUT') {
        const userId = pathname.replace('/api/messages/', '').replace('/read', '');
        
        const result = await env.DATABASE.prepare(`
          UPDATE messages SET is_read = true 
          WHERE user_id = ? AND sender_type = 'user'
        `).bind(userId).run();

        return new Response(JSON.stringify({
          success: result.success
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get all conversations for admin
      if (pathname === '/api/messages/conversations' && request.method === 'GET') {
        const result = await env.DATABASE.prepare(`
          SELECT DISTINCT
            m.user_id,
            u.name as user_name,
            u.email as user_email,
            (
              SELECT content 
              FROM messages m2 
              WHERE m2.user_id = m.user_id 
              ORDER BY m2.created_at DESC 
              LIMIT 1
            ) as last_message,
            (
              SELECT created_at 
              FROM messages m2 
              WHERE m2.user_id = m.user_id 
              ORDER BY m2.created_at DESC 
              LIMIT 1
            ) as last_message_at,
            (
              SELECT COUNT(*) 
              FROM messages m3 
              WHERE m3.user_id = m.user_id 
              AND m3.sender_type = 'user' 
              AND m3.is_read = false
            ) as unread_count
          FROM messages m
          LEFT JOIN users u ON m.user_id = u.id
          ORDER BY last_message_at DESC
        `).all();

        return new Response(JSON.stringify({
          conversations: result.results || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response('Not Found', { 
        status: 404,
        headers: corsHeaders
      });

    } catch (error) {
      console.error('Messages API error:', error);
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