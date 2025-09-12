import databaseService from './databaseService';
import { cloudflareDb } from '@/lib/cloudflare';
import { Post, Category, Comment } from '../types/content';

export interface ServicePost extends Post {
  serviceType: string;
  isFeatured: boolean;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  updatedAt: string;
  createdAt: string;
  authorId: string;
  viewCount: number;
  shareCount: number;
  seoTitle?: string;
  seoDescription?: string;
  featuredImage?: string;
}

export interface ServiceContentStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  topCategories: Array<{ name: string; count: number }>;
  recentActivity: Array<{
    type: 'post_created' | 'post_published' | 'comment_added';
    timestamp: string;
    title: string;
    author: string;
  }>;
}

export class ServiceContentService {
  /**
   * Get all posts for a specific service
   */
  static async getServicePosts(
    serviceSlug: string,
    options: {
      status?: 'all' | 'published' | 'draft' | 'archived';
      category?: string;
      featured?: boolean;
      limit?: number;
      offset?: number;
      search?: string;
    } = {}
  ): Promise<{ posts: ServicePost[]; total: number }> {
    try {
      const filters: any = {
        serviceSlug,
        limit: options.limit
      };

      if (options.status && options.status !== 'all') {
        filters.status = options.status;
      }

      const posts = await databaseService.getPosts(filters);

      // Transform data to match ServicePost interface
      const transformedPosts = posts.map((post: any) => ({
        ...post,
        serviceType: serviceSlug,
        isFeatured: false,
        authorId: post.author_id,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        publishedAt: post.published_at,
        viewCount: post.view_count || 0,
        shareCount: post.share_count || 0,
        likes: 0,
        comments: 0,
        author: {
          id: post.author_id,
          name: post.author_name || 'Anonymous',
          avatarUrl: post.author_avatar
        }
      }));

      return {
        posts: transformedPosts as ServicePost[],
        total: posts.length
      };
    } catch (error) {
      return { posts: [], total: 0 };
    }
  }

  /**
   * Get featured posts for a service
   */
  static async getFeaturedPosts(serviceSlug: string, limit = 3): Promise<ServicePost[]> {
    try {
      const posts = await databaseService.getPosts({
        serviceSlug,
        status: 'published',
        limit
      });

      // Transform data to match ServicePost interface
      const transformedPosts = posts.map((post: any) => ({
        ...post,
        serviceType: serviceSlug,
        isFeatured: true,
        authorId: post.author_id,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        publishedAt: post.published_at,
        viewCount: post.view_count || 0,
        shareCount: 0,
        likes: 0,
        comments: 0,
        author: post.author ? {
          id: post.author_id,
          name: post.author.display_name || 'Anonymous',
          avatarUrl: post.author.avatar_url
        } : undefined
      }));

      return transformedPosts as ServicePost[];
    } catch (error) {
      return [];
    }
  }

  /**
   * Create a new service post
   */
  static async createServicePost(
    serviceSlug: string,
    postData: Omit<ServicePost, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'shareCount'>
  ): Promise<ServicePost | null> {
    try {
      const newPost = await databaseService.createPost({
        title: postData.title,
        content: postData.content,
        excerpt: postData.excerpt,
        slug: postData.slug,
        status: postData.status || 'draft',
        author_id: postData.authorId,
        service_id: serviceSlug,
        category_id: postData.category,
        tags: JSON.stringify(postData.tags),
        seo_title: postData.seoTitle,
        seo_description: postData.seoDescription,
        featured_image: postData.featuredImage
      });

      if (!newPost) throw new Error('Failed to create post');

      // Transform data to match ServicePost interface
      const transformedPost = {
        ...newPost,
        serviceType: newPost.service_type || serviceSlug,
        isFeatured: false,
        authorId: newPost.author_id,
        createdAt: newPost.created_at,
        updatedAt: newPost.updated_at,
        publishedAt: newPost.published_at,
        viewCount: 0,
        shareCount: 0,
        likes: 0,
        comments: 0,
        author: {
          id: newPost.author_id,
          name: 'Anonymous',
          avatarUrl: undefined
        }
      };

      return transformedPost as ServicePost;
    } catch (error) {
      return null;
    }
  }

