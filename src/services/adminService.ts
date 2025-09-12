import databaseService from '@/services/databaseService';
import type { Post, ServiceCategory, Tag, Media, User, Analytics, GeneralSettings, SeoSettings, ApiSettings } from '@/types/admin';

interface ContentBlock {
  id?: string;
  type: string;
  content: string;
  metadata?: any;
  order?: number;
  post_id?: string;
}

/**
 * Admin Service
 * Handles all admin operations with the new database service
 */
export const adminService = {
  // Posts
  async getPosts() {
    try {
      const posts = await databaseService.getPosts();
      
      return posts.map((post: any) => ({
        id: post.id.toString(),
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || '',
        content: post.content,
        contentBlocks: (post.content_blocks || []).map((block: any) => ({
          id: block.id,
          type: block.type,
          content: block.content,
          metadata: block.metadata,
          order: block.order
        })),
        author: {
          id: post.author_id,
          name: post.author_name || 'Unknown Author',
          avatar: post.author_avatar
        },
        service: post.service_title || post.service_type,
        category: post.category_name || post.category_slug,
        tags: post.tags || [],
        status: post.status,
        publishedAt: post.published_at,
        scheduledFor: post.scheduled_for,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        featured: post.featured,
        readTime: post.read_time,
        featuredImage: post.featured_image,
        mediaType: post.media_type,
        mediaUrl: post.media_url,
        seoTitle: post.seo_title,
        seoDescription: post.seo_description,
        seoKeywords: post.seo_keywords,
        stats: {
          views: post.view_count || 0,
          likes: post.likes_count || 0,
          comments: post.comments_count || 0,
          shares: post.shares_count || 0
        }
      }));
    } catch (error) {
      return [];
    }
  },

  async getPostById(id: string) {
    try {
      const post = await databaseService.getPostBySlug(id); // Assuming id could be slug
      if (!post) return null;
      
      return {
        id: post.id.toString(),
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || '',
        content: post.content,
        contentBlocks: (post.content_blocks || []).map((block: any) => ({
          id: block.id,
          type: block.type,
          content: block.content,
          metadata: block.metadata,
          order: block.order
        })),
        author: {
          id: post.author_id,
          name: post.author_name || 'Unknown Author',
          avatar: post.author_avatar
        },
        service: post.service_title || post.service_type,
        category: post.category_name || post.category_slug,
        tags: post.tags || [],
        status: post.status,
        publishedAt: post.published_at,
        scheduledFor: post.scheduled_for,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        featured: post.featured,
        readTime: post.read_time,
        featuredImage: post.featured_image,
        mediaType: post.media_type,
        mediaUrl: post.media_url,
        seoTitle: post.seo_title,
        seoDescription: post.seo_description,
        seoKeywords: post.seo_keywords,
        stats: {
          views: post.view_count || 0,
          likes: post.likes_count || 0,
          comments: post.comments_count || 0,
          shares: post.shares_count || 0
        }
      };
    } catch (error) {
      return null;
    }
  },

  async createPost(post: Partial<Post>) {
    try {
      const postData = {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        author_id: post.author?.id,
        service_type: post.service,
        category_slug: post.category,
        tags: post.tags,
        status: post.status,
        published_at: post.status === 'published' ? new Date().toISOString() : null,
        scheduled_for: post.scheduledFor,
        featured: post.featured,
        read_time: post.readTime,
        featured_image: post.featuredImage,
        media_type: post.mediaType,
        media_url: post.mediaUrl,
        seo_title: post.seoTitle,
        seo_description: post.seoDescription,
        seo_keywords: post.seoKeywords
      };

      const result = await databaseService.createPost(postData);
      return result.id;
    } catch (error) {
      throw error;
    }
  },

  async updatePost(id: string, post: Partial<Post>) {
    try {
      const updateData = {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        service_type: post.service,
        category_slug: post.category,
        tags: post.tags,
        status: post.status,
        published_at: post.status === 'published' && !post.publishedAt ? new Date().toISOString() : post.publishedAt,
        scheduled_for: post.scheduledFor,
        featured: post.featured,
        read_time: post.readTime,
        featured_image: post.featuredImage,
        media_type: post.mediaType,
        media_url: post.mediaUrl,
        seo_title: post.seoTitle,
        seo_description: post.seoDescription,
        seo_keywords: post.seoKeywords,
        updated_at: new Date().toISOString()
      };

      await databaseService.updatePost(id, updateData);
      return id;
    } catch (error) {
      throw error;
    }
  },

  async deletePost(id: string) {
    try {
      await databaseService.delete('posts', id);
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Categories
  async getCategories() {
    try {
      const categories = await databaseService.getCategories();
      
      return categories.map((category: any) => ({
        id: category.id.toString(),
        name: category.name,
        slug: category.slug,
        count: category.post_count || 0,
        service: category.service_type
      }));
    } catch (error) {
      return [];
    }
  },

  async createCategory(category: Partial<ServiceCategory>) {
    try {
      const result = await databaseService.create('categories', {
        name: category.name,
        slug: category.slug,
        service_type: category.service
      });
      
      return result.id;
    } catch (error) {
      throw error;
    }
  },

  async updateCategory(id: string, category: Partial<ServiceCategory>) {
    try {
      await databaseService.update('categories', id, {
        name: category.name,
        slug: category.slug,
        service_type: category.service
      });
      
      return id;
    } catch (error) {
      throw error;
    }
  },

  async deleteCategory(id: string) {
    try {
      await databaseService.delete('categories', id);
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Users
  async getUsers() {
    try {
      const users = await databaseService.read('profiles');
      
      return users.map((user: any) => ({
        id: user.id,
        name: user.full_name || user.display_name,
        email: user.email,
        role: user.role,
        avatar: user.avatar_url,
        status: user.status,
        lastLogin: user.last_login
      }));
    } catch (error) {
      return [];
    }
  },

  async updateUser(id: string, user: Partial<User>) {
    try {
      await databaseService.update('profiles', id, {
        full_name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar,
        status: user.status
      });
      
      return id;
    } catch (error) {
      throw error;
    }
  },

  // Analytics
  async getAnalytics(timeRange: Analytics['timeRange']) {
    // Mock analytics data for now
    const mockAnalytics: Analytics = {
      timeRange,
      overview: {
        totalViews: 24538,
        totalLikes: 1234,
        totalComments: 432,
        totalShares: 123,
        averageReadTime: 4.2,
        viewsChange: 8.5,
        likesChange: 12.3,
        commentsChange: 5.7,
        sharesChange: 3.2
      },
      topPosts: [
        { id: '1', title: 'The Impact of Evidence-Based Practice in Adult Nursing', views: 1234, service: 'Adult Health Nursing' },
        { id: '2', title: 'Cognitive Behavioral Therapy: A Comprehensive Guide', views: 987, service: 'Mental Health Nursing' },
        { id: '3', title: 'Pediatric Nursing Essentials: Current Research Overview', views: 876, service: 'Child Nursing' },
        { id: '4', title: 'Blockchain Fundamentals for Beginners', views: 765, service: 'Crypto' },
        { id: '5', title: 'Machine Learning Applications in Healthcare', views: 654, service: 'AI Services' }
      ],
      topServices: [
        { service: 'Adult Health Nursing', views: 10234, percentage: 35 },
        { service: 'Mental Health Nursing', views: 7654, percentage: 25 },
        { service: 'Child Nursing', views: 5432, percentage: 20 },
        { service: 'AI Services', views: 3210, percentage: 10 },
        { service: 'Crypto', views: 2345, percentage: 10 }
      ],
      viewsByDay: Array(30).fill(0).map((_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        views: 500 + Math.floor(Math.random() * 500)
      })),
      engagementByService: [
        { service: 'Adult Health Nursing', likes: 567, comments: 234, shares: 123 },
        { service: 'Mental Health Nursing', likes: 456, comments: 187, shares: 98 },
        { service: 'Child Nursing', likes: 345, comments: 156, shares: 87 },
        { service: 'AI Services', likes: 234, comments: 123, shares: 65 },
        { service: 'Crypto', likes: 123, comments: 89, shares: 43 }
      ]
    };
    
    return mockAnalytics;
  },

  // Settings
  async getSettings() {
    // Return default settings for now
    return {
      general: {
        siteName: 'HandyWriterz',
        siteDescription: 'Professional writing services for all your needs',
        contactEmail: 'contact@handywriterz.com',
        phoneNumber: '',
        address: '',
        socialLinks: {}
      },
      seo: {
        metaTitle: 'HandyWriterz - Professional Writing Services',
        metaDescription: 'Professional writing services for students, researchers, and professionals',
        metaKeywords: ['writing', 'academic', 'research', 'essays'],
        ogImage: '',
        googleAnalyticsId: '',
        googleSiteVerification: ''
      },
      api: {
        turnitinApiKey: '',
        turnitinApiUrl: '',
        googleApiKey: '',
        openaiApiKey: ''
      }
    };
  },

  async updateSettings(
    generalSettings: Partial<GeneralSettings>,
    seoSettings: Partial<SeoSettings>,
    apiSettings: Partial<ApiSettings>
  ) {
    try {
      // Mock implementation for now
      return true;
    } catch (error) {
      throw error;
    }
  }
};