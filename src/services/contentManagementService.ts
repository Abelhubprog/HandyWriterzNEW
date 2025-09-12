import { d1Client } from '@/lib/d1Client';

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  category: string;
  tags: string[];
  status: 'published' | 'draft' | 'scheduled';
  publishedAt: string;
  readTime: number;
  featuredImage: string;
  likes: number;
  comments: number;
  userHasLiked: boolean;
  views: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface Comment {
  id: string;
  postId: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  userHasLiked: boolean;
}

export class ContentManagementService {
  private db = d1Client;

  // Fetch posts for a specific service
  async getPostsByService(serviceType: string, limit: number = 10, offset: number = 0, category?: string): Promise<Post[]> {
    try {
      let query = this.db.prepare(`SELECT p.*, a.id as author_id, a.full_name as author_name, a.avatar_url as author_avatar, a.role as author_role
                                   FROM posts p
                                   LEFT JOIN authors a ON p.author_id = a.id
                                   WHERE p.service_type = ?
                                   ORDER BY p.created_at DESC`)
        .bind(serviceType);

      if (category && category !== 'all') {
        query = this.db.prepare(`SELECT p.*, a.id as author_id, a.full_name as author_name, a.avatar_url as author_avatar, a.role as author_role
                                 FROM posts p
                                 LEFT JOIN authors a ON p.author_id = a.id
                                 WHERE p.service_type = ? AND p.category = ?
                                 ORDER BY p.created_at DESC`)
          .bind(serviceType, category);
      }

      const { results } = await query.limit(limit).offset(offset).all();

      const postsWithAuthors = results.map((post: any) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || '',
        content: post.content,
        author: {
          id: post.author_id || 'unknown',
          name: post.author_name || 'Unknown Author',
          avatar: post.author_avatar || '/placeholder-avatar.png',
          role: post.author_role || 'user'
        },
        category: post.category,
        tags: JSON.parse(post.tags || '[]'),
        status: post.status,
        publishedAt: post.published_at || post.created_at,
        readTime: Math.ceil((post.content || '').split(' ').length / 200),
        featuredImage: post.featured_image || '/placeholder-image.jpg',
        likes: post.likes_count || 0,
        comments: post.comments_count || 0,
        userHasLiked: false, // Client-side, can be updated via local state
        views: post.views_count || 0
      }));

