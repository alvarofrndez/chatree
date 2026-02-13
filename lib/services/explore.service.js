'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Explore Service
 * Handles exploration of public chats and creators
 */

/**
 * Get public chats with pagination, filtering, and search
 */
export async function getPublicChats({
  page = 1,
  limit = 20,
  search = '',
  platform = '',
  sort = 'recent'
}) {
  try {
    const supabase = await createClient()

    // Sanitize and validate inputs
    const validPage = Math.max(1, parseInt(page))
    const validLimit = Math.min(100, Math.max(1, parseInt(limit)))
    const offset = (validPage - 1) * validLimit

    const searchTerm = search?.trim() || ''
    const platformFilter = platform?.trim() || ''
    const sortBy = sort || 'recent'

    // Build query
    let query = supabase
      .from('ai_chat_links')
      .select(`
        *,
        profiles!inner (
          id,
          username,
          full_name,
          bio,
          avatar_url
        )
      `, { count: 'exact' })

    // Apply search filter
    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
    }

    // Apply platform filter
    if (platformFilter && platformFilter !== 'all') {
      query = query.eq('ai_platform', platformFilter)
    }

    // Apply sorting
    switch (sortBy) {
      case 'popular':
        query = query.order('likes_count', { ascending: false })
        break
      case 'views':
        query = query.order('views_count', { ascending: false })
        break
      case 'recent':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    // Apply pagination
    query = query.range(offset, offset + validLimit - 1)

    const { data: chats, error, count } = await query

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil((count || 0) / validLimit)
    const hasNextPage = validPage < totalPages
    const hasPrevPage = validPage > 1

    return {
      success: true,
      data: chats || [],
      pagination: {
        page: validPage,
        limit: validLimit,
        total: count || 0,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    }

  } catch (error) {
    console.error('Error fetching public chats:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
  }
}

/**
 * Get creators with public profiles
 */
export async function getPublicCreators({
  page = 1,
  limit = 20,
  search = '',
  sort = 'recent'
}) {
  try {
    const supabase = await createClient()

    // Sanitize and validate inputs
    const validPage = Math.max(1, parseInt(page))
    const validLimit = Math.min(100, Math.max(1, parseInt(limit)))
    const offset = (validPage - 1) * validLimit

    const searchTerm = search?.trim() || ''
    const sortBy = sort || 'recent'

    // Build query
    let query = supabase
      .from('profiles')
      .select(`
        id,
        username,
        full_name,
        bio,
        avatar_url,
        created_at,
        ai_chat_links!left (
          id,
          views_count,
          likes_count,
          created_at
        )
      `, { count: 'exact' })

    // Apply search filter
    if (searchTerm) {
      query = query.or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`)
    }

    // Apply pagination
    query = query.range(offset, offset + validLimit - 1)

    const { data: profiles, error, count } = await query

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    // Transform profiles data and calculate stats
    const creators = profiles.map(profile => {
      const chats = profile.ai_chat_links || []
      
      return {
        id: profile.id,
        username: profile.username,
        full_name: profile.full_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        stats: {
          total_chats: chats.length,
          total_views: chats.reduce((sum, chat) => sum + (chat.views_count || 0), 0),
          total_likes: chats.reduce((sum, chat) => sum + (chat.likes_count || 0), 0),
          latest_chat_date: chats.length > 0 
            ? chats.reduce((latest, chat) => {
                const chatDate = new Date(chat.created_at)
                return chatDate > latest ? chatDate : latest
              }, new Date(0)).toISOString()
            : null
        }
      }
    })

    // Apply sorting (in-memory since we need stats)
    switch (sortBy) {
      case 'popular':
        creators.sort((a, b) => b.stats.total_likes - a.stats.total_likes)
        break
      case 'views':
        creators.sort((a, b) => b.stats.total_views - a.stats.total_views)
        break
      case 'chats':
        creators.sort((a, b) => b.stats.total_chats - a.stats.total_chats)
        break
      case 'recent':
      default:
        creators.sort((a, b) => {
          const dateA = a.stats.latest_chat_date ? new Date(a.stats.latest_chat_date) : new Date(0)
          const dateB = b.stats.latest_chat_date ? new Date(b.stats.latest_chat_date) : new Date(0)
          return dateB - dateA
        })
        break
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil((count || 0) / validLimit)
    const hasNextPage = validPage < totalPages
    const hasPrevPage = validPage > 1

    return {
      success: true,
      data: creators,
      pagination: {
        page: validPage,
        limit: validLimit,
        total: count || 0,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    }

  } catch (error) {
    console.error('Error fetching public creators:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
  }
}