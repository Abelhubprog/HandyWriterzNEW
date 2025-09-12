import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import { Search, AlertCircle, Save } from 'lucide-react';

interface SeoMetadataProps {
  postId: string;
  initialData?: {
    title?: string;
    description?: string;
    keywords?: string;
    slug?: string;
  };
  onSave: (data: SeoMetadataValues) => Promise<void>;
}

export interface SeoMetadataValues {
  title: string;
  description: string;
  keywords: string;
  slug: string;
}

const SeoMetadata: React.FC<SeoMetadataProps> = ({
  postId,
  initialData,
  onSave,
}) => {
  const [values, setValues] = useState<SeoMetadataValues>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    keywords: initialData?.keywords || '',
    slug: initialData?.slug || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate character counts and provide visual feedback
  const titleLength = values.title.length;
  const descriptionLength = values.description.length;
  
  const titleTooLong = titleLength > 60;
  const titleTooShort = titleLength < 30;
  const descTooLong = descriptionLength > 160;
  const descTooShort = descriptionLength < 70;

  const handleChange = (field: keyof SeoMetadataValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setValues((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Generate slug-friendly string
    const value = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    setValues((prev) => ({
      ...prev,
      slug: value,
    }));
  };

  const generateSlugFromTitle = () => {
    if (!values.title) return;
    
    const slug = values.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    setValues((prev) => ({
      ...prev,
      slug,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await onSave(values);
      toast.success('SEO metadata saved');
    } catch (err) {
      setError('Failed to save SEO metadata. Please try again.');
      toast.error('Failed to save SEO metadata');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Search className="h-5 w-5 mr-2" />
          SEO Metadata
        </CardTitle>
        <CardDescription>
          Optimize your content for search engines
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}
        
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Meta Title
              <span className={`ml-2 text-sm ${
                titleTooLong ? 'text-red-500' : 
                titleTooShort ? 'text-orange-500' : 
                'text-green-500'
              }`}>
                {titleLength}/60
              </span>
            </label>
            <Input 
              value={values.title}
              onChange={handleChange('title')}
              placeholder="Enter SEO-friendly title"
              maxLength={80}
              className={`${
                titleTooLong ? 'border-red-300' : 
                titleTooShort ? 'border-orange-300' : 
                'border-green-300'
              }`}
            />
            {titleTooLong && (
              <p className="mt-1 text-sm text-red-500">
                Title is too long (recommended max: 60 characters)
              </p>
            )}
            {titleTooShort && values.title && (
              <p className="mt-1 text-sm text-orange-500">
                Title is quite short (recommended min: 30 characters)
              </p>
            )}
          </div>
          
          {/* Meta Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Meta Description
              <span className={`ml-2 text-sm ${
                descTooLong ? 'text-red-500' : 
                descTooShort ? 'text-orange-500' : 
                'text-green-500'
              }`}>
                {descriptionLength}/160
              </span>
            </label>
            <Textarea 
              value={values.description}
              onChange={handleChange('description')}
              placeholder="Enter meta description"
              rows={3}
              maxLength={200}
              className={`${
                descTooLong ? 'border-red-300' : 
                descTooShort ? 'border-orange-300' : 
                'border-green-300'
              }`}
            />
            {descTooLong && (
              <p className="mt-1 text-sm text-red-500">
                Description is too long (recommended max: 160 characters)
              </p>
            )}
            {descTooShort && values.description && (
              <p className="mt-1 text-sm text-orange-500">
                Description is quite short (recommended min: 70 characters)
              </p>
            )}
          </div>
          
          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Keywords (comma-separated)
            </label>
            <Input 
              value={values.keywords}
              onChange={handleChange('keywords')}
              placeholder="e.g., nursing, healthcare, childcare"
            />
          </div>
          
          {/* URL Slug */}
          <div>
            <label className="block text-sm font-medium mb-1">
              URL Slug
            </label>
            <div className="flex space-x-2">
              <Input 
                value={values.slug}
                onChange={handleSlugChange}
                placeholder="url-friendly-slug"
              />
              <Button 
                variant="outline" 
                onClick={generateSlugFromTitle}
                disabled={!values.title}
                type="button"
              >
                Generate from Title
              </Button>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="pt-2">
            <Button 
              onClick={handleSubmit}
              disabled={isLoading || !(values.title && values.description && values.slug)}
              className="w-full sm:w-auto"
            >
              <Save className="h-4 w-4 mr-2" />
              Save SEO Metadata
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SeoMetadata;
