'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, Loader2, Mail } from 'lucide-react'
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
    <div role="alert" aria-live="assertive" className={`${styles.alert} ${styles.error}`}>
      <AlertCircle size={16} aria-hidden="true" />
      {message}
    </div>
  )
}

function SuccessScreen({ email }) {
  return (
    <div role="status" aria-live="polite" className={`${styles.alert} ${styles.success}`}>
      <Mail size={32} aria-hidden="true" />
      <h2 style={{ marginBottom: '0.5rem' }}>Verify your email</h2>
      <p>
        We&apos;ve sent a confirmation link to <strong>{email}</strong>.
      </p>
      <p>Please check your inbox (and spam folder) to activate your account.</p>
    </div>
  )
}

export default function SignupClient() {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    fullname: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
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
      if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
        throw new Error('Username can only contain letters, numbers, underscores, and hyphens')
      }
      if (formData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long')
      }

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username.toLowerCase(),
            full_name: formData.fullname,
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
        },
      })

      if (signUpError) throw signUpError

      if (authData.user && !authData.session) {
        setSuccess(true)
        return
      }

      if (authData.session) {
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const appHost = process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL).host
    : `${process.env.NEXT_PUBLIC_APP_NAME?.toLowerCase()}.com`

  return (
    <div className={styles.container}>
      <div className={styles.backgroundGlow} aria-hidden="true">
        <div className={styles.glowOrb} />
      </div>

      <div className={styles.wrapper}>

        <div className={styles.brand}>
          <Link
            href="/"
            className={styles.brandLink}
            aria-label={`Go to ${process.env.NEXT_PUBLIC_APP_NAME} homepage`}
          >
            <PiTree className={styles.brandIcon} aria-hidden="true" />
            <span className={styles.brandName}>{process.env.NEXT_PUBLIC_APP_NAME}</span>
          </Link>
          <p className={styles.brandDescription}>Create your account</p>
        </div>

        <div className={styles.card}>
          <ErrorAlert message={error} />

          {success ? (
            <SuccessScreen email={formData.email} />
          ) : (
            <>
              <form onSubmit={handleSubmit} className={styles.form} noValidate>

                <div className={styles.formField}>
                  <label htmlFor="username" className={styles.label}>
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    name="username"
                    placeholder="alexchen"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    autoComplete="username"
                    pattern="^[a-zA-Z0-9_-]+$"
                    className={styles.input}
                  />
                  <span className={styles.hint} aria-live="polite">
                    Your profile URL:{' '}
                    <strong>
                      {appHost}/u/{formData.username || 'username'}
                    </strong>
                  </span>
                </div>

                <div className={styles.formField}>
                  <label htmlFor="fullname" className={styles.label}>
                    Full Name
                  </label>
                  <input
                    id="fullname"
                    type="text"
                    name="fullname"
                    placeholder="Alex Chen"
                    value={formData.fullname}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    className={styles.input}
                  />
                </div>

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
                      placeholder="Min. 8 characters"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                      autoComplete="new-password"
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

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading
                    ? <><Loader2 size={16} className={styles.spinner} aria-hidden="true" /> Creating account…</>
                    : 'Create Account'
                  }
                </button>
              </form>

              <div className={styles.divider} aria-hidden="true">
                <span>or</span>
              </div>

              <div
                className={styles.oauthButtonsContainer}
                role="group"
                aria-label="Sign up with a third-party account"
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
            </>
          )}
        </div>

        <footer className={styles.footer}>
          <p>
            Already have an account?{' '}
            <Link href="/signin">Sign in</Link>
          </p>
        </footer>

      </div>
    </div>
  )
}