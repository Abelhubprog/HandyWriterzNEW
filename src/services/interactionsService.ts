import databaseService from '@/services/databaseService';
// RealtimeChannel type for compatibility
type RealtimeChannel = any;

export interface Comment {
  id: string;
  content: string;
  serviceId: string;
  userId: string;
  userDisplayName: string;
  userAvatarUrl?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContentLike {
  id: string;
  serviceId: string;
  userId: string;
  createdAt: string;
}

export type CommentListener = (comment: Comment) => void;
export type LikeListener = (like: ContentLike) => void;

export const interactionsService = {
  subscriptions: new Map<string, RealtimeChannel>(),

  /**
   * Subscribe to comments for a service (mock implementation)
   */
  subscribeToComments(serviceId: string, onComment: CommentListener): () => void {
    
    // Mock subscription - return unsubscribe function
    return () => {
    };
  },

  /**
   * Subscribe to likes for a service (mock implementation)
   */
  subscribeToLikes(serviceId: string, onLike: LikeListener): () => void {
    
    // Mock subscription - return unsubscribe function
    return () => {
    };
  },

  /**
   * Get comments for a service
   */
  async getComments(serviceId: string): Promise<Comment[]> {
    try {
      const comments = await databaseService.read('comments', { service_id: serviceId });
      
      return comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        serviceId: comment.service_id,
        userId: comment.user_id,
        userDisplayName: comment.user_display_name || 'Anonymous',
        userAvatarUrl: comment.user_avatar_url,
        isApproved: comment.is_approved || false,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at
      }));
    } catch (error) {
      return [];
    }
  },

  /**
   * Add a comment
   */
  async addComment(
    serviceId: string,
    content: string,
    userId: string,
    userDisplayName: string,
    userAvatarUrl?: string
  ): Promise<Comment | null> {
    try {
      const commentData = {
        service_id: serviceId,
        content,
        user_id: userId,
        user_display_name: userDisplayName,
        user_avatar_url: userAvatarUrl,
        is_approved: false, // Comments need approval by default
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const result = await databaseService.create('comments', commentData);
      
      return {
        id: result.id,
        content,
        serviceId,
        userId,
        userDisplayName,
        userAvatarUrl,
        isApproved: false,
        createdAt: commentData.created_at,
        updatedAt: commentData.updated_at
      };
    } catch (error) {
      return null;
    }
  },

  /**
   * Update a comment
   */
  async updateComment(commentId: string, content: string): Promise<boolean> {
    try {
      await databaseService.update('comments', commentId, {
        content,
        updated_at: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<boolean> {
    try {
      await databaseService.delete('comments', commentId);
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Approve a comment
   */
  async approveComment(commentId: string): Promise<boolean> {
    try {
      await databaseService.update('comments', commentId, {
        is_approved: true,
        updated_at: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get likes for a service
   */
  async getLikes(serviceId: string): Promise<ContentLike[]> {
    try {
      const likes = await databaseService.read('content_likes', { service_id: serviceId });
      
      return likes.map(like => ({
        id: like.id,
        serviceId: like.service_id,
        userId: like.user_id,
        createdAt: like.created_at
      }));
    } catch (error) {
      return [];
    }
  },

  /**
   * Add a like
   */
  async addLike(serviceId: string, userId: string): Promise<ContentLike | null> {
    try {
      // Check if like already exists
      const existingLikes = await databaseService.read('content_likes', {
        service_id: serviceId,
        user_id: userId
      });

      if (existingLikes.length > 0) {
        return existingLikes[0];
      }

      const likeData = {
        service_id: serviceId,
        user_id: userId,
        created_at: new Date().toISOString()
      };

      const result = await databaseService.create('content_likes', likeData);
      
      return {
        id: result.id,
        serviceId,
        userId,
        createdAt: likeData.created_at
      };
    } catch (error) {
      return null;
    }
  },

  /**
   * Remove a like
   */
  async removeLike(serviceId: string, userId: string): Promise<boolean> {
    try {
      // Find the like to remove
      const likes = await databaseService.read('content_likes', {
        service_id: serviceId,
        user_id: userId
      });

      if (likes.length > 0) {
        await databaseService.delete('content_likes', likes[0].id);
      }
      
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get like count for a service
   */
  async getLikeCount(serviceId: string): Promise<number> {
    try {
      const likes = await this.getLikes(serviceId);
      return likes.length;
    } catch (error) {
      return 0;
    }
  },

  /**
   * Get comment count for a service
   */
  async getCommentCount(serviceId: string): Promise<number> {
    try {
      const comments = await this.getComments(serviceId);
      return comments.filter(comment => comment.isApproved).length;
    } catch (error) {
      return 0;
    }
  },

  /**
   * Check if user has liked a service
   */
  async hasUserLiked(serviceId: string, userId: string): Promise<boolean> {
    try {
      const likes = await databaseService.read('content_likes', {
        service_id: serviceId,
        user_id: userId
      });
      
      return likes.length > 0;
    } catch (error) {
      return false;
    }
  },

  /**
   * Unsubscribe from all subscriptions
   */
  unsubscribeAll(): void {
    this.subscriptions.forEach((channel, key) => {
      // In a real implementation, this would call channel.unsubscribe()
    });
    this.subscriptions.clear();
  }
};

export default interactionsService;