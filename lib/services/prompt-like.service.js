'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

/**
 * Prompt Like Service
 * Handles prompt like operations
 */

/**
 * Get client IP address from headers
 */
async function getClientIp() {
  const headersList = await headers()
  const forwarded = headersList.get('x-forwarded-for')
  const realIp = headersList.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIp) {
    return realIp
  }

  // Fallback IP for development
  return '127.0.0.1'
}

/**
 * Toggle like status for a prompt
 * Returns the new like status and updated count
 */
export async function togglePromptLike(promptId) {
  try {
    const supabase = await createClient()

    // Get current user (optional for anonymous likes)
    const { data: { user } } = await supabase.auth.getUser()

    // Get IP address for anonymous likes
    const ipAddress = await getClientIp()

    // Verify prompt exists
    const { data: prompt, error: promptError } = await supabase
      .from('ai_prompts')
      .select('id, user_id')
      .eq('id', promptId)
      .single()

    if (promptError || !prompt) {
      return {
        success: false,
        error: 'Prompt not found'
      }
    }

    // Don't allow users to like their own prompts
    if (user && user.id === prompt.user_id) {
      return {
        success: false,
        error: 'Cannot like your own prompt'
      }
    }

    // Toggle like using stored procedure
    const { data, error } = await supabase.rpc('toggle_prompt_like', {
      p_prompt_id: promptId,
      p_user_id: user?.id || null,
      p_ip_address: ipAddress,
    })

    if (error) {
      console.error('Error toggling like:', error)
      return {
        success: false,
        error: error.message
      }
    }

    // Get updated like count
    const { data: updatedPrompt } = await supabase
      .from('ai_prompts')
      .select('likes_count')
      .eq('id', promptId)
      .single()

    revalidatePath(`/u/[username]`, 'page')
    revalidatePath('/explore', 'page')

    return {
      success: true,
      liked: data[0]?.liked || false,
      likesCount: updatedPrompt?.likes_count || 0
    }

  } catch (error) {
    console.error('Error toggling like:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
  }
}

/**
 * Check if current user/IP has liked this prompt
 */
export async function checkPromptLikeStatus(promptId) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    const ipAddress = await getClientIp()

    const { data, error } = await supabase.rpc('check_prompt_like_status', {
      p_prompt_id: promptId,
      p_user_id: user?.id || null,
      p_ip_address: ipAddress
    })

    if (error) {
      console.error('Error checking like status:', error)
      return {
        success: false,
        liked: false
      }
    }

    return {
      success: true,
      liked: data || false
    }

  } catch (error) {
    console.error('Error checking like status:', error)
    return {
      success: false,
      liked: false
    }
  }
}

/**
 * Get like statuses for multiple prompts in a single query (bulk)
 */
export async function getPromptLikeStatuses(promptIds) {
  if (!promptIds || promptIds.length === 0) {
    return { success: true, data: {}, userId: null }
  }

  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    const ipAddress = await getClientIp()

    const { data, error } = await supabase.rpc('get_prompt_like_statuses', {
      p_prompt_ids: promptIds,
      p_user_id: user?.id || null,
      p_ip_address: ipAddress
    })

    if (error) {
      console.error('Error fetching bulk like statuses:', error)
      return { success: false, data: {}, userId: user?.id || null }
    }

    const statusMap = {}
    ;(data || []).forEach(row => {
      statusMap[row.prompt_id] = row.liked
    })

    return {
      success: true,
      data: statusMap,
      userId: user?.id || null
    }

  } catch (error) {
    console.error('Error fetching bulk like statuses:', error)
    return {
      success: false,
      data: {},
      userId: null
    }
  }
}