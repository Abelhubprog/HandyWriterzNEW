import React, { useState, useEffect } from 'react';
import { contentAnalyticsService } from '@/services/contentAnalyticsService';
import type { ContentAnalytics as IContentAnalytics, AnalyticsSummary, AuditLogEntry } from '@/services/contentAnalyticsService';

interface Props {
  postId: string;
}

const ContentAnalytics: React.FC<Props> = ({ postId }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummary | null>(null);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, [postId, dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const summary = await contentAnalyticsService.getAnalyticsSummary(postId);
      const log = await contentAnalyticsService.getAuditLog(postId);
      setAnalyticsData(summary);
      setAuditLog(log);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  if (loading) {
    return <div className="p-4">Loading analytics data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!analyticsData) {
    return <div className="p-4">No analytics data available</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Date Range Filter */}
      <div className="mb-6">
        <div className="flex space-x-4">
          {[
            { value: '7d', label: 'Last 7 Days' },
            { value: '30d', label: 'Last 30 Days' },
            { value: '90d', label: 'Last 90 Days' },
            { value: 'all', label: 'All Time' }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setDateRange(value as typeof dateRange)}
              className={`px-4 py-2 rounded ${
                dateRange === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-sm font-medium text-gray-500">Total Views</h3>
          <p className="mt-1 text-2xl font-semibold">{formatNumber(analyticsData.totalViews)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-sm font-medium text-gray-500">Unique Visitors</h3>
          <p className="mt-1 text-2xl font-semibold">{formatNumber(analyticsData.totalUniqueVisitors)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-sm font-medium text-gray-500">Avg. Time on Page</h3>
          <p className="mt-1 text-2xl font-semibold">{analyticsData.avgTimeOnPage}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-sm font-medium text-gray-500">Bounce Rate</h3>
          <p className="mt-1 text-2xl font-semibold">{formatPercentage(analyticsData.avgBounceRate)}</p>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-semibold mb-4">Top Referrers</h3>
          <div className="space-y-2">
            {analyticsData.topReferrers.map(({ source, count }) => (
              <div key={source} className="flex justify-between items-center">
                <span className="text-gray-600">{source}</span>
                <span className="font-medium">{formatNumber(count)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-semibold mb-4">Device Breakdown</h3>
          <div className="space-y-2">
            {analyticsData.deviceBreakdown.map(({ device, percentage }) => (
              <div key={device} className="flex justify-between items-center">
                <span className="text-gray-600">{device}</span>
                <span className="font-medium">{formatPercentage(percentage)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trends Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Traffic Trends</h3>
        <div className="bg-gray-50 p-4 rounded">
          <div className="h-64">
            {/* Chart would go here - implement with your preferred charting library */}
            {analyticsData.trendsData.map((dataPoint) => (
              <div key={dataPoint.date} className="text-sm text-gray-600">
                {new Date(dataPoint.date).toLocaleDateString()}: {formatNumber(dataPoint.views)} views
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Engagement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-sm font-medium text-gray-500">Total Likes</h3>
          <p className="mt-1 text-2xl font-semibold">{formatNumber(analyticsData.totalLikes)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-sm font-medium text-gray-500">Total Shares</h3>
          <p className="mt-1 text-2xl font-semibold">{formatNumber(analyticsData.totalShares)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-sm font-medium text-gray-500">Click-Through Rate</h3>
          <p className="mt-1 text-2xl font-semibold">{formatPercentage(analyticsData.avgClickThroughRate)}</p>
        </div>
      </div>

      {/* Audit Log */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Content History</h3>
        <div className="bg-gray-50 p-4 rounded">
          <div className="space-y-4">
            {auditLog.map((entry) => (
              <div
                key={entry.id}
                className="border-b border-gray-200 last:border-0 pb-4 last:pb-0"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block px-2 py-1 text-sm rounded mr-2" style={{
                      backgroundColor: {
                        create: '#A7F3D0',
                        update: '#FDE68A',
                        delete: '#FCA5A5',
                        publish: '#93C5FD',
                        unpublish: '#E5E7EB',
                        archive: '#CBD5E1'
                      }[entry.action]
                    }}>
                      {entry.action}
                    </span>
                    <span className="text-gray-600 text-sm">
                      {new Date(entry.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                {entry.changes && (
                  <div className="mt-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      {entry.changes.old && (
                        <div>
                          <h4 className="font-medium text-gray-700">Previous Version</h4>
                          <pre className="mt-1 text-gray-600 whitespace-pre-wrap">
                            {JSON.stringify(entry.changes.old, null, 2)}
                          </pre>
                        </div>
                      )}
                      {entry.changes.new && (
                        <div>
                          <h4 className="font-medium text-gray-700">New Version</h4>
                          <pre className="mt-1 text-gray-600 whitespace-pre-wrap">
                            {JSON.stringify(entry.changes.new, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentAnalytics;
