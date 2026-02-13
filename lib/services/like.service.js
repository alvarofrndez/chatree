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
function getClientIp() {
  const headersList = headers()
  const forwarded = headersList.get('x-forwarded-for')
  const realIp = headersList.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  return null
}

/**
 * Toggle like status for a chat link
 */
export async function toggleChatLike(chatId) {
  try {
    const supabase = await createClient()

    // Get current user (optional for anonymous likes)
    const { data: { user } } = await supabase.auth.getUser()

    // Get IP address for anonymous likes
    const ipAddress = getClientIp()

    // Verify chat link exists
    const { data: chatLink, error: chatError } = await supabase
      .from('ai_chat_links')
      .select('id')
      .eq('id', chatId)
      .single()

    if (chatError || !chatLink) {
      return {
        success: false,
        error: 'Chat link not found'
      }
    }

    // Toggle like using stored procedure
    const { data, error } = await supabase.rpc('toggle_chat_like', {
      p_chat_link_id: chatId,
      p_user_id: user?.id || null,
      p_ip_address: ipAddress,
    })

    if (error) {
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

    revalidatePath(`/u/[username]`)
    revalidatePath('/dashboard')

    return {
      success: true,
      liked: data.liked,
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
    const ipAddress = getClientIp()

    let liked = false

    if (user) {
      // Check if user has liked
      const { data } = await supabase
        .from('chat_link_likes')
        .select('id')
        .eq('chat_link_id', chatId)
        .eq('user_id', user.id)
        .maybeSingle()

      liked = !!data
    } else if (ipAddress) {
      // Check if IP has liked (anonymous)
      const { data } = await supabase
        .from('chat_link_likes')
        .select('id')
        .eq('chat_link_id', chatId)
        .eq('ip_address', ipAddress)
        .maybeSingle()

      liked = !!data
    }

    return {
      success: true,
      liked
    }

  } catch (error) {
    console.error('Error checking like status:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
  }
}