  /**
   * Update a service post
   */
  static async updateServicePost(
    postId: string,
    updates: Partial<ServicePost>
  ): Promise<ServicePost | null> {
    try {
      const updateData: any = {};
      if (updates.title) updateData.title = updates.title;
      if (updates.content) updateData.content = updates.content;
      if (updates.excerpt) updateData.excerpt = updates.excerpt;
      if (updates.status) updateData.status = updates.status;
      if (updates.category) updateData.category = updates.category;
      if (updates.tags) updateData.tags = updates.tags;
      if (updates.featuredImage) updateData.featured_image = updates.featuredImage;

      const data = await cloudflareDb.update('posts', updateData, { id: postId });
      
      if (!data) throw new Error('Failed to update post');

      // Transform data to match ServicePost interface
      const transformedPost = {
        ...data,
        serviceType: data.service_type,
        isFeatured: false,
        authorId: data.author_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        publishedAt: data.published_at,
        viewCount: 0,
        shareCount: 0,
        likes: 0,
        comments: 0,
        author: data.author ? {
          id: data.author_id,
          name: data.author.display_name || 'Anonymous',
          avatarUrl: data.author.avatar_url
        } : undefined
      };

      return transformedPost as ServicePost;
    } catch (error) {
      return null;
    }
  }

