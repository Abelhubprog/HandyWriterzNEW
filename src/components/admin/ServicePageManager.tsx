import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Eye, 
  Copy, 
  Layout, 
  Image, 
  Video, 
  FileText, 
  Tag, 
  Calendar,
  Globe,
  Settings,
  ArrowUp,
  ArrowDown,
  X,
  Layers,
  Code,
  Quote,
  Star,
  Heart,
  MessageSquare
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';
import { useServiceContent } from '../../hooks/useServiceContent';
import { ServiceType, SERVICE_CONFIGS } from '../../types/content';
import ServiceContentEditor from './ServiceContentEditor';

interface ServicePageSection {
  id: string;
  type: 'hero' | 'content' | 'cta' | 'testimonials' | 'faq' | 'features' | 'pricing';
  title: string;
  content: string;
  media?: {
    type: 'image' | 'video';
    url: string;
    alt?: string;
  };
  order: number;
  isVisible: boolean;
  settings?: Record<string, any>;
}

interface ServicePage {
  id: string;
  title: string;
  slug: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  featuredImage: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  sections: ServicePageSection[];
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
  };
}

const ServicePageManager: React.FC = () => {
  const { user } = useUser();
  const [pages, setPages] = useState<ServicePage[]>([]);
  const [selectedPage, setSelectedPage] = useState<ServicePage | null>(null);
  const [editingSection, setEditingSection] = useState<ServicePageSection | null>(null);
  const [showPageModal, setShowPageModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  // Mock data - Replace with actual Cloudflare D1 API calls
  useEffect(() => {
    fetchServicePages();
  }, []);

  const fetchServicePages = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual Cloudflare D1 API call
      const mockPages: ServicePage[] = [
        {
          id: '1',
          title: 'Child Health Nursing',
          slug: 'child-nursing',
          description: 'Comprehensive child health nursing services and education',
          metaTitle: 'Child Health Nursing - Expert Care & Education',
          metaDescription: 'Professional child health nursing services with expert care and educational resources',
          featuredImage: '/images/child-nursing-hero.jpg',
          category: 'Nursing',
          tags: ['nursing', 'pediatric', 'healthcare', 'education'],
          status: 'published',
          publishedAt: '2024-03-01',
          sections: [
            {
              id: 'hero-1',
              type: 'hero',
              title: 'Expert Child Health Nursing',
              content: 'Providing comprehensive pediatric nursing care with specialized expertise in child health and development.',
              media: {
                type: 'image',
                url: '/images/child-nursing-hero.jpg',
                alt: 'Child health nursing care'
              },
              order: 1,
              isVisible: true
            },
            {
              id: 'content-1',
              type: 'content',
              title: 'Our Services',
              content: 'We offer a full range of pediatric nursing services including routine check-ups, immunizations, developmental assessments, and specialized care for chronic conditions.',
              order: 2,
              isVisible: true
            }
          ],
          createdAt: '2024-02-15',
          updatedAt: '2024-03-01',
          author: {
            id: 'admin-1',
            name: 'Admin User'
          }
        },
        {
          id: '2',
          title: 'Adult Health Nursing',
          slug: 'adult-health-nursing',
          description: 'Comprehensive adult health nursing services',
          metaTitle: 'Adult Health Nursing - Professional Healthcare',
          metaDescription: 'Expert adult health nursing services for comprehensive healthcare',
          featuredImage: '/images/adult-nursing-hero.jpg',
          category: 'Nursing',
          tags: ['nursing', 'adult care', 'healthcare'],
          status: 'published',
          publishedAt: '2024-02-20',
          sections: [],
          createdAt: '2024-02-10',
          updatedAt: '2024-02-20',
          author: {
            id: 'admin-1',
            name: 'Admin User'
          }
        }
      ];
      setPages(mockPages);
    } catch (error) {
      toast.error('Failed to load service pages');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = async (pageData: Partial<ServicePage>) => {
    try {
      // TODO: Replace with actual Cloudflare D1 API call
      const newPage: ServicePage = {
        id: Date.now().toString(),
        title: pageData.title || '',
        slug: pageData.slug || '',
        description: pageData.description || '',
        metaTitle: pageData.metaTitle || '',
        metaDescription: pageData.metaDescription || '',
        featuredImage: pageData.featuredImage || '',
        category: pageData.category || '',
        tags: pageData.tags || [],
        status: 'draft',
        sections: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          id: user?.id || '',
          name: user?.firstName + ' ' + user?.lastName || 'Admin'
        }
      };

      setPages(prev => [...prev, newPage]);
      toast.success('Service page created successfully');
      setShowPageModal(false);
    } catch (error) {
      toast.error('Failed to create service page');
    }
  };

  const handleUpdatePage = async (pageId: string, updates: Partial<ServicePage>) => {
    try {
      // TODO: Replace with actual Cloudflare D1 API call
      setPages(prev => prev.map(page => 
        page.id === pageId 
          ? { ...page, ...updates, updatedAt: new Date().toISOString() }
          : page
      ));
      toast.success('Service page updated successfully');
    } catch (error) {
      toast.error('Failed to update service page');
    }
  };

  const handleAddSection = async (pageId: string, sectionData: Partial<ServicePageSection>) => {
    try {
      const newSection: ServicePageSection = {
        id: Date.now().toString(),
        type: sectionData.type || 'content',
        title: sectionData.title || '',
        content: sectionData.content || '',
        media: sectionData.media,
        order: sectionData.order || 1,
        isVisible: true,
        settings: sectionData.settings || {}
      };

      setPages(prev => prev.map(page => 
        page.id === pageId 
          ? { 
              ...page, 
              sections: [...page.sections, newSection].sort((a, b) => a.order - b.order),
              updatedAt: new Date().toISOString()
            }
          : page
      ));

      if (selectedPage?.id === pageId) {
        setSelectedPage(prev => prev ? {
          ...prev,
          sections: [...prev.sections, newSection].sort((a, b) => a.order - b.order)
        } : null);
      }

      toast.success('Section added successfully');
      setShowSectionModal(false);
      setEditingSection(null);
    } catch (error) {
      toast.error('Failed to add section');
    }
  };

  const handleUpdateSection = async (pageId: string, sectionId: string, updates: Partial<ServicePageSection>) => {
    try {
      setPages(prev => prev.map(page => 
        page.id === pageId 
          ? {
              ...page,
              sections: page.sections.map(section =>
                section.id === sectionId ? { ...section, ...updates } : section
              ),
              updatedAt: new Date().toISOString()
            }
          : page
      ));

      if (selectedPage?.id === pageId) {
        setSelectedPage(prev => prev ? {
          ...prev,
          sections: prev.sections.map(section =>
            section.id === sectionId ? { ...section, ...updates } : section
          )
        } : null);
      }

      toast.success('Section updated successfully');
    } catch (error) {
      toast.error('Failed to update section');
    }
  };

  const handleReorderSection = (pageId: string, sectionId: string, direction: 'up' | 'down') => {
    const page = pages.find(p => p.id === pageId);
    if (!page) return;

    const sections = [...page.sections];
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    
    if (sectionIndex === -1) return;
    
    const newIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    // Swap sections
    [sections[sectionIndex], sections[newIndex]] = [sections[newIndex], sections[sectionIndex]];
    
    // Update order values
    sections.forEach((section, index) => {
      section.order = index + 1;
    });

    handleUpdatePage(pageId, { sections });
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch = 
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || page.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || page.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getSectionIcon = (type: ServicePageSection['type']) => {
    switch (type) {
      case 'hero': return <Layout className="w-4 h-4" />;
      case 'content': return <FileText className="w-4 h-4" />;
      case 'cta': return <ArrowUp className="w-4 h-4" />;
      case 'testimonials': return <Quote className="w-4 h-4" />;
      case 'faq': return <FileText className="w-4 h-4" />;
      case 'features': return <Layers className="w-4 h-4" />;
      case 'pricing': return <Tag className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const PageModal: React.FC<{ page?: ServicePage; onClose: () => void; onSave: (data: Partial<ServicePage>) => void }> = ({ 
    page, 
    onClose, 
    onSave 
  }) => {
    const [formData, setFormData] = useState({
      title: page?.title || '',
      slug: page?.slug || '',
      description: page?.description || '',
      metaTitle: page?.metaTitle || '',
      metaDescription: page?.metaDescription || '',
      featuredImage: page?.featuredImage || '',
      category: page?.category || '',
      tags: page?.tags?.join(', ') || '',
      status: page?.status || 'draft'
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave({
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{page ? 'Edit' : 'Create'} Service Page</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  <option value="Nursing">Nursing</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Technology">Technology</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="nursing, healthcare, pediatric"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image URL</label>
              <input
                type="url"
                value={formData.featuredImage}
                onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {page ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
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
        <h1 className="text-2xl font-bold text-gray-900">Service Page Manager</h1>
        <button
          onClick={() => setShowPageModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Page
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="Nursing">Nursing</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Education">Education</option>
            <option value="Technology">Technology</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPages.map((page) => (
          <div key={page.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{page.title}</h3>
                  <p className="text-sm text-gray-600">{page.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  page.status === 'published' ? 'bg-green-100 text-green-800' :
                  page.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {page.status}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span>{page.category}</span>
                <span>{page.sections.length} sections</span>
                <span>{page.tags.length} tags</span>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedPage(page)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  <Edit className="w-3 h-3 inline mr-1" />
                  Edit Content
                </button>
                <button
                  onClick={() => {
                    setSelectedPage(page);
                    setShowPageModal(true);
                  }}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                >
                  <Settings className="w-3 h-3 inline mr-1" />
                  Settings
                </button>
                <button
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  <Eye className="w-3 h-3 inline mr-1" />
                  Preview
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Page Content Editor */}
      {selectedPage && !showPageModal && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedPage.title}</h2>
                <p className="text-gray-600">Manage page sections and content</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingSection({
                    id: '',
                    type: 'content',
                    title: '',
                    content: '',
                    order: selectedPage.sections.length + 1,
                    isVisible: true
                  })}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Section
                </button>
                <button
                  onClick={() => setSelectedPage(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {selectedPage.sections.map((section, index) => (
                <div key={section.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {getSectionIcon(section.type)}
                      <div>
                        <h4 className="font-medium text-gray-900">{section.title || `${section.type} Section`}</h4>
                        <p className="text-sm text-gray-600">Order: {section.order}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReorderSection(selectedPage.id, section.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReorderSection(selectedPage.id, section.id, 'down')}
                        disabled={index === selectedPage.sections.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingSection(section)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this section?')) {
                            const updatedSections = selectedPage.sections.filter(s => s.id !== section.id);
                            handleUpdatePage(selectedPage.id, { sections: updatedSections });
                          }
                        }}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {section.content && (
                    <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
                      {section.content.length > 200 
                        ? section.content.substring(0, 200) + '...' 
                        : section.content
                      }
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Page Modal */}
      {showPageModal && (
        <PageModal
          page={selectedPage || undefined}
          onClose={() => {
            setShowPageModal(false);
            setSelectedPage(null);
          }}
          onSave={(data) => {
            if (selectedPage) {
              handleUpdatePage(selectedPage.id, data);
            } else {
              handleCreatePage(data);
            }
            setShowPageModal(false);
            setSelectedPage(null);
          }}
        />
      )}

      {/* Section Editor Modal */}
      {editingSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingSection.id ? 'Edit' : 'Add'} Section
              </h2>
              <button
                onClick={() => setEditingSection(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Section Type</label>
                <select
                  value={editingSection.type}
                  onChange={(e) => setEditingSection(prev => prev ? { ...prev, type: e.target.value as any } : null)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hero">Hero Section</option>
                  <option value="content">Content Section</option>
                  <option value="cta">Call to Action</option>
                  <option value="testimonials">Testimonials</option>
                  <option value="faq">FAQ Section</option>
                  <option value="features">Features</option>
                  <option value="pricing">Pricing</option>
                </select>
              </div>
              
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                <input
                  type="text"
                  value={editingSection.title}
                  onChange={(e) => setEditingSection(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter section title"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={editingSection.content}
                onChange={(e) => setEditingSection(prev => prev ? { ...prev, content: e.target.value } : null)}
                className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter section content (HTML and markdown supported)"
              />
            </div>

            <div className="mt-6 flex gap-2 justify-end">
              <button
                onClick={() => setEditingSection(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedPage && editingSection) {
                    if (editingSection.id) {
                      handleUpdateSection(selectedPage.id, editingSection.id, editingSection);
                    } else {
                      handleAddSection(selectedPage.id, editingSection);
                    }
                    setEditingSection(null);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4 inline mr-2" />
                Save Section
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicePageManager;