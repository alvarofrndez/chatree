import { NextResponse } from 'next/server'
import { checkUsernameAvailability } from '@/lib/services/auth.service'

/**
 * GET /api/auth/check-username?username=value
 * Checks if a username is available
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json(
        { available: false, error: 'Username is required' },
        { status: 400 }
      )
    }

    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { available: false, error: 'Username must be between 3 and 30 characters' },
        { status: 400 }
      )
    }

    const result = await checkUsernameAvailability(username)

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { available: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}