  /**
   * Delete a service post
   */
  static async deleteServicePost(postId: string): Promise<boolean> {
    try {
      await cloudflareDb.delete('posts', { id: postId });

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Publish a draft post
   */
  static async publishPost(postId: string): Promise<ServicePost | null> {
    try {
      const data = await cloudflareDb.update('posts', {
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { id: postId });

      if (!data) throw new Error('Failed to publish post');

      // Transform data to match ServicePost interface
      const transformedPost = {
        ...data,
        serviceType: data.service_type,
        isFeatured: false,
        authorId: data.author_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        publishedAt: data.published_at,
        viewCount: data.view_count || 0,
        shareCount: data.share_count || 0,
        likes: 0,
        comments: 0,
        author: {
          id: data.author_id,
          name: 'Anonymous',
          avatarUrl: undefined
        }
      };

      return transformedPost as ServicePost;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get service content statistics
   */
  static async getServiceStats(serviceType: string): Promise<ServiceContentStats> {
    try {
      // Get post counts by status
      const posts = await cloudflareDb.query(
        'SELECT status FROM posts WHERE service_type = ?',
        [serviceType]
      );

      // Get category statistics
      const categories = await cloudflareDb.query(
        'SELECT category FROM posts WHERE service_type = ? AND status = ?',
        [serviceType, 'published']
      );

      // Get recent activity
      const recentPosts = await cloudflareDb.query(
        'SELECT title, created_at, author_id FROM posts WHERE service_type = ? ORDER BY created_at DESC LIMIT 10',
        [serviceType]
      );

      // Calculate statistics
      const postsData = posts.results || [];
      const categoriesData = categories.results || [];
      const recentPostsData = recentPosts.results || [];

      const totalPosts = postsData.length;
      const publishedPosts = postsData.filter((p: any) => p.status === 'published').length;
      const draftPosts = postsData.filter((p: any) => p.status === 'draft').length;
      const totalViews = 0; // Will implement with analytics
      const totalLikes = 0; // Will implement with interactions
      const totalComments = 0; // Will implement with interactions

      // Calculate top categories
      const categoryCount = categoriesData.reduce((acc: Record<string, number>, post: any) => {
        if (post.category) {
          acc[post.category] = (acc[post.category] || 0) + 1;
        }
        return acc;
      }, {});

      const topCategories = Object.entries(categoryCount)
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Format recent activity
      const recentActivity = recentPostsData.map((post: any) => ({
        type: 'post_created' as const,
        timestamp: post.created_at,
        title: post.title,
        author: 'Anonymous'
      }));

      return {
        totalPosts,
        publishedPosts,
        draftPosts,
        totalViews,
        totalLikes,
        totalComments,
        topCategories,
        recentActivity
      };
    } catch (error) {
      return {
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        topCategories: [],
        recentActivity: []
      };
    }
  }

  /**
   * Get categories for a service
   */
  static async getServiceCategories(serviceType: string): Promise<Category[]> {
    try {
      const result = await cloudflareDb.query(
        'SELECT category FROM posts WHERE service_type = ? AND status = ?',
        [serviceType, 'published']
      );

      const data = result.results || [];

      // Count occurrences of each category
      const categoryCount = data.reduce((acc: Record<string, number>, post: any) => {
        if (post.category) {
          acc[post.category] = (acc[post.category] || 0) + 1;
        }
        return acc;
      }, {});

      // Convert to Category objects
      return Object.entries(categoryCount).map(([name, count]) => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        count: count as number
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Get popular tags for a service
   */
  static async getServiceTags(serviceType: string, limit = 20): Promise<string[]> {
    try {
      const result = await cloudflareDb.query(
        'SELECT tags FROM posts WHERE service_type = ? AND status = ?',
        [serviceType, 'published']
      );

      const data = result.results || [];

      // Flatten and count tags
      const tagCount = data.flatMap((post: any) => {
        try {
          return post.tags ? JSON.parse(post.tags) : [];
        } catch {
          return [];
        }
      }).reduce((acc: Record<string, number>, tag: string) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {});

      // Return sorted tags by popularity
      return Object.entries(tagCount)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, limit)
        .map(([tag]) => tag);
    } catch (error) {
      return [];
    }
  }

  /**
   * Search posts across all services or specific service
   */
  static async searchPosts(
    query: string,
    serviceType?: string,
    options: {
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ posts: ServicePost[]; total: number }> {
    try {
      let sql = `
        SELECT * FROM posts 
        WHERE status = 'published' 
        AND (title LIKE ? OR content LIKE ?)
      `;
      const params = [`%${query}%`, `%${query}%`];

      if (serviceType) {
        sql += ' AND service_type = ?';
        params.push(serviceType);
      }

      sql += ' ORDER BY created_at DESC';

      if (options.limit) {
        sql += ` LIMIT ${options.limit}`;
      }
      if (options.offset) {
        sql += ` OFFSET ${options.offset}`;
      }

      const result = await cloudflareDb.query(sql, params);
      const data = result.results || [];

      // Get total count for pagination
      let countSql = `
        SELECT COUNT(*) as total FROM posts 
        WHERE status = 'published' 
        AND (title LIKE ? OR content LIKE ?)
      `;
      const countParams = [`%${query}%`, `%${query}%`];
      
      if (serviceType) {
        countSql += ' AND service_type = ?';
        countParams.push(serviceType);
      }

      const countResult = await cloudflareDb.query(countSql, countParams);
      const total = countResult.results?.[0]?.total || 0;

      // Transform data to match ServicePost interface
      const transformedPosts = data.map((post: any) => ({
        ...post,
        serviceType: post.service_type,
        isFeatured: false,
        authorId: post.author_id,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        publishedAt: post.published_at,
        viewCount: post.view_count || 0,
        shareCount: post.share_count || 0,
        likes: 0,
        comments: 0,
        author: {
          id: post.author_id,
          name: 'Anonymous',
          avatarUrl: undefined
        }
      }));

      return {
        posts: transformedPosts as ServicePost[],
        total
      };
    } catch (error) {
      return { posts: [], total: 0 };
    }
  }

  /**
   * Increment view count for a post
   */
  static async incrementViewCount(postId: string): Promise<void> {
    try {
      await cloudflareDb.query(
        'UPDATE posts SET view_count = COALESCE(view_count, 0) + 1 WHERE id = ?',
        [postId]
      );
    } catch (error) {
    }
  }

  /**
   * Toggle like for a post
   */
  static async togglePostLike(postId: string, userId: string): Promise<boolean> {
    try {
      // Check if user already liked the post
      const existingLike = await cloudflareDb.query(
        'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?',
        [postId, userId]
      );

      if (existingLike.results && existingLike.results.length > 0) {
        // Remove like
        await cloudflareDb.query(
          'DELETE FROM post_likes WHERE post_id = ? AND user_id = ?',
          [postId, userId]
        );
        return false;
      } else {
        // Add like
        await cloudflareDb.query(
          'INSERT INTO post_likes (post_id, user_id, created_at) VALUES (?, ?, ?)',
          [postId, userId, new Date().toISOString()]
        );
        return true;
      }
    } catch (error) {
      return false;
    }
  }
}