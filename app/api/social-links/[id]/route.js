import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isValidUrl } from '@/lib/utils'

/**
 * PATCH /api/social-links/[id]
 * Update a social link
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
    const { data: existingLink, error: fetchError } = await supabase
      .from('social_links')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingLink) {
      return NextResponse.json(
        { error: 'Social link not found' },
        { status: 404 }
      )
    }

    if (existingLink.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validation
    if (body.url !== undefined && !isValidUrl(body.url)) {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData = {}
    if (body.platform !== undefined) updateData.platform = body.platform
    if (body.url !== undefined) updateData.url = body.url.trim()
    if (body.label !== undefined) updateData.label = body.label?.trim() || null

    // Update social link
    const { data: updatedLink, error: updateError } = await supabase
      .from('social_links')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ 
      success: true,
      data: updatedLink
    })

  } catch (error) {
    console.error('Error updating social link:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/social-links/[id]
 * Delete a social link
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
    const { data: existingLink, error: fetchError } = await supabase
      .from('social_links')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingLink) {
      return NextResponse.json(
        { error: 'Social link not found' },
        { status: 404 }
      )
    }

    if (existingLink.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Delete social link
    const { error: deleteError } = await supabase
      .from('social_links')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({ 
      success: true
    })

  } catch (error) {
    console.error('Error deleting social link:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    )
  }
}