import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';

interface ContentFormProps {
  initialData?: any;
  mode?: 'create' | 'edit';
  onSubmit: (data: any) => Promise<void>;
}

interface ServiceOption {
  id: string;
  title: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

export default function ContentForm({ initialData, mode = 'create', onSubmit }: ContentFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || {
      title: '',
      content: '',
      excerpt: '',
      status: 'draft',
      service_id: '',
      category_id: '',
      featured_image: '',
      seo_title: '',
      seo_description: '',
      tags: []
    }
  });

  useEffect(() => {
    loadServices();
    loadCategories();
  }, []);

  const loadServices = async () => {
    try {
      // Mock data for now since we're migrating away from Supabase
      setServices([
        { id: '1', title: 'Academic Writing' },
        { id: '2', title: 'Research Papers' },
        { id: '3', title: 'Essay Writing' }
      ]);
    } catch (error) {
    }
  };

  const loadCategories = async () => {
    try {
      // Mock data for now since we're migrating away from Supabase
      setCategories([
        { id: '1', name: 'Academic' },
        { id: '2', name: 'Business' },
        { id: '3', name: 'Technical' }
      ]);
    } catch (error) {
    }
  };

  const handleFormSubmit = async (data: any) => {
    setLoading(true);
    try {
      await onSubmit(data);
      navigate('/admin/content');
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...register('title', { required: 'Title is required' })}
                  placeholder="Enter content title"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{String(errors.title.message)}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  {...register('status')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                {...register('excerpt')}
                placeholder="Brief description of the content"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                {...register('content', { required: 'Content is required' })}
                placeholder="Write your content here..."
                rows={10}
                className={errors.content ? 'border-red-500' : ''}
              />
              {errors.content && (
                <p className="text-sm text-red-500">{String(errors.content.message)}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="service_id">Service</Label>
                <select
                  id="service_id"
                  {...register('service_id')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category_id">Category</Label>
                <select
                  id="category_id"
                  {...register('category_id')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="seo_title">SEO Title</Label>
                <Input
                  id="seo_title"
                  {...register('seo_title')}
                  placeholder="SEO optimized title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo_description">SEO Description</Label>
                <Input
                  id="seo_description"
                  {...register('seo_description')}
                  placeholder="Meta description for search engines"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/admin/content')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className={loading ? 'opacity-50 cursor-not-allowed' : ''}
              >
                {loading ? 'Saving...' : mode === 'create' ? 'Create Content' : 'Update Content'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}