export interface AnalyticsPeriod {
  start: string;
  end: string;
}

export interface ServiceContent {
  id: string;
  title: string;
  category: string | null;
  service_type: string;
}

export interface ContentView {
  id: string;
  content_id: string;
  user_id?: string;
  session_id: string;
  time_spent?: number;
  referrer?: string;
  user_agent?: string;
  created_at: string;
}

export interface ContentEngagement {
  id: string;
  content_id: string;
  user_id?: string;
  type: 'like' | 'comment' | 'share';
  metadata?: {
    commentText?: string;
    sharedPlatform?: string;
  };
  created_at: string;
}

export interface ContentConversion {
  id: string;
  content_id: string;
  user_id?: string;
  session_id: string;
  conversion_type: string;
  conversion_value?: number;
  created_at: string;
}

export interface DailyStats {
  date: string;
  views: number;
  engagement: number;
  service_type: string;
}

export interface ContentPerformance {
  contentId: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  averageTimeOnPage: number;
  bounceRate: number;
  conversionRate: number;
}

export interface ServiceAnalytics {
  totalViews: number;
  totalEngagement: number;
  topPerformingContent: ContentPerformance[];
  categoryPerformance: Record<string, {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  }>;
  trendsOverTime: Array<{
    date: string;
    views: number;
    engagement: number;
  }>;
}
