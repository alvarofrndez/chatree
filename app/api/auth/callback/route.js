import { createClient } from '@/lib/supabase/server'
import { createOrUpdateOAuthProfile } from '@/lib/services/auth.service'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('code', code)

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    console.log('data', data)
    console.log('error', error)
    
    if (!error && data.user) {
      const profileResult = await createOrUpdateOAuthProfile(
        data.user.id,
        {
          email: data.user.email,
          name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
          username: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
          avatar_url: data.user.user_metadata?.avatar_url
        }
      )

      console.log('propfile resutl', profileResult)

      if (!profileResult.success) {
        console.error('Profile creation error:', profileResult.error)
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=profile_creation_failed`)
      }
      
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}