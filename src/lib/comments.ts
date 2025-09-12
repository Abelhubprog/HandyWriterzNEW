import { d1Client as supabase } from './d1Client';

// Get comments for a post
export async function getPostComments(postId: string) {
  try {
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:profiles(id, full_name, avatar_url)
      `)
      .eq('post_id', postId)
      .eq('status', 'approved')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return { comments, error: null };
  } catch (error) {
    return { comments: [], error };
  }
}

// Add a comment to a post (requires authentication)
export async function addComment(postId: string, content: string) {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to comment');
    }
    
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        author_id: user.id,
        content,
        status: 'pending' // Set to 'approved' if no moderation is needed
      })
      .select()
      .single();
    
    if (error) throw error;
    return { comment, error: null };
  } catch (error) {
    return { comment: null, error };
  }
}

// Update a comment (author only)
export async function updateComment(commentId: string, content: string) {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to update a comment');
    }
    
    const { data: comment, error } = await supabase
      .from('comments')
      .update({ content })
      .eq('id', commentId)
      .eq('author_id', user.id) // Ensure user owns the comment
      .select()
      .single();
    
    if (error) throw error;
    return { comment, error: null };
  } catch (error) {
    return { comment: null, error };
  }
}

// Delete a comment (author only)
export async function deleteComment(commentId: string) {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to delete a comment');
    }
    
    // Check if user is an admin
    const { data: isAdmin } = await supabase.rpc('is_admin');
    
    let query = supabase
      .from('comments')
      .delete()
      .eq('id', commentId);
    
    // If not admin, restrict to author's own comments
    if (!isAdmin) {
      query = query.eq('author_id', user.id);
    }
    
    const { error } = await query;
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}

// Get comment count for a post
export async function getCommentCount(postId: string) {
  try {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
      .eq('status', 'approved');
    
    if (error) throw error;
    return { count, error: null };
  } catch (error) {
    return { count: 0, error };
  }
}
