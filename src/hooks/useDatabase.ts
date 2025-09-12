import { useUser } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';
import databaseService from '@/services/databaseService';
import { cloudflareDb } from '@/lib/cloudflare';

export interface ContentData {
  title: string;
  content: string;
  category: string;
  tags?: string[];
  status: 'draft' | 'published';
  is_premium?: boolean;
}

export interface CommentData {
  content_id: string;
  comment: string;
}

export function useDatabase() {
  const { user } = useUser();
  
  // Content Management
  const getServices = async () => {
    try {
      const data = await databaseService.read('services', { status: 'published' });
      
      // Format data to match expected structure
      const servicesWithCounts = await Promise.all(data.map(async (service: any) => {
        const [likesCount, anonymousLikesCount, sharesCount, commentsCount] = await Promise.all([
          cloudflareDb.query(
            'SELECT COUNT(*) as count FROM content_likes WHERE content_id = ?', 
            [service.id]
          ),
          cloudflareDb.query(
            'SELECT COUNT(*) as count FROM content_anonymous_likes WHERE content_id = ?',
            [service.id]
          ),
          cloudflareDb.query(
            'SELECT COUNT(*) as count FROM content_shares WHERE content_id = ?',
            [service.id]
          ),
          cloudflareDb.query(
            'SELECT COUNT(*) as count FROM comments WHERE content_id = ?',
            [service.id]
          )
        ]);
        
        return {
          ...service,
          likes: { count: likesCount.results?.[0]?.count || 0 },
          anonymous_likes: { count: anonymousLikesCount.results?.[0]?.count || 0 },
          shares: { count: sharesCount.results?.[0]?.count || 0 },
          comments: { count: commentsCount.results?.[0]?.count || 0 }
        };
      }));

      return { success: true, data: servicesWithCounts };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const getServiceById = async (id: string) => {
    try {
      // Get the service
      const service = await databaseService.read('services', { id });
      if (!service || service.length === 0) {
        throw new Error('Service not found');
      }
      
      // Get related counts and comments
      const [
        likesCount, 
        anonymousLikesCount,
        sharesCount,
        comments
      ] = await Promise.all([
        cloudflareDb.query(
          'SELECT COUNT(*) as count FROM content_likes WHERE content_id = ?', 
          [id]
        ),
        cloudflareDb.query(
          'SELECT COUNT(*) as count FROM content_anonymous_likes WHERE content_id = ?',
          [id]
        ),
        cloudflareDb.query(
          'SELECT COUNT(*) as count FROM content_shares WHERE content_id = ?',
          [id]
        ),
        cloudflareDb.query(
          'SELECT c.*, p.id as profile_id, p.full_name, p.avatar_url ' +
          'FROM comments c ' +
          'LEFT JOIN profiles p ON c.user_id = p.id ' +
          'WHERE c.content_id = ?',
          [id]
        )
      ]);
      
      // Format data to match expected structure
      const serviceWithRelations = {
        ...service[0],
        likes: { count: likesCount.results?.[0]?.count || 0 },
        anonymous_likes: { count: anonymousLikesCount.results?.[0]?.count || 0 },
        shares: { count: sharesCount.results?.[0]?.count || 0 },
        comments: comments.results?.map((comment: any) => ({
          id: comment.id,
          comment: comment.comment,
          created_at: comment.created_at,
          profiles: {
            id: comment.profile_id,
            full_name: comment.full_name,
            avatar_url: comment.avatar_url
          }
        })) || []
      };

      return { success: true, data: serviceWithRelations };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Admin Operations
  const getAdminDashboardData = async () => {
    if (!user) return null;

    try {
      const [
        services,
        users,
        interactions,
        analytics
      ] = await Promise.all([
        cloudflareDb.query(
          'SELECT * FROM services ORDER BY created_at DESC LIMIT 5',
          []
        ),
        cloudflareDb.query(
          'SELECT * FROM profiles ORDER BY created_at DESC LIMIT 5',
          []
        ),
        cloudflareDb.query(
          'SELECT * FROM user_interactions ORDER BY timestamp DESC LIMIT 10',
          []
        ),
        cloudflareDb.query(
          'SELECT ' +
          '(SELECT COUNT(*) FROM services) AS total_services, ' +
          '(SELECT COUNT(*) FROM profiles) AS total_users, ' +
          '(SELECT COUNT(*) FROM comments) AS total_comments, ' +
          '(SELECT COUNT(*) FROM content_likes) AS total_likes',
          []
        )
      ]);

      return {
        recentServices: services.results,
        recentUsers: users.results,
        recentInteractions: interactions.results,
        analytics: analytics.results?.[0] || {
          total_services: 0,
          total_users: 0,
          total_comments: 0,
          total_likes: 0
        }
      };
    } catch (error) {
      return null;
    }
  };

  const getAllUsers = async () => {
    if (!user) return { success: false, error: 'Not authorized' };

    try {
      const result = await cloudflareDb.query(
        'SELECT * FROM profiles ORDER BY created_at DESC',
        []
      );
      
      return { success: true, data: result.results };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Public Interactions
  const likeContent = async (contentId: string) => {
    try {
      if (user) {
        // Authenticated like
        await cloudflareDb.query(
          'INSERT INTO content_likes (content_id, user_id, created_at) ' +
          'VALUES (?, ?, ?) ' +
          'ON CONFLICT (content_id, user_id) DO NOTHING',
          [contentId, user.id, new Date().toISOString()]
        );
      } else {
        // Anonymous like - increment a counter
        await cloudflareDb.query(
          'INSERT INTO content_anonymous_likes (content_id, ip_hash, created_at) ' +
          'VALUES (?, ?, ?)',
          [contentId, 'anonymous', new Date().toISOString()]
        );
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const shareContent = async (contentId: string, platform: string) => {
    try {
      await cloudflareDb.query(
        'INSERT INTO content_shares (content_id, platform, user_id, created_at) ' +
        'VALUES (?, ?, ?, ?)',
        [contentId, platform, user?.id || null, new Date().toISOString()]
      );
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const addComment = async ({ content_id, comment }: CommentData) => {
    if (!user) {
      toast.error('You must be logged in to comment');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      await cloudflareDb.query(
        'INSERT INTO comments (content_id, user_id, comment, created_at) ' +
        'VALUES (?, ?, ?, ?)',
        [content_id, user.id, comment, new Date().toISOString()]
      );
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Analytics
  const trackPageView = async (page: string) => {
    try {
      await cloudflareDb.query(
        'INSERT INTO analytics (page, user_id, timestamp) ' +
        'VALUES (?, ?, ?)',
        [page, user?.id || null, new Date().toISOString()]
      );
    } catch (error) {
    }
  };

  const trackInteraction = async (eventType: string, metadata: any) => {
    try {
      await cloudflareDb.query(
        'INSERT INTO user_interactions (event_type, user_id, metadata, timestamp) ' +
        'VALUES (?, ?, ?, ?)',
        [eventType, user?.id || null, JSON.stringify(metadata), new Date().toISOString()]
      );
    } catch (error) {
    }
  };

  return {
    // Content Management
    getServices,
    getServiceById,
    
    // Admin Operations
    getAdminDashboardData,
    getAllUsers,
    
    // Public Interactions
    likeContent,
    shareContent,
    addComment,
    
    // Analytics
    trackPageView,
    trackInteraction
  };
}