      return postsWithAuthors;
    } catch (error) {
      console.error('Error fetching posts by service:', error);
      return []; // Fallback to empty or mocks if needed
    }
  }

  // Fetch featured posts for a service
  async getFeaturedPosts(serviceType: string, limit: number = 3): Promise<Post[]> {
    try {
      const { results } = await this.db.prepare(`SELECT p.*, a.id as author_id, a.full_name as author_name, a.avatar_url as author_avatar, a.role as author_role
                                                 FROM posts p
                                                 LEFT JOIN authors a ON p.author_id = a.id
                                                 WHERE p.service_type = ? AND p.featured = true
                                                 ORDER BY p.created_at DESC`)
        .bind(serviceType)
        .limit(limit)
        .all();

      const postsWithAuthors = results.map((post: any) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || '',
        content: post.content,
        author: {
          id: post.author_id || 'unknown',
          name: post.author_name || 'Unknown Author',
          avatar: post.author_avatar || '/placeholder-avatar.png',
          role: post.author_role || 'user'
        },
        category: post.category,
        tags: JSON.parse(post.tags || '[]'),
        status: post.status,
        publishedAt: post.published_at || post.created_at,
        readTime: Math.ceil((post.content || '').split(' ').length / 200),
        featuredImage: post.featured_image || '/placeholder-image.jpg',
        likes: post.likes_count || 0,
        comments: post.comments_count || 0,
        userHasLiked: false,
        views: post.views_count || 0
      }));

      return postsWithAuthors;
    } catch (error) {
      console.error('Error fetching featured posts:', error);
      return [];
    }
  }

  // Fetch categories for a service
  async getCategories(serviceType: string): Promise<Category[]> {
    try {
      const { results } = await this.db.prepare(`SELECT category, COUNT(*) as count
                                                 FROM posts
                                                 WHERE service_type = ?
                                                 GROUP BY category
                                                 ORDER BY count DESC`)
        .bind(serviceType)
        .all();

      return results.map((cat: any) => ({
        id: cat.category.toLowerCase().replace(/\s+/g, '-'),
        name: cat.category,
        slug: cat.category.toLowerCase().replace(/\s+/g, '-'),
        count: Number(cat.count)
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Get popular tags for a service
  async getPopularTags(serviceType: string): Promise<string[]> {
    try {
      const { results } = await this.db.prepare(`SELECT value as tag, COUNT(*) as count
                                                 FROM posts, json_each(posts.tags) as tags
                                                 WHERE posts.service_type = ?
                                                 GROUP BY value
                                                 ORDER BY count DESC
                                                 LIMIT 10`)
        .bind(serviceType)
        .all();

      return results.map((row: any) => row.tag);
    } catch (error) {
      console.error('Error fetching popular tags:', error);
      return [];
    }
  }

  // Fetch comments for a post
  async getCommentsByPost(postId: string): Promise<Comment[]> {
    try {
      const { results } = await this.db.from('comments').select('*').eq('post_id', postId).order('created_at', { ascending: false }).all();

      const commentsWithAuthors = await Promise.all(results.map(async (comment: any) => {
        const { results: authorResults } = await this.db.from('authors').select('id, full_name as name, avatar_url as avatar, role').eq('id', comment.author_id).all();
        const author = authorResults[0] || {
          id: 'unknown',
          name: 'Anonymous',
          avatar: '/placeholder-avatar.png',
          role: 'user'
        };

        return {
          id: comment.id,
          postId: comment.post_id,
          author,
          content: comment.content,
          createdAt: comment.created_at,
          likes: comment.likes_count || 0,
          userHasLiked: false // Client-side
        };
      }));

      return commentsWithAuthors;
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  // Create a new comment
  async createComment(postId: string, content: string, authorId: string): Promise<Comment> {
    try {
      const { success, meta } = await this.db.prepare('INSERT INTO comments (post_id, author_id, content, created_at) VALUES (?, ?, ?, ?) RETURNING *')
        .bind(postId, authorId, content, new Date().toISOString())
        .run();

      if (!success) {
        throw new Error('Failed to create comment');
      }

      const insertedComment = meta.lastRowId;

      // Fetch the created comment with author
      const { results: commentResults } = await this.db.from('comments').select('*').eq('id', insertedComment).all();
      const comment = commentResults[0];

      const { results: authorResults } = await this.db.from('authors').select('id, full_name as name, avatar_url as avatar, role').eq('id', comment.author_id).all();
      const author = authorResults[0] || {
        id: 'unknown',
        name: 'Anonymous',
        avatar: '/placeholder-avatar.png',
        role: 'user'
      };

      // Update post comments count
      await this.db.prepare('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?')
        .bind(postId)
        .run();

      return {
        id: comment.id,
        postId: comment.post_id,
        author,
        content: comment.content,
        createdAt: comment.created_at,
        likes: 0,
        userHasLiked: false
      };
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  // Update post (for likes, views, etc.)
  async updatePost(id: string, updates: Partial<Post>): Promise<void> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.likes !== undefined) updateData.likes_count = updates.likes;
      if (updates.views !== undefined) updateData.views_count = updates.views;

      const { success } = await this.db.prepare(`UPDATE posts SET ${Object.keys(updateData).map(k => `${k} = ?`).join(', ')} WHERE id = ?`)
        .bind(...Object.values(updateData), id)
        .run();

      if (!success) {
        throw new Error('Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  // Delete post
  async deletePost(id: string): Promise<void> {
    try {
      const { success } = await this.db.prepare('DELETE FROM posts WHERE id = ?')
        .bind(id)
        .run();

      if (!success) {
        throw new Error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }
}

export const contentManagementService = new ContentManagementService();
