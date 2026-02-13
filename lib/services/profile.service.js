'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Profile Service
 * Handles user profile operations
 */

/**
 * Get current user profile
 */
export async function getCurrentUserProfile() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized'
      }
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      data: profile
    }

  } catch (error) {
    console.error('Error fetching profile:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
  }
}

/**
 * Get profile by username
 */
export async function getProfileByUsername(username) {
  try {
    const supabase = await createClient()

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !profile) {
      return {
        success: false,
        error: 'Profile not found'
      }
    }

    return {
      success: true,
      data: profile
    }

  } catch (error) {
    console.error('Error fetching profile:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
  }
}