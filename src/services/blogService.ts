import databaseService from '@/services/databaseService';
import { BlogPost, BlogPostsResponse, ServicePage } from '@/types/blog';

const POSTS_PER_PAGE = 10;

// Service pages API
export const getServicePages = async (): Promise<ServicePage[]> => {
  try {
    const pages = await databaseService.read('service_pages', { published: true });
    return pages || [];
  } catch (error) {
    return [];
  }
};

export const getServicePageBySlug = async (slug: string): Promise<ServicePage | null> => {
  try {
    const pages = await databaseService.read('service_pages', { slug });
    return pages.length > 0 ? pages[0] : null;
  } catch (error) {
    return null;
  }
};

// Blog posts API
export const getBlogPosts = async (
  page = 1, 
  serviceType?: string
): Promise<BlogPostsResponse> => {
  try {
    const filters: any = { published: true };
    
    if (serviceType) {
      filters.service_type = serviceType;
    }
    
    const posts = await databaseService.read('blog_posts', filters);
    
    // Sort by published_at descending
    posts.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    
    // Calculate pagination
    const offset = (page - 1) * POSTS_PER_PAGE;
    const paginatedPosts = posts.slice(offset, offset + POSTS_PER_PAGE);
    
    return {
      data: paginatedPosts || [],
      count: posts.length,
      page,
      totalPages: Math.ceil(posts.length / POSTS_PER_PAGE)
    };
  } catch (error) {
    return { data: [], count: 0, page, totalPages: 0 };
  }
};

export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  try {
    const posts = await databaseService.read('blog_posts', { slug });
    const post = posts.length > 0 ? posts[0] : null;
    
    if (post) {
      // Increment view count if available
      try {
        await databaseService.update('blog_posts', post.id, {
          view_count: (post.view_count || 0) + 1
        });
      } catch (error) {
      }
    }
    
    return post;
  } catch (error) {
    return null;
  }
};

export const getRecentBlogPosts = async (limit = 5): Promise<BlogPost[]> => {
  try {
    const posts = await databaseService.read('blog_posts', { published: true });
    
    // Sort by published_at descending and limit
    return posts
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, limit);
  } catch (error) {
    return [];
  }
};

export const getPopularBlogPosts = async (limit = 5): Promise<BlogPost[]> => {
  try {
    const posts = await databaseService.read('blog_posts', { published: true });
    
    // Sort by view_count descending and limit
    return posts
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, limit);
  } catch (error) {
    return [];
  }
};

export const searchBlogPosts = async (query: string, serviceType?: string): Promise<BlogPost[]> => {
  try {
    const filters: any = { published: true };
    
    if (serviceType) {
      filters.service_type = serviceType;
    }
    
    let posts = await databaseService.read('blog_posts', filters);
    
    // Apply search filter
    const searchLower = query.toLowerCase();
    posts = posts.filter(post => 
      post.title?.toLowerCase().includes(searchLower) ||
      post.content?.toLowerCase().includes(searchLower) ||
      post.excerpt?.toLowerCase().includes(searchLower) ||
      (post.tags && post.tags.some((tag: string) => tag.toLowerCase().includes(searchLower)))
    );
    
    // Sort by relevance (simple title match first, then content)
    posts.sort((a, b) => {
      const aTitle = a.title?.toLowerCase().includes(searchLower) ? 1 : 0;
      const bTitle = b.title?.toLowerCase().includes(searchLower) ? 1 : 0;
      return bTitle - aTitle;
    });
    
    return posts;
  } catch (error) {
    return [];
  }
};

// Admin functions
export const createBlogPost = async (post: Partial<BlogPost>): Promise<string | null> => {
  try {
    const postData = {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content || '',
      service_type: post.service_type,
      author_id: post.author_id,
      published: post.published || false,
      published_at: post.published ? new Date().toISOString() : null,
      featured_image: post.featured_image,
      tags: post.tags || [],
      meta_title: post.meta_title,
      meta_description: post.meta_description,
      view_count: 0
    };

    const result = await databaseService.create('blog_posts', postData);
    return result.id;
  } catch (error) {
    return null;
  }
};

export const updateBlogPost = async (id: string, post: Partial<BlogPost>): Promise<boolean> => {
  try {
    const updateData = {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      service_type: post.service_type,
      published: post.published,
      published_at: post.published && !post.published_at ? new Date().toISOString() : post.published_at,
      featured_image: post.featured_image,
      tags: post.tags,
      meta_title: post.meta_title,
      meta_description: post.meta_description,
      updated_at: new Date().toISOString()
    };

    await databaseService.update('blog_posts', id, updateData);
    return true;
  } catch (error) {
    return false;
  }
};

export const deleteBlogPost = async (id: string): Promise<boolean> => {
  try {
    await databaseService.delete('blog_posts', id);
    return true;
  } catch (error) {
    return false;
  }
};

// Service page admin functions
export const createServicePage = async (page: Partial<ServicePage>): Promise<string | null> => {
  try {
    const pageData = {
      title: page.title,
      slug: page.slug,
      description: page.description || '',
      content: page.content || '',
      service_type: page.service_type,
      published: page.published || false,
      meta_title: page.meta_title,
      meta_description: page.meta_description,
      featured_image: page.featured_image
    };

    const result = await databaseService.create('service_pages', pageData);
    return result.id;
  } catch (error) {
    return null;
  }
};

export const updateServicePage = async (id: string, page: Partial<ServicePage>): Promise<boolean> => {
  try {
    const updateData = {
      title: page.title,
      slug: page.slug,
      description: page.description,
      content: page.content,
      service_type: page.service_type,
      published: page.published,
      meta_title: page.meta_title,
      meta_description: page.meta_description,
      featured_image: page.featured_image,
      updated_at: new Date().toISOString()
    };

    await databaseService.update('service_pages', id, updateData);
    return true;
  } catch (error) {
    return false;
  }
};

export const deleteServicePage = async (id: string): Promise<boolean> => {
  try {
    await databaseService.delete('service_pages', id);
    return true;
  } catch (error) {
    return false;
  }
};

// Export default service object
const blogService = {
  getServicePages,
  getServicePageBySlug,
  getBlogPosts,
  getBlogPostBySlug,
  getRecentBlogPosts,
  getPopularBlogPosts,
  searchBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  createServicePage,
  updateServicePage,
  deleteServicePage
};

export default blogService;