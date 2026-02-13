import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isValidUrl } from '@/lib/utils'

/**
 * GET /api/social-links
 * Get all social links for the current user
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

    const { data: links, error } = await supabase
      .from('social_links')
      .select('*')
      .eq('user_id', user.id)
      .order('position', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      success: true,
      data: links || []
    })

  } catch (error) {
    console.error('Error fetching social links:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/social-links
 * Create a new social link
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
    if (!body.platform) {
      return NextResponse.json(
        { error: 'Platform is required' },
        { status: 400 }
      )
    }

    if (!body.url || !isValidUrl(body.url)) {
      return NextResponse.json(
        { error: 'Valid URL is required' },
        { status: 400 }
      )
    }

    // Get max position for user
    const { data: maxPositionData } = await supabase
      .from('social_links')
      .select('position')
      .eq('user_id', user.id)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle() // Usamos maybeSingle en lugar de single para evitar errores si la tabla está vacía

    const nextPosition = (maxPositionData?.position || 0) + 1

    // Create social link
    const { data: newLink, error } = await supabase
      .from('social_links')
      .insert({
        user_id: user.id,
        platform: body.platform,
        url: body.url.trim(),
        label: body.label?.trim() || null,
        position: nextPosition,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      success: true,
      data: newLink
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating social link:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    )
  }
}