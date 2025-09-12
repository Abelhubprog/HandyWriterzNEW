// src/services/commentService.ts
import databaseService from '@/services/databaseService';
import { Comment } from '@/types/blog';

/**
 * Get all comments for a specific post
 * @param postId - The ID of the post to get comments for
 * @returns Promise with an array of comments
 */
export async function getComments(postId: string): Promise<Comment[]> {
  try {
    const comments = await databaseService.read('comments', { post_id: postId });
    
    // Transform to expected format
    return comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      user_id: comment.user_id,
      post_id: comment.post_id,
      parent_id: comment.parent_id,
      replies_count: comment.replies_count || 0,
      // Note: Profile data would need to be fetched separately or joined
      profiles: {
        id: comment.user_id,
        full_name: comment.user_display_name || 'Anonymous',
        avatar_url: comment.user_avatar_url,
        username: comment.username || ''
      }
    }));
  } catch (error) {
    return [];
  }
}

/**
 * Create a new comment
 * @param postId - The ID of the post to comment on
 * @param content - The comment content
 * @param userId - The ID of the user creating the comment
 * @param parentId - Optional parent comment ID for replies
 * @returns Promise with the created comment or null if failed
 */
export async function createComment(
  postId: string,
  content: string,
  userId: string,
  parentId?: string
): Promise<Comment | null> {
  try {
    const commentData = {
      post_id: postId,
      content,
      user_id: userId,
      parent_id: parentId || null,
      replies_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const result = await databaseService.create('comments', commentData);
    
    // If this is a reply, increment parent's reply count
    if (parentId) {
      try {
        const parentComments = await databaseService.read('comments', { id: parentId });
        if (parentComments.length > 0) {
          const parent = parentComments[0];
          await databaseService.update('comments', parentId, {
            replies_count: (parent.replies_count || 0) + 1
          });
        }
      } catch (error) {
      }
    }

    return {
      id: result.id,
      content,
      created_at: commentData.created_at,
      updated_at: commentData.updated_at,
      user_id: userId,
      post_id: postId,
      parent_id: parentId || null,
      replies_count: 0,
      profiles: {
        id: userId,
        full_name: 'User', // Would be fetched from user profile
        avatar_url: null,
        username: ''
      }
    };
  } catch (error) {
    return null;
  }
}

/**
 * Update an existing comment
 * @param commentId - The ID of the comment to update
 * @param content - The new comment content
 * @returns Promise with the updated comment or null if failed
 */
export async function updateComment(commentId: string, content: string): Promise<Comment | null> {
  try {
    await databaseService.update('comments', commentId, {
      content,
      updated_at: new Date().toISOString()
    });

    // Fetch and return the updated comment
    const comments = await databaseService.read('comments', { id: commentId });
    
    if (comments.length > 0) {
      const comment = comments[0];
      return {
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        user_id: comment.user_id,
        post_id: comment.post_id,
        parent_id: comment.parent_id,
        replies_count: comment.replies_count || 0,
        profiles: {
          id: comment.user_id,
          full_name: comment.user_display_name || 'User',
          avatar_url: comment.user_avatar_url,
          username: comment.username || ''
        }
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Delete a comment
 * @param commentId - The ID of the comment to delete
 * @returns Promise with success boolean
 */
export async function deleteComment(commentId: string): Promise<boolean> {
  try {
    // Get the comment to check if it has a parent
    const comments = await databaseService.read('comments', { id: commentId });
    
    if (comments.length > 0) {
      const comment = comments[0];
      
      // If this is a reply, decrement parent's reply count
      if (comment.parent_id) {
        try {
          const parentComments = await databaseService.read('comments', { id: comment.parent_id });
          if (parentComments.length > 0) {
            const parent = parentComments[0];
            await databaseService.update('comments', comment.parent_id, {
              replies_count: Math.max(0, (parent.replies_count || 0) - 1)
            });
          }
        } catch (error) {
        }
      }
      
      // Delete all replies to this comment first
      try {
        const replies = await databaseService.read('comments', { parent_id: commentId });
        for (const reply of replies) {
          await databaseService.delete('comments', reply.id);
        }
      } catch (error) {
      }
    }

    // Delete the comment
    await databaseService.delete('comments', commentId);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get replies for a specific comment
 * @param parentId - The ID of the parent comment
 * @returns Promise with an array of reply comments
 */
export async function getCommentReplies(parentId: string): Promise<Comment[]> {
  try {
    const replies = await databaseService.read('comments', { parent_id: parentId });
    
    return replies.map(reply => ({
      id: reply.id,
      content: reply.content,
      created_at: reply.created_at,
      updated_at: reply.updated_at,
      user_id: reply.user_id,
      post_id: reply.post_id,
      parent_id: reply.parent_id,
      replies_count: reply.replies_count || 0,
      profiles: {
        id: reply.user_id,
        full_name: reply.user_display_name || 'User',
        avatar_url: reply.user_avatar_url,
        username: reply.username || ''
      }
    }));
  } catch (error) {
    return [];
  }
}

/**
 * Get comment count for a post
 * @param postId - The ID of the post
 * @returns Promise with the comment count
 */
export async function getCommentCount(postId: string): Promise<number> {
  try {
    const comments = await databaseService.read('comments', { post_id: postId });
    return comments.length;
  } catch (error) {
    return 0;
  }
}

// Export default service object
const commentService = {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  getCommentReplies,
  getCommentCount
};

export default commentService;