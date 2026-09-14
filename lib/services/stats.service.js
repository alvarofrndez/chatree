'use server'

import { createClient } from '@/lib/supabase/server'

export async function getUserStats() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' }
    }

    const [{ data: chatStats, error: chatStatsError }, { data: promptStats, error: promptStatsError }] =
      await Promise.all([
        supabase
          .from('ai_chat_links')
          .select('views_count, likes_count')
          .eq('user_id', user.id)
          .eq('is_active', true),
        supabase
          .from('ai_prompts')
          .select('views_count, likes_count')
          .eq('user_id', user.id)
          .eq('is_active', true),
      ])

    if (chatStatsError) {
      return { success: false, error: chatStatsError.message }
    }

    if (promptStatsError) {
      return { success: false, error: promptStatsError.message }
    }

    const total_chats = chatStats?.length || 0
    const total_chat_views = chatStats?.reduce((sum, c) => sum + (c.views_count || 0), 0) || 0
    const total_chat_likes = chatStats?.reduce((sum, c) => sum + (c.likes_count || 0), 0) || 0

    const total_prompts = promptStats?.length || 0
    const total_prompt_views = promptStats?.reduce((sum, p) => sum + (p.views_count || 0), 0) || 0
    const total_prompt_likes = promptStats?.reduce((sum, p) => sum + (p.likes_count || 0), 0) || 0

    return {
      success: true,
      data: {
        total_chats: total_chats,
        total_views: total_chat_views + total_prompt_views,
        total_likes: total_chat_likes + total_prompt_likes,
        total_prompts: total_prompts,
        total_chat_views: total_chat_views,
        total_chat_likes: total_chat_likes,
        total_prompt_views: total_prompt_views,
        total_prompt_likes: total_prompt_likes,
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

    const [
      { data: chatStatsData, count: total_chats, error: chatStatsError },
      { data: promptStatsData, count: total_prompts, error: promptStatsError },
    ] = await Promise.all([
      supabase
        .from('ai_chat_links')
        .select('views_count', { count: 'exact' })
        .eq('is_active', true),
      supabase
        .from('ai_prompts')
        .select('views_count', { count: 'exact' })
        .eq('is_active', true),
    ])

    if (chatStatsError) throw chatStatsError;
    if (promptStatsError) throw promptStatsError;

    const total_chat_views = chatStatsData?.reduce((sum, row) => sum + (row.views_count || 0), 0) || 0;
    const total_prompt_views = promptStatsData?.reduce((sum, row) => sum + (row.views_count || 0), 0) || 0;

    return {
      success: true,
      data: {
        total_creators: total_creators || 0,
        total_chats: total_chats || 0,
        total_prompts: total_prompts || 0,
        total_views: total_chat_views + total_prompt_views,
      },
    }
  } catch (error) {
    return {
      success: false,
      data: { total_creators: 0, total_chats: 0, total_prompts: 0, total_views: 0 },
    }
  }
}