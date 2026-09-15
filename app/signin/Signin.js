'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { IoMdEye, IoMdEyeOff } from 'react-icons/io'
import { SiGoogle, SiGithub } from '@icons-pack/react-simple-icons'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import styles from './page.module.scss'
import Image from 'next/image'

// ─── OAuth hook ───────────────────────────────────────────────────────────────
function useOAuth(supabase) {
  return async (provider) => {
    const loadingToast = toast.loading(`Connecting to ${provider === 'github' ? 'GitHub' : 'Google'}…`)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
        },
      })

      if (error) throw error

      toast.dismiss(loadingToast)
    } catch (err) {
      toast.dismiss(loadingToast)

      // Errores conocidos de OAuth
      if (err.message?.toLowerCase().includes('popup')) {
        toast.error('Popup blocked', {
          description: 'Allow popups for this site and try again.',
        })
      } else if (err.message?.toLowerCase().includes('network') || err.message?.toLowerCase().includes('fetch')) {
        toast.error('Connection error', {
          description: 'Check your internet connection and try again.',
        })
      } else {
        toast.error(`Could not sign in with ${provider === 'github' ? 'GitHub' : 'Google'}`, {
          description: err.message || 'Please try again or use email and password.',
        })
      }
    }
  }
}

// ─── Signin Client ────────────────────────────────────────────────────────────
export default function SigninClient() {
  const router   = useRouter()
  const supabase = createClient()

  const [formData,     setFormData]     = useState({ email: '', password: '' })
  const [loading,      setLoading]      = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const signInWithOAuth = useOAuth(supabase)

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // ── Client-side validation ─────────────────────────────────────────────
    if (!formData.email.trim()) {
      toast.warning('Email required', {
        description: 'Please enter your email address.',
      })
      return
    }

    if (!formData.email.includes('@')) {
      toast.warning('Invalid email', {
        description: 'Please enter a valid email address.',
      })
      return
    }

    if (!formData.password) {
      toast.warning('Password required', {
        description: 'Please enter your password.',
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email:    formData.email,
        password: formData.password,
      })

      if (error) throw error

      toast.success('Welcome back!', {
        description: 'Redirecting to your dashboard…',
        duration: 2000,
      })

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      // ── Map Supabase error codes to friendly messages ───────────────────
      const msg = err.message?.toLowerCase() || ''

      if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
        toast.error('Incorrect email or password', {
          description: 'Double-check your credentials and try again.',
        })
      } else if (msg.includes('email not confirmed')) {
        toast.error('Email not verified', {
          description: 'Check your inbox for a confirmation link before signing in.',
        })
      } else if (msg.includes('too many requests') || msg.includes('rate limit')) {
        toast.error('Too many attempts', {
          description: 'Please wait a few minutes before trying again.',
        })
      } else if (msg.includes('network') || msg.includes('fetch')) {
        toast.error('Connection error', {
          description: 'Check your internet connection and try again.',
        })
      } else if (msg.includes('user not found')) {
        toast.error('Account not found', {
          description: 'No account with that email. Try signing up instead.',
        })
      } else {
        toast.error('Could not sign in', {
          description: err.message || 'Something went wrong. Please try again.',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.backgroundGlow} aria-hidden='true'>
        <div className={styles.glowOrb} />
      </div>

      <div className={styles.wrapper}>

        <div className={styles.brand}>
          <Link href='/' className={styles.brandLink} aria-label={`Go to ${process.env.NEXT_PUBLIC_APP_NAME} homepage`}>
            <Image
              className={styles.brandIcon}
              src='/favicon.svg' 
              alt='Logo' 
              width={24}
              height={24}
              aria-hidden='true'
            />
            <span className={styles.brandName}>{process.env.NEXT_PUBLIC_APP_NAME}</span>
          </Link>
          <p className={styles.brandDescription}>Welcome back</p>
        </div>

        <div className={styles.card}>
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.formField}>
              <label htmlFor='email' className={styles.label}>
                Email
              </label>
              <input
                id='email'
                type='email'
                name='email'
                placeholder='alex@example.com'
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete='email'
                className={styles.input}
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor='password' className={styles.label}>
                Password
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  placeholder='••••••••'
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete='current-password'
                  className={styles.input}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword((v) => !v)}
                  className={styles.toggleButton}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword
                    ? <IoMdEyeOff aria-hidden='true' />
                    : <IoMdEye    aria-hidden='true' />
                  }
                </button>
              </div>
            </div>

            <div className={styles.forgotPassword}>
              <Link href='/forgot-password' className={styles.forgotPasswordLink}>
                Forgot password?
              </Link>
            </div>

            <button
              type='submit'
              className={styles.submitButton}
              disabled={loading}
              aria-busy={loading}
            >
              {loading
                ? <><Loader2 size={16} className={styles.spinner} aria-hidden='true' /> Signing in…</>
                : 'Sign In'
              }
            </button>
          </form>

          <div className={styles.divider} aria-hidden='true'>
            <span>or</span>
          </div>

          <div
            className={styles.oauthButtonsContainer}
            role='group'
            aria-label='Sign in with a third-party account'
          >
            <button
              type='button'
              onClick={() => signInWithOAuth('github')}
              className={styles.oauthButton}
              disabled={loading}
              aria-label='Continue with GitHub'
            >
              <SiGithub aria-hidden='true' />
              Continue with GitHub
            </button>
            <button
              type='button'
              onClick={() => signInWithOAuth('google')}
              className={styles.oauthButton}
              disabled={loading}
              aria-label='Continue with Google'
            >
              <SiGoogle aria-hidden='true' />
              Continue with Google
            </button>
          </div>
        </div>

        <footer className={styles.footer}>
          <p>
            Don&apos;t have an account?{' '}
            <Link href='/signup'>Sign up</Link>
          </p>
        </footer>

      </div>
    </div>
  )
}