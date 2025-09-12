import { supabase } from './supabase';

// Get all conversations for the current user
export async function getUserConversations() {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to view conversations');
    }
    
    const { data: isAdmin } = await supabase.rpc('is_admin');
    
    let query = supabase
      .from('conversations')
      .select(`
        *,
        user:profiles!user_id(id, full_name, avatar_url),
        admin:profiles!admin_id(id, full_name, avatar_url)
      `)
      .order('last_message_time', { ascending: false });
    
    // Filter based on user role
    if (isAdmin) {
      // Admins can see all conversations they're assigned to
      query = query.eq('admin_id', user.id).or(`admin_id.is.null`);
    } else {
      // Regular users can only see their own conversations
      query = query.eq('user_id', user.id);
    }
    
    const { data: conversations, error } = await query;
    
    if (error) throw error;
    return { conversations, error: null };
  } catch (error) {
    return { conversations: [], error };
  }
}

// Get a single conversation by ID
export async function getConversation(conversationId: string) {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to view a conversation');
    }
    
    const { data: isAdmin } = await supabase.rpc('is_admin');
    
    // Get conversation details
    let query = supabase
      .from('conversations')
      .select(`
        *,
        user:profiles!user_id(id, full_name, avatar_url),
        admin:profiles!admin_id(id, full_name, avatar_url)
      `)
      .eq('id', conversationId);
    
    // Regular users can only access their own conversations
    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }
    
    const { data: conversation, error: convError } = await query.single();
    
    if (convError) throw convError;
    
    // Get messages for this conversation
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select(`
        *,
        sender_user:profiles!user_id(id, full_name, avatar_url),
        sender_admin:profiles!admin_id(id, full_name, avatar_url)
      `)
      .or(`user_id.eq.${conversation.user_id},admin_id.eq.${conversation.admin_id || 'null'}`)
      .order('created_at', { ascending: true });
    
    if (msgError) throw msgError;
    
    // Mark all messages as read for the current user
    if (isAdmin && conversation.admin_id === user.id) {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('user_id', conversation.user_id)
        .eq('is_read', false);
      
      // Reset unread count
      await supabase
        .from('conversations')
        .update({ unread_count: 0 })
        .eq('id', conversationId);
    } else if (!isAdmin && conversation.user_id === user.id) {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('admin_id', conversation.admin_id)
        .eq('is_read', false);
      
      // Reset unread count
      await supabase
        .from('conversations')
        .update({ unread_count: 0 })
        .eq('id', conversationId);
    }
    
    return { 
      conversation, 
      messages,
      error: null 
    };
  } catch (error) {
    return { 
      conversation: null, 
      messages: [],
      error 
    };
  }
}

// Start a new conversation
export async function startConversation(data: {
  subject: string;
  initial_message: string;
  order_id?: string;
  order_number?: string;
}) {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to start a conversation');
    }
    
    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        subject: data.subject,
        status: 'active',
        last_message: data.initial_message,
        last_message_time: new Date().toISOString(),
        order_id: data.order_id || null,
        order_number: data.order_number || null
      })
      .select()
      .single();
    
    if (convError) throw convError;
    
    // Add initial message
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({
        user_id: user.id,
        content: data.initial_message,
        is_read: false,
        sender_type: 'user'
      })
      .select()
      .single();
    
    if (msgError) throw msgError;
    
    return { conversation, message, error: null };
  } catch (error) {
    return { conversation: null, message: null, error };
  }
}

// Send a message in a conversation
export async function sendMessage(conversationId: string, content: string, attachments?: string[]) {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to send a message');
    }
    
    // Get conversation to check permissions
    const { data: isAdmin } = await supabase.rpc('is_admin');
    
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
    
    if (convError) throw convError;
    
    // Verify user has access to this conversation
    if (!isAdmin && conversation.user_id !== user.id) {
      throw new Error('You do not have permission to send messages in this conversation');
    }
    
    // Determine sender type and IDs
    const senderType = isAdmin ? 'admin' : 'user';
    const messageData: any = {
      content,
      is_read: false,
      sender_type: senderType,
      attachments: attachments || null
    };
    
    if (senderType === 'admin') {
      messageData.admin_id = user.id;
      messageData.user_id = conversation.user_id;
    } else {
      messageData.user_id = user.id;
      messageData.admin_id = conversation.admin_id;
    }
    
    // Send message
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();
    
    if (msgError) throw msgError;
    
    // Update conversation with last message
    const { error: updateError } = await supabase
      .from('conversations')
      .update({
        last_message: content,
        last_message_time: new Date().toISOString(),
        unread_count: conversation.unread_count + 1
      })
      .eq('id', conversationId);
    
    if (updateError) throw updateError;
    
    return { message, error: null };
  } catch (error) {
    return { message: null, error };
  }
}

// Assign an admin to a conversation (admin only)
export async function assignConversation(conversationId: string, adminId: string) {
  try {
    // Check if user is an admin
    const { data: isAdmin } = await supabase.rpc('is_admin');
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    const { data: conversation, error } = await supabase
      .from('conversations')
      .update({ admin_id: adminId })
      .eq('id', conversationId)
      .select()
      .single();
    
    if (error) throw error;
    return { conversation, error: null };
  } catch (error) {
    return { conversation: null, error };
  }
}

// Close a conversation
export async function closeConversation(conversationId: string) {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to close a conversation');
    }
    
    // Check if user is an admin
    const { data: isAdmin } = await supabase.rpc('is_admin');
    
    // Verify user has access to this conversation
    let query = supabase
      .from('conversations')
      .update({ status: 'closed' })
      .eq('id', conversationId);
    
    // Add permission check for non-admins
    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }
    
    const { data: conversation, error } = await query
      .select()
      .single();
    
    if (error) throw error;
    return { conversation, error: null };
  } catch (error) {
    return { conversation: null, error };
  }
}

// Get unread message count
export async function getUnreadMessageCount() {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { count: 0, error: null };
    }
    
    const { data: isAdmin } = await supabase.rpc('is_admin');
    
    let query = supabase
      .from('conversations')
      .select('unread_count', { count: 'exact', head: true });
    
    // Filter based on user role
    if (isAdmin) {
      query = query.eq('admin_id', user.id);
    } else {
      query = query.eq('user_id', user.id);
    }
    
    const { count, error } = await query;
    
    if (error) throw error;
    return { count: count || 0, error: null };
  } catch (error) {
    return { count: 0, error };
  }
}

// Subscribe to new messages in real-time
// Type definition for Realtime payload
interface RealtimePayload {
  new: any;
  old: any;
  commit_timestamp: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}

export function subscribeToMessages(conversationId: string, callback: (message: any) => void) {
  return supabase
    .channel(`messages:${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, (payload: RealtimePayload) => {
      callback(payload.new);
    })
    .subscribe();
}
