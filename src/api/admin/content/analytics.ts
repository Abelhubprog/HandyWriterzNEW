// Import Cloudflare D1 client directly
import { cloudflareDb } from '@/lib/cloudflare';
import type { ContentStats } from '@/types/admin';
import type {
  AnalyticsPeriod,
  ContentView,
  ContentEngagement,
  ContentConversion,
  ContentPerformance,
  ServiceAnalytics,
  DailyStats,
  ServiceContent
} from '@/types/analytics';

/**
 * Track content view
 */
export async function trackContentView(
  contentId: string,
  metadata: {
    userId?: string;
    sessionId: string;
    timeSpent?: number;
    referrer?: string;
    userAgent?: string;
  }
) {
  try {
    await cloudflareDb.insert('content_views', {
      content_id: contentId,
      user_id: metadata.userId,
      session_id: metadata.sessionId,
      time_spent: metadata.timeSpent,
      referrer: metadata.referrer,
      user_agent: metadata.userAgent,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    throw new Error('Failed to track content view');
  }
}

/**
 * Track content engagement (likes, comments, shares)
 */
export async function trackContentEngagement(
  contentId: string,
  type: ContentEngagement['type'],
  metadata: {
    userId?: string;
    commentText?: string;
    sharedPlatform?: string;
  }
) {
  const { error } = await supabase
    .from('content_engagement')
    .insert({
      content_id: contentId,
      user_id: metadata.userId,
      type,
      metadata: {
        commentText: metadata.commentText,
        sharedPlatform: metadata.sharedPlatform
      },
      created_at: new Date().toISOString()
    });

  if (error) {
    throw new Error('Failed to track content engagement');
  }
}

/**
 * Get content performance metrics
 */
export async function getContentPerformance(
  contentId: string,
  period: AnalyticsPeriod
): Promise<ContentPerformance> {
  // Get content details
  const { data: content } = await supabase
    .from('content')
    .select('title')
    .eq('id', contentId)
    .single();

  // Get views
  const { count: views } = await supabase
    .from('content_views')
    .select('id', { count: 'exact' })
    .eq('content_id', contentId)
    .gte('created_at', period.start)
    .lte('created_at', period.end);

  // Get engagement metrics
  const { data: engagement } = await supabase
    .from('content_engagement')
    .select('type')
    .eq('content_id', contentId)
    .gte('created_at', period.start)
    .lte('created_at', period.end);

  const engagementArray = engagement as ContentEngagement[] || [];
  const likes = engagementArray.filter(e => e.type === 'like').length;
  const comments = engagementArray.filter(e => e.type === 'comment').length;
  const shares = engagementArray.filter(e => e.type === 'share').length;

  // Calculate average time on page
  const { data: timeData } = await supabase
    .from('content_views')
    .select('time_spent')
    .eq('content_id', contentId)
    .gte('created_at', period.start)
    .lte('created_at', period.end)
    .not('time_spent', 'is', null);

  const timeDataArray = timeData as ContentView[] || [];
  const totalTime = timeDataArray.reduce((sum, view) => sum + (view.time_spent || 0), 0);
  const averageTimeOnPage = timeDataArray.length ? totalTime / timeDataArray.length : 0;

  // Calculate bounce rate
  const { count: totalSessions } = await supabase
    .from('content_views')
    .select('session_id', { count: 'exact' })
    .eq('content_id', contentId)
    .gte('created_at', period.start)
    .lte('created_at', period.end);

  const { count: bouncedSessions } = await supabase
    .from('content_views')
    .select('session_id', { count: 'exact' })
    .eq('content_id', contentId)
    .eq('time_spent', 0)
    .gte('created_at', period.start)
    .lte('created_at', period.end);

  const bounceRate = totalSessions ? (bouncedSessions / totalSessions) * 100 : 0;

  // Calculate conversion rate (if applicable)
  const { count: conversions } = await supabase
    .from('content_conversions')
    .select('id', { count: 'exact' })
    .eq('content_id', contentId)
    .gte('created_at', period.start)
    .lte('created_at', period.end);

  const conversionRate = views ? (conversions / views) * 100 : 0;

  return {
    contentId,
    title: content?.title || 'Unknown',
    views: views || 0,
    likes,
    comments,
    shares,
    averageTimeOnPage,
    bounceRate,
    conversionRate
  };
}

/**
 * Get service-level analytics
 */
export async function getServiceAnalytics(
  service: string,
  period: AnalyticsPeriod
): Promise<ServiceAnalytics> {
  // Get all content for the service
  const { data: serviceContent } = await supabase
    .from('content')
    .select('id, title, category, service_type')
    .eq('service_type', service)
    .eq('status', 'published');

  const content = serviceContent as ServiceContent[] || [];

  if (!content.length) {
    return {
      totalViews: 0,
      totalEngagement: 0,
      topPerformingContent: [],
      categoryPerformance: {},
      trendsOverTime: []
    };
  }

  // Get performance metrics for each piece of content
  const contentPerformance = await Promise.all(
    content.map(content => 
      getContentPerformance(content.id, period)
    )
  );

  // Calculate total views and engagement
  const totalViews = contentPerformance.reduce((sum, content) => sum + content.views, 0);
  const totalEngagement = contentPerformance.reduce(
    (sum, content) => sum + content.likes + content.comments + content.shares,
    0
  );

  // Get top performing content
  const topPerformingContent = contentPerformance
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // Calculate category performance
  const categoryPerformance: Record<string, ContentStats> = {};
  content.forEach((item, index) => {
    if (item.category) {
      if (!categoryPerformance[item.category]) {
        categoryPerformance[item.category] = {
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0
        };
      }
      const performance = contentPerformance[index];
      categoryPerformance[item.category].views += performance.views;
      categoryPerformance[item.category].likes += performance.likes;
      categoryPerformance[item.category].comments += performance.comments;
      categoryPerformance[item.category].shares += performance.shares;
    }
  });

  // Get trends over time
  const { data: dailyStats } = await supabase
    .from('content_daily_stats')
    .select('date, views, engagement')
    .eq('service_type', service)
    .gte('date', period.start)
    .lte('date', period.end)
    .order('date', { ascending: true });

  const trendsOverTime = (dailyStats as DailyStats[] || []).map(stat => ({
    date: stat.date,
    views: stat.views,
    engagement: stat.engagement
  }));

  return {
    totalViews,
    totalEngagement,
    topPerformingContent,
    categoryPerformance,
    trendsOverTime
  };
}

/**
 * Track a content conversion
 */
export async function trackContentConversion(
  contentId: string,
  metadata: {
    userId?: string;
    sessionId: string;
    type: string;
    value?: number;
  }
) {
  const { error } = await supabase
    .from('content_conversions')
    .insert({
      content_id: contentId,
      user_id: metadata.userId,
      session_id: metadata.sessionId,
      conversion_type: metadata.type,
      conversion_value: metadata.value,
      created_at: new Date().toISOString()
    });

  if (error) {
    throw new Error('Failed to track content conversion');
  }
}
