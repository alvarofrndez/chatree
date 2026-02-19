'use server'

import { createClient } from '@/lib/supabase/server'

export async function getUserStats() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data: stats, error: stats_error } = await supabase
      .from('ai_chat_links')
      .select('views_count, likes_count')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (stats_error) {
      return { success: false, error: stats_error.message }
    }

    const total_chats = stats?.length || 0
    const total_views = stats?.reduce((sum, c) => sum + (c.views_count || 0), 0) || 0
    const total_likes = stats?.reduce((sum, c) => sum + (c.likes_count || 0), 0) || 0

    return {
      success: true,
      data: {
        total_chats: total_chats,
        total_views: total_views,
        total_likes: total_likes,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }
  }
}

export async function getGlobalStats() {
  try {
    const supabase = await createClient()

    const { count: total_creators, error: users_error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (users_error) throw users_error;

    const { data: stats_data, count: total_chats, error: stats_error } = await supabase
      .from('ai_chat_links')
      .select('views_count', { count: 'exact' })
      .eq('is_active', true);

    if (stats_error) throw stats_error;

    const total_views = stats_data?.reduce((sum, row) => sum + (row.views_count || 0), 0) || 0;

    return {
      success: true,
      data: {
        total_creators: total_creators || 0,
        total_chats: total_chats || 0,
        total_views: total_views,
      },
    }
  } catch (error) {
    return {
      success: false,
      data: { total_creators: 0, total_chats: 0, total_views: 0 },
    }
  }
}