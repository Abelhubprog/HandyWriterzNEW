import databaseService from '@/services/databaseService';
import type { Post, ContentBlock, Service, Category } from '@/types/admin';
import { v4 as uuidv4 } from 'uuid';
import { slugify } from '@/utils/formatters';

/**
 * Admin Content Service
 * Handles content operations with the new database service for admin users
 */
export const adminContentService = {
  /**
   * Fetch a single post by ID
   */
  async getPost(id: string): Promise<Post | null> {
    try {
      const posts = await databaseService.read('posts', { id });
      
      if (posts.length === 0) {
        return null;
      }
      
      const data = posts[0];
      
      // Get related data
      const services = data.service_id ? await databaseService.read('services', { id: data.service_id }) : [];
      const profiles = data.author_id ? await databaseService.read('profiles', { user_id: data.author_id }) : [];
      
      const service = services.length > 0 ? services[0] : null;
      const profile = profiles.length > 0 ? profiles[0] : null;

      return {
        id: data.id,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || '',
        content: data.content,
        contentBlocks: data.content_blocks || [],
        service: service?.slug || '',
        category: data.categories?.[0] || '',
        status: data.status,
        publishedAt: data.published_at,
        scheduledFor: data.metadata?.scheduled_for,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        featuredImage: data.featured_image,
        tags: data.tags || [],
        seoTitle: data.seo_title || '',
        seoDescription: data.seo_description || '',
        seoKeywords: data.metadata?.seo_keywords || [],
        author: profile ? {
          id: profile.id,
          name: profile.name || profile.display_name || 'Unknown Author',
          avatar: profile.avatar_url
        } : {
          id: data.author_id,
          name: 'Unknown Author',
          avatar: null
        }
      };
    } catch (error) {
      return null;
    }
  },

  /**
   * Create a new post
   */
  async createPost(post: Partial<Post>, userId: string): Promise<{ id: string } | null> {
    try {
      // Generate slug if not provided
      const slug = post.slug || slugify(post.title || '');
      
      const serviceId = post.service ? await this.getServiceIdBySlug(post.service) : null;
      
      const contentData = {
        title: post.title,
        slug,
        excerpt: post.excerpt || '',
        content: post.content || '',
        content_blocks: post.contentBlocks || [],
        service_id: serviceId,
        categories: post.category ? [post.category] : [],
        status: post.status || 'draft',
        published_at: post.status === 'published' ? new Date().toISOString() : null,
        author_id: userId,
        featured_image: post.featuredImage || null,
        tags: post.tags || [],
        seo_title: post.seoTitle || post.title,
        seo_description: post.seoDescription || post.excerpt,
        metadata: {
          scheduled_for: post.scheduledFor || null,
          seo_keywords: post.seoKeywords || [],
        }
      };
      
      const result = await databaseService.create('posts', contentData);
      return { id: result.id };
    } catch (error) {
      return null;
    }
  },
  
  /**
   * Update an existing post
   */
  async updatePost(id: string, post: Partial<Post>): Promise<boolean> {
    try {
      const updates: any = {};
      
      if (post.title !== undefined) updates.title = post.title;
      if (post.slug !== undefined) updates.slug = post.slug;
      if (post.excerpt !== undefined) updates.excerpt = post.excerpt;
      if (post.content !== undefined) updates.content = post.content;
      if (post.contentBlocks !== undefined) updates.content_blocks = post.contentBlocks;
      if (post.status !== undefined) {
        updates.status = post.status;
        if (post.status === 'published' && !post.publishedAt) {
          updates.published_at = new Date().toISOString();
        }
      }
      if (post.service !== undefined) {
        updates.service_id = await this.getServiceIdBySlug(post.service);
      }
      if (post.category !== undefined) {
        updates.categories = post.category ? [post.category] : [];
      }
      if (post.featuredImage !== undefined) updates.featured_image = post.featuredImage;
      if (post.tags !== undefined) updates.tags = post.tags;
      if (post.seoTitle !== undefined) updates.seo_title = post.seoTitle;
      if (post.seoDescription !== undefined) updates.seo_description = post.seoDescription;
      
      // Handle metadata fields
      const existingPosts = await databaseService.read('posts', { id });
      const metadata = existingPosts[0]?.metadata || {};
      
      if (post.scheduledFor !== undefined) metadata.scheduled_for = post.scheduledFor;
      if (post.seoKeywords !== undefined) metadata.seo_keywords = post.seoKeywords;
      
      updates.metadata = metadata;
      
      await databaseService.update('posts', id, updates);
      return true;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Delete a post
   */
  async deletePost(id: string): Promise<boolean> {
    try {
      await databaseService.delete('posts', id);
      return true;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Get services
   */
  async getServices(): Promise<Service[]> {
    try {
      const services = await databaseService.getServices();
      
      return services.map(service => ({
        id: service.id,
        name: service.title,
        slug: service.slug,
        description: service.description || '',
        icon: service.icon || null,
        isActive: service.is_active
      }));
    } catch (error) {
      return [];
    }
  },
  
  /**
   * Get categories
   */
  async getCategories(service?: string): Promise<Category[]> {
    try {
      const categories = await databaseService.getCategories();
      
      let filteredCategories = categories;
      
      if (service) {
        const serviceId = await this.getServiceIdBySlug(service);
        if (serviceId) {
          filteredCategories = categories.filter(cat => cat.service_id === serviceId);
        }
      }
      
      return filteredCategories.map(category => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        service: category.service_id
      }));
    } catch (error) {
      return [];
    }
  },
  
  /**
   * Helper to get service ID by slug
   */
  async getServiceIdBySlug(slug: string): Promise<string | null> {
    try {
      const services = await databaseService.read('services', { slug });
      return services.length > 0 ? services[0].id : null;
    } catch (error) {
      return null;
    }
  },
  
  /**
   * Upload image to storage
   */
  async uploadImage(file: File, folderPath = 'content'): Promise<string | null> {
    try {
      // Use a simple file upload approach for now
      // In a real implementation, this would use Cloudflare R2 or similar
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${folderPath}/${fileName}`;
      
      // Mock implementation - return a placeholder URL
      // In production, integrate with Cloudflare R2 storage
      return `/uploads/${filePath}`;
    } catch (error) {
      return null;
    }
  }
};

export default adminContentService;