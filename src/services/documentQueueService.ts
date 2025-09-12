import { cloudflare } from '@/lib/cloudflareClient';
import { documentSubmissionService } from './documentSubmissionService';
import { v4 as uuidv4 } from 'uuid';

// Define the status for document submissions
export type SubmissionStatus = 
  | 'pending'    // Initial state
  | 'uploading'  // Files are being uploaded
  | 'notifying'  // Admin notifications are being sent
  | 'completed'  // Successfully completed
  | 'failed'     // Failed after retries
  | 'partial'    // Partially successful (e.g. files uploaded but admin not notified)
  | 'retrying';  // In retry process

// Define submission queue item
export interface SubmissionQueueItem {
  id: string;
  userId: string;
  files: File[];
  metadata: any;
  status: SubmissionStatus;
  attempts: number;
  maxAttempts: number;
  lastAttempt: string | null;
  error: string | null;
  created: string;
  updated: string;
}

/**
 * Service to manage document submission queue with retry logic
 */
export const documentQueueService = {
  // Maximum number of retries
  MAX_ATTEMPTS: 3,
  
  // In-memory queue for current session
  queue: new Map<string, SubmissionQueueItem>(),
  
  // Active processing flag
  isProcessing: false,
  
  /**
   * Add a submission to the queue
   */
  async addToQueue(
    userId: string,
    files: File[],
    metadata: any
  ): Promise<string> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    // Create queue item
    const queueItem: SubmissionQueueItem = {
      id,
      userId,
      files,
      metadata,
      status: 'pending',
      attempts: 0,
      maxAttempts: this.MAX_ATTEMPTS,
      lastAttempt: null,
      error: null,
      created: now,
      updated: now
    };
    
    // Add to in-memory queue
    this.queue.set(id, queueItem);
    
    // Start processing the queue if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }
    
    return id;
  },
  
  /**
   * Process all queued items
   */
  async processQueue() {
    if (this.isProcessing) return;
    
    try {
      this.isProcessing = true;
      
      // Get all pending items
      const pendingItems = Array.from(this.queue.values())
        .filter(item => ['pending', 'retrying'].includes(item.status) && 
                item.attempts < item.maxAttempts);
      
      for (const item of pendingItems) {
        await this.processItem(item.id);
      }
    } catch (error) {
    } finally {
      this.isProcessing = false;
      
      // If there are still pending items, schedule another run
      const hasPending = Array.from(this.queue.values())
        .some(item => ['pending', 'retrying'].includes(item.status) && 
              item.attempts < item.maxAttempts);
      
      if (hasPending) {
        setTimeout(() => this.processQueue(), 5000);
      }
    }
  },
  
  /**
   * Process a single queue item
   */
  async processItem(id: string): Promise<boolean> {
    const item = this.queue.get(id);
    if (!item) return false;
    
    try {
      // Update status and attempt count
      item.status = item.attempts === 0 ? 'uploading' : 'retrying';
      item.attempts += 1;
      item.lastAttempt = new Date().toISOString();
      item.updated = new Date().toISOString();
      
      // Process submission
      const result = await documentSubmissionService.submitDocumentsToAdmin(
        item.userId,
        item.files,
        item.metadata
      );
      
      if (result.success) {
        // Complete status based on channels that succeeded
        if (result.notificationChannels && 
            (result.notificationChannels.includes('in-app') || 
             result.notificationChannels.includes('email'))) {
          item.status = 'completed';
        } else {
          item.status = 'partial';
          item.error = 'Files uploaded but admin may not have been notified on all channels';
        }
      } else {
        // Failed but may retry
        if (item.attempts < item.maxAttempts) {
          item.status = 'retrying';
          item.error = result.message || 'Unknown error';
          
          // Schedule retry with exponential backoff
          const backoff = Math.pow(2, item.attempts) * 1000;
          setTimeout(() => this.processItem(id), backoff);
        } else {
          item.status = 'failed';
          item.error = result.message || 'Max retries exceeded';
        }
      }
      
      // Record status change to database if possible
      try {
        await this.recordStatus(item);
      } catch (dbError) {
      }
      
      return result.success;
    } catch (error) {
      // Update item status
      item.error = error instanceof Error ? error.message : 'Unknown error';
      
      if (item.attempts < item.maxAttempts) {
        item.status = 'retrying';
        
        // Schedule retry with exponential backoff
        const backoff = Math.pow(2, item.attempts) * 1000;
        setTimeout(() => this.processItem(id), backoff);
      } else {
        item.status = 'failed';
      }
      
      // Record failure
      try {
        await this.recordStatus(item);
      } catch (dbError) {
      }
      
      return false;
    }
  },
  
  /**
   * Record submission status to database
   */
  async recordStatus(item: SubmissionQueueItem): Promise<void> {
    try {
      const { error } = await cloudflare
        .upsert('document_submission_queue', {
          id: item.id,
          user_id: item.userId,
          metadata: JSON.stringify(item.metadata),
          status: item.status,
          attempts: item.attempts,
          max_attempts: item.maxAttempts,
          last_attempt: item.lastAttempt,
          error: item.error,
          created_at: item.created,
          updated_at: new Date().toISOString()
        })
        .execute();
      
      if (error) throw new Error(error);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Get submission status
   */
  getStatus(id: string): SubmissionStatus | null {
    const item = this.queue.get(id);
    return item ? item.status : null;
  },
  
  /**
   * Clear completed items from memory
   */
  clearCompleted() {
    for (const [id, item] of this.queue.entries()) {
      if (['completed', 'failed', 'partial'].includes(item.status)) {
        this.queue.delete(id);
      }
    }
  }
};

export default documentQueueService; 