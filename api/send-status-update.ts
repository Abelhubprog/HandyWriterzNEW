// Cloudflare Workers API for sending order status update emails

export interface Env {
  RESEND_API_KEY: string;
  DATABASE: D1Database;
}

interface StatusUpdateData {
  to: string;
  subject: string;
  orderDetails: {
    orderId: string;
    serviceType: string;
    status: string;
    customerName: string;
  };
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
      if (pathname === '/api/send-status-update' && request.method === 'POST') {
        const statusData: StatusUpdateData = await request.json();

        // Generate HTML email based on status
        const htmlContent = generateStatusUpdateHTML(statusData);
        
        // Send email using Resend
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'HandyWriterz <updates@handywriterz.com>',
            to: [statusData.to],
            subject: statusData.subject,
            html: htmlContent,
          }),
        });

        if (emailResponse.ok) {
          const emailResult = await emailResponse.json();
          
          // Log status update in database
          await env.DATABASE.prepare(`
            INSERT INTO status_updates (
              id, order_id, status, updated_at, email_sent, email_id
            ) VALUES (?, ?, ?, ?, ?, ?)
          `).bind(
            `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            statusData.orderDetails.orderId,
            statusData.orderDetails.status,
            new Date().toISOString(),
            true,
            emailResult.id
          ).run();

          return new Response(JSON.stringify({
            success: true,
            emailId: emailResult.id
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } else {
          const error = await emailResponse.text();
          throw new Error(`Email service error: ${error}`);
        }
      }

      return new Response('Not Found', { 
        status: 404,
        headers: corsHeaders
      });

    } catch (error) {
      console.error('Send status update API error:', error);
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

function generateStatusUpdateHTML(data: StatusUpdateData): string {
  const { orderDetails } = data;
  const statusConfig = getStatusConfig(orderDetails.status);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Status Update - HandyWriterz</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: ${statusConfig.gradient};
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #f8f9fa;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .status-box {
      background: white;
      padding: 25px;
      border-radius: 8px;
      margin: 20px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }
    .status-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    .status-title {
      color: ${statusConfig.color};
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .order-info {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 15px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .label {
      font-weight: 600;
      color: #555;
    }
    .value {
      color: #333;
    }
    .cta-section {
      background: ${statusConfig.bgColor};
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      text-align: center;
    }
    .cta-button {
      display: inline-block;
      background: ${statusConfig.color};
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 10px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding: 20px;
      background: #667eea;
      color: white;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 HandyWriterz</h1>
    <h2>Order Status Update</h2>
    <p>Order #${orderDetails.orderId}</p>
  </div>
  
  <div class="content">
    <p>Dear ${orderDetails.customerName},</p>
    <p>We have an update on your order. Here's the current status:</p>
    
    <div class="status-box">
      <div class="status-icon">${statusConfig.icon}</div>
      <div class="status-title">${statusConfig.title}</div>
      <p>${statusConfig.description}</p>
    </div>
    
    <div class="order-info">
      <h3>📋 Order Information</h3>
      <div class="info-row">
        <span class="label">Order ID:</span>
        <span class="value">${orderDetails.orderId}</span>
      </div>
      <div class="info-row">
        <span class="label">Service Type:</span>
        <span class="value">${orderDetails.serviceType}</span>
      </div>
      <div class="info-row">
        <span class="label">Current Status:</span>
        <span class="value" style="color: ${statusConfig.color}; font-weight: bold;">${statusConfig.title}</span>
      </div>
      <div class="info-row">
        <span class="label">Last Updated:</span>
        <span class="value">${new Date().toLocaleString()}</span>
      </div>
    </div>
    
    <div class="cta-section">
      <h3>${statusConfig.ctaTitle}</h3>
      <p>${statusConfig.ctaDescription}</p>
      <a href="https://handywriterz.com/dashboard" class="cta-button">
        View Dashboard
      </a>
      ${orderDetails.status === 'completed' ? 
        '<a href="https://handywriterz.com/dashboard" class="cta-button">Download Files</a>' : ''
      }
    </div>
    
    <div style="background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #0066cc; margin-top: 0;">💬 Need Help?</h3>
      <p>If you have any questions about your order, our support team is here to help:</p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>📧 Email: <a href="mailto:admin@handywriterz.com">admin@handywriterz.com</a></li>
        <li>💬 WhatsApp: <a href="https://wa.me/254711264993">+254 711 264 993</a></li>
        <li>🌐 Dashboard: <a href="https://handywriterz.com/dashboard">handywriterz.com/dashboard</a></li>
      </ul>
    </div>
  </div>
  
  <div class="footer">
    <p><strong>HandyWriterz - Professional Academic Services</strong></p>
    <p>Email: admin@handywriterz.com | WhatsApp: +254 711 264 993</p>
    <p><a href="https://handywriterz.com" style="color: #fff;">handywriterz.com</a></p>
  </div>
</body>
</html>
  `;
}

function getStatusConfig(status: string) {
  const configs = {
    pending: {
      icon: '⏳',
      title: 'Order Received',
      description: 'Your order has been received and is being reviewed by our team.',
      color: '#ffc107',
      bgColor: '#fff3cd',
      gradient: 'linear-gradient(135deg, #ffc107 0%, #ff8f00 100%)',
      ctaTitle: 'What happens next?',
      ctaDescription: 'Our team will review your requirements and assign the best writer for your project.'
    },
    'in-progress': {
      icon: '✍️',
      title: 'Work in Progress',
      description: 'Our expert writer is actively working on your order.',
      color: '#007bff',
      bgColor: '#cce5ff',
      gradient: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
      ctaTitle: 'Work is underway!',
      ctaDescription: 'Your writer is making great progress. You\'ll receive updates as milestones are completed.'
    },
    completed: {
      icon: '🎉',
      title: 'Order Completed',
      description: 'Great news! Your order has been completed and is ready for download.',
      color: '#28a745',
      bgColor: '#d4edda',
      gradient: 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)',
      ctaTitle: 'Your work is ready!',
      ctaDescription: 'Download your completed work from your dashboard. Unlimited revisions are included.'
    },
    rejected: {
      icon: '❌',
      title: 'Order Requires Attention',
      description: 'There\'s an issue with your order that requires clarification.',
      color: '#dc3545',
      bgColor: '#f8d7da',
      gradient: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
      ctaTitle: 'Action Required',
      ctaDescription: 'Please contact our support team to resolve the issue with your order.'
    }
  };

  return configs[status as keyof typeof configs] || configs.pending;
}