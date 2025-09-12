import { supabase } from './supabaseClient'
import type { Database } from '../../types/database.types'

export const queries = {
  // Messages queries
  getMessagesForUser: (userId: string) => {
    return supabase
      .from('messages')
      .select(`
        *,
        user_profile:profiles!messages_user_id_fkey (
          full_name
        ),
        admin_profile:profiles!messages_admin_id_fkey (
          full_name
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  },

  // Content revision queries
  getContentRevisions: (contentId: string) => {
    return supabase
      .from('content_revisions')
      .select(`
        *,
        author:profiles!content_revisions_created_by_fkey (
          full_name
        )
      `)
      .eq('content_id', contentId)
      .order('version', { ascending: false })
  },

  // Recent content revisions
  getRecentRevisions: (days = 7) => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    return supabase
      .from('content_revisions')
      .select(`
        *,
        author:profiles!content_revisions_created_by_fkey (
          full_name
        )
      `)
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false })
  },

  // Recent messages
  getRecentMessages: (hours = 24) => {
    const cutoffDate = new Date()
    cutoffDate.setHours(cutoffDate.getHours() - hours)
    
    return supabase
      .from('messages')
      .select(`
        *,
        user_profile:profiles!messages_user_id_fkey (
          full_name
        ),
        admin_profile:profiles!messages_admin_id_fkey (
          full_name
        )
      `)
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false })
  }
}
