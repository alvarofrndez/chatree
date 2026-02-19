'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import { IoMdEye, IoMdEyeOff } from 'react-icons/io'
import { PiTree } from 'react-icons/pi'
import { SiGoogle, SiGithub } from '@icons-pack/react-simple-icons'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.scss'

function useOAuth(supabase, setError) {
  return async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
        },
      })
      if (error) throw error
    } catch (err) {
      setError(err.message)
    }
  }
}

function ErrorAlert({ message }) {
  if (!message) return null
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`${styles.alert} ${styles.error}`}
    >
      <AlertCircle size={16} aria-hidden="true" />
      {message}
    </div>
  )
}

export default function SigninClient() {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const signInWithOAuth = useOAuth(supabase, setError)

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })
      if (error) throw error
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.backgroundGlow} aria-hidden="true">
        <div className={styles.glowOrb} />
      </div>

      <div className={styles.wrapper}>

        <div className={styles.brand}>
          <Link href="/" className={styles.brandLink} aria-label={`Go to ${process.env.NEXT_PUBLIC_APP_NAME} homepage`}>
            <PiTree className={styles.brandIcon} aria-hidden="true" />
            <span className={styles.brandName}>{process.env.NEXT_PUBLIC_APP_NAME}</span>
          </Link>
          <p className={styles.brandDescription}>Welcome back</p>
        </div>

        <div className={styles.card}>
          <ErrorAlert message={error} />

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.formField}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="alex@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className={styles.input}
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  className={styles.input}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className={styles.toggleButton}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword
                    ? <IoMdEyeOff aria-hidden="true" />
                    : <IoMdEye aria-hidden="true" />
                  }
                </button>
              </div>
            </div>

            <div className={styles.forgotPassword}>
              <Link href="/forgot-password" className={styles.forgotPasswordLink}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
              aria-busy={loading}
            >
              {loading
                ? <><Loader2 size={16} className={styles.spinner} aria-hidden="true" /> Signing in…</>
                : 'Sign In'
              }
            </button>
          </form>

          <div className={styles.divider} aria-hidden="true">
            <span>or</span>
          </div>

          <div
            className={styles.oauthButtonsContainer}
            role="group"
            aria-label="Sign in with a third-party account"
          >
            <button
              type="button"
              onClick={() => signInWithOAuth('github')}
              className={styles.oauthButton}
              disabled={loading}
              aria-label="Continue with GitHub"
            >
              <SiGithub aria-hidden="true" />
              Continue with GitHub
            </button>
            <button
              type="button"
              onClick={() => signInWithOAuth('google')}
              className={styles.oauthButton}
              disabled={loading}
              aria-label="Continue with Google"
            >
              <SiGoogle aria-hidden="true" />
              Continue with Google
            </button>
          </div>
        </div>

        <footer className={styles.footer}>
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/signup">Sign up</Link>
          </p>
        </footer>

      </div>
    </div>
  )
}