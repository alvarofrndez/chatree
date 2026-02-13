import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { isValidUrl } from '@/lib/utils'

/**
 * GET /api/chats
 * Get all chats for the current user
 */
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: chats, error } = await supabase
      .from('ai_chat_links')
      .select('*')
      .eq('user_id', user.id)
      .order('position', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      success: true,
      data: chats || []
    })

  } catch (error) {
    console.error('Error fetching chats:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/chats
 * Create a new chat link
 */
export async function POST(request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validation
    if (!body.title || body.title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    if (!body.url || !isValidUrl(body.url)) {
      return NextResponse.json(
        { error: 'Valid URL is required' },
        { status: 400 }
      )
    }

    if (!body.ai_platform) {
      return NextResponse.json(
        { error: 'AI platform is required' },
        { status: 400 }
      )
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
        title: body.title.trim(),
        url: body.url.trim(),
        ai_platform: body.ai_platform,
        description: body.description?.trim() || null,
        tags: body.tags || [],
        position: nextPosition,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      success: true,
      data: newChat
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating chat:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}