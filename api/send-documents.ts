// Cloudflare Workers API for sending document submission emails to admin

export interface Env {
  RESEND_API_KEY: string;
  ADMIN_EMAIL: string;
  DATABASE: D1Database;
  R2_BUCKET: R2Bucket;
}

interface DocumentSubmissionData {
  userId: string;
  customerName: string;
  customerEmail: string;
  orderId: string;
  orderDetails: {
    serviceType: string;
    subjectArea: string;
    wordCount: number;
    studyLevel: string;
    dueDate: string;
    module: string;
    instructions: string;
    price?: number;
  };
  files: Array<{
    name: string;
    url: string;
    path: string;
    size: number;
    type: string;
  }>;
  submissionTime: string;
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
      if (pathname === '/api/send-documents' && request.method === 'POST') {
        const submissionData: DocumentSubmissionData = await request.json();

        // Store submission in database first
        await storeSubmissionInDatabase(env.DATABASE, submissionData);

        // Generate HTML email for admin
        const adminHtmlContent = generateAdminDocumentNotificationHTML(submissionData);

        // Send email to admin using Resend
        const adminEmailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'HandyWriterz Documents <documents@handywriterz.com>',
            to: [env.ADMIN_EMAIL || 'admin@handywriterz.com'],
            subject: `📋 New Document Submission - Order #${submissionData.orderId}`,
            html: adminHtmlContent,
          }),
        });

        // Generate confirmation email for customer
        const customerHtmlContent = generateCustomerConfirmationHTML(submissionData);

        // Send confirmation to customer
        const customerEmailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'HandyWriterz <noreply@handywriterz.com>',
            to: [submissionData.customerEmail],
            subject: `📋 Document Submission Confirmed - Order #${submissionData.orderId}`,
            html: customerHtmlContent,
          }),
        });

        if (adminEmailResponse.ok && customerEmailResponse.ok) {
          const adminResult = await adminEmailResponse.json();
          const customerResult = await customerEmailResponse.json();

          // Update the submission record with email IDs
          await env.DATABASE.prepare(`
            UPDATE document_submissions
            SET admin_email_id = ?, customer_email_id = ?, admin_notified = true
            WHERE order_id = ?
          `).bind(adminResult.id, customerResult.id, submissionData.orderId).run();

          // Return submission id and file urls to the client for reference
          return new Response(JSON.stringify({
            success: true,
            adminEmailId: adminResult.id,
            customerEmailId: customerResult.id,
            submissionId: submissionData.orderId,
            fileUrls: submissionData.files.map(f => f.url),
            message: 'Documents submitted successfully and admin notified'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } else {
          let error = 'Email service error';
          if (!adminEmailResponse.ok) {
            error += `: Admin email failed - ${await adminEmailResponse.text()}`;
          }
          if (!customerEmailResponse.ok) {
            error += `: Customer email failed - ${await customerEmailResponse.text()}`;
          }
          throw new Error(error);
        }
      }

      return new Response('Not Found', {
        status: 404,
        headers: corsHeaders
      });

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

async function storeSubmissionInDatabase(db: D1Database, data: DocumentSubmissionData) {
  // Insert submission record
  await db.prepare(`
    INSERT INTO document_submissions (
      id, user_id, order_id, customer_name, customer_email,
      service_type, subject_area, word_count, study_level, due_date,
      module, instructions, price, files, status, created_at,
      admin_notified, admin_email_id, customer_email_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    data.userId,
    data.orderId,
    data.customerName,
    data.customerEmail,
    data.orderDetails.serviceType,
    data.orderDetails.subjectArea,
    data.orderDetails.wordCount,
    data.orderDetails.studyLevel,
    data.orderDetails.dueDate,
    data.orderDetails.module,
    data.orderDetails.instructions,
    data.orderDetails.price || 0,
    JSON.stringify(data.files),
    'submitted',
    data.submissionTime,
    false, // admin_notified will be updated after email sent
    null,  // admin_email_id
    null   // customer_email_id
  ).run();
}

function generateAdminDocumentNotificationHTML(data: DocumentSubmissionData): string {
  const filesListHTML = data.files.map((file, index) => `
    <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 8px 0; border-left: 4px solid #007bff;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong>${file.name}</strong>
          <br>
          <span style="color: #666; font-size: 14px;">${formatFileSize(file.size)} • ${file.type || 'Unknown type'}</span>
        </div>
        <a href="${file.url}"
           style="background: #007bff; color: white; padding: 6px 12px; text-decoration: none; border-radius: 4px; font-size: 14px;"
           target="_blank">
          📥 Download
        </a>
      </div>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Document Submission - HandyWriterz Admin</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 700px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .urgent-badge {
      background: #fff;
      color: #dc3545;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 14px;
      margin-bottom: 10px;
      display: inline-block;
    }
    .content {
      background: #f8f9fa;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .info-box {
      background: white;
      padding: 25px;
      border-radius: 8px;
      margin: 20px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .info-title {
      color: #dc3545;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
      border-bottom: 2px solid #dc3545;
      padding-bottom: 10px;
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
      min-width: 120px;
    }
    .value {
      color: #333;
      flex: 1;
    }
    .action-buttons {
      display: flex;
      gap: 10px;
      margin: 20px 0;
      flex-wrap: wrap;
    }
    .btn {
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      text-align: center;
      display: inline-block;
      font-size: 14px;
    }
    .btn-primary {
      background: #007bff;
      color: white;
    }
    .btn-success {
      background: #28a745;
      color: white;
    }
    .btn-warning {
      background: #ffc107;
      color: #212529;
    }
    .files-section {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 15px 0;
    }
    .priority-notice {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #ffc107;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="urgent-badge">🚨 ACTION REQUIRED</div>
    <h1>📋 New Document Submission</h1>
    <h2>Order #${data.orderId}</h2>
    <p>Documents uploaded and ready for review</p>
  </div>

  <div class="content">
    <div class="priority-notice">
      <h3 style="margin-top: 0; color: #856404;">⚡ Priority Action Required</h3>
      <p style="margin-bottom: 0;"><strong>A customer has submitted documents and is waiting for assignment.</strong> Please review the order details and assign to an appropriate writer immediately.</p>
    </div>

    <div class="info-box">
      <div class="info-title">👤 Customer Information</div>
      <div class="info-row">
        <span class="label">Name:</span>
        <span class="value">${data.customerName}</span>
      </div>
      <div class="info-row">
        <span class="label">Email:</span>
        <span class="value">${data.customerEmail}</span>
      </div>
      <div class="info-row">
        <span class="label">User ID:</span>
        <span class="value">${data.userId}</span>
      </div>
      <div class="info-row">
        <span class="label">Submitted:</span>
        <span class="value">${new Date(data.submissionTime).toLocaleString()}</span>
      </div>
    </div>

    <div class="info-box">
      <div class="info-title">📋 Order Details</div>
      <div class="info-row">
        <span class="label">Order ID:</span>
        <span class="value">${data.orderId}</span>
      </div>
      <div class="info-row">
        <span class="label">Service Type:</span>
        <span class="value">${data.orderDetails.serviceType}</span>
      </div>
      <div class="info-row">
        <span class="label">Subject Area:</span>
        <span class="value">${data.orderDetails.subjectArea}</span>
      </div>
      <div class="info-row">
        <span class="label">Word Count:</span>
        <span class="value">${data.orderDetails.wordCount.toLocaleString()} words</span>
      </div>
      <div class="info-row">
        <span class="label">Study Level:</span>
        <span class="value">${data.orderDetails.studyLevel}</span>
      </div>
      <div class="info-row">
        <span class="label">Due Date:</span>
        <span class="value">${new Date(data.orderDetails.dueDate).toLocaleDateString()}</span>
      </div>
      <div class="info-row">
        <span class="label">Module:</span>
        <span class="value">${data.orderDetails.module || 'Not specified'}</span>
      </div>
      ${data.orderDetails.price ? `
      <div class="info-row">
        <span class="label">Estimated Price:</span>
        <span class="value">£${data.orderDetails.price.toFixed(2)}</span>
      </div>
      ` : ''}
    </div>

    ${data.orderDetails.instructions ? `
    <div class="info-box">
      <div class="info-title">📝 Special Instructions</div>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; font-style: italic;">
        "${data.orderDetails.instructions}"
      </div>
    </div>
    ` : ''}

    <div class="files-section">
      <div class="info-title">📎 Submitted Files (${data.files.length})</div>
      ${filesListHTML}
    </div>

    <div style="background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #0066cc; margin-top: 0;">🎯 Next Steps</h3>
      <ol style="margin: 10px 0; padding-left: 20px;">
        <li><strong>Review Requirements:</strong> Check the order details and uploaded files</li>
        <li><strong>Assign Writer:</strong> Select the most suitable writer for this project</li>
        <li><strong>Send Confirmation:</strong> Let the customer know work has begun</li>
        <li><strong>Set Timeline:</strong> Confirm delivery date with the customer</li>
      </ol>
    </div>

    <div class="action-buttons">
      <a href="https://handywriterz.com/admin/orders/${data.orderId}" class="btn btn-primary">
        📋 View Full Order
      </a>
      <a href="https://handywriterz.com/admin/assign-writer/${data.orderId}" class="btn btn-success">
        👥 Assign Writer
      </a>
      <a href="https://handywriterz.com/admin/dashboard" class="btn btn-warning">
        🏠 Admin Dashboard
      </a>
    </div>

    <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; border-left: 4px solid #bee5eb; margin: 20px 0;">
      <p style="margin: 0;"><strong>💬 Customer Contact:</strong> The customer is waiting for confirmation. Please respond within 2 hours during business hours.</p>
    </div>
  </div>

  <div style="background: #6c757d; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-top: 20px;">
    <p><strong>HandyWriterz Admin Panel</strong></p>
    <p style="font-size: 14px;">Admin Dashboard: <a href="https://handywriterz.com/admin" style="color: #fff;">handywriterz.com/admin</a></p>
  </div>
</body>
</html>
  `;
}

function generateCustomerConfirmationHTML(data: DocumentSubmissionData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document Submission Confirmed - HandyWriterz</title>
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
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
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
    .confirmation-box {
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
      color: #28a745;
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .info-box {
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
    .next-steps {
      background: #e8f4f8;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .cta-button {
      display: inline-block;
      background: #28a745;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 HandyWriterz</h1>
    <h2>Documents Received!</h2>
    <p>Your submission has been confirmed</p>
  </div>

  <div class="content">
    <p>Dear ${data.customerName},</p>
    <p>Great news! We have successfully received your document submission and our admin team has been notified.</p>

    <div class="confirmation-box">
      <div class="status-icon">✅</div>
      <div class="status-title">Documents Submitted Successfully</div>
      <p>Your files have been uploaded and sent to our admin team for review and assignment.</p>
    </div>

    <div class="info-box">
      <h3>📋 Submission Summary</h3>
      <div class="info-row">
        <span class="label">Order ID:</span>
        <span class="value">${data.orderId}</span>
      </div>
      <div class="info-row">
        <span class="label">Service Type:</span>
        <span class="value">${data.orderDetails.serviceType}</span>
      </div>
      <div class="info-row">
        <span class="label">Files Submitted:</span>
        <span class="value">${data.files.length} file(s)</span>
      </div>
      <div class="info-row">
        <span class="label">Submission Time:</span>
        <span class="value">${new Date(data.submissionTime).toLocaleString()}</span>
      </div>
      <div class="info-row">
        <span class="label">Due Date:</span>
        <span class="value">${new Date(data.orderDetails.dueDate).toLocaleDateString()}</span>
      </div>
    </div>

    <div class="next-steps">
      <h3 style="color: #0066cc; margin-top: 0;">🚀 What happens next?</h3>
      <ol style="margin: 10px 0; padding-left: 20px;">
        <li><strong>Admin Review (Within 2 hours):</strong> Our team will review your requirements and uploaded files</li>
        <li><strong>Writer Assignment (Same day):</strong> We'll assign the most qualified writer for your project</li>
        <li><strong>Work Begins:</strong> Your writer will start working immediately after assignment</li>
        <li><strong>Progress Updates:</strong> You'll receive regular updates via email and your dashboard</li>
        <li><strong>Quality Check:</strong> All work goes through our quality assurance process</li>
        <li><strong>Delivery:</strong> Your completed work will be delivered before the due date</li>
      </ol>
    </div>

    <div style="text-align: center; margin: 25px 0;">
      <a href="https://handywriterz.com/dashboard" class="cta-button">
        📊 View Dashboard
      </a>
      <a href="https://handywriterz.com/payment" class="cta-button">
        💳 Make Payment
      </a>
    </div>

    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
      <h3 style="color: #856404; margin-top: 0;">📞 Need Help?</h3>
      <p style="margin-bottom: 0;">Our support team is available 24/7 to assist you:</p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>📧 Email: <a href="mailto:admin@handywriterz.com">admin@handywriterz.com</a></li>
        <li>💬 WhatsApp: <a href="https://wa.me/254711264993">+254 711 264 993</a></li>
        <li>🌐 Dashboard: <a href="https://handywriterz.com/dashboard">handywriterz.com/dashboard</a></li>
      </ul>
    </div>
  </div>

  <div style="background: #667eea; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-top: 20px;">
    <p><strong>HandyWriterz - Professional Academic Services</strong></p>
    <p style="font-size: 14px;">Email: admin@handywriterz.com | WhatsApp: +254 711 264 993</p>
    <p style="font-size: 14px;"><a href="https://handywriterz.com" style="color: #fff;">handywriterz.com</a></p>
  </div>
</body>
</html>
  `;
}

function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}
