import databaseService from '@/services/databaseService';
import { adminService } from '@/services/adminService';

export type TimeFrame = 'day' | 'week' | 'month' | 'year';

export interface MetricData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
  }[];
}

export interface ContentPerformance {
  id: string;
  title: string;
  views: number;
  engagement: number;
  change: number;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalUsers: number;
  contentCount: number;
  engagementRate: number;
  changes: {
    views: number;
    users: number;
    content: number;
    engagement: number;
  };
}

export const analyticsService = {
  /**
   * Get summary metrics for the dashboard
   */
  async getSummaryMetrics(): Promise<AnalyticsSummary> {
    try {
      // Get posts data from database service
      const posts = await databaseService.getPosts();
      
      // Calculate metrics from available data
      const totalViews = posts.reduce((sum, post) => sum + (post.view_count || 0), 0);
      const contentCount = posts.length;
      
      // Get mock data for users (would be from real user service in production)
      const totalUsers = 150; // Mock value
      
      // Calculate engagement rate from mock data
      const engagementRate = 68.5;
      
      return {
        totalViews,
        totalUsers,
        contentCount,
        engagementRate,
        changes: {
          views: 8.5,
          users: 12.3,
          content: 5.2,
          engagement: -2.1
        }
      };
    } catch (error) {
      
      // Return mock data as fallback
      return {
        totalViews: 12543,
        totalUsers: 8721,
        contentCount: 45,
        engagementRate: 68.5,
        changes: {
          views: 8.5,
          users: 12.3,
          content: 5.2,
          engagement: -2.1
        }
      };
    }
  },
  
  /**
   * Get traffic data for the specified timeframe
   */
  async getTrafficData(timeframe: TimeFrame): Promise<MetricData> {
    try {
      // Get date range based on timeframe
      const { startDate, endDate, interval, format } = this.getTimeframeParams(timeframe);
      
      // For now, use mock data until Cloudflare analytics are implemented
      // In production, this would query the database for actual traffic data
      
      // Create labels based on timeframe
      const labels = this.generateLabels(timeframe);
      
      // Use mock data for demonstration
      const visits = this.getMockDataForTimeframe(timeframe);
      
      return {
        labels,
        datasets: [
          {
            label: 'Visits',
            data: visits,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true
          }
        ]
      };
    } catch (error) {
      
      // Return mock data as fallback
      const labels = this.generateLabels(timeframe);
      const visits = this.getMockDataForTimeframe(timeframe);
      
      return {
        labels,
        datasets: [
          {
            label: 'Visits',
            data: visits,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true
          }
        ]
      };
    }
  },
  
  /**
   * Get engagement data (likes, comments, shares) for the specified timeframe
   */
  async getEngagementData(timeframe: TimeFrame): Promise<MetricData> {
    // Get date range based on timeframe
    const { startDate, endDate, interval } = this.getTimeframeParams(timeframe);
    
    // In a real app, you would query the database for likes, comments, and shares
    // For simplicity, we'll use mock data
    
    // Create labels based on timeframe
    const labels = this.generateLabels(timeframe);
    
    return {
      labels,
      datasets: [
        {
          label: 'Likes',
          data: this.getMockDataForTimeframe(timeframe, 'likes'),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)'
        },
        {
          label: 'Comments',
          data: this.getMockDataForTimeframe(timeframe, 'comments'),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)'
        },
        {
          label: 'Shares',
          data: this.getMockDataForTimeframe(timeframe, 'shares'),
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)'
        }
      ]
    };
  },
  
  /**
   * Get top performing content
   */
  async getTopContent(): Promise<ContentPerformance[]> {
    try {
      // Get posts from database service and sort by views
      const posts = await databaseService.getPosts();
      
      if (posts && posts.length > 0) {
        // Sort by view count and take top 5
        const topPosts = posts
          .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
          .slice(0, 5)
          .map((post) => ({
            id: post.id,
            title: post.title,
            views: post.view_count || 0,
            engagement: (post.likes_count || 0) + (post.comments_count || 0) + (post.shares_count || 0),
            change: Math.floor(Math.random() * 20) - 10 // Mock change percentage
          }));
        
        return topPosts;
      }
      
      // Fallback to mock data if no results
      return [
        { id: '1', title: 'Child Health Nursing - Complete Guide', views: 2543, engagement: 224, change: 12 },
        { id: '2', title: 'Adult Health Nursing Best Practices', views: 1876, engagement: 141, change: -3 },
        { id: '3', title: 'Mental Health Nursing Insights', views: 1654, engagement: 215, change: 5 },
        { id: '4', title: 'Cryptocurrency Market Analysis', views: 3421, engagement: 390, change: 8 },
        { id: '5', title: 'AI and Machine Learning Trends', views: 1234, engagement: 89, change: -2 }
      ];
    } catch (error) {
      
      // Return mock data as fallback
      return [
        { id: '1', title: 'Child Health Nursing - Complete Guide', views: 2543, engagement: 224, change: 12 },
        { id: '2', title: 'Adult Health Nursing Best Practices', views: 1876, engagement: 141, change: -3 },
        { id: '3', title: 'Mental Health Nursing Insights', views: 1654, engagement: 215, change: 5 },
        { id: '4', title: 'Cryptocurrency Market Analysis', views: 3421, engagement: 390, change: 8 },
        { id: '5', title: 'AI and Machine Learning Trends', views: 1234, engagement: 89, change: -2 }
      ];
    }
  },
  
  /**
   * Get content breakdown by category
   */
  async getCategoryBreakdown() {
    try {
      // Get categories from database service
      const categories = await databaseService.getCategories();
      
      if (categories && categories.length > 0) {
        // Calculate percentages based on category counts
        const total = categories.reduce((sum, cat) => sum + (cat.post_count || 0), 0);
        
        return categories.map(cat => ({
          category: cat.name,
          percentage: total > 0 ? Math.round(((cat.post_count || 0) / total) * 100) : 0
        }));
      }
      
      // Fallback to mock data
      return [
        { category: 'Healthcare', percentage: 65 },
        { category: 'Technology', percentage: 20 },
        { category: 'Education', percentage: 10 },
        { category: 'Research', percentage: 5 }
      ];
    } catch (error) {
      
      // Return mock data as fallback
      return [
        { category: 'Healthcare', percentage: 65 },
        { category: 'Technology', percentage: 20 },
        { category: 'Education', percentage: 10 },
        { category: 'Research', percentage: 5 }
      ];
    }
  },
  
  /**
   * Get recent user activity for the activity feed
   */
  async getRecentActivity(limit = 5) {
    // In a real app, you would query various activity tables
    // and combine the results in chronological order
    
    // Mock data for demonstration
    return [
      { 
        id: '1', 
        type: 'post_created', 
        user: { id: '1', name: 'Emma Rodriguez', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
        content: 'Managing Acute Respiratory Conditions in Children',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      },
      { 
        id: '2', 
        type: 'user_joined', 
        user: { id: '2', name: 'David Thompson', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      },
      { 
        id: '3', 
        type: 'post_updated', 
        user: { id: '3', name: 'Sarah Johnson', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
        content: 'Developmental Milestones: Assessment and Nursing Interventions',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
      },
      { 
        id: '4', 
        type: 'analytics_report', 
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week ago
      }
    ];
  },
  
  // Helper methods for generating data
  
  /**
   * Get timeframe parameters for queries
   */
  getTimeframeParams(timeframe: TimeFrame) {
    const endDate = new Date();
    let startDate = new Date();
    let interval: string;
    let format: string;
    
    switch (timeframe) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        interval = 'hour';
        format = 'ha'; // 1pm, 2pm, etc.
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        interval = 'day';
        format = 'ddd'; // Mon, Tue, etc.
        break;
      case 'month':
        startDate.setDate(1); // First day of current month
        interval = 'day';
        format = 'Do'; // 1st, 2nd, etc.
        break;
      case 'year':
        startDate.setMonth(0, 1); // January 1st of current year
        interval = 'month';
        format = 'MMM'; // Jan, Feb, etc.
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
        interval = 'day';
        format = 'Do';
    }
    
    return { startDate, endDate, interval, format };
  },
  
  /**
   * Generate labels for the specified timeframe
   */
  generateLabels(timeframe: TimeFrame): string[] {
    switch (timeframe) {
      case 'day':
        return ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm'];
      case 'week':
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      case 'month':
        return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      case 'year':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      default:
        return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    }
  },
  
  /**
   * Get mock data for a specific timeframe and dataset
   */
  getMockDataForTimeframe(timeframe: TimeFrame, datasetType = 'visits'): number[] {
    // Scale factors for different dataset types
    const scaleFactor = {
      visits: 1,
      likes: 0.1,
      comments: 0.05,
      shares: 0.02
    };
    
    const scale = scaleFactor[datasetType as keyof typeof scaleFactor];
    
    switch (timeframe) {
      case 'day':
        return [120, 90, 70, 240, 350, 460, 380, 290].map(v => Math.round(v * scale));
      case 'week':
        return [1200, 1900, 1700, 2400, 2500, 1800, 1200].map(v => Math.round(v * scale));
      case 'month':
        return [8500, 11000, 9500, 12300].map(v => Math.round(v * scale));
      case 'year':
        return [
          25000, 27000, 30000, 35000, 42000, 46000, 48000, 45000, 43000, 47000, 50000, 52000
        ].map(v => Math.round(v * scale));
      default:
        return [8500, 11000, 9500, 12300].map(v => Math.round(v * scale));
    }
  }
}; 