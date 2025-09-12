import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useLocation } from 'react-router-dom';
import { cloudflareDb } from '@/lib/cloudflare';

export interface PageView {
  page: string;
  user_id: string | null;
  timestamp: string;
}

export interface UserInteraction {
  event_type: string;
  user_id: string | null;
  metadata: any;
  timestamp: string;
}

export interface ContentMetrics {
  content_id: string;
  views: number;
  likes: number;
  anonymous_likes: number;
  shares: number;
  comments: number;
}

export function useAnalytics() {
  const { user } = useUser();
  const location = useLocation();

  // Automatically track page views
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  const trackPageView = async (page: string) => {
    try {
      await cloudflareDb.insert('analytics', {
        page,
        user_id: user?.id || null,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
    }
  };

  const trackEvent = async (eventType: string, metadata: any = {}) => {
    try {
      await cloudflareDb.insert('user_interactions', {
        event_type: eventType,
        user_id: user?.id || null,
        metadata: JSON.stringify(metadata),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
    }
  };

  const getContentMetrics = async (contentId: string): Promise<ContentMetrics | null> => {
    try {
      const data = await cloudflareDb.select('content_metrics', { content_id: contentId }, 1);
      return data?.[0] || null;
    } catch (error) {
      return null;
    }
  };

  const getDashboardMetrics = async () => {
    try {
      const [pageViews, interactions, contentPerformance] = await Promise.all([
        // Get page view statistics
        cloudflareDb.query(`
          SELECT DATE(timestamp) as date, COUNT(*) as views 
          FROM analytics 
          WHERE timestamp >= DATE('now', '-30 days') 
          GROUP BY DATE(timestamp) 
          ORDER BY date
        `),
        // Get user interaction statistics
        cloudflareDb.query(`
          SELECT event_type, COUNT(*) as count 
          FROM user_interactions 
          WHERE timestamp >= DATE('now', '-30 days') 
          GROUP BY event_type
        `),
        // Get content performance metrics
        cloudflareDb.query(`
          SELECT content_id, SUM(views) as total_views, SUM(likes) as total_likes 
          FROM content_metrics 
          GROUP BY content_id 
          ORDER BY total_views DESC 
          LIMIT 10
        `)
      ]);

      return {
        pageViews: pageViews.results,
        interactions: interactions.results,
        contentPerformance: contentPerformance.results
      };
    } catch (error) {
      return null;
    }
  };

  const getTopContent = async () => {
    try {
      const result = await cloudflareDb.query(`
        SELECT 
          cm.content_id,
          cm.views,
          cm.likes,
          cm.anonymous_likes,
          cm.shares,
          cm.comments,
          s.title,
          s.category
        FROM content_metrics cm
        LEFT JOIN services s ON cm.content_id = s.id
        ORDER BY cm.views DESC
        LIMIT 10
      `);
      
      return result.results;
    } catch (error) {
      return null;
    }
  };

  const getUserEngagement = async () => {
    if (!user) return null;

    try {
      const data = await cloudflareDb.select('user_engagement', { user_id: user.id }, 1);
      return data?.[0] || null;
    } catch (error) {
      return null;
    }
  };

  const getPublicInteractionStats = async () => {
    try {
      const result = await cloudflareDb.query(`
        SELECT 
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(*) as total_interactions,
          AVG(CASE WHEN event_type = 'like' THEN 1 ELSE 0 END) as avg_likes_per_user
        FROM user_interactions
        WHERE timestamp >= DATE('now', '-30 days')
      `);
      
      return result.results?.[0];
    } catch (error) {
      return null;
    }
  };

  // Track specific events
  const trackContentView = (contentId: string) => {
    trackEvent('content_view', { content_id: contentId });
  };

  const trackLike = (contentId: string, isAuthenticated: boolean) => {
    trackEvent('like', { 
      content_id: contentId,
      authenticated: isAuthenticated 
    });
  };

  const trackShare = (contentId: string, platform: string) => {
    trackEvent('share', { 
      content_id: contentId,
      platform 
    });
  };

  const trackComment = (contentId: string) => {
    trackEvent('comment', { content_id: contentId });
  };

  const trackSearch = (query: string, resultsCount: number) => {
    trackEvent('search', { 
      query,
      results_count: resultsCount 
    });
  };

  const trackError = (error: Error, context: string) => {
    trackEvent('error', {
      message: error.message,
      context,
      stack: error.stack
    });
  };

  return {
    // Basic tracking
    trackPageView,
    trackEvent,
    
    // Content tracking
    trackContentView,
    trackLike,
    trackShare,
    trackComment,
    
    // User action tracking
    trackSearch,
    trackError,
    
    // Analytics retrieval
    getContentMetrics,
    getDashboardMetrics,
    getTopContent,
    getUserEngagement,
    getPublicInteractionStats
  };
}
