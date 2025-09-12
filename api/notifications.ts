// Cloudflare Workers API for Notifications
// Handles admin notifications via email and Telegram

export interface Env {
  DATABASE: D1Database;
  RESEND_API_KEY: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_ADMIN_CHAT_ID: string;
  ADMIN_EMAIL: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

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
      // Send admin notification
      if (pathname === '/api/notifications/admin' && request.method === 'POST') {
        const notificationData = await request.json();
        const { submissionId, userId, metadata, fileCount, options } = notificationData;

        const results = {
          email: false,
          telegram: false,
          inApp: false
        };

        // Send email notification with professional HTML template
        if (options.notifyAdminEmail) {
          try {
            const emailSubject = `🔔 NEW ORDER: ${metadata.subject || metadata.serviceType || 'Document Submission'} - ${submissionId}`;
            
            const emailResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'HandyWriterz System <notifications@handywriterz.com>',
                to: [options.adminEmail || env.ADMIN_EMAIL || 'admin@handywriterz.com'],
                subject: emailSubject,
                html: `
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <style>
                      body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; }
                      .container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                      .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px 20px; text-align: center; }
                      .content { padding: 30px; }
                      .footer { background: #1e293b; color: white; padding: 20px; text-align: center; }
                      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                      .info-item { background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb; }
                      .info-label { font-weight: bold; color: #374151; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
                      .info-value { color: #1f2937; font-size: 14px; }
                      .urgent-section { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
                      .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 10px 5px; font-weight: bold; }
                      .button:hover { background: #1d4ed8; }
                      .instructions-box { background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 15px 0; border: 1px solid #e2e8f0; }
                      @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <div class="header">
                        <h1 style="margin: 0; font-size: 24px;">📋 New Order Received</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Order ID: <strong>${submissionId}</strong></p>
                      </div>
                      
                      <div class="content">
                        <div class="info-grid">
                          <div class="info-item">
                            <div class="info-label">Subject</div>
                            <div class="info-value">${metadata.subject || 'Not specified'}</div>
                          </div>
                          <div class="info-item">
                            <div class="info-label">Paper Type</div>
                            <div class="info-value">${metadata.paperType || metadata.serviceType || 'Not specified'}</div>
                          </div>
                          <div class="info-item">
                            <div class="info-label">Word Count</div>
                            <div class="info-value">${metadata.wordCount || 'Not specified'} words</div>
                          </div>
                          <div class="info-item">
                            <div class="info-label">Academic Level</div>
                            <div class="info-value">${metadata.academicLevel || metadata.studyLevel || 'Not specified'}</div>
                          </div>
                          <div class="info-item">
                            <div class="info-label">Deadline</div>
                            <div class="info-value">${metadata.deadline || metadata.dueDate || 'Not specified'}</div>
                          </div>
                          <div class="info-item">
                            <div class="info-label">Files Uploaded</div>
                            <div class="info-value">${fileCount} file(s)</div>
                          </div>
                        </div>
                        
                        ${(metadata.instructions || options.instructions) ? `
                          <div class="instructions-box">
                            <div class="info-label" style="margin-bottom: 10px;">Special Instructions</div>
                            <div style="color: #374151; line-height: 1.5;">
                              ${metadata.instructions || options.instructions}
                            </div>
                          </div>
                        ` : ''}
                        
                        <div class="urgent-section">
                          <div style="font-weight: bold; margin-bottom: 15px;">⚡ Action Required</div>
                          <ul style="margin: 0; padding-left: 20px; color: #92400e;">
                            <li>Review uploaded documents in admin dashboard</li>
                            <li>Confirm order details and requirements</li>
                            <li>Begin assignment work immediately</li>
                            <li>Contact client if clarification needed</li>
                          </ul>
                        </div>
                        
                        <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                          <p style="margin: 5px 0; color: #6b7280;"><strong>Client:</strong> ${userId}</p>
                          <p style="margin: 5px 0; color: #6b7280;"><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div class="footer">
                        <a href="https://handywriterz.com/admin" class="button">🚀 Open Admin Dashboard</a>
                        <a href="https://handywriterz.com/admin/orders/${submissionId}" class="button">📄 View This Order</a>
                      </div>
                    </div>
                  </body>
                  </html>
                `,
                text: `
New document submission received:

Submission ID: ${submissionId}
User ID: ${userId}
Service Type: ${metadata.serviceType || 'Not specified'}
Subject: ${metadata.subject || 'Not specified'}
Word Count: ${metadata.wordCount || 'Not specified'}
Academic Level: ${metadata.academicLevel || 'Not specified'}
Due Date: ${metadata.deadline || 'Not specified'}
Number of Files: ${fileCount}

Instructions: ${metadata.instructions || options.instructions || 'None provided'}

Please review the submission in the admin dashboard at https://handywriterz.com/admin
                `
              }),
            });

            if (emailResponse.ok) {
              results.email = true;
            }
          } catch (emailError) {
            console.error('Email notification failed:', emailError);
          }
        }

        // Send Telegram notification
        if (options.notifyTelegram && env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_ADMIN_CHAT_ID) {
          try {
            const telegramMessage = `
🚨 *New Document Submission*

📋 *Service:* ${metadata.serviceType || 'General'}
👤 *User:* ${userId}
📝 *Subject:* ${metadata.subjectArea || 'Not specified'}
📊 *Words:* ${metadata.wordCount || 'Not specified'}
🎓 *Level:* ${metadata.studyLevel || 'Not specified'}
📅 *Due:* ${metadata.dueDate || 'Not specified'}
📎 *Files:* ${fileCount}

*ID:* \`${submissionId}\`
            `;

            const telegramResponse = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                chat_id: env.TELEGRAM_ADMIN_CHAT_ID,
                text: telegramMessage,
                parse_mode: 'Markdown',
              }),
            });

            if (telegramResponse.ok) {
              results.telegram = true;
            }
          } catch (telegramError) {
            console.error('Telegram notification failed:', telegramError);
          }
        }

        // Save in-app notification
        if (options.notifyInApp) {
          try {
            await env.DATABASE.prepare(`
              INSERT INTO admin_notifications (
                id, type, title, message, submission_id, created_at, is_read
              ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `).bind(
              `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              'submission',
              `New ${metadata.serviceType || 'submission'} from user`,
              `User ${userId} submitted ${fileCount} file(s) for ${metadata.serviceType || 'general service'}`,
              submissionId,
              new Date().toISOString(),
              false
            ).run();

            results.inApp = true;
          } catch (dbError) {
            console.error('In-app notification failed:', dbError);
          }
        }

        return new Response(JSON.stringify({
          success: true,
          results
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response('Not Found', { 
        status: 404,
        headers: corsHeaders
      });

    } catch (error) {
      console.error('Notifications API error:', error);
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