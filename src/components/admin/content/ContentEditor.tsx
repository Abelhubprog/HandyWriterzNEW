import React, { useState, useCallback } from 'react';
import type { Database } from '../../../types/database.types';
import { createContent, updateContent } from '../../../api/admin/content';

type ContentStatus = Database['public']['Enums']['content_status'];

interface ContentEditorProps {
  initialContent?: {
    id?: string;
    title?: string;
    content?: string;
    excerpt?: string;
    featuredImage?: string;
    seoTitle?: string;
    seoDescription?: string;
    tags?: string[];
    categories?: string[];
    serviceId?: string;
    status?: ContentStatus;
  };
  onSave?: (content: any) => void;
  onCancel?: () => void;
}

export default function ContentEditor({ 
  initialContent = {}, 
  onSave, 
  onCancel 
}: ContentEditorProps) {
  const [title, setTitle] = useState(initialContent.title || '');
  const [content, setContent] = useState(initialContent.content || '');
  const [excerpt, setExcerpt] = useState(initialContent.excerpt || '');
  const [featuredImage, setFeaturedImage] = useState(initialContent.featuredImage || '');
  const [seoTitle, setSeoTitle] = useState(initialContent.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialContent.seoDescription || '');
  const [tags, setTags] = useState<string[]>(initialContent.tags || []);
  const [categories, setCategories] = useState<string[]>(initialContent.categories || []);
  const [serviceId, setServiceId] = useState(initialContent.serviceId || '');
  const [status, setStatus] = useState<ContentStatus>(initialContent.status || 'draft');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const contentData = {
        title,
        content,
        excerpt,
        featuredImage,
        seoTitle,
        seoDescription,
        tags,
        categories,
        serviceId,
        status
      };

      let savedContent;
      if (initialContent.id) {
        savedContent = await updateContent({
          id: initialContent.id,
          ...contentData
        }, 'your-access-token'); // Replace with actual access token
      } else {
        savedContent = await createContent(contentData, 'your-access-token'); // Replace with actual access token
      }

      onSave?.(savedContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving');
    } finally {
      setSaving(false);
    }
  }, [
    title,
    content,
    excerpt,
    featuredImage,
    seoTitle,
    seoDescription,
    tags,
    categories,
    serviceId,
    status,
    initialContent.id,
    onSave
  ]);

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTags(e.target.value.split(',').map(tag => tag.trim()));
  };

  const handleCategoriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategories(e.target.value.split(',').map(category => category.trim()));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto p-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          required
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          required
        />
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
          Excerpt
        </label>
        <textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700">
          Featured Image URL
        </label>
        <input
          type="url"
          id="featuredImage"
          value={featuredImage}
          onChange={(e) => setFeaturedImage(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700">
          SEO Title
        </label>
        <input
          type="text"
          id="seoTitle"
          value={seoTitle}
          onChange={(e) => setSeoTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700">
          SEO Description
        </label>
        <textarea
          id="seoDescription"
          value={seoDescription}
          onChange={(e) => setSeoDescription(e.target.value)}
          rows={2}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          id="tags"
          value={tags.join(', ')}
          onChange={handleTagsChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="categories" className="block text-sm font-medium text-gray-700">
          Categories (comma-separated)
        </label>
        <input
          type="text"
          id="categories"
          value={categories.join(', ')}
          onChange={handleCategoriesChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="serviceId" className="block text-sm font-medium text-gray-700">
          Service ID
        </label>
        <input
          type="text"
          id="serviceId"
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ContentStatus)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="draft">Draft</option>
          <option value="review">Review</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="flex justify-end space-x-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}
