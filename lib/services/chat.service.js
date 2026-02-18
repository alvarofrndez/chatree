'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isValidUrl } from '@/lib/utils'

/**
 * Chat Service
 * Handles all chat-related database operations
 */

/**
 * Get all chats for the current user
 */
export async function getUserChats() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized'
      }
    }

    const { data: chats, error } = await supabase
      .from('ai_chat_links')
      .select('*')
      .eq('user_id', user.id)
      .order('position', { ascending: true })

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      data: chats || []
    }

  } catch (error) {
    console.error('Error fetching chats:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
  }
}

/**
 * Get a specific chat by ID
 */
export async function getChatById(chatId) {
  try {
    const supabase = await createClient()

    const { data: chat, error } = await supabase
      .from('ai_chat_links')
      .select('*')
      .eq('id', chatId)
      .single()

    if (error || !chat) {
      return {
        success: false,
        error: 'Chat not found'
      }
    }

    return {
      success: true,
      data: chat
    }

  } catch (error) {
    console.error('Error fetching chat:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
  }
}

/**
 * Create a new chat link
 */
export async function createChat(chatData) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized'
      }
    }

    // Validation
    if (!chatData.title || chatData.title.trim().length === 0) {
      return {
        success: false,
        error: 'Title is required'
      }
    }

    if (!chatData.url || !isValidUrl(chatData.url)) {
      return {
        success: false,
        error: 'Valid URL is required'
      }
    }

    if (!chatData.ai_platform) {
      return {
        success: false,
        error: 'AI platform is required'
      }
    }

    // Get max position for user
    const { data: maxPositionData } = await supabase
      .from('ai_chat_links')
      .select('position')
      .eq('user_id', user.id)
      .order('position', { ascending: false })
      .limit(1)
      .single()

    const nextPosition = (maxPositionData?.position || 0) + 1

    // Create chat link
    const { data: newChat, error } = await supabase
      .from('ai_chat_links')
      .insert({
        user_id: user.id,
        title: chatData.title.trim(),
        url: chatData.url.trim(),
        ai_platform: chatData.ai_platform,
        description: chatData.description?.trim() || null,
        tags: chatData.tags || [],
        position: nextPosition,
      })
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    revalidatePath('/dashboard')
    revalidatePath(`/u/${user.id}`)

    return {
      success: true,
      data: newChat
    }

  } catch (error) {
    console.error('Error creating chat:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
  }
}

/**
 * Update an existing chat link
 */
export async function updateChat(chatId, updateData) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized'
      }
    }

    // Verify ownership
    const { data: existingChat, error: fetchError } = await supabase
      .from('ai_chat_links')
      .select('user_id')
      .eq('id', chatId)
      .single()

    if (fetchError || !existingChat) {
      return {
        success: false,
        error: 'Chat not found'
      }
    }

    if (existingChat.user_id !== user.id) {
      return {
        success: false,
        error: 'Forbidden'
      }
    }

    // Validation
    if (updateData.title !== undefined && updateData.title.trim().length === 0) {
      return {
        success: false,
        error: 'Title cannot be empty'
      }
    }

    if (updateData.url !== undefined && !isValidUrl(updateData.url)) {
      return {
        success: false,
        error: 'Invalid URL'
      }
    }

    // Prepare update data
    const dataToUpdate = {}
    if (updateData.title !== undefined) dataToUpdate.title = updateData.title.trim()
    if (updateData.url !== undefined) dataToUpdate.url = updateData.url.trim()
    if (updateData.ai_platform !== undefined) dataToUpdate.ai_platform = updateData.ai_platform
    if (updateData.description !== undefined) dataToUpdate.description = updateData.description?.trim() || null
    if (updateData.tags !== undefined) dataToUpdate.tags = updateData.tags

    // Update chat link
    const { data: updatedChat, error: updateError } = await supabase
      .from('ai_chat_links')
      .update(dataToUpdate)
      .eq('id', chatId)
      .select()
      .single()

    if (updateError) {
      return {
        success: false,
        error: updateError.message
      }
    }

    revalidatePath('/dashboard')
    revalidatePath(`/u/${user.id}`)

    return {
      success: true,
      data: updatedChat
    }

  } catch (error) {
    console.error('Error updating chat:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
  }
}

/**
 * Delete a chat link
 */
export async function deleteChat(chatId) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized'
      }
    }

    // Verify ownership
    const { data: existingChat, error: fetchError } = await supabase
      .from('ai_chat_links')
      .select('user_id')
      .eq('id', chatId)
      .single()

    if (fetchError || !existingChat) {
      return {
        success: false,
        error: 'Chat not found'
      }
    }

    if (existingChat.user_id !== user.id) {
      return {
        success: false,
        error: 'Forbidden'
      }
    }

    // Delete chat link
    const { error: deleteError } = await supabase
      .from('ai_chat_links')
      .delete()
      .eq('id', chatId)

    if (deleteError) {
      return {
        success: false,
        error: deleteError.message
      }
    }

    revalidatePath('/dashboard')
    revalidatePath(`/u/${user.id}`)

    return {
      success: true
    }

  } catch (error) {
    console.error('Error deleting chat:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
  }
}

/**
 * Increment view count for a chat
 * Only increments if the visitor is NOT the owner
 */
export async function incrementChatViews(chatId) {
  try {
    const supabase = await createClient()
    
    // Get current user (null if not logged in)
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data, error } = await supabase.rpc('increment_chat_views', {
      chat_id: chatId,
      visitor_user_id: user?.id || null
    })
    
    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    // data es un boolean que indica si se incrementó
    revalidatePath(`/u/[username]`, 'page')
    revalidatePath('/explore', 'page')
    
    return {
      success: true,
      incremented: data
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
  }
}