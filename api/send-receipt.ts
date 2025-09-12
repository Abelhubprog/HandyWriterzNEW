// Cloudflare Workers API for sending receipt emails
// Handles automated receipt generation and email delivery

export interface Env {
  RESEND_API_KEY: string;
  ADMIN_EMAIL: string;
}

interface ReceiptData {
  to: string;
  subject: string;
  customerName: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  orderDetails: {
    serviceType: string;
    subjectArea: string;
    wordCount: number;
    studyLevel: string;
    dueDate: string;
    module: string;
    instructions: string;
  };
  timestamp: string;
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
      if (pathname === '/api/send-receipt' && request.method === 'POST') {
        const receiptData: ReceiptData = await request.json();

        // Generate HTML receipt email
        const htmlContent = generateReceiptHTML(receiptData);
        
        // Send email using Resend
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'HandyWriterz <noreply@handywriterz.com>',
            to: [receiptData.to],
            subject: receiptData.subject,
            html: htmlContent,
          }),
        });

        if (emailResponse.ok) {
          const emailResult = await emailResponse.json();
          
          // Also send a copy to admin for record keeping
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'HandyWriterz <noreply@handywriterz.com>',
              to: [env.ADMIN_EMAIL || 'admin@handywriterz.com'],
              subject: `Payment Received - Order #${receiptData.orderId}`,
              html: generateAdminNotificationHTML(receiptData),
            }),
          });

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
      console.error('Send receipt API error:', error);
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

function generateReceiptHTML(data: ReceiptData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt - HandyWriterz</title>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    .receipt-box {
      background: white;
      padding: 25px;
      border-radius: 8px;
      margin: 20px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .receipt-title {
      color: #667eea;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }
    .receipt-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    .receipt-row:last-child {
      border-bottom: none;
      font-weight: bold;
      font-size: 16px;
    }
    .label {
      font-weight: 600;
      color: #555;
    }
    .value {
      color: #333;
    }
    .status-paid {
      color: #28a745;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding: 20px;
      background: #667eea;
      color: white;
      border-radius: 8px;
    }
    .contact-info {
      margin-top: 15px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎯 HandyWriterz</h1>
    <h2>Payment Receipt</h2>
    <p>Thank you for your payment!</p>
  </div>
  
  <div class="content">
    <p>Dear ${data.customerName},</p>
    <p>We have successfully received your payment. Here are your receipt details:</p>
    
    <div class="receipt-box">
      <div class="receipt-title">💳 Payment Information</div>
      <div class="receipt-row">
        <span class="label">Order ID:</span>
        <span class="value">${data.orderId}</span>
      </div>
      <div class="receipt-row">
        <span class="label">Amount Paid:</span>
        <span class="value">${data.currency}${data.amount.toFixed(2)}</span>
      </div>
      <div class="receipt-row">
        <span class="label">Payment Method:</span>
        <span class="value">${data.paymentMethod}</span>
      </div>
      <div class="receipt-row">
        <span class="label">Transaction ID:</span>
        <span class="value">${data.transactionId}</span>
      </div>
      <div class="receipt-row">
        <span class="label">Date & Time:</span>
        <span class="value">${new Date(data.timestamp).toLocaleString()}</span>
      </div>
      <div class="receipt-row">
        <span class="label">Status:</span>
        <span class="value status-paid">✅ PAID</span>
      </div>
    </div>
    
    <div class="receipt-box">
      <div class="receipt-title">📋 Order Details</div>
      <div class="receipt-row">
        <span class="label">Service Type:</span>
        <span class="value">${data.orderDetails.serviceType}</span>
      </div>
      <div class="receipt-row">
        <span class="label">Subject Area:</span>
        <span class="value">${data.orderDetails.subjectArea}</span>
      </div>
      <div class="receipt-row">
        <span class="label">Word Count:</span>
        <span class="value">${data.orderDetails.wordCount.toLocaleString()} words</span>
      </div>
      <div class="receipt-row">
        <span class="label">Study Level:</span>
        <span class="value">${data.orderDetails.studyLevel}</span>
      </div>
      <div class="receipt-row">
        <span class="label">Due Date:</span>
        <span class="value">${new Date(data.orderDetails.dueDate).toLocaleDateString()}</span>
      </div>
      <div class="receipt-row">
        <span class="label">Module:</span>
        <span class="value">${data.orderDetails.module || 'Not specified'}</span>
      </div>
    </div>
    
    <div style="background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #0066cc; margin-top: 0;">🚀 What happens next?</h3>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Our expert writers will begin working on your order immediately</li>
        <li>You'll receive progress updates via email and your dashboard</li>
        <li>We'll deliver your completed work before the due date</li>
        <li>Unlimited revisions are included at no extra cost</li>
      </ul>
    </div>
    
    <p><strong>Need help?</strong> Contact our support team:</p>
    <ul>
      <li>📧 Email: <a href="mailto:admin@handywriterz.com">admin@handywriterz.com</a></li>
      <li>💬 WhatsApp: <a href="https://wa.me/254711264993">+254 711 264 993</a></li>
      <li>🌐 Dashboard: <a href="https://handywriterz.com/dashboard">handywriterz.com/dashboard</a></li>
    </ul>
  </div>
  
  <div class="footer">
    <p><strong>HandyWriterz - Professional Academic Services</strong></p>
    <div class="contact-info">
      <p>Email: admin@handywriterz.com | WhatsApp: +254 711 264 993</p>
      <p>Visit us at: <a href="https://handywriterz.com" style="color: #fff;">handywriterz.com</a></p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateAdminNotificationHTML(data: ReceiptData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payment Received - Order #${data.orderId}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #28a745;">💰 Payment Received</h2>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0;">
      <h3>Customer Information</h3>
      <p><strong>Name:</strong> ${data.customerName}</p>
      <p><strong>Email:</strong> ${data.to}</p>
    </div>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0;">
      <h3>Payment Details</h3>
      <p><strong>Order ID:</strong> ${data.orderId}</p>
      <p><strong>Amount:</strong> ${data.currency}${data.amount.toFixed(2)}</p>
      <p><strong>Method:</strong> ${data.paymentMethod}</p>
      <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
      <p><strong>Date:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
    </div>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0;">
      <h3>Order Details</h3>
      <p><strong>Service:</strong> ${data.orderDetails.serviceType}</p>
      <p><strong>Subject:</strong> ${data.orderDetails.subjectArea}</p>
      <p><strong>Words:</strong> ${data.orderDetails.wordCount.toLocaleString()}</p>
      <p><strong>Level:</strong> ${data.orderDetails.studyLevel}</p>
      <p><strong>Due Date:</strong> ${new Date(data.orderDetails.dueDate).toLocaleDateString()}</p>
      <p><strong>Module:</strong> ${data.orderDetails.module || 'Not specified'}</p>
    </div>
    
    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
      <p><strong>Action Required:</strong> Please check the admin dashboard to assign this order to a writer and begin work.</p>
    </div>
  </div>
</body>
</html>
  `;
}