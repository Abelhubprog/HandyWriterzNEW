import { useState, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { documentSubmissionService } from '@/services/documentSubmissionService';
import { documentQueueService } from '@/services/documentQueueService';
import { adminNotificationService } from '@/services/adminNotificationService';
import { toast } from 'react-hot-toast';

export type SubmissionStatus = 'idle' | 'uploading' | 'submitting' | 'notifying' | 'success' | 'error' | 'partial';

export interface UseDocumentSubmissionProps {
  onSuccess?: (submissionId: string) => void;
  onError?: (error: any) => void;
  onStatusChange?: (status: SubmissionStatus) => void;
  autoNotify?: boolean;
}

/**
 * Hook to handle document submission to admins with advanced error handling,
 * status tracking, and multi-channel notifications
 */
export function useDocumentSubmission({
  onSuccess,
  onError,
  onStatusChange,
  autoNotify = true
}: UseDocumentSubmissionProps = {}) {
  const { user, isSignedIn } = useUser();
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null);

  // Update the parent component when status changes
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(status);
    }
  }, [status, onStatusChange]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

  // Check queue status periodically
  const checkQueueStatus = useCallback((id: string) => {
    const intervalId = setInterval(() => {
      const currentStatus = documentQueueService.getStatus(id);
      
      if (currentStatus === 'completed') {
        clearInterval(intervalId);
        setStatusCheckInterval(null);
        setStatus('success');
        setIsSubmitting(false);
        if (onSuccess) onSuccess(id);
      } else if (currentStatus === 'failed') {
        clearInterval(intervalId);
        setStatusCheckInterval(null);
        setStatus('error');
        setIsSubmitting(false);
        const err = new Error('Submission failed after multiple attempts');
        setError(err);
        if (onError) onError(err);
      } else if (currentStatus === 'partial') {
        clearInterval(intervalId);
        setStatusCheckInterval(null);
        setStatus('partial');
        setIsSubmitting(false);
        if (onSuccess) onSuccess(id);
        // Still consider it a success but with warning
        toast.success('Documents uploaded but admin notification may have been incomplete');
      }
    }, 1000);
    
    setStatusCheckInterval(intervalId);
    return intervalId;
  }, [onSuccess, onError]);

  // Main submission function
  const submitDocuments = useCallback(async (
    files: File[],
    metadata: Record<string, any> = {}
  ) => {
    if (!isSignedIn || !user) {
      const err = new Error('User must be signed in to submit documents');
      setError(err);
      if (onError) onError(err);
      toast.error('Please sign in to submit documents');
      return { success: false, error: err };
    }

    if (files.length === 0) {
      const err = new Error('No files selected for submission');
      setError(err);
      if (onError) onError(err);
      toast.error('Please select files to submit');
      return { success: false, error: err };
    }

    if (isSubmitting) {
      return { success: false, error: new Error('Submission already in progress') };
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setStatus('uploading');

      // 1. First attempt with direct submission
      try {
        setStatus('submitting');
        const result = await documentSubmissionService.submitDocumentsToAdmin(
          user.id,
          files,
          metadata
        );
        
        if (result.success) {
          setSubmissionId(result.submissionId || null);
          
          // Send additional notification if requested
          if (autoNotify) {
            setStatus('notifying');
            try {
              await adminNotificationService.notify(
                'New Document Submission',
                `User ${user.fullName || user.username || user.id} has submitted ${files.length} document(s) for review.`,
                {
                  priority: files.length > 5 ? 'high' : 'medium',
                  channels: ['in-app', 'email'],
                  metadata: {
                    submissionId: result.submissionId,
                    fileCount: files.length,
                    ...metadata
                  },
                  user_id: user.id
                }
              );
            } catch (notifyError) {
              // Continue anyway since the main submission succeeded
            }
          }
          
          setStatus('success');
          setIsSubmitting(false);
          if (onSuccess) onSuccess(result.submissionId || '');
          toast.success('Documents sent to admin successfully!');
          
          return { 
            success: true, 
            submissionId: result.submissionId,
            channels: result.notificationChannels
          };
        }
        
        // If direct submission fails, fallback to queue
        throw new Error(result.message || 'Direct submission failed');
      } catch (directError) {
        
        // 2. Queue the submission with retry logic
        setStatus('submitting');
        const queueId = await documentQueueService.addToQueue(
          user.id,
          files,
          metadata
        );
        
        setSubmissionId(queueId);
        
        // 3. Start checking status
        checkQueueStatus(queueId);
        
        // Show partial success message
        toast.success('Documents queued for delivery to admin', { duration: 5000 });
        
        return { 
          success: true, 
          submissionId: queueId,
          queued: true
        };
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error during submission');
      setStatus('error');
      setError(err);
      setIsSubmitting(false);
      if (onError) onError(err);
      toast.error('Failed to send documents to admin. Please try again.');
      
      return { 
        success: false, 
        error: err 
      };
    }
  }, [isSignedIn, user, isSubmitting, autoNotify, checkQueueStatus, onSuccess, onError]);

  // Cancel submission if it's in progress
  const cancelSubmission = useCallback(() => {
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
      setStatusCheckInterval(null);
    }
    setIsSubmitting(false);
    setStatus('idle');
    toast.error('Document submission cancelled');
  }, [statusCheckInterval]);

  // Reset the submission state
  const resetSubmission = useCallback(() => {
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
      setStatusCheckInterval(null);
    }
    setIsSubmitting(false);
    setStatus('idle');
    setSubmissionId(null);
    setError(null);
  }, [statusCheckInterval]);

  return {
    submitDocuments,
    cancelSubmission,
    resetSubmission,
    isSubmitting,
    status,
    error,
    submissionId,
    isSignedIn,
    user
  };
} 