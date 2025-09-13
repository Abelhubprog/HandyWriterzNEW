import { toast } from 'react-hot-toast';
import { getAuthHeaders, authenticatedFetch } from '@/utils/apiAuth';

interface SubmissionMetadata {
  orderId: string;
  serviceType?: string;
  subjectArea?: string;
  wordCount?: number;
  studyLevel?: string;
  dueDate?: string;
  module?: string;
  instructions?: string;
  emailSubject?: string;
  submissionType?: string;
  clientEmail?: string;
  clientName?: string;
  price?: number;
}

interface SubmissionOptions {
  notifyAdminEmail?: boolean;
  adminEmail?: string;
  notifyTelegram?: boolean;
  notifyInApp?: boolean;
}

interface SubmissionResult {
  success: boolean;
  message: string;
  fileUrls?: string[];
  submissionId?: string;
}

class DocumentSubmissionService {
  private readonly baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  private readonly r2BucketUrl = import.meta.env.VITE_CLOUDFLARE_R2_BUCKET_URL || '';
  private readonly apiToken = import.meta.env.VITE_CLOUDFLARE_API_TOKEN || '';

  /**
   * Submit documents to admin with Cloudflare R2 storage
   */
  async submitDocumentsToAdmin(
    userId: string,
    files: File[],
    metadata: SubmissionMetadata,
    options: SubmissionOptions = {},
    authToken?: string
  ): Promise<SubmissionResult> {
    try {
      // Validate inputs
      if (!files || files.length === 0) {
        throw new Error('No files provided for submission');
      }

      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!authToken) {
        throw new Error('Authentication token is required');
      }

      // Upload files to Cloudflare R2
      const uploadedFiles = await this.uploadFilesToR2(files, userId, metadata.orderId, authToken);

      if (uploadedFiles.length === 0) {
        throw new Error('Failed to upload files to storage');
      }

      // Create submission record
      const submissionId = `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const submissionData = {
        id: submissionId,
        userId,
        metadata,
        files: uploadedFiles,
        createdAt: new Date().toISOString(),
        status: 'submitted'
      };

      // Save submission to database (Cloudflare D1) and capture id
      await this.saveSubmissionToDatabase(submissionData, authToken);

      // Send notifications if requested
      if (options.notifyAdminEmail || options.notifyTelegram || options.notifyInApp) {
        await this.sendNotifications(submissionData, options, authToken);
      }

      return {
        success: true,
        message: 'Documents submitted successfully',
        fileUrls: uploadedFiles.map(f => f.url),
        submissionId
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to submit documents'
      };
    }
  }

  /**
   * Upload files to Cloudflare R2 storage
   */
  private async uploadFilesToR2(
    files: File[],
    userId: string,
    orderId: string,
    authToken: string
  ): Promise<Array<{ name: string; url: string; path: string; size: number }>> {
    const uploadedFiles: Array<{ name: string; url: string; path: string; size: number }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Generate unique file path
      const timestamp = Date.now();
      const fileName = `${timestamp}_${i}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `submissions/${userId}/${orderId}/${fileName}`;

      // Upload to Cloudflare R2 via Worker
      const uploadResult = await this.uploadToR2Worker(file, filePath, authToken);

      if (!uploadResult.success) {
        // If any upload fails, stop and throw so caller can handle retry/rollback.
        throw new Error(uploadResult.error || `Failed to upload file ${file.name}`);
      }

      uploadedFiles.push({
        name: file.name,
        url: uploadResult.url as string,
        path: filePath,
        size: file.size
      });
    }

