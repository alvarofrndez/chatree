import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getClientIp } from '@/lib/utils'

/**
 * POST /api/chats/[id]/like
 * Toggle like status for a chat link
 */
export async function POST(request, { params }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get current user (optional for anonymous likes)
    const { data: { user } } = await supabase.auth.getUser()

    // Get IP address for anonymous likes
    const ipAddress = getClientIp(request)

    // Verify chat link exists
    const { data: chatLink, error: chatError } = await supabase
      .from('ai_chat_links')
      .select('id')
      .eq('id', id)
      .single()

    if (chatError || !chatLink) {
      return NextResponse.json(
        { error: 'Chat link not found' },
        { status: 404 }
      )
    }

    // Toggle like
    const { data, error } = await supabase.rpc('toggle_chat_like', {
      p_chat_link_id: id,
      p_user_id: user?.id || null,
      p_ip_address: ipAddress,
    })

    if (error) {
      throw error
    }

    // Get updated like count
    const { data: updatedChat } = await supabase
      .from('ai_chat_links')
      .select('likes_count')
      .eq('id', id)
      .single()

    return NextResponse.json({ 
      success: true,
      liked: data.liked,
      likesCount: updatedChat?.likes_count || 0
    })

  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/chats/[id]/like
 * Check if current user/IP has liked this chat
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    // Get IP address
    const ipAddress = getClientIp(request)

    let liked = false

    if (user) {
      // Check if user has liked
      const { data } = await supabase
        .from('chat_link_likes')
        .select('id')
        .eq('chat_link_id', id)
        .eq('user_id', user.id)
        .maybeSingle() // Usamos maybeSingle para evitar ruidos de error si no existe

      liked = !!data
    } else if (ipAddress) {
      // Check if IP has liked (anonymous)
      const { data } = await supabase
        .from('chat_link_likes')
        .select('id')
        .eq('chat_link_id', id)
        .eq('ip_address', ipAddress)
        .maybeSingle()

      liked = !!data
    }

    return NextResponse.json({ 
      success: true,
      liked 
    })

  } catch (error) {
    console.error('Error checking like status:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    )
  }
}