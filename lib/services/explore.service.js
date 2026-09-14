'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Explore Service
 * Handles exploration of public chats and creators
 */

/**
 * Get public chats with pagination, filtering, and search.
 *
 * Tag search strategy:
 * - tags.cs.{term}  → exact containment (original) — too strict
 * - Solution: call the search_chats_by_tag(term) RPC to get IDs of chats
 *   whose tags array contains any tag matching ilike '%term%', then
 *   add that as an extra OR condition alongside title/description ilike.
 */
export async function getPublicChats({
  page     = 1,
  limit    = 20,
  search   = '',
  platform = '',
  sort     = 'recent'
}) {
  try {
    const supabase = await createClient()

    const validPage  = Math.max(1, parseInt(page))
    const validLimit = Math.min(100, Math.max(1, parseInt(limit)))
    const offset     = (validPage - 1) * validLimit

    const searchTerm     = search?.trim()   || ''
    const platformFilter = platform?.trim() || ''
    const sortBy         = sort             || 'recent'

    // ── Resolve tag-matching IDs when there's a search term ──────────────────
    // We call the RPC first (cheap: returns only UUIDs) and include those IDs
    // in the main query as an extra OR filter. This gives us partial tag search
    // without having to pull all rows into JS memory.
    let tagMatchIds = []

    if (searchTerm) {
      const { data: tagRows, error: tagError } = await supabase
        .rpc('search_chats_by_tag', { search_term: searchTerm })

      if (!tagError && tagRows?.length) {
        tagMatchIds = tagRows // array of UUIDs
      }
    }

    // ── Build main query ──────────────────────────────────────────────────────
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

    // Search filter: title ilike OR description ilike OR id in tag-match IDs
    if (searchTerm) {
      const orClauses = [
        `title.ilike.%${searchTerm}%`,
        `description.ilike.%${searchTerm}%`,
      ]

      // Only add the id.in clause if we actually found tag matches —
      // an empty in() filter would wrongly return zero results in Supabase.
      if (tagMatchIds.length > 0) {
        orClauses.push(`id.in.(${tagMatchIds.join(',')})`)
      }

      query = query.or(orClauses.join(','))
    }

    // Platform filter
    if (platformFilter && platformFilter !== 'all') {
      query = query.eq('ai_platform', platformFilter)
    }

    // Sorting
    switch (sortBy) {
      case 'popular':
        query = query.order('likes_count',  { ascending: false })
        break
      case 'views':
        query = query.order('views_count',  { ascending: false })
        break
      case 'recent':
      default:
        query = query.order('created_at',   { ascending: false })
        break
    }

    // Pagination
    query = query.range(offset, offset + validLimit - 1)

    const { data: chats, error, count } = await query

    if (error) {
      return { success: false, error: error.message }
    }

    const totalPages = Math.ceil((count || 0) / validLimit)

    return {
      success: true,
      data:    chats || [],
      pagination: {
        page:        validPage,
        limit:       validLimit,
        total:       count || 0,
        totalPages,
        hasNextPage: validPage < totalPages,
        hasPrevPage: validPage > 1,
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
  page  = 1,
  limit = 20,
  search = '',
  sort  = 'recent'
}) {
  try {
    const supabase = await createClient()

    const validPage  = Math.max(1, parseInt(page))
    const validLimit = Math.min(100, Math.max(1, parseInt(limit)))
    const offset     = (validPage - 1) * validLimit

    const searchTerm = search?.trim() || ''
    const sortBy     = sort           || 'recent'

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

    if (searchTerm) {
      query = query.or(
        `username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`
      )
    }

    query = query.range(offset, offset + validLimit - 1)

    const { data: profiles, error, count } = await query

    if (error) {
      return { success: false, error: error.message }
    }

    const creators = profiles.map(profile => {
      const chats = profile.ai_chat_links || []
      return {
        id:         profile.id,
        username:   profile.username,
        full_name:  profile.full_name,
        bio:        profile.bio,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        stats: {
          total_chats: chats.length,
          total_views: chats.reduce((sum, c) => sum + (c.views_count || 0), 0),
          total_likes: chats.reduce((sum, c) => sum + (c.likes_count || 0), 0),
          latest_chat_date: chats.length > 0
            ? chats.reduce((latest, c) => {
                const d = new Date(c.created_at)
                return d > latest ? d : latest
              }, new Date(0)).toISOString()
            : null
        }
      }
    })

    switch (sortBy) {
      case 'popular': creators.sort((a, b) => b.stats.total_likes - a.stats.total_likes);  break
      case 'views':   creators.sort((a, b) => b.stats.total_views - a.stats.total_views);  break
      case 'chats':   creators.sort((a, b) => b.stats.total_chats - a.stats.total_chats);  break
      case 'recent':
      default:
        creators.sort((a, b) => {
          const da = a.stats.latest_chat_date ? new Date(a.stats.latest_chat_date) : new Date(0)
          const db = b.stats.latest_chat_date ? new Date(b.stats.latest_chat_date) : new Date(0)
          return db - da
        })
    }

    const totalPages = Math.ceil((count || 0) / validLimit)

    return {
      success: true,
      data:    creators,
      pagination: {
        page:        validPage,
        limit:       validLimit,
        total:       count || 0,
        totalPages,
        hasNextPage: validPage < totalPages,
        hasPrevPage: validPage > 1,
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

export async function getPublicPrompts({ page = 1, limit = 20, search = '', platform = 'all', sort = 'recent' } = {}) {
  try {
    const supabase = await createClient()
 
    let query = supabase
      .from('ai_prompts')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
 
    if (platform && platform !== 'all') {
      query = query.eq('ai_platform', platform)
    }
 
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,prompt_text.ilike.%${search}%`
      )
    }
 
    switch (sort) {
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
 
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)
 
    const { data, error, count } = await query
 
    if (error) {
      return {
        success: false,
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
      }
    }
 
    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    console.log(data)
 
    return {
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    }
  } catch (error) {
    return {
      success: false,
      data: [],
      pagination: { page, limit, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
    }
  }
}