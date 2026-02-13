import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isValidUrl } from '@/lib/utils'

/**
 * GET /api/chats/[id]
 * Get a specific chat link
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: chat, error } = await supabase
      .from('ai_chat_links')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true,
      data: chat
    })

  } catch (error) {
    console.error('Error fetching chat:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/chats/[id]
 * Update a chat link
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify ownership
    const { data: existingChat, error: fetchError } = await supabase
      .from('ai_chat_links')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingChat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      )
    }

    if (existingChat.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validation
    if (body.title !== undefined && body.title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title cannot be empty' },
        { status: 400 }
      )
    }

    if (body.url !== undefined && !isValidUrl(body.url)) {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData = {}
    if (body.title !== undefined) updateData.title = body.title.trim()
    if (body.url !== undefined) updateData.url = body.url.trim()
    if (body.ai_platform !== undefined) updateData.ai_platform = body.ai_platform
    if (body.description !== undefined) updateData.description = body.description?.trim() || null
    if (body.tags !== undefined) updateData.tags = body.tags

    // Update chat link
    const { data: updatedChat, error: updateError } = await supabase
      .from('ai_chat_links')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ 
      success: true,
      data: updatedChat
    })

  } catch (error) {
    console.error('Error updating chat:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/chats/[id]
 * Delete a chat link
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify ownership
    const { data: existingChat, error: fetchError } = await supabase
      .from('ai_chat_links')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingChat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      )
    }

    if (existingChat.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Delete chat link
    const { error: deleteError } = await supabase
      .from('ai_chat_links')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({ 
      success: true
    })

  } catch (error) {
    console.error('Error deleting chat:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}