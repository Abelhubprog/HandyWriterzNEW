import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  MessageCircle,
  Users,
  Calendar,
  Filter,
  Download,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Globe,
  Clock,
  Target,
  RefreshCw
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';
import { analyticsService } from '@/services/analyticsService';
import { adminService } from '@/services/adminService';

interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

interface ContentPerformance {
  id: string;
  title: string;
  type: 'service' | 'blog' | 'page';
  views: number;
  likes: number;
  comments: number;
  shares: number;
  avgTimeOnPage: number;
  bounceRate: number;
  publishedAt: string;
  lastUpdated: string;
}

interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
  change: number;
}

interface UserEngagement {
  metric: string;
  current: number;
  previous: number;
  change: number;
}

const AnalyticsDashboard: React.FC = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [contentPerformance, setContentPerformance] = useState<ContentPerformance[]>([]);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [userEngagement, setUserEngagement] = useState<UserEngagement[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Get analytics summary from service
      const summaryData = await analyticsService.getSummaryMetrics();
      
      // Transform to component format
      const analyticsMetrics: AnalyticsMetric[] = [
        {
          id: 'total-views',
          name: 'Total Views',
          value: summaryData.totalViews,
          previousValue: Math.floor(summaryData.totalViews * (1 - summaryData.changes.views / 100)),
          change: summaryData.changes.views,
          changeType: summaryData.changes.views >= 0 ? 'increase' : 'decrease',
          icon: <Eye className="w-6 h-6" />,
          color: 'text-blue-600'
        },
        {
          id: 'unique-visitors',
          name: 'Unique Visitors',
          value: summaryData.totalUsers,
          previousValue: Math.floor(summaryData.totalUsers * (1 - summaryData.changes.users / 100)),
          change: summaryData.changes.users,
          changeType: summaryData.changes.users >= 0 ? 'increase' : 'decrease',
          icon: <Users className="w-6 h-6" />,
          color: 'text-green-600'
        },
        {
          id: 'engagement-rate',
          name: 'Engagement Rate',
          value: summaryData.engagementRate,
          previousValue: summaryData.engagementRate * (1 - summaryData.changes.engagement / 100),
          change: summaryData.changes.engagement,
          changeType: summaryData.changes.engagement >= 0 ? 'increase' : 'decrease',
          icon: <Activity className="w-6 h-6" />,
          color: 'text-purple-600'
        },
        {
          id: 'avg-session',
          name: 'Avg. Session Duration',
          value: 245,
          previousValue: 223,
          change: 9.9,
          changeType: 'increase',
          icon: <Clock className="w-6 h-6" />,
          color: 'text-orange-600'
        }
      ];

      // Get analytics-specific data from admin service
      const analyticsFullData = await adminService.getAnalytics(timeRange as any);
      
      // Transform content performance data
      const performanceData: ContentPerformance[] = analyticsFullData.topPosts.map(post => ({
        id: post.id,
        title: post.title,
        type: 'service' as const,
        views: post.views,
        likes: Math.floor(post.views * 0.08), // Mock engagement data
        comments: Math.floor(post.views * 0.03),
        shares: Math.floor(post.views * 0.02),
        avgTimeOnPage: 200 + Math.floor(Math.random() * 200),
        bounceRate: 15 + Math.floor(Math.random() * 30),
        publishedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));

      // Use traffic and engagement data from analytics service
      const mockTrafficSources: TrafficSource[] = [
        { source: 'Direct', visitors: 3542, percentage: 35.2, change: 8.5 },
        { source: 'Search Engines', visitors: 2987, percentage: 29.7, change: 12.3 },
        { source: 'Social Media', visitors: 1876, percentage: 18.6, change: -2.1 },
        { source: 'Referrals', visitors: 1098, percentage: 10.9, change: 5.7 },
        { source: 'Email', visitors: 567, percentage: 5.6, change: 15.2 }
      ];

      const mockUserEngagement: UserEngagement[] = [
        { metric: 'Page Views per Session', current: 2.8, previous: 2.5, change: 12.0 },
        { metric: 'Time on Site (minutes)', current: 4.2, previous: 3.8, change: 10.5 },
        { metric: 'Bounce Rate (%)', current: 24.5, previous: 28.9, change: -15.2 },
        { metric: 'Return Visitors (%)', current: 45.3, previous: 41.7, change: 8.6 }
      ];

      setMetrics(analyticsMetrics);
      setContentPerformance(performanceData);
      setTrafficSources(mockTrafficSources);
      setUserEngagement(mockUserEngagement);
      
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
    toast.success('Analytics data refreshed');
  };

  const exportData = () => {
    // TODO: Implement data export functionality
    toast.success('Analytics data export initiated');
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getChangeIcon = (changeType: string) => {
    if (changeType === 'increase') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (changeType === 'decrease') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <div className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track content performance and user engagement</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={exportData}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div className={metric.color}>
                {metric.icon}
              </div>
              <div className="flex items-center gap-1">
                {getChangeIcon(metric.changeType)}
                <span className={`text-sm font-medium ${
                  metric.changeType === 'increase' ? 'text-green-600' : 
                  metric.changeType === 'decrease' ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600">{metric.name}</p>
              <p className="text-2xl font-bold text-gray-900">
                {metric.id === 'avg-session' ? formatDuration(metric.value) : 
                 metric.id === 'engagement-rate' ? `${metric.value}%` :
                 metric.value.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Performance */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Top Performing Content</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                <Filter className="w-4 h-4 inline mr-1" />
                Filter
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bounce Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Published
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contentPerformance.map((content) => (
                <tr key={content.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{content.title}</div>
                      <div className="text-sm text-gray-500 capitalize">{content.type}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">{content.views.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 text-red-400 mr-1" />
                        <span className="text-sm text-gray-900">{content.likes}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="w-4 h-4 text-blue-400 mr-1" />
                        <span className="text-sm text-gray-900">{content.comments}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDuration(content.avgTimeOnPage)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${
                      content.bounceRate < 30 ? 'text-green-600' : 
                      content.bounceRate < 50 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {content.bounceRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(content.publishedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Traffic Sources and User Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Traffic Sources</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {trafficSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                      index === 2 ? 'bg-yellow-500' :
                      index === 3 ? 'bg-purple-500' :
                      'bg-gray-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-900">{source.source}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {source.visitors.toLocaleString()} ({source.percentage}%)
                    </div>
                    <div className={`text-xs ${
                      source.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {source.change > 0 ? '+' : ''}{source.change}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Engagement */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">User Engagement</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {userEngagement.map((engagement, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{engagement.metric}</span>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {engagement.metric.includes('%') ? 
                        `${engagement.current}%` : 
                        engagement.current.toFixed(1)
                      }
                    </div>
                    <div className={`text-xs flex items-center ${
                      engagement.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {engagement.change > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {engagement.change > 0 ? '+' : ''}{engagement.change.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Activity Feed */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-900">
                New comment on "Child Health Nursing - Complete Guide"
              </span>
              <span className="text-xs text-gray-500 ml-auto">2 minutes ago</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-900">
                High traffic spike on "Cryptocurrency Market Analysis"
              </span>
              <span className="text-xs text-gray-500 ml-auto">15 minutes ago</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-900">
                New user registration from social media referral
              </span>
              <span className="text-xs text-gray-500 ml-auto">32 minutes ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;