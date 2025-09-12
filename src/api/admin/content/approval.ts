import { cloudflareDb } from '@/lib/cloudflare';
import { getAuth } from '@clerk/clerk-react';
import type { ContentReview } from '@/types/admin';

/**
 * Submit content for review
 */
export async function submitForReview(
  contentId: string,
  metadata: {
    submitterNotes?: string;
    priority?: 'low' | 'medium' | 'high';
    requestedReviewers?: string[];
  } = {},
  accessToken: string
) {
  const { userId } = getAuth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    // Update content status
    await cloudflareDb.prepare(`
      UPDATE content SET 
        status = 'review',
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(contentId).run();

    // Create workflow record
    await cloudflareDb.prepare(`
      INSERT INTO content_workflows (
        post_id, status, assigned_to, review_notes, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      contentId,
      'pending_review',
      metadata.requestedReviewers?.[0] || null,
      metadata.submitterNotes || null,
      JSON.stringify({
        priority: metadata.priority || 'medium',
        requestedReviewers: metadata.requestedReviewers || [],
        submittedBy: userId,
        submittedAt: new Date().toISOString()
      })
    ).run();

    // Create notifications for reviewers
    if (metadata.requestedReviewers?.length) {
      for (const reviewerId of metadata.requestedReviewers) {
        await cloudflareDb.prepare(`
          INSERT INTO notifications (
            user_id, type, content, created_at
          ) VALUES (?, ?, ?, datetime('now'))
        `).bind(
          reviewerId,
          'content_review_request',
          JSON.stringify({
            contentId,
            submitterId: userId,
            priority: metadata.priority
          })
        ).run();
      }
    }

    return { success: true };

  } catch (error) {
    throw error;
  }
}

/**
 * Submit a content review
 */
export async function submitReview(
  contentId: string,
  review: {
    status: 'approved' | 'rejected' | 'changes_requested';
    feedback: string;
    checklistItems?: Record<string, boolean>;
  },
  accessToken: string
) {
  const { userId } = getAuth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    // Create review record
    await cloudflareDb.prepare(`
      INSERT INTO content_reviews (
        content_id, reviewer_id, status, feedback, checklist_items, created_at
      ) VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      contentId,
      userId,
      review.status,
      review.feedback,
      JSON.stringify(review.checklistItems || {})
    ).run();

    // Get current workflow metadata
    const workflowResult = await cloudflareDb.prepare(`
      SELECT metadata FROM content_workflows WHERE post_id = ?
    `).bind(contentId).first();

    const currentMetadata = workflowResult?.metadata ? JSON.parse(workflowResult.metadata) : {};

    // Update workflow status
    await cloudflareDb.prepare(`
      UPDATE content_workflows SET
        status = ?,
        reviewed_by = ?,
        updated_at = datetime('now'),
        metadata = ?
      WHERE post_id = ?
    `).bind(
      review.status === 'approved' ? 'approved' : 'changes_needed',
      userId,
      JSON.stringify({
        ...currentMetadata,
        lastReviewedAt: new Date().toISOString(),
        lastReviewedBy: userId
      }),
      contentId
    ).run();

    // Update content status if approved
    if (review.status === 'approved') {
      await cloudflareDb.prepare(`
        UPDATE content SET 
          status = 'published',
          published_at = datetime('now'),
          updated_at = datetime('now')
        WHERE id = ?
      `).bind(contentId).run();
    }

    // Get content author and notify
    const contentResult = await cloudflareDb.prepare(`
      SELECT author_id FROM content WHERE id = ?
    `).bind(contentId).first();

    if (contentResult?.author_id) {
      await cloudflareDb.prepare(`
        INSERT INTO notifications (
          user_id, type, content, created_at
        ) VALUES (?, ?, ?, datetime('now'))
      `).bind(
        contentResult.author_id,
        'content_review_completed',
        JSON.stringify({
          contentId,
          reviewerId: userId,
          status: review.status
        })
      ).run();
    }

    return { success: true };

  } catch (error) {
    throw error;
  }
}

/**
 * Get review history for content
 */
export async function getContentReviews(contentId: string): Promise<ContentReview[]> {
  const reviewsResult = await cloudflareDb.prepare(`
    SELECT 
      r.id,
      r.content_id,
      r.reviewer_id,
      r.status,
      r.feedback,
      r.checklist_items,
      r.created_at,
      u.name as reviewer_name,
      u.avatar_url
    FROM content_reviews r
    LEFT JOIN users u ON r.reviewer_id = u.id
    WHERE r.content_id = ?
    ORDER BY r.created_at DESC
  `).bind(contentId).all();

  if (!reviewsResult.results) {
    throw new Error('Failed to get content reviews');
  }

  return reviewsResult.results.map((review: any) => ({
    id: review.id,
    contentId: review.content_id,
    reviewer: {
      id: review.reviewer_id,
      name: review.reviewer_name || 'Unknown',
      avatar: review.avatar_url
    },
    status: review.status,
    feedback: review.feedback,
    checklistItems: review.checklist_items ? JSON.parse(review.checklist_items) : {},
    createdAt: review.created_at
  }));
}

/**
 * Get current workflow status
 */
export async function getWorkflowStatus(contentId: string) {
  const workflowResult = await cloudflareDb.prepare(`
    SELECT 
      w.status,
      w.assigned_to,
      w.reviewed_by,
      w.review_notes,
      w.next_review_date,
      w.metadata,
      w.updated_at,
      u.name as assigned_name,
      u.avatar_url
    FROM content_workflows w
    LEFT JOIN users u ON w.assigned_to = u.id
    WHERE w.post_id = ?
  `).bind(contentId).first();

  if (!workflowResult) {
    throw new Error('Failed to get workflow status');
  }

  return {
    status: workflowResult.status,
    assignedTo: workflowResult.assigned_to ? {
      id: workflowResult.assigned_to,
      name: workflowResult.assigned_name || 'Unknown',
      avatar: workflowResult.avatar_url
    } : null,
    reviewedBy: workflowResult.reviewed_by,
    notes: workflowResult.review_notes,
    nextReviewDate: workflowResult.next_review_date,
    metadata: workflowResult.metadata ? JSON.parse(workflowResult.metadata) : {},
    updatedAt: workflowResult.updated_at
  };
}
