import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  FileText,
  Image,
  Tag,
  User,
  MoreVertical,
  ThumbsUp,
  MessageSquare,
  BarChart3,
  Globe,
  Settings,
  Archive,
  Copy,
  Download
} from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  serviceType: string;
  serviceName: string;
  category?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  featuredImage?: string;
  publishedAt?: string;
  scheduledFor?: string;
  createdAt: string;
  updatedAt: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  tags: string[];
}

interface Service {
  id: string;
  name: string;
  slug: string;
  color: string;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  serviceId: string;
  postsCount: number;
}

const ContentManagement: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Mock data for demonstration
  const mockServices: Service[] = [
    { id: '1', name: 'Adult Health Nursing', slug: 'adult-health-nursing', color: '#3B82F6', isActive: true },
    { id: '2', name: 'Mental Health Nursing', slug: 'mental-health-nursing', color: '#8B5CF6', isActive: true },
    { id: '3', name: 'Child Nursing', slug: 'child-nursing', color: '#F59E0B', isActive: true },
    { id: '4', name: 'Special Education', slug: 'special-education', color: '#10B981', isActive: true },
    { id: '5', name: 'Social Work', slug: 'social-work', color: '#EF4444', isActive: true }
  ];

  const mockCategories: Category[] = [
    { id: '1', name: 'Clinical Practice', slug: 'clinical-practice', serviceId: '1', postsCount: 15 },
    { id: '2', name: 'Patient Care', slug: 'patient-care', serviceId: '1', postsCount: 12 },
    { id: '3', name: 'Evidence-Based Practice', slug: 'evidence-based-practice', serviceId: '1', postsCount: 8 },
    { id: '4', name: 'Assessment Tools', slug: 'assessment-tools', serviceId: '2', postsCount: 10 },
    { id: '5', name: 'Therapeutic Interventions', slug: 'therapeutic-interventions', serviceId: '2', postsCount: 7 }
  ];

  const mockContent: ContentItem[] = [
    {
      id: '1',
      title: 'Advanced Pain Management Techniques in Adult Health Nursing',
      slug: 'advanced-pain-management-techniques',
      excerpt: 'Comprehensive guide to modern pain management approaches for adult patients...',
      status: 'published',
      serviceType: '1',
      serviceName: 'Adult Health Nursing',
      category: 'Clinical Practice',
      author: {
        id: 'author1',
        name: 'Dr. Sarah Mitchell',
        avatar: '/avatars/sarah.jpg'
      },
      featuredImage: '/images/pain-management.jpg',
      publishedAt: '2024-03-10T10:00:00Z',
      createdAt: '2024-03-08T09:00:00Z',
      updatedAt: '2024-03-10T10:00:00Z',
      viewsCount: 1234,
      likesCount: 45,
      commentsCount: 12,
      tags: ['pain-management', 'nursing', 'clinical-practice']
    },
    {
      id: '2',
      title: 'Mental Health Assessment in Primary Care Settings',
      slug: 'mental-health-assessment-primary-care',
      excerpt: 'Essential assessment techniques for identifying mental health concerns...',
      status: 'draft',
      serviceType: '2',
      serviceName: 'Mental Health Nursing',
      category: 'Assessment Tools',
      author: {
        id: 'author2',
        name: 'Dr. Michael Chen',
        avatar: '/avatars/michael.jpg'
      },
      createdAt: '2024-03-12T14:30:00Z',
      updatedAt: '2024-03-12T16:45:00Z',
      viewsCount: 0,
      likesCount: 0,
      commentsCount: 0,
      tags: ['mental-health', 'assessment', 'primary-care']
    },
    {
      id: '3',
      title: 'Pediatric Medication Administration: Safety Protocols',
      slug: 'pediatric-medication-administration-safety',
      excerpt: 'Critical safety protocols for administering medications to children...',
      status: 'scheduled',
      serviceType: '3',
      serviceName: 'Child Nursing',
      category: 'Patient Care',
      author: {
        id: 'author3',
        name: 'Dr. Emily Rodriguez',
        avatar: '/avatars/emily.jpg'
      },
      featuredImage: '/images/pediatric-care.jpg',
      scheduledFor: '2024-03-15T08:00:00Z',
      createdAt: '2024-03-11T11:20:00Z',
      updatedAt: '2024-03-12T09:15:00Z',
      viewsCount: 0,
      likesCount: 0,
      commentsCount: 0,
      tags: ['pediatric', 'medication', 'safety']
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        setServices(mockServices);
        setCategories(mockCategories);
        setContent(mockContent);
      } catch (error) {
        toast.error('Failed to load content data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredContent = content.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesService = selectedService === 'all' || item.serviceType === selectedService;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesService && matchesStatus && matchesCategory;
  });

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredContent.length) {
      setSelectedItems(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedItems(new Set(filteredContent.map(item => item.id)));
      setShowBulkActions(true);
    }
  };

  const handleBulkAction = async (action: string) => {
    try {
      const selectedIds = Array.from(selectedItems);
      
      switch (action) {
        case 'publish':
          // TODO: Implement bulk publish
          toast.success(`Published ${selectedIds.length} items`);
          break;
        case 'draft':
          // TODO: Implement bulk draft
          toast.success(`Moved ${selectedIds.length} items to draft`);
          break;
        case 'archive':
          // TODO: Implement bulk archive
          toast.success(`Archived ${selectedIds.length} items`);
          break;
        case 'delete':
          if (confirm(`Are you sure you want to delete ${selectedIds.length} items?`)) {
            // TODO: Implement bulk delete
            toast.success(`Deleted ${selectedIds.length} items`);
          }
          break;
      }
      
      setSelectedItems(new Set());
      setShowBulkActions(false);
    } catch (error) {
      toast.error('Failed to perform bulk action');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this content?')) {
      try {
        // TODO: Implement delete
        setContent(prev => prev.filter(item => item.id !== id));
        toast.success('Content deleted successfully');
      } catch (error) {
        toast.error('Failed to delete content');
      }
    }
  };

  const handleDuplicateItem = async (id: string) => {
    try {
      // TODO: Implement duplicate
      const original = content.find(item => item.id === id);
      if (original) {
        const duplicate = {
          ...original,
          id: 'dup_' + Date.now(),
          title: original.title + ' (Copy)',
          slug: original.slug + '-copy',
          status: 'draft' as const,
          publishedAt: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          viewsCount: 0,
          likesCount: 0,
          commentsCount: 0
        };
        setContent(prev => [duplicate, ...prev]);
        toast.success('Content duplicated successfully');
      }
    } catch (error) {
      toast.error('Failed to duplicate content');
    }
  };

  const getStatusBadge = (status: ContentItem['status']) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: Edit },
      published: { color: 'bg-green-100 text-green-800', icon: Globe },
      scheduled: { color: 'bg-blue-100 text-blue-800', icon: Calendar },
      archived: { color: 'bg-yellow-100 text-yellow-800', icon: Archive }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getServiceColor = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service?.color || '#6B7280';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
              <p className="text-gray-600">Manage content for all service pages</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/admin/content/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Content
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Services</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {categories
                  .filter(cat => selectedService === 'all' || cat.serviceId === selectedService)
                  .map(category => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
              </select>
              
              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {viewMode === 'list' ? <BarChart3 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {selectedItems.size} item(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('publish')}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Publish
                </button>
                <button
                  onClick={() => handleBulkAction('draft')}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                >
                  Draft
                </button>
                <button
                  onClick={() => handleBulkAction('archive')}
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                >
                  Archive
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedItems.size === filteredContent.length && filteredContent.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContent.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.featuredImage && (
                            <img
                              src={item.featuredImage}
                              alt=""
                              className="h-10 w-10 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {item.title}
                            </p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {item.excerpt}
                            </p>
                            <div className="flex gap-1 mt-1">
                              {item.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                                  <Tag className="h-2 w-2" />
                                  {tag}
                                </span>
                              ))}
                              {item.tags.length > 2 && (
                                <span className="text-xs text-gray-500">+{item.tags.length - 2}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: getServiceColor(item.serviceType) }}
                          ></div>
                          <span className="text-sm text-gray-900">{item.serviceName}</span>
                        </div>
                        {item.category && (
                          <p className="text-xs text-gray-500">{item.category}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(item.status)}
                        {item.scheduledFor && (
                          <p className="text-xs text-gray-500 mt-1">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {new Date(item.scheduledFor).toLocaleDateString()}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {item.viewsCount}
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {item.likesCount}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {item.commentsCount}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          by {item.author.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/admin/content/${item.id}`}
                            className="p-1 text-blue-600 hover:text-blue-700"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          
                          <button
                            onClick={() => window.open(`/services/${services.find(s => s.id === item.serviceType)?.slug}`, '_blank')}
                            className="p-1 text-green-600 hover:text-green-700"
                            title="View Live"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          <div className="relative group">
                            <button className="p-1 text-gray-600 hover:text-gray-700">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => handleDuplicateItem(item.id)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Copy className="h-4 w-4 inline mr-2" />
                                  Duplicate
                                </button>
                                <button
                                  onClick={() => {
                                    // TODO: Export functionality
                                    toast.success('Export feature coming soon');
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Download className="h-4 w-4 inline mr-2" />
                                  Export
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 inline mr-2" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredContent.map((item) => (
                <div key={item.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    {item.featuredImage && (
                      <img
                        src={item.featuredImage}
                        alt=""
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="absolute top-2 left-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="rounded border-gray-300"
                      />
                    </div>
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(item.status)}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: getServiceColor(item.serviceType) }}
                      ></div>
                      <span className="text-sm text-gray-600">{item.serviceName}</span>
                    </div>
                    
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {item.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {item.viewsCount}
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {item.likesCount}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {item.commentsCount}
                        </div>
                      </div>
                      
                      <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <img
                          src={item.author.avatar || '/placeholder-avatar.png'}
                          alt=""
                          className="h-5 w-5 rounded-full"
                        />
                        <span className="text-xs text-gray-600">{item.author.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/content/${item.id}`}
                          className="p-1 text-blue-600 hover:text-blue-700"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        
                        <button
                          onClick={() => window.open(`/services/${services.find(s => s.id === item.serviceType)?.slug}`, '_blank')}
                          className="p-1 text-green-600 hover:text-green-700"
                          title="View Live"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {filteredContent.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No content found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedService !== 'all' || selectedStatus !== 'all' || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first piece of content.'}
              </p>
              <div className="mt-6">
                <Link
                  to="/admin/content/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Content
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;