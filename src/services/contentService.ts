import databaseService from '@/services/databaseService';
import type { Post, ContentBlock, Service, Category } from '@/types/admin';
import { v4 as uuidv4 } from 'uuid';
import { calculateReadTime } from '@/utils/formatters';

/**
 * Content Service
 * Handles content operations with the new database service
 */
export const contentService = {
  /**
   * Fetch all content with pagination
   */
  async getPosts(options: {
    page?: number;
    limit?: number;
    service?: string;
    category?: string;
    status?: string;
    search?: string;
  } = {}) {
    const {
      page = 1,
      limit = 10,
      service,
      category,
      status = 'published',
      search
    } = options;

    try {
      const filters: any = { status };
      
      if (service) {
        filters.serviceSlug = service;
      }
      
      if (category) {
        filters.categorySlug = category;
      }
      
      // Get posts from database service
      let posts = await databaseService.getPosts(filters);
      
      // Apply search filter if provided
      if (search) {
        const searchLower = search.toLowerCase();
        posts = posts.filter(post => 
          post.title.toLowerCase().includes(searchLower) ||
          post.content.toLowerCase().includes(searchLower) ||
          post.excerpt?.toLowerCase().includes(searchLower)
        );
      }
      
      // Calculate pagination
      const offset = (page - 1) * limit;
      const paginatedPosts = posts.slice(offset, offset + limit);
      
      return {
        data: paginatedPosts,
        count: posts.length,
        page,
        totalPages: Math.ceil(posts.length / limit)
      };
    } catch (error) {
      return { data: [], count: 0, page, totalPages: 0 };
    }
  },

  /**
   * Fetch a single post by slug
   */
  async getPostBySlug(slug: string): Promise<Post | null> {
    try {
      const post = await databaseService.getPostBySlug(slug);
      
      if (post) {
        // Increment view count
        await databaseService.incrementViewCount(post.id);
      }
      
      return post;
    } catch (error) {
      return null;
    }
  },

  /**
   * Fetch a single post by ID
   */
  async getPostById(id: string): Promise<Post | null> {
    try {
      const posts = await databaseService.read('posts', { id });
      return posts.length > 0 ? posts[0] : null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Create a new post
   */
  async createPost(post: Partial<Post>, userId: string): Promise<{ id: string } | null> {
    try {
      const postData = {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || '',
        content: post.content || '',
        author_id: userId,
        service_id: post.service,
        category_id: post.category,
        status: post.status || 'draft',
        featured_image: post.featuredImage,
        tags: post.tags || [],
        seo_title: post.seoTitle,
        seo_description: post.seoDescription,
      };

      const result = await databaseService.createPost(postData);
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
      const updateData = {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        status: post.status,
        featured_image: post.featuredImage,
        tags: post.tags,
        seo_title: post.seoTitle,
        seo_description: post.seoDescription,
      };

      await databaseService.updatePost(id, updateData);
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
  async getCategories(serviceSlug?: string): Promise<Category[]> {
    try {
      const categories = await databaseService.getCategories();
      
      let filteredCategories = categories;
      
      if (serviceSlug) {
        // Filter by service if provided
        const services = await databaseService.read('services', { slug: serviceSlug });
        if (services.length > 0) {
          const serviceId = services[0].id;
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
   * Search posts
   */
  async searchPosts(query: string, options: {
    service?: string;
    category?: string;
    limit?: number;
  } = {}): Promise<Post[]> {
    try {
      const { service, category, limit = 50 } = options;
      
      const filters: any = { status: 'published' };
      
      if (service) filters.serviceSlug = service;
      if (category) filters.categorySlug = category;
      
      let posts = await databaseService.getPosts(filters);
      
      // Apply search
      const searchLower = query.toLowerCase();
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower) ||
        post.excerpt?.toLowerCase().includes(searchLower) ||
        (post.tags && post.tags.some((tag: string) => tag.toLowerCase().includes(searchLower)))
      );
      
      return posts.slice(0, limit);
    } catch (error) {
      return [];
    }
  },

  /**
   * Get popular posts
   */
  async getPopularPosts(limit = 10): Promise<Post[]> {
    try {
      let posts = await databaseService.getPosts({ status: 'published', limit: 50 });
      
      // Sort by view count
      posts.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
      
      return posts.slice(0, limit);
    } catch (error) {
      return [];
    }
  },

  /**
   * Get recent posts
   */
  async getRecentPosts(limit = 10): Promise<Post[]> {
    try {
      const posts = await databaseService.getPosts({ status: 'published', limit });
      return posts;
    } catch (error) {
      return [];
    }
  },

  /**
   * Get related posts
   */
  async getRelatedPosts(postId: string, limit = 5): Promise<Post[]> {
    try {
      // Get the current post to find related ones
      const currentPost = await this.getPostById(postId);
      if (!currentPost) return [];
      
      // Get posts with same service or tags
      let posts = await databaseService.getPosts({ 
        status: 'published',
        serviceSlug: currentPost.service
      });
      
      // Filter out current post and limit results
      posts = posts.filter(post => post.id !== postId);
      
      return posts.slice(0, limit);
    } catch (error) {
      return [];
    }
  }
};

export default contentService;