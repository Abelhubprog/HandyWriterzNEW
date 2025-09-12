import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  MessageSquare, 
  Clock, 
  Star,
  Plus,
  Eye
} from 'lucide-react';

const DashboardHome: React.FC = () => {
  const stats = [
    {
      title: 'Total Posts',
      value: '1,234',
      icon: FileText,
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Active Users',
      value: '5,678',
      icon: Users,
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Comments',
      value: '2,456',
      icon: MessageSquare,
      change: '+15%',
      changeType: 'positive' as const
    },
    {
      title: 'Page Views',
      value: '98,765',
      icon: Eye,
      change: '+23%',
      changeType: 'positive' as const
    }
  ];

  const recentPosts = [
    {
      id: 1,
      title: 'Getting Started with Essay Writing',
      status: 'published',
      author: 'Admin',
      date: '2024-01-15',
      views: 1234
    },
    {
      id: 2,
      title: 'Research Methodology Guide',
      status: 'draft',
      author: 'Admin',
      date: '2024-01-14',
      views: 856
    },
    {
      id: 3,
      title: 'Citation Styles Comparison',
      status: 'review',
      author: 'Editor',
      date: '2024-01-13',
      views: 567
    }
  ];

  const quickActions = [
    { title: 'Create New Post', icon: Plus, href: '/admin/content/posts/new' },
    { title: 'View Analytics', icon: TrendingUp, href: '/admin/analytics' },
    { title: 'Manage Users', icon: Users, href: '/admin/users' },
    { title: 'Recent Comments', icon: MessageSquare, href: '/admin/comments' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your content.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Content
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Posts
            </CardTitle>
            <CardDescription>
              Latest content updates and activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{post.title}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>By {post.author}</span>
                      <span>{post.date}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.views}
                      </span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(post.status)}>
                    {post.status}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                View All Posts
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <a href={action.href}>
                    <action.icon className="h-4 w-4 mr-3" />
                    {action.title}
                  </a>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: 'New post published', item: 'Getting Started with Essay Writing', time: '2 hours ago' },
              { action: 'Comment approved', item: 'Research Methodology Guide', time: '4 hours ago' },
              { action: 'User registered', item: 'john.doe@example.com', time: '6 hours ago' },
              { action: 'Post updated', item: 'Citation Styles Comparison', time: '1 day ago' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <span className="font-medium">{activity.action}:</span>
                  <span className="text-gray-600 ml-1">{activity.item}</span>
                </div>
                <span className="text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;