import { createClient } from '@/lib/supabase/server'

/* =====================================================
   VALIDACIONES
===================================================== */

export function isValidUsername(username) {
  return /^[a-zA-Z0-9_-]{3,30}$/.test(username)
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPassword(password) {
  return password.length >= 8
}

/* =====================================================
   USERNAME
===================================================== */

export async function checkUsernameAvailability(username) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .maybeSingle()

    if (error) {
      return { available: false, error: error.message }
    }

    return { available: !data, error: null }
  } catch (err) {
    return { available: false, error: err.message }
  }
}

/* =====================================================
   EMAIL / PASSWORD SIGNUP
===================================================== */

export async function createUserAccount({
  email,
  password,
  username,
  displayName
}) {
  try {
    if (!isValidEmail(email)) {
      return { success: false, data: null, error: 'Invalid email format' }
    }

    if (!isValidPassword(password)) {
      return {
        success: false,
        data: null,
        error: 'Password must be at least 8 characters long'
      }
    }

    if (!isValidUsername(username)) {
      return {
        success: false,
        data: null,
        error:
          'Username must be 3–30 characters and contain only letters, numbers, underscores or hyphens'
      }
    }

    const { available, error: availabilityError } =
      await checkUsernameAvailability(username)

    if (!available) {
      return { success: false, data: null, error: availabilityError }
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.toLowerCase(),
          full_name: displayName || username
        }
      }
    })

    if (error) {
      return { success: false, data: null, error: error.message }
    }

    return { success: true, data, error: null }
  } catch (err) {
    return { success: false, data: null, error: err.message }
  }
}

/* =====================================================
   OAUTH PROFILE (GOOGLE / GITHUB)
===================================================== */

/**
 * Crea o actualiza el perfil mínimo tras OAuth
 */
export async function createOrUpdateOAuthProfile(userId, userData) {
  try {
    const supabase = await createClient()

    const { data: existingProfile, error: existingError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (existingError) {
      return { success: false, data: null, error: existingError.message }
    }

    if (existingProfile) {
      return { success: true, data: existingProfile, error: null }
    }

    let baseUsername =
      (userData.name || userData.full_name || 'user')
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '')
        .slice(0, 30)
        || 'user'

    let username = baseUsername
    let counter = 1

    while (true) {
      const { available } = await checkUsernameAvailability(username)
      if (available) break
      username = `${baseUsername}${counter}`
      counter++
    }

    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          username,
          full_name: userData.name || userData.full_name || null,
          avatar_url: userData.avatar_url || null,
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .maybeSingle()

    if (insertError) {
      return { success: false, data: null, error: insertError.message }
    }

    return { success: true, data: newProfile, error: null }

  } catch (err) {
    return { success: false, data: null, error: err.message }
  }
}


/* =====================================================
   SET USERNAME (ONBOARDING)
===================================================== */
export async function setUsername(userId, username) {
  try {
    if (!isValidUsername(username)) {
      return { success: false, error: 'Invalid username format' }
    }

    const { available } = await checkUsernameAvailability(username)
    if (!available) {
      return { success: false, error: 'Username already taken' }
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('profiles')
      .update({
        username: username.toLowerCase(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/* =====================================================
   GET PROFILE
===================================================== */
export async function getUserProfile(userId) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      return { success: false, data: null, error: error.message }
    }

    return { success: true, data, error: null }
  } catch (err) {
    return { success: false, data: null, error: err.message }
  }
}
