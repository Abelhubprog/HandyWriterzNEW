import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Search, Filter, Calendar, Tag, User, Settings, Save, X } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';
import { cloudflareDb } from '@/lib/cloudflare';

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  type: 'post' | 'page' | 'service';
  status: 'draft' | 'published' | 'archived';
  category: string;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  featuredImage?: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  readingTime: number;
  views: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  postCount: number;
}

export default function ContentManagementSystem() {
  const { user } = useUser();
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Sample data - replace with actual API calls
  useEffect(() => {
    fetchContents();
    fetchCategories();
  }, []);

  const fetchContents = async () => {
    setLoading(true);
    try {
      // Get posts from Cloudflare D1
      const postsResult = await cloudflareDb.prepare(`
        SELECT 
          p.id,
          p.title,
          p.slug,
          p.content,
          p.status,
          p.category,
          p.tags,
          p.created_at,
          p.updated_at,
          p.published_at,
          p.featured_image,
          p.excerpt,
          p.seo_title,
          p.seo_description,
          u.name as author_name,
          COALESCE(a.view_count, 0) as views
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        LEFT JOIN analytics a ON p.id = a.post_id
        ORDER BY p.created_at DESC
      `).all();
      
      // Transform to ContentItem format
      const contentItems: ContentItem[] = (postsResult.results || []).map((post: any) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        type: 'post' as const,
        status: post.status as any,
        category: post.category,
        tags: post.tags ? JSON.parse(post.tags) : [],
        author: post.author_name || 'Unknown',
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        publishedAt: post.published_at,
        featuredImage: post.featured_image,
        excerpt: post.excerpt || '',
        seoTitle: post.seo_title || '',
        seoDescription: post.seo_description || '',
        readingTime: Math.ceil((post.content?.length || 0) / 1000),
        views: post.views || 0
      }));
      
      setContents(contentItems);
    } catch (error) {
      toast.error('Failed to fetch contents');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Get categories from Cloudflare D1
      const categoriesResult = await cloudflareDb.prepare(`
        SELECT 
          c.id,
          c.name,
          c.slug,
          c.description,
          s.title as service_name,
          COUNT(p.id) as post_count
        FROM categories c
        LEFT JOIN services s ON c.service_id = s.id
        LEFT JOIN posts p ON p.category = c.name
        GROUP BY c.id
        ORDER BY c.name
      `).all();
      
      // Transform to Category format
      const categories: Category[] = (categoriesResult.results || []).map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description || (cat.service_name ? `${cat.service_name} related content` : 'General content'),
        postCount: cat.post_count || 0
      }));
      
      setCategories(categories);
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  const handleCreate = () => {
    const newContent: ContentItem = {
      id: '',
      title: 'New Content',
      slug: '',
      content: '',
      type: 'post',
      status: 'draft',
      category: '',
      tags: [],
      author: user?.fullName || 'Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      excerpt: '',
      seoTitle: '',
      seoDescription: '',
      readingTime: 0,
      views: 0
    };
    
    setSelectedContent(newContent);
    setIsEditing(true);
  };

  const handleEdit = (content: ContentItem) => {
    setSelectedContent(content);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await cloudflareDb.prepare(`
          DELETE FROM posts WHERE id = ?
        `).bind(id).run();
        
        setContents(contents.filter(c => c.id !== id));
        toast.success('Content deleted successfully');
      } catch (error) {
        toast.error('Failed to delete content');
      }
    }
  };

  const handleSave = async (content: ContentItem) => {
    try {
      setLoading(true);
      
      if (content.id) {
        // Update existing content
        await cloudflareDb.prepare(`
          UPDATE posts SET
            title = ?,
            slug = ?,
            content = ?,
            status = ?,
            category = ?,
            tags = ?,
            excerpt = ?,
            seo_title = ?,
            seo_description = ?,
            updated_at = datetime('now')
          WHERE id = ?
        `).bind(
          content.title,
          content.slug,
          content.content,
          content.status,
          content.category,
          JSON.stringify(content.tags),
          content.excerpt,
          content.seoTitle,
          content.seoDescription,
          content.id
        ).run();
        
        setContents(contents.map(c => c.id === content.id ? content : c));
        toast.success('Content updated successfully');
      } else {
        // Create new content
        const result = await cloudflareDb.prepare(`
          INSERT INTO posts (
            title, slug, content, status, category, tags,
            excerpt, seo_title, seo_description, author_id,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `).bind(
          content.title,
          content.slug,
          content.content,
          content.status,
          content.category,
          JSON.stringify(content.tags),
          content.excerpt,
          content.seoTitle,
          content.seoDescription,
          user?.id || 'admin'
        ).run();
        
        const newContent = { ...content, id: result.meta.last_row_id.toString() };
        setContents([newContent, ...contents]);
        toast.success('Content created successfully');
      }
      
      setIsEditing(false);
      setSelectedContent(null);
    } catch (error) {
      toast.error('Failed to save content');
    } finally {
      setLoading(false);
    }
  };

  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || content.status === filterStatus;
    const matchesType = filterType === 'all' || content.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      draft: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors]}`}>
        {status}
      </span>
    );
  };

  const ContentEditor = ({ 
    content, 
    categories, 
    onSave, 
    onCancel 
  }: {
    content: ContentItem;
    categories: Category[];
    onSave: (content: ContentItem) => void;
    onCancel: () => void;
  }) => {
    const [editedContent, setEditedContent] = useState(content);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {content.id ? 'Edit Content' : 'Create New Content'}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => onSave(editedContent)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={editedContent.title}
                onChange={(e) => setEditedContent({ ...editedContent, title: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter content title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={editedContent.content}
                onChange={(e) => setEditedContent({ ...editedContent, content: e.target.value })}
                rows={15}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Write your content here..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
              <textarea
                value={editedContent.excerpt}
                onChange={(e) => setEditedContent({ ...editedContent, excerpt: e.target.value })}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of the content..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={editedContent.status}
                onChange={(e) => setEditedContent({ ...editedContent, status: e.target.value as ContentItem['status'] })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={editedContent.type}
                onChange={(e) => setEditedContent({ ...editedContent, type: e.target.value as ContentItem['type'] })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="post">Post</option>
                <option value="page">Page</option>
                <option value="service">Service</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={editedContent.category}
                onChange={(e) => setEditedContent({ ...editedContent, category: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select category...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SEO Title</label>
              <input
                type="text"
                value={editedContent.seoTitle}
                onChange={(e) => setEditedContent({ ...editedContent, seoTitle: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="SEO optimized title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SEO Description</label>
              <textarea
                value={editedContent.seoDescription}
                onChange={(e) => setEditedContent({ ...editedContent, seoDescription: e.target.value })}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="SEO meta description..."
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isEditing && selectedContent) {
    return (
      <ContentEditor
        content={selectedContent}
        categories={categories}
        onSave={handleSave}
        onCancel={() => { setIsEditing(false); setSelectedContent(null); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Content</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="post">Posts</option>
            <option value="page">Pages</option>
            <option value="service">Services</option>
          </select>
        </div>
      </div>

      {/* Content List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContents.map((content) => (
                <tr key={content.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{content.title}</div>
                      <div className="text-sm text-gray-500">{content.excerpt.substring(0, 60)}...</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">{content.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={content.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {content.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {content.views.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(content.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(content)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(content.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}