import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/stats
 * Get statistics for the current user
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user statistics
    const { data, error } = await supabase.rpc('get_user_stats', {
      p_user_id: user.id
    })

    if (error) {
      throw error
    }

    const stats = {
      total_chats: data?.total_chats || 0,
      total_views: data?.total_views || 0,
      total_likes: data?.total_likes || 0,
    }

    return NextResponse.json({ 
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}