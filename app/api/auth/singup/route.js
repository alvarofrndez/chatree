import { NextResponse } from 'next/server'
import { createUserAccount } from '@/lib/services/auth.service'

/**
 * POST /api/auth/signup
 * Creates a new user account
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password, username, displayName } = body

    // Validate required fields
    if (!email || !password || !username) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and username are required' },
        { status: 400 }
      )
    }

    // Create user account
    const result = await createUserAccount({
      email,
      password,
      username,
      displayName: displayName || username
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}