    return uploadedFiles;
  }

  /**
   * Upload single file to R2 via Cloudflare Worker - Fixed and improved
   */
  async uploadToR2Worker(
    file: File,
    filePath: string,
    authToken: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('key', filePath);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: getAuthHeaders(authToken),
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          url: result.url || `https://cdn.handywriterz.com/${filePath}`
        };
      } else {
        return {
          success: false,
          error: result.error || 'Upload failed'
        };
      }
    } catch (error) {
      // In development only allow a local fallback object URL so the UI remains usable.
      // In production we must not return local blob URLs because admins cannot access them.
      const mode = (import.meta as any).env?.MODE || (import.meta as any).env?.VITE_MODE || 'production';
      if (mode === 'development') {
        try {
          const fileUrl = URL.createObjectURL(file);
          return {
            success: true,
            url: fileUrl,
            error: 'Using local fallback (development mode)'
          };
        } catch (fallbackError) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed completely'
          };
        }
      }

      // Production: do NOT return local blob urls. Return an error so calling code can handle it.
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Save submission to Cloudflare D1 database
   */
  private async saveSubmissionToDatabase(submissionData: any, authToken: string): Promise<void> {
    try {
      // Call the real API endpoint for submissions
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: getAuthHeaders(authToken),
        body: JSON.stringify({
          submission: submissionData
        })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Database save failed: ${response.status} ${text}`);
      }

      // Parse the response to get the submission ID
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message || result.error || 'Failed to save submission to database');
      }

    } catch (error) {
      // Bubble up to caller - database save should be considered part of the submission flow
      throw error;
    }
  }

  /**
   * Send notifications to admin via multiple channels
   */
  private async sendNotifications(submissionData: any, options: SubmissionOptions, authToken: string): Promise<void> {
    try {
      // Use the new document submission email API
      await this.sendDocumentSubmissionEmails(submissionData, options, authToken);
    } catch (error) {
      // Try fallback email notification
      await this.sendFallbackEmailNotification(submissionData, options);
    }
  }

  /**
   * Send document submission emails to admin and customer
   */
  private async sendDocumentSubmissionEmails(submissionData: any, options: SubmissionOptions, authToken: string): Promise<void> {
    try {
      // Prepare document submission data for the email API
      const emailPayload = {
        userId: submissionData.userId,
        customerName: submissionData.metadata.clientName || 'Customer',
        customerEmail: submissionData.metadata.clientEmail || '',
        orderId: submissionData.metadata.orderId,
        orderDetails: {
          serviceType: submissionData.metadata.serviceType || 'Service',
          subjectArea: submissionData.metadata.subjectArea || 'General',
          wordCount: submissionData.metadata.wordCount || 0,
          studyLevel: submissionData.metadata.studyLevel || 'Not specified',
          dueDate: submissionData.metadata.dueDate || new Date().toISOString().split('T')[0],
          module: submissionData.metadata.module || 'Not specified',
          instructions: submissionData.metadata.instructions || 'None provided',
          price: submissionData.metadata.price || 0
        },
        files: submissionData.files.map((file: any) => ({
          name: file.name,
          url: file.url,
          path: file.path,
          size: file.size || 0,
          type: file.type || 'application/octet-stream'
        })),
        submissionTime: submissionData.createdAt
      };

      // Send via new email API
      const response = await fetch('/api/send-documents', {
        method: 'POST',
        headers: getAuthHeaders(authToken),
        body: JSON.stringify(emailPayload)
      });

      if (response.ok) {
        const result = await response.json();
        // Emails sent successfully
      } else {
        const errorText = await response.text();
        throw new Error(`Email API failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      throw error; // Re-throw to trigger fallback
    }
  }

  /**
   * Fallback email notification using local service
   */
  private async sendFallbackEmailNotification(submissionData: any, options: SubmissionOptions): Promise<void> {
    try {
      const adminEmail = options.adminEmail || 'admin@handywriterz.com';

      // Create a simple email notification as fallback
      const emailData = {
        to: adminEmail,
        subject: `Document Submission - Order ${submissionData.metadata.orderId}`,
        text: `
          New document submission received!

          Order ID: ${submissionData.metadata.orderId}
          Service Type: ${submissionData.metadata.serviceType || 'Not specified'}
          Subject Area: ${submissionData.metadata.subjectArea || 'Not specified'}
          Word Count: ${submissionData.metadata.wordCount || 0}
          Study Level: ${submissionData.metadata.studyLevel || 'Not specified'}
          Due Date: ${submissionData.metadata.dueDate || 'Not specified'}
          Module: ${submissionData.metadata.module || 'Not specified'}
          Instructions: ${submissionData.metadata.instructions || 'None provided'}
          Price: £${submissionData.metadata.price || 0}

          Client: ${submissionData.metadata.clientName || 'Unknown'} (${submissionData.metadata.clientEmail || 'No email'})
          Submitted: ${new Date(submissionData.createdAt).toLocaleString()}

          Files (${submissionData.files.length}):
          ${submissionData.files.map((file: any) => `- ${file.name} (${this.formatFileSize(file.size)})`).join('\n')}

          This is an automated fallback notification. The primary email system may be unavailable.
        `,
        html: `
          <h2>New Document Submission Received</h2>
          <p><strong>Order ID:</strong> ${submissionData.metadata.orderId}</p>
          <p><strong>Service Type:</strong> ${submissionData.metadata.serviceType || 'Not specified'}</p>
          <p><strong>Subject Area:</strong> ${submissionData.metadata.subjectArea || 'Not specified'}</p>
          <p><strong>Word Count:</strong> ${submissionData.metadata.wordCount || 0}</p>
          <p><strong>Study Level:</strong> ${submissionData.metadata.studyLevel || 'Not specified'}</p>
          <p><strong>Due Date:</strong> ${submissionData.metadata.dueDate || 'Not specified'}</p>
          <p><strong>Module:</strong> ${submissionData.metadata.module || 'Not specified'}</p>
          <p><strong>Instructions:</strong> ${submissionData.metadata.instructions || 'None provided'}</p>
          <p><strong>Price:</strong> £${submissionData.metadata.price || 0}</p>

          <p><strong>Client:</strong> ${submissionData.metadata.clientName || 'Unknown'} (${submissionData.metadata.clientEmail || 'No email'})</p>
          <p><strong>Submitted:</strong> ${new Date(submissionData.createdAt).toLocaleString()}</p>

          <h3>Files (${submissionData.files.length})</h3>
          <ul>
            ${submissionData.files.map((file: any) => `<li>${file.name} (${this.formatFileSize(file.size)})</li>`).join('')}
          </ul>

          <p><em>This is an automated fallback notification. The primary email system may be unavailable.</em></p>
        `
      };

      // Try to send via fallback email API
      const response = await fetch('/api/send-email-fallback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        throw new Error(`Fallback email failed: ${response.status}`);
      }

      console.log('Fallback email notification sent successfully');
    } catch (error) {
      console.error('Fallback email notification failed:', error);
      // As a last resort, create a system log that can be monitored by admin
      this.logAdminNotification(submissionData);
    }
  }

  /**
   * Log admin notification for manual follow-up
   */
  private logAdminNotification(submissionData: any): void {
    const logEntry = {
      type: 'admin_notification_fallback',
      timestamp: new Date().toISOString(),
      submissionId: submissionData.id,
      orderId: submissionData.metadata.orderId,
      client: submissionData.metadata.clientName || 'Unknown',
      clientEmail: submissionData.metadata.clientEmail || 'No email',
      files: submissionData.files.map((f: any) => f.name),
      status: 'requires_manual_followup'
    };

    // Store in local storage as fallback (will be cleared on browser close)
    try {
      const existingLogs = JSON.parse(localStorage.getItem('admin_notification_logs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('admin_notification_logs', JSON.stringify(existingLogs));
    } catch (e) {
      console.error('Failed to store admin notification log:', e);
    }

    // Also log to console for development
    console.warn('ADMIN NOTIFICATION REQUIRED:', logEntry);
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get submission status
   */
  async getSubmissionStatus(submissionId: string, authToken: string): Promise<any> {
    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        headers: getAuthHeaders(authToken)
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`Failed to get submission status: ${response.status}`);
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * List user submissions
   */
  async getUserSubmissions(userId: string, authToken: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/submissions/user/${userId}`, {
        headers: getAuthHeaders(authToken)
      });

      if (response.ok) {
        const data = await response.json();
        return data.submissions || [];
      } else {
        throw new Error(`Failed to get submissions: ${response.status}`);
      }
    } catch (error) {
      return [];
    }
  }
}

// Export singleton instance
export const documentSubmissionService = new DocumentSubmissionService();
export default documentSubmissionService;
