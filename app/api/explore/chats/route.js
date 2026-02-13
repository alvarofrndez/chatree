import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/explore/chats
 * Get public chats with pagination, filtering, and search
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - search: string (searches in title, description, tags)
 * - platform: string (filter by AI platform)
 * - sort: 'recent' | 'popular' | 'views' (default: 'recent')
 */
export async function GET(request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const offset = (page - 1) * limit

    const search = searchParams.get('search')?.trim() || ''
    const platform = searchParams.get('platform')?.trim() || ''
    const sort = searchParams.get('sort') || 'recent'

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

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`)
    }

    if (platform && platform !== 'all') {
      query = query.eq('ai_platform', platform)
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

    query = query.range(offset, offset + limit - 1)

    const { data: chats, error, count } = await query

    if (error) {
      throw error
    }

    const totalPages = Math.ceil((count || 0) / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      data: chats || [],
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