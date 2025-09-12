import { d1Client as supabase } from './d1Client';
import { User } from '@/types/user';

// Interface for post data
interface PostData {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  category_id?: string;
  featured_image?: string;
  status?: string;
  tags?: string[];
  published_at?: string | null;
}

// Check if current user is an admin
export async function isAdmin(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_admin');
    if (error) {
      return false;
    }
    return !!data;
  } catch (error) {
    return false;
  }
}

// Get all users (admin only)
export async function getAllUsers() {
  try {
    // Verify admin access
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { users, error: null };
  } catch (error) {
    return { users: [], error };
  }
}

// Update a user's role (admin only)
export async function updateUserRole(userId: string, role: string) {
  try {
    // Verify admin access
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}

// Delete a user (admin only)
export async function deleteUser(userId: string) {
  try {
    // Verify admin access
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    // Delete user's profile first
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (profileError) throw profileError;
    
    // Then delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    
    if (authError) throw authError;
    
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}

// Get all categories
export async function getAllCategories() {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return { categories, error: null };
  } catch (error) {
    return { categories: [], error };
  }
}

// Create a new category (admin only)
export async function createCategory(name: string, description?: string) {
  try {
    // Verify admin access
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    const slug = name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    
    const { data, error } = await supabase
      .from('categories')
      .insert({ name, slug, description })
      .select()
      .single();
    
    if (error) throw error;
    return { category: data, error: null };
  } catch (error) {
    return { category: null, error };
  }
}

// Update a category (admin only)
export async function updateCategory(categoryId: string, name?: string, description?: string) {
  try {
    // Verify admin access
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    // Create update object
    const updates: any = {};
    if (name) {
      updates.name = name;
      updates.slug = name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    }
    if (description !== undefined) {
      updates.description = description;
    }
    
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', categoryId)
      .select()
      .single();
    
    if (error) throw error;
    return { category: data, error: null };
  } catch (error) {
    return { category: null, error };
  }
}

// Delete a category (admin only)
export async function deleteCategory(categoryId: string) {
  try {
    // Verify admin access
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    // First update all posts with this category to null
    await supabase
      .from('posts')
      .update({ category_id: null })
      .eq('category_id', categoryId);
    
    // Then delete the category
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}

// Get all posts with pagination
export async function getAllPosts(page = 1, limit = 10, status?: string) {
  try {
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('posts')
      .select('*, profiles!inner(*), categories(*)');
    
    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }
    
    // Get count first
    const { count, error: countError } = await supabase
      .from('posts')
      .select('*', { count: 'exact' });
    
    if (countError) throw countError;
    
    // Then get paginated data
    const { data: posts, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    return { 
      posts, 
      totalCount: count || 0, 
      page,
      totalPages: Math.ceil((count || 0) / limit),
      error: null 
    };
  } catch (error) {
    return { posts: [], totalCount: 0, page, totalPages: 0, error };
  }
}

// Create a new post (admin or author only)
export async function createPost(postData: PostData) {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to create a post');
    }
    
    // Generate slug if not provided
    if (!postData.slug) {
      postData.slug = postData.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
    }
    
    // Create post
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        title: postData.title,
        slug: postData.slug,
        content: postData.content,
        excerpt: postData.excerpt || null,
        category_id: postData.category_id || null,
        author_id: user.id,
        featured_image: postData.featured_image || null,
        status: postData.status || 'draft',
        published_at: postData.status === 'published' ? new Date().toISOString() : null
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Add tags if provided
    if (postData.tags && postData.tags.length > 0) {
      const tagConnections = postData.tags.map(tagId => ({
        post_id: post.id,
        tag_id: tagId
      }));
      
      const { error: tagError } = await supabase
        .from('posts_tags')
        .insert(tagConnections);
      
      if (tagError) {
      }
    }
    
    return { post, error: null };
  } catch (error) {
    return { post: null, error };
  }
}

// Update a post (admin or author only)
export async function updatePost(postId: string, postData: PostData) {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to update a post');
    }
    
    // Check if user is an admin
    const adminCheck = await isAdmin();
    
    // If not admin, check if user is the author
    if (!adminCheck) {
      const { data, error } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single();
      
      if (error) throw error;
      
      if (data.author_id !== user.id) {
        throw new Error('You do not have permission to update this post');
      }
    }
    
    // Create update object
    const updates: any = {};
    if (postData.title !== undefined) updates.title = postData.title;
    if (postData.slug !== undefined) updates.slug = postData.slug;
    if (postData.content !== undefined) updates.content = postData.content;
    if (postData.excerpt !== undefined) updates.excerpt = postData.excerpt;
    if (postData.category_id !== undefined) updates.category_id = postData.category_id;
    if (postData.featured_image !== undefined) updates.featured_image = postData.featured_image;
    if (postData.status !== undefined) {
      updates.status = postData.status;
      // Set published_at if changing to published and not already set
      if (postData.status === 'published' && !postData.published_at) {
        updates.published_at = new Date().toISOString();
      }
    }
    if (postData.published_at !== undefined) updates.published_at = postData.published_at;
    
    // Update post
    const { data: post, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', postId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update tags if provided
    if (postData.tags !== undefined) {
      // First delete all existing tag connections
      await supabase
        .from('posts_tags')
        .delete()
        .eq('post_id', postId);
      
      // Then add new tags if any
      if (postData.tags.length > 0) {
        const tagConnections = postData.tags.map(tagId => ({
          post_id: post.id,
          tag_id: tagId
        }));
        
        const { error: tagError } = await supabase
          .from('posts_tags')
          .insert(tagConnections);
        
        if (tagError) {
        }
      }
    }
    
    return { post, error: null };
  } catch (error) {
    return { post: null, error };
  }
}

// Delete a post (admin or author only)
export async function deletePost(postId: string) {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to delete a post');
    }
    
    // Check if user is an admin
    const adminCheck = await isAdmin();
    
    // If not admin, check if user is the author
    if (!adminCheck) {
      const { data, error } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single();
      
      if (error) throw error;
      
      if (data.author_id !== user.id) {
        throw new Error('You do not have permission to delete this post');
      }
    }
    
    // First delete associated tags
    await supabase
      .from('posts_tags')
      .delete()
      .eq('post_id', postId);
    
    // Delete associated comments
    await supabase
      .from('comments')
      .delete()
      .eq('post_id', postId);
    
    // Then delete associated likes
    await supabase
      .from('content_likes')
      .delete()
      .eq('post_id', postId);
    
    // Finally delete the post
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}

// Get all tags
export async function getAllTags() {
  try {
    const { data: tags, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return { tags, error: null };
  } catch (error) {
    return { tags: [], error };
  }
}

// Create a new tag (admin only)
export async function createTag(name: string) {
  try {
    // Verify admin access
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    const slug = name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    
    const { data, error } = await supabase
      .from('tags')
      .insert({ name, slug })
      .select()
      .single();
    
    if (error) throw error;
    return { tag: data, error: null };
  } catch (error) {
    return { tag: null, error };
  }
}

// Delete a tag (admin only)
export async function deleteTag(tagId: string) {
  try {
    // Verify admin access
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    // First delete all tag connections
    await supabase
      .from('posts_tags')
      .delete()
      .eq('tag_id', tagId);
    
    // Then delete the tag
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', tagId);
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}
