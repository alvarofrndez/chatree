'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

/**
 * Like Service
 * Handles chat like operations
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
 * Toggle like status for a chat link
 * Returns the new like status and updated count
 */
export async function toggleChatLike(chatId) {
  try {
    const supabase = await createClient()

    // Get current user (optional for anonymous likes)
    const { data: { user } } = await supabase.auth.getUser()

    // Get IP address for anonymous likes
    const ipAddress = await getClientIp()

    // Verify chat link exists
    const { data: chatLink, error: chatError } = await supabase
      .from('ai_chat_links')
      .select('id, user_id')
      .eq('id', chatId)
      .single()

    if (chatError || !chatLink) {
      return {
        success: false,
        error: 'Chat link not found'
      }
    }

    // Don't allow users to like their own chats
    if (user && user.id === chatLink.user_id) {
      return {
        success: false,
        error: 'Cannot like your own chat'
      }
    }

    // Toggle like using stored procedure
    const { data, error } = await supabase.rpc('toggle_chat_like', {
      p_chat_link_id: chatId,
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
    const { data: updatedChat } = await supabase
      .from('ai_chat_links')
      .select('likes_count')
      .eq('id', chatId)
      .single()

    revalidatePath(`/u/[username]`, 'page')
    revalidatePath('/explore', 'page')

    return {
      success: true,
      liked: data[0]?.liked || false,
      likesCount: updatedChat?.likes_count || 0
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
 * Check if current user/IP has liked this chat
 */
export async function checkChatLikeStatus(chatId) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Get IP address
    const ipAddress = await getClientIp()

    const { data, error } = await supabase.rpc('check_chat_like_status', {
      p_chat_link_id: chatId,
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
 * Get like statuses for multiple chats in a single query (bulk)
 * Replaces N individual checkChatLikeStatus calls with one RPC call
 * Returns a map of { chatId: boolean } and the current user ID
 */
export async function getChatLikeStatuses(chatIds) {
  if (!chatIds || chatIds.length === 0) {
    return { success: true, data: {}, userId: null }
  }

  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    const ipAddress = await getClientIp()

    const { data, error } = await supabase.rpc('get_chat_like_statuses', {
      p_chat_ids: chatIds,
      p_user_id: user?.id || null,
      p_ip_address: ipAddress
    })

    if (error) {
      console.error('Error fetching bulk like statuses:', error)
      return { success: false, data: {}, userId: user?.id || null }
    }

    // Convert array [{ chat_id, liked }] to map { chatId: boolean }
    const statusMap = {}
    ;(data || []).forEach(row => {
      statusMap[row.chat_id] = row.liked
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