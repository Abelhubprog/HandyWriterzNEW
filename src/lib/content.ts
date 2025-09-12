import { d1Client as supabase } from './d1Client';

// Cache storage for frequently accessed content
const contentCache: Record<string, { data: any; timestamp: number }> = {};

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Clear expired cache entries
function cleanupCache() {
  const now = Date.now();
  Object.keys(contentCache).forEach(key => {
    if (now - contentCache[key].timestamp > CACHE_DURATION) {
      delete contentCache[key];
    }
  });
}

// Run cache cleanup every 10 minutes
setInterval(cleanupCache, 10 * 60 * 1000);

// Get all published posts with pagination (optimized with caching)
export async function getPublishedPosts(page = 1, pageSize = 12, categorySlug?: string, serviceType?: string) {
  try {
    // Generate cache key based on function parameters
    const cacheKey = `posts_${page}_${pageSize}_${categorySlug || 'all'}_${serviceType || 'all'}`;
    
    // Check cache first
    if (contentCache[cacheKey] && Date.now() - contentCache[cacheKey].timestamp < CACHE_DURATION) {
      return contentCache[cacheKey].data;
    }
    
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    let query = supabase
      .from('posts')
      .select(`
        *,
        author:profiles(id, full_name, avatar_url),
        category:categories(id, name, slug)
      `, { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    
    // Filter by category if provided
    if (categorySlug) {
      query = query.eq('category.slug', categorySlug);
    }
    
    // Filter by service type if provided
    if (serviceType) {
      query = query.eq('service_type', serviceType);
    }
    
    const { data: posts, count, error } = await query.range(from, to);
    
    if (error) throw error;
    
    const result = { 
      posts, 
      count, 
      currentPage: page, 
      totalPages: Math.ceil((count || 0) / pageSize)
    };
    
    // Store in cache
    contentCache[cacheKey] = {
      data: result,
      timestamp: Date.now()
    };
    
    return result;
  } catch (error) {
    return { posts: [], count: 0, currentPage: page, totalPages: 0 };
  }
}

// Get a single post by slug with optimized loading
// Get post stats (views, likes, comments count) - useful for showing engagement metrics
export async function getPostStats(postId: string) {
  try {
    // Generate cache key
    const cacheKey = `post_stats_${postId}`;
    
    // Check cache first
    if (contentCache[cacheKey] && Date.now() - contentCache[cacheKey].timestamp < CACHE_DURATION) {
      return contentCache[cacheKey].data;
    }
    
    // Get comments count
    const { count: commentsCount, error: commentsError } = await supabase
      .from('comments')
      .select('*', { count: 'exact' })
      .eq('post_id', postId);
    
    if (commentsError) throw commentsError;
    
    // Get likes count
    const { count: likesCount, error: likesError } = await supabase
      .from('content_likes')
      .select('*', { count: 'exact' })
      .eq('post_id', postId);
    
    if (likesError) throw likesError;
    
    // Update view count in posts table (increment by 1)
    const { error: viewError } = await supabase.rpc('increment_post_views', { post_id: postId });
    
    
    // Get current view count
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('views')
      .eq('id', postId)
      .single();
    
    if (postError) throw postError;
    
    const result = {
      commentsCount: commentsCount || 0,
      likesCount: likesCount || 0,
      viewsCount: post?.views || 0,
      error: null
    };
    
    // Store in cache
    contentCache[cacheKey] = {
      data: result,
      timestamp: Date.now()
    };
    
    return result;
  } catch (error) {
    return { commentsCount: 0, likesCount: 0, viewsCount: 0, error };
  }
}

// Get trending posts based on engagement metrics
export async function getTrendingPosts(limit = 5, serviceType?: string) {
  try {
    // Generate cache key
    const cacheKey = `trending_posts_${limit}_${serviceType || 'all'}`;
    
    // Check cache first
    if (contentCache[cacheKey] && Date.now() - contentCache[cacheKey].timestamp < CACHE_DURATION) {
      return contentCache[cacheKey].data;
    }
    
    let query = supabase
      .from('posts')
      .select(`
        *,
        author:profiles(id, full_name, avatar_url),
        category:categories(id, name, slug)
      `)
      .eq('status', 'published')
      .order('views', { ascending: false }); // Order by views first
    
    if (serviceType) {
      query = query.eq('service_type', serviceType);
    }
    
    const { data: posts, error } = await query.limit(limit);
    
    if (error) throw error;
    
    const result = { posts: posts || [], error: null };
    
    // Store in cache
    contentCache[cacheKey] = {
      data: result,
      timestamp: Date.now()
    };
    
    return result;
  } catch (error) {
    return { posts: [], error };
  }
}

// Search posts with optimized performance
export async function searchPosts(query: string, serviceType?: string, limit = 20) {
  try {
    if (!query.trim()) {
      return { posts: [], error: null };
    }
    
    let searchQuery = supabase
      .from('posts')
      .select(`
        *,
        author:profiles(id, full_name, avatar_url),
        category:categories(id, name, slug)
      `)
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
      .order('published_at', { ascending: false });
    
    if (serviceType) {
      searchQuery = searchQuery.eq('service_type', serviceType);
    }
    
    const { data: posts, error } = await searchQuery.limit(limit);
    
    if (error) throw error;
    
    return { posts: posts || [], error: null };
  } catch (error) {
    return { posts: [], error };
  }
}

export async function getPostBySlug(slug: string) {
  try {
    // Generate cache key
    const cacheKey = `post_${slug}`;
    
    // Check cache first
    if (contentCache[cacheKey] && Date.now() - contentCache[cacheKey].timestamp < CACHE_DURATION) {
      return contentCache[cacheKey].data;
    }
    
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(id, full_name, avatar_url, bio),
        category:categories(id, name, slug),
        tags:posts_tags(tag:tags(*))
      `)
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    
    // Get formatted tags array
    const tags = post.tags ? post.tags.map((t: any) => t.tag) : [];
    
    // Increment view count
    const { error: viewError } = await supabase.rpc('increment_post_views', {
      post_id: post.id
    });
    
    
    return { post: { ...post, tags }, error: null };
  } catch (error) {
    return { post: null, error };
  }
}

// Get all categories
export async function getCategories() {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return { categories, error: null };
  } catch (error) {
    return { categories: [], error };
  }
}

// Get all tags
export async function getTags() {
  try {
    const { data: tags, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return { tags, error: null };
  } catch (error) {
    return { tags: [], error };
  }
}

// Like a post (works for both authenticated and anonymous users)
export async function likePost(postId: string) {
  try {
    const { user } = await supabase.auth.getUser();
    
    if (user) {
      // Authenticated like - create a record in post_likes
      const { error } = await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: user.id })
        .single();
      
      if (error && error.code !== '23505') { // Ignore unique constraint violations (already liked)
        throw error;
      }
    } else {
      // Anonymous like - just increment the count
      const { error } = await supabase.rpc('increment_anonymous_post_likes', {
        post_id: postId
      });
      
      if (error) throw error;
    }
    
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}

// Check if the current user has liked a post
export async function hasUserLikedPost(postId: string) {
  try {
    const { user } = await supabase.auth.getUser();
    
    if (!user) return { hasLiked: false, error: null };
    
    const { data, error } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (error) throw error;
    
    return { hasLiked: !!data, error: null };
  } catch (error) {
    return { hasLiked: false, error };
  }
}

// Share post (track share statistics)
export async function sharePost(postId: string, platform: string) {
  try {
    const { user } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('post_shares')
      .insert({ 
        post_id: postId, 
        user_id: user?.id || null, 
        platform 
      });
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}

// Search posts
export async function searchPosts(query: string, page = 1, pageSize = 12) {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    // Use text search capabilities
    const { data: posts, count, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(id, full_name, avatar_url),
        category:categories(id, name, slug)
      `, { count: 'exact' })
      .eq('status', 'published')
      .or(`title.ilike.%${query}%, content.ilike.%${query}%`)
      .order('published_at', { ascending: false })
      .range(from, to);
    
    if (error) throw error;
    
    return { 
      posts, 
      count, 
      currentPage: page, 
      totalPages: Math.ceil((count || 0) / pageSize),
      error: null 
    };
  } catch (error) {
    return { posts: [], count: 0, currentPage: page, totalPages: 0, error };
  }
}
