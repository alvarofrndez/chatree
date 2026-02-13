'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Stats Service
 * Handles user statistics operations
 */

/**
 * Get user statistics (total chats, views, likes)
 */
export async function getUserStats() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized'
      }
    }

    // Get total chats
    const { count: totalChats, error: chatsError } = await supabase
      .from('ai_chat_links')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (chatsError) {
      console.error('Error fetching chats count:', chatsError)
    }

    // Get total views and likes
    const { data: stats, error: statsError } = await supabase
      .from('ai_chat_links')
      .select('views_count, likes_count')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (statsError) {
      console.error('Error fetching stats:', statsError)
    }

    const totalViews = stats?.reduce((sum, chat) => sum + (chat.views_count || 0), 0) || 0
    const totalLikes = stats?.reduce((sum, chat) => sum + (chat.likes_count || 0), 0) || 0

    return {
      success: true,
      data: {
        total_chats: totalChats || 0,
        total_views: totalViews,
        total_likes: totalLikes
      }
    }

  } catch (error) {
    console.error('Error fetching user stats:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
  }
}