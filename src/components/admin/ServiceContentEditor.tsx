import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';
import {
  Save,
  Eye,
  EyeOff,
  Upload,
  Image,
  Video,
  FileText,
  Tag,
  Calendar,
  Clock,
  Star,
  X,
  Plus,
  Trash2,
  Bold,
  Italic,
  Link,
  Code,
  List,
  Quote
} from 'lucide-react';
import { ServiceContentService } from '../../services/serviceContentService';
import { Post, ServiceType, SERVICE_CONFIGS } from '../../types/content';

interface ServiceContentEditorProps {
  serviceType: ServiceType;
  post?: Post | null;
  onSave?: (post: Post) => void;
  onCancel?: () => void;
  isNew?: boolean;
}

const ServiceContentEditor: React.FC<ServiceContentEditorProps> = ({
  serviceType,
  post,
  onSave,
  onCancel,
  isNew = false
}) => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    category: post?.category || '',
    tags: post?.tags || [],
    featuredImage: post?.featuredImage || '',
    mediaType: post?.mediaType || 'image' as const,
    mediaUrl: post?.mediaUrl || '',
    isFeatured: post?.isFeatured || false,
    status: post?.status || 'draft' as const,
    readTime: post?.readTime || 5
  });

  const [tagInput, setTagInput] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const serviceConfig = SERVICE_CONFIGS[serviceType];

  // Load categories for this service
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const serviceCategories = await ServiceContentService.getServiceCategories(serviceType);
        setCategories(serviceCategories.map(cat => cat.name));
      } catch (error) {
      }
    };

    loadCategories();
  }, [serviceType]);

  // Generate slug from title
  useEffect(() => {
    if (formData.title && (isNew || !post?.slug)) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, isNew, post?.slug]);

  // Mark form as dirty when data changes
  useEffect(() => {
    if (post) {
      const hasChanges = Object.keys(formData).some(key => {
        return JSON.stringify(formData[key as keyof typeof formData]) !== 
               JSON.stringify(post[key as keyof Post]);
      });
      setIsDirty(hasChanges);
    } else {
      setIsDirty(true);
    }
  }, [formData, post]);

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // TODO: Implement actual file upload to your storage service
      // For now, creating a placeholder URL
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, featuredImage: imageUrl }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (status: 'draft' | 'published' = 'draft') => {
    if (!user) {
      toast.error('You must be logged in to save content');
      return;
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setIsLoading(true);
    try {
      const postData = {
        ...formData,
        status,
        serviceType,
        authorId: user.id,
        publishedAt: status === 'published' ? new Date().toISOString() : undefined
      };

      let savedPost: Post | null;

      if (isNew) {
        savedPost = await ServiceContentService.createServicePost(serviceType, postData as any);
      } else if (post) {
        savedPost = await ServiceContentService.updateServicePost(post.id, postData);
      } else {
        throw new Error('No post to update');
      }

      if (savedPost) {
        toast.success(`Post ${status === 'published' ? 'published' : 'saved'} successfully`);
        setIsDirty(false);
        onSave?.(savedPost);
      } else {
        throw new Error('Failed to save post');
      }
    } catch (error) {
      toast.error('Failed to save post');
    } finally {
      setIsLoading(false);
    }
  };

  const insertFormatting = (format: string, text = '') => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    let replacement = '';
    switch (format) {
      case 'bold':
        replacement = `**${selectedText || text || 'bold text'}**`;
        break;
      case 'italic':
        replacement = `*${selectedText || text || 'italic text'}*`;
        break;
      case 'link':
        replacement = `[${selectedText || text || 'link text'}](https://example.com)`;
        break;
      case 'code':
        replacement = `\`${selectedText || text || 'code'}\``;
        break;
      case 'list':
        replacement = `\n- ${selectedText || text || 'list item'}\n`;
        break;
      case 'quote':
        replacement = `\n> ${selectedText || text || 'quote'}\n`;
        break;
      case 'heading':
        replacement = `\n## ${selectedText || text || 'Heading'}\n`;
        break;
    }

    const newValue = 
      textarea.value.substring(0, start) + 
      replacement + 
      textarea.value.substring(end);

    setFormData(prev => ({ ...prev, content: newValue }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isNew ? 'Create New Post' : 'Edit Post'} - {serviceConfig.serviceName}
              </h1>
              <p className="text-gray-600 mt-1">
                {isNew ? 'Create engaging content for your service page' : 'Update your existing content'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsPreview(!isPreview)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isPreview
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {isPreview ? 'Hide Preview' : 'Preview'}
              </button>
              <button
                onClick={() => handleSave('draft')}
                disabled={isLoading || !isDirty}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </button>
              <button
                onClick={() => handleSave('published')}
                disabled={isLoading || !formData.title.trim() || !formData.content.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FileText className="h-4 w-4 mr-2" />
                {formData.status === 'published' ? 'Update' : 'Publish'}
              </button>
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Slug */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter post title..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="post-url-slug"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excerpt
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    placeholder="Brief description of the post..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Content Editor */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {!isPreview && (
                <div className="border-b border-gray-200 p-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => insertFormatting('bold')}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                      title="Bold"
                    >
                      <Bold className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => insertFormatting('italic')}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                      title="Italic"
                    >
                      <Italic className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => insertFormatting('link')}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                      title="Link"
                    >
                      <Link className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => insertFormatting('code')}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                      title="Code"
                    >
                      <Code className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => insertFormatting('list')}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                      title="List"
                    >
                      <List className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => insertFormatting('quote')}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                      title="Quote"
                    >
                      <Quote className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => insertFormatting('heading')}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                      title="Heading"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
              
              <div className="p-6">
                {isPreview ? (
                  <div className="prose max-w-none">
                    <h1>{formData.title}</h1>
                    {formData.excerpt && (
                      <p className="text-lg text-gray-600 italic">{formData.excerpt}</p>
                    )}
                    <div dangerouslySetInnerHTML={{ __html: formData.content.replace(/\n/g, '<br>') }} />
                  </div>
                ) : (
                  <textarea
                    id="content-editor"
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Write your content here... You can use Markdown formatting."
                    rows={20}
                    className="w-full border-0 resize-none focus:ring-0 focus:outline-none text-gray-900"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Post Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Post Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select category...</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Read Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.readTime}
                    onChange={(e) => handleInputChange('readTime', parseInt(e.target.value) || 5)}
                    min="1"
                    max="60"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.isFeatured}
                    onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                    <Star className="h-4 w-4 inline mr-1" />
                    Featured post
                  </label>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={addTag}
                    disabled={!tagInput.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Image</h3>
              <div className="space-y-4">
                {formData.featuredImage && (
                  <div className="relative">
                    <img
                      src={formData.featuredImage}
                      alt="Featured"
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={() => handleInputChange('featuredImage', '')}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 cursor-pointer transition-colors">
                    {isUploading ? (
                      <div className="text-gray-500">
                        <Upload className="h-6 w-6 mx-auto mb-2 animate-spin" />
                        Uploading...
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        <Image className="h-6 w-6 mx-auto mb-2" />
                        Click to upload image
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceContentEditor;