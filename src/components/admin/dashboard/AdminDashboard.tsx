import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import {
  Users,
  FileText,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  BarChart3,
  Settings,
  Bell
} from 'lucide-react';
import { contentManagementService, ServicePage, BlogPost } from '@/services/contentManagementService';
import { stableLinkPaymentService } from '@/services/stableLinkPaymentService';
import toast from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminStats {
  totalUsers: number;
  activeOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingMessages: number;
  totalPages: number;
  publishedPosts: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingMessages: 0,
    totalPages: 0,
    publishedPosts: 0
  });
  const [servicePages, setServicePages] = useState<ServicePage[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServicePage, setSelectedServicePage] = useState<ServicePage | null>(null);
  const [contentBlocks, setContentBlocks] = useState<any[]>([]);
  const [newBlockType, setNewBlockType] = useState<'heading' | 'paragraph' | 'image' | 'video' | 'cta' | 'feature_list' | 'testimonial' | 'faq'>('heading');
  const [newBlockContent, setNewBlockContent] = useState<any>({ text: '' });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load all admin dashboard data
      const [pages, posts] = await Promise.all([
        contentManagementService.getAllServicePages(),
        contentManagementService.getBlogPosts()
      ]);

      setServicePages(pages);
      setBlogPosts(posts);

      // Update stats (in production, fetch from API)
      setStats({
        totalUsers: 156,
        activeOrders: 23,
        pendingOrders: 8,
        completedOrders: 134,
        totalRevenue: 45620.50,
        monthlyRevenue: 8940.25,
        pendingMessages: 12,
        totalPages: pages.length,
        publishedPosts: posts.filter(p => p.status === 'published').length
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadServicePageContent = async (slug: string) => {
    try {
      const page = await contentManagementService.getServicePage(slug);
      setSelectedServicePage(page);
      if (page) {
        // Fetch content blocks
        const blocksRes = await d1Client.from('content_blocks').select('*')
          .eq('page_id', page.id)
          .order('order', { ascending: true });
        setContentBlocks(blocksRes.data || []);
      }
    } catch (error) {
      console.error('Error loading service page:', error);
      toast.error('Failed to load service page');
    }
  };

  const addContentBlock = async () => {
    if (!selectedServicePage || !newBlockType || Object.keys(newBlockContent).length === 0) {
      toast.error('Please select a block type and provide content');
      return;
    }

    try {
      const blockData = {
        type: newBlockType,
        content: newBlockContent,
        order: contentBlocks.length,
        is_visible: true
      };

      const newBlock = await contentManagementService.addContentBlock(selectedServicePage.id, blockData);

      // Refresh content blocks
      const blocksRes = await d1Client.from('content_blocks').select('*')
        .eq('page_id', selectedServicePage.id)
        .order('order', { ascending: true });
      setContentBlocks(blocksRes.data || []);

      // Reset form
      setNewBlockType('heading');
      setNewBlockContent({ text: '' });

      toast.success('Content block added successfully');
    } catch (error) {
      console.error('Error adding content block:', error);
      toast.error('Failed to add content block');
    }
  };

  const updateContentBlock = async (blockId: string, updates: Partial<any>) => {
    try {
      await contentManagementService.updateContentBlock(blockId, updates);

      // Refresh content blocks
      const blocksRes = await d1Client.from('content_blocks').select('*')
        .eq('page_id', selectedServicePage!.id)
        .order('order', { ascending: true });
      setContentBlocks(blocksRes.data || []);

      toast.success('Content block updated successfully');
    } catch (error) {
      console.error('Error updating content block:', error);
      toast.error('Failed to update content block');
    }
  };

  const deleteContentBlock = async (blockId: string) => {
    if (!confirm('Are you sure you want to delete this content block?')) return;

    try {
      await contentManagementService.deleteContentBlock(blockId);

      // Refresh content blocks
      const blocksRes = await d1Client.from('content_blocks').select('*')
        .eq('page_id', selectedServicePage!.id)
        .order('order', { ascending: true });
      setContentBlocks(blocksRes.data || []);

      toast.success('Content block deleted successfully');
    } catch (error) {
      console.error('Error deleting content block:', error);
      toast.error('Failed to delete content block');
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: string;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, change, icon, color }) => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          {typeof value === 'number' && title.includes('Revenue')
            ? `$${value.toLocaleString()}`
            : value.toLocaleString()}
        </div>
        {change && (
          <p className={`text-sm mt-2 ${
            change.startsWith('+') ? 'text-green-600' : 'text-red-600'
          }`}>
            {change} vs last month
          </p>
        )}
      </CardContent>
      <CardFooter>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </CardFooter>
    </Card>
  );

  const TabButton: React.FC<{
    id: string;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }> = ({ id, label, icon, count }) => (
    <TabsTrigger value={id} className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
        {count !== undefined && (
          <span className={`ml-1 px-2 py-1 text-xs rounded-full bg-blue-200 text-blue-800`}>
            {count}
          </span>
        )}
      </div>
    </TabsTrigger>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.fullName || 'Administrator'}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="h-5 w-5" />
                {stats.pendingMessages > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {stats.pendingMessages}
                  </span>
                )}
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            change="+12%"
            icon={<Users className="h-6 w-6 text-blue-600" />}
            color="bg-blue-100"
          />
          <StatCard
            title="Active Orders"
            value={stats.activeOrders}
            change="+8%"
            icon={<FileText className="h-6 w-6 text-green-600" />}
            color="bg-green-100"
          />
          <StatCard
            title="Monthly Revenue"
            value={stats.monthlyRevenue}
            change="+23%"
            icon={<DollarSign className="h-6 w-6 text-purple-600" />}
            color="bg-purple-100"
          />
          <StatCard
            title="Pending Messages"
            value={stats.pendingMessages}
            icon={<MessageSquare className="h-6 w-6 text-orange-600" />}
            color="bg-orange-100"
          />
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
            <TabButton id="overview" label="Overview" icon={<BarChart3 className="h-4 w-4" />} />
            <TabButton id="orders" label="Orders" icon={<FileText className="h-4 w-4" />} count={stats.activeOrders} />
            <TabButton id="users" label="Users" icon={<Users className="h-4 w-4" />} count={stats.totalUsers} />
            <TabButton id="pages" label="Pages" icon={<Edit className="h-4 w-4" />} count={stats.totalPages} />
            <TabButton id="blog" label="Blog" icon={<FileText className="h-4 w-4" />} count={stats.publishedPosts} />
            <TabButton id="messages" label="Messages" icon={<MessageSquare className="h-4 w-4" />} count={stats.pendingMessages} />
            <TabButton id="analytics" label="Analytics" icon={<TrendingUp className="h-4 w-4" />} />
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                  <div className="space-y-3">
                    {[
                      { id: '#12345', client: 'John Doe', service: 'Essay Writing', status: 'pending', amount: 150 },
                      { id: '#12346', client: 'Jane Smith', service: 'Dissertation', status: 'in-progress', amount: 800 },
                      { id: '#12347', client: 'Mike Johnson', service: 'Report', status: 'completed', amount: 200 }
                    ].map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{order.id}</p>
                          <p className="text-sm text-gray-600">{order.client} • {order.service}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${order.amount}</p>
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => setActiveTab('pages')}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Service Page
                    </Button>
                    <Button
                      onClick={() => setActiveTab('blog')}
                      className="w-full"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      New Blog Post
                    </Button>
                    <Button
                      onClick={() => setActiveTab('messages')}
                      className="w-full"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Check Messages
                    </Button>
                    <Button
                      onClick={() => setActiveTab('analytics')}
                      className="w-full"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pages" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Service Pages</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Page
              </Button>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search pages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicePages
                .filter(page =>
                  page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  page.slug.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((page) => (
                  <Card key={page.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">{page.title}</CardTitle>
                      <CardDescription className="text-xs">/{page.slug}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-2">Status: {page.isPublished ? 'Published' : 'Draft'}</p>
                      <p className="text-xs text-gray-500">Updated: {new Date(page.updatedAt).toLocaleDateString()}</p>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>

            {/* Content Management Tab */}
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Content Management</h3>
                {selectedServicePage && (
                  <Button onClick={() => setSelectedServicePage(null)}>
                    Back to List
                  </Button>
                )}
              </div>

              {!selectedServicePage ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {servicePages.map((page) => (
                    <Card key={page.id} onClick={() => loadServicePageContent(page.slug)}>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">{page.title}</CardTitle>
                        <CardDescription className="text-xs">/{page.slug}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">Blocks: {page.contentBlocks.length}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedServicePage.title}</CardTitle>
                      <CardDescription>/{selectedServicePage.slug}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {contentBlocks.map((block, index) => (
                          <div key={block.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-medium capitalize">{block.type}</span>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => {
                                  // Edit block logic
                                }}>
                                  Edit
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => deleteContentBlock(block.id)}>
                                  Delete
                                </Button>
                              </div>
                            </div>
                            <pre className="text-xs bg-gray-50 p-2 rounded text-wrap">{JSON.stringify(block.content, null, 2)}</pre>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="flex gap-4">
                        <select
                          value={newBlockType}
                          onChange={(e) => setNewBlockType(e.target.value as any)}
                          className="border rounded p-2"
                        >
                          <option value="heading">Heading</option>
                          <option value="paragraph">Paragraph</option>
                          <option value="image">Image</option>
                          <option value="cta">Call to Action</option>
                          <option value="feature_list">Feature List</option>
                          <option value="testimonial">Testimonial</option>
                          <option value="faq">FAQ</option>
                          <option value="video">Video</option>
                        </select>
                        <Input
                          placeholder="Content for new block"
                          value={JSON.stringify(newBlockContent)}
                          onChange={(e) => setNewBlockContent(JSON.parse(e.target.value || '{}'))}
                          className="flex-1"
                        />
                        <Button onClick={addContentBlock}>
                          Add Block
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="blog">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Blog Posts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogPosts.slice(0, 9).map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium line-clamp-1">{post.title}</CardTitle>
                      <CardDescription className="text-xs">/{post.slug}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-2">{post.excerpt}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {post.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">Published: {new Date(post.publishedAt).toLocaleDateString()}</p>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Orders</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: stats.activeOrders }, (_, i) => i + 1).map((orderId) => (
                  <Card key={orderId}>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Order #{orderId}</CardTitle>
                      <CardDescription>Active Order</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">Client Name</p>
                      <p className="text-sm text-gray-600">Service: Consulting</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Users</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: stats.totalUsers }, (_, i) => i + 1).map((userId) => (
                  <Card key={userId}>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">User #{userId}</CardTitle>
                      <CardDescription>Active User</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">john.doe@example.com</p>
                      <p className="text-sm text-gray-600">Role: Client</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Messages</h3>
              <div className="space-y-4">
                {Array.from({ length: stats.pendingMessages }, (_, i) => i + 1).map((messageId) => (
                  <div key={messageId} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3 mb-2">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Support Message #{messageId}</p>
                        <p className="text-xs text-gray-500">New inquiry regarding service</p>
                      </div>
                      <span className="text-xs text-gray-500">2 min ago</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Hello, I have a question about...</p>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm">
                        Reply
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-gray-900">12,345</p>
                    <p className="text-sm text-gray-600">+12% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">New Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-gray-900">23</p>
                    <p className="text-sm text-green-600">+8%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-gray-900">$45,620.50</p>
                    <p className="text-sm text-purple-600">+23%</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
