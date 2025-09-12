import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { contentManagementService } from '@/services/contentManagementService';
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Tag,
  Calendar,
  Clock,
  X,
  Upload,
  Trash2,
  Edit,
  Check,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Post {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author_id: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'scheduled';
  publishedAt?: string;
  featuredImage: string;
  service_type?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
}

const ContentEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const isEditing = !!id;
  const [post, setPost] = useState<Post>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author_id: '',
    category: '',
    tags: [],
    status: 'draft',
    featuredImage: '',
    service_type: ''
  });

  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [publishedDate, setPublishedDate] = useState<Date | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories
  const { data: fetchedCategories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => contentManagementService.getCategories(''),
    staleTime: 5 * 60 * 1000
  });

  // Fetch post if editing
  const { data: existingPost, isLoading: isLoadingPost } = useQuery({
    queryKey: ['post', id],
    queryFn: () => contentManagementService.getBlogPost(id || ''),
    enabled: isEditing,
    staleTime: 5 * 60 * 1000
  });

  // Mutation for saving post
  const saveMutation = useMutation({
    mutationFn: async (postData: Post) => {
      const token = await getToken({ template: 'supabase' });
      // In a real app, pass token to service if needed for auth headers
      if (isEditing) {
        return contentManagementService.updateBlogPost(id!, postData);
      } else {
        return contentManagementService.createBlogPost(postData);
      }
    },
    onSuccess: (savedId) => {
      toast.success(isEditing ? 'Post updated successfully' : 'Post created successfully');
      if (!isEditing) {
        navigate(`/admin/content/${savedId}`);
      } else {
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      }
    },
    onError: (err) => {
      console.error('Error saving post:', err);
      toast.error('Failed to save post');
      setError('Failed to save post. Please try again.');
    }
  });

  useEffect(() => {
    setCategories(fetchedCategories);
  }, [fetchedCategories]);

  useEffect(() => {
    if (existingPost) {
      setPost(existingPost);
      setSelectedCategory(existingPost.category);
      setPublishedDate(existingPost.publishedAt ? new Date(existingPost.publishedAt) : null);
      setImagePreview(existingPost.featuredImage);
    }
  }, [existingPost]);

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Handle title change and update slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setPost(prev => ({
      ...prev,
      title: newTitle,
      slug: generateSlug(newTitle)
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setPost(prev => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setPost(prev => ({ ...prev, category: cat }));
  };

  const handleAddTag = () => {
    const tag = tagsInput.trim();
    if (!tag) return;
    setPost(prev => ({ ...prev, tags: Array.from(new Set([...(prev.tags || []), tag])) }));
    setTagsInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPost(prev => ({ ...prev, tags: (prev.tags || []).filter(t => t !== tagToRemove) }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFeaturedImage(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (status: 'draft' | 'published' | 'scheduled' = 'draft') => {
    setIsSaving(true);
    try {
      const payload: Post = {
        ...post,
        title: post.title || '',
        slug: post.slug || generateSlug(post.title || ''),
        excerpt: post.excerpt || '',
        content: post.content || '',
        author_id: post.author_id || '',
        category: post.category || selectedCategory || '',
        tags: post.tags || [],
        status,
        publishedAt: publishedDate ? publishedDate.toISOString() : undefined,
        featuredImage: imagePreview || post.featuredImage || '',
        service_type: post.service_type
      };

      saveMutation.mutate(payload as Post);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      setPost(prev => ({ ...prev, category: selectedCategory }));
    }
  }, [selectedCategory]);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">{isEditing ? 'Edit Content' : 'New Content'}</h2>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input name="title" value={post.title} onChange={handleTitleChange} className="mt-1 w-full border rounded px-2 py-1" />
        </div>

        <div>
          <label className="block text-sm font-medium">Slug</label>
          <input name="slug" value={post.slug} onChange={handleInputChange} className="mt-1 w-full border rounded px-2 py-1" />
        </div>

        <div>
          <label className="block text-sm font-medium">Excerpt</label>
          <textarea name="excerpt" value={post.excerpt} onChange={handleInputChange} className="mt-1 w-full border rounded px-2 py-1" rows={3} />
        </div>

        <div>
          <label className="block text-sm font-medium">Content</label>
          <textarea name="content" value={post.content} onChange={handleInputChange} className="mt-1 w-full border rounded px-2 py-1" rows={10} />
        </div>

        <div>
          <label className="block text-sm font-medium">Category</label>
          <div className="mt-1">
            <select value={selectedCategory} onChange={e => handleCategorySelect(e.target.value)} className="border rounded px-2 py-1">
              <option value="">-- Select category --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Tags</label>
          <div className="flex gap-2 items-center mt-1">
            <input value={tagsInput} onChange={e => setTagsInput(e.target.value)} className="border rounded px-2 py-1" />
            <button type="button" onClick={handleAddTag} className="bg-gray-200 px-3 py-1 rounded">Add</button>
          </div>
          <div className="mt-2 flex gap-2 flex-wrap">
            {(post.tags || []).map(t => (
              <span key={t} className="bg-gray-100 px-2 py-1 rounded flex items-center gap-2">
                {t}
                <button type="button" onClick={() => handleRemoveTag(t)} className="text-red-500">x</button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Featured Image</label>
          <input type="file" accept="image/*" onChange={handleFileChange} className="mt-1" />
          {imagePreview && <img src={imagePreview} alt="preview" className="mt-2 max-w-xs" />}
        </div>

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={() => handleSave('draft')} disabled={isSaving} className="px-4 py-2 bg-gray-200 rounded">Save Draft</button>
          <button type="button" onClick={() => handleSave('published')} disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded">Publish</button>
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;
