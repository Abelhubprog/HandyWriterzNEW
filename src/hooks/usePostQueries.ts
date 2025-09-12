import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cloudflareDb } from '@/lib/cloudflare';

// Define post types
export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image?: string;
  service_type: string;
  created_at: string;
  updated_at: string;
  category_id?: number;
  author_id?: string;
  published: boolean;
  likes_count: number;
  anonymous_likes: number;
  views_count: number;
  comments_count: number;
  category?: {
    id: number;
    name: string;
  };
  author?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface PostQueryParams {
  limit?: number;
  offset?: number;
  serviceType?: string;
  searchQuery?: string;
  categoryId?: number;
  sortBy?: 'created_at' | 'likes_count' | 'views_count' | 'comments_count';
  sortOrder?: 'asc' | 'desc';
}

// Helper function to build the query
const buildPostQuery = async ({
  limit = 10,
  offset = 0,
  serviceType,
  searchQuery,
  categoryId,
  sortBy = 'created_at',
  sortOrder = 'desc'
}: PostQueryParams) => {
  let sql = `
    SELECT 
      p.*,
      c.id as category_id, c.name as category_name,
      pr.id as author_id, pr.full_name as author_name, pr.avatar_url as author_avatar
    FROM posts p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN profiles pr ON p.author_id = pr.id
    WHERE p.published = 1
  `;
  const params: any[] = [];

  // Apply filters
  if (serviceType) {
    sql += ` AND p.service_type = ?`;
    params.push(serviceType);
  }

  if (searchQuery) {
    sql += ` AND p.title LIKE ?`;
    params.push(`%${searchQuery}%`);
  }

  if (categoryId) {
    sql += ` AND p.category_id = ?`;
    params.push(categoryId);
  }

  // Apply sorting and pagination
  sql += ` ORDER BY p.${sortBy} ${sortOrder.toUpperCase()}`;
  sql += ` LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  return cloudflareDb.query(sql, params);
};

// React Query hook for fetching posts
export const usePosts = (params: PostQueryParams) => {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: async () => {
      const result = await buildPostQuery(params);
      
      if (!result.success) {
        throw new Error('Failed to fetch posts');
      }
      
      // Transform data to match expected structure
      const posts = result.results?.map((row: any) => ({
        ...row,
        category: row.category_id ? {
          id: row.category_id,
          name: row.category_name
        } : null,
        author: row.author_id ? {
          id: row.author_id,
          full_name: row.author_name,
          avatar_url: row.author_avatar
        } : null
      })) || [];
      
      return posts as Post[];
    },
    keepPreviousData: true,
  });
};

// Hook for fetching a single post
export const usePost = (postId: number | string | undefined) => {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      if (!postId) throw new Error('Post ID is required');
      
      const result = await cloudflareDb.query(`
        SELECT 
          p.*,
          c.id as category_id, c.name as category_name,
          pr.id as author_id, pr.full_name as author_name, pr.avatar_url as author_avatar
        FROM posts p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN profiles pr ON p.author_id = pr.id
        WHERE p.id = ?
      `, [postId]);
      
      if (!result.success || !result.results?.[0]) {
        throw new Error('Post not found');
      }
      
      const row = result.results[0];
      const post = {
        ...row,
        category: row.category_id ? {
          id: row.category_id,
          name: row.category_name
        } : null,
        author: row.author_id ? {
          id: row.author_id,
          full_name: row.author_name,
          avatar_url: row.author_avatar
        } : null
      };
      
      return post as Post;
    },
    enabled: !!postId,
  });
};

// Hook for fetching post by slug
export const usePostBySlug = (slug: string | undefined, serviceType: string | undefined) => {
  return useQuery({
    queryKey: ['post', slug, serviceType],
    queryFn: async () => {
      if (!slug || !serviceType) throw new Error('Slug and service type are required');
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          category:category_id (id, name),
          author:author_id (id, full_name, avatar_url)
        `)
        .eq('slug', slug)
        .eq('service_type', serviceType)
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as Post;
    },
    enabled: !!slug && !!serviceType,
  });
};

// Hook for incrementing post views
export const useIncrementPostView = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postId: number) => {
      const { error } = await supabase.rpc('record_post_view', { post_id: postId });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return true;
    },
    onSuccess: (_, postId) => {
      // Invalidate the post query to refetch with updated view count
      queryClient.invalidateQueries(['post', postId]);
    },
  });
};

// Hook for handling post likes/unlikes
export const usePostLike = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ postId, isAnonymous }: { postId: number; isAnonymous: boolean }) => {
      if (isAnonymous) {
        const { error } = await supabase.rpc('increment_anonymous_likes', { post_id: postId });
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.rpc('like_post', { post_id: postId });
        if (error) throw new Error(error.message);
      }
      return true;
    },
    onSuccess: (_, variables) => {
      // Invalidate the post query to refetch with updated like count
      queryClient.invalidateQueries(['post', variables.postId]);
      queryClient.invalidateQueries(['posts']);
    },
  });
};

// React Query hook for fetching categories
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    staleTime: 5 * 60 * 1000, // Categories don't change often, cache for 5 minutes
  });
}; 