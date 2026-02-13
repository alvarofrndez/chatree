import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/explore/creators
 * Get creators (users with public profiles) with pagination, filtering, and search
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - search: string (searches in username, full_name, bio)
 * - sort: 'recent' | 'popular' | 'views' | 'chats' (default: 'recent')
 */
export async function GET(request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Pagination params
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const offset = (page - 1) * limit

    const search = searchParams.get('search')?.trim() || ''
    const sort = searchParams.get('sort') || 'recent'

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

    if (search) {
      query = query.or(`username.ilike.%${search}%,full_name.ilike.%${search}%,bio.ilike.%${search}%`)
    }

    query = query.range(offset, offset + limit - 1)

    const { data: profiles, error, count } = await query

    if (error) {
      throw error
    }

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

    switch (sort) {
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
    const totalPages = Math.ceil((count || 0) / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      data: creators,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    })

  } catch (error) {
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}