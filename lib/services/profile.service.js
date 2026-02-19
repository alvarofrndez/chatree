'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Profile Service
 * Handles user profile operations
 */

// ─── Get current user profile ─────────────────────────────────────────────────
export async function getCurrentUserProfile() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) return { success: false, error: 'Unauthorized' }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) return { success: false, error: error.message }

    return { success: true, data: profile }
  } catch (error) {
    console.error('Error fetching profile:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Internal server error' }
  }
}

// ─── Get profile by username ──────────────────────────────────────────────────
export async function getProfileByUsername(username) {
  try {
    const supabase = await createClient()

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !profile) return { success: false, error: 'Profile not found' }

    return { success: true, data: profile }
  } catch (error) {
    console.error('Error fetching profile:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Internal server error' }
  }
}

// ─── Update profile fields ────────────────────────────────────────────────────
/**
 * Update username, full_name, bio, and/or avatar_url for the current user.
 * The avatar image itself is uploaded client-side to Supabase Storage;
 * this function only persists the resulting public URL to the profiles table.
 *
 * @param {{ username?: string, full_name?: string, bio?: string, avatar_url?: string }} fields
 */
export async function updateProfile(fields) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) return { success: false, error: 'Unauthorized' }

    // ── Validate username if provided ──────────────────────────────────────
    if (fields.username !== undefined) {
      const username = fields.username.trim().toLowerCase()

      if (username.length < 3 || username.length > 30) {
        return { success: false, error: 'Username must be between 3 and 30 characters' }
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return { success: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' }
      }

      // Check uniqueness — exclude current user
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', user.id)
        .maybeSingle()

      if (existing) {
        return { success: false, error: 'Username is already taken' }
      }

      fields = { ...fields, username }
    }

    // ── Validate bio length ────────────────────────────────────────────────
    if (fields.bio !== undefined && fields.bio.length > 160) {
      return { success: false, error: 'Bio must be 160 characters or fewer' }
    }

    // ── Persist to DB ──────────────────────────────────────────────────────
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({
        ...fields,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      // Supabase returns a specific code for unique constraint violations
      if (updateError.code === '23505') {
        return { success: false, error: 'Username is already taken' }
      }
      return { success: false, error: updateError.message }
    }

    return { success: true, data: profile }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Internal server error' }
  }
}

// ─── Delete avatar from Storage ───────────────────────────────────────────────
/**
 * Remove the user's avatar from Supabase Storage.
 * Called when the user removes their photo or replaces it with a new one.
 *
 * @param {string} avatarUrl  Full public URL of the avatar to delete
 */
export async function deleteAvatar(avatarUrl) {
  try {
    if (!avatarUrl) return { success: true }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { success: false, error: 'Unauthorized' }

    // Extract the storage path from the full URL
    // URL format: .../storage/v1/object/public/avatars/<userId>/<filename>
    const url = new URL(avatarUrl)
    const pathParts = url.pathname.split('/storage/v1/object/public/avatars/')
    if (pathParts.length < 2) return { success: true } // Not a storage URL, skip

    const storagePath = pathParts[1]

    const { error } = await supabase.storage
      .from('avatars')
      .remove([storagePath])

    if (error) {
      console.error('Error deleting avatar from storage:', error)
      // Non-fatal — the file might already be gone
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting avatar:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Internal server error' }
  }
}