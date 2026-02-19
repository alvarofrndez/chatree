'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Mail, AlertCircle } from 'lucide-react'
import { IoMdEye, IoMdEyeOff } from 'react-icons/io'
import { PiTree } from 'react-icons/pi'
import { SiGoogle, SiGithub } from '@icons-pack/react-simple-icons'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import styles from './page.module.scss'

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
      if (err.message?.toLowerCase().includes('popup')) {
        toast.error('Popup blocked', { description: 'Allow popups for this site and try again.' })
      } else if (err.message?.toLowerCase().includes('network') || err.message?.toLowerCase().includes('fetch')) {
        toast.error('Connection error', { description: 'Check your internet connection and try again.' })
      } else {
        toast.error(`Could not continue with ${provider === 'github' ? 'GitHub' : 'Google'}`, {
          description: err.message || 'Please try again or use email and password.',
        })
      }
    }
  }
}

// ─── Field Error ──────────────────────────────────────────────────────────────
function FieldError({ message }) {
  if (!message) return null
  return (
    <span className={styles.fieldError} role="alert" aria-live="polite">
      <AlertCircle size={12} aria-hidden="true" />
      {message}
    </span>
  )
}

// ─── Validation ───────────────────────────────────────────────────────────────
function validateForm(formData) {
  const errors = {}

  // username
  if (!formData.username.trim()) {
    errors.username = 'Choose a username for your profile'
  } else if (formData.username.length < 3) {
    errors.username = 'Must be at least 3 characters'
  } else if (formData.username.length > 30) {
    errors.username = 'Must be 30 characters or fewer'
  } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
    errors.username = 'Only letters, numbers, _ and - are allowed'
  }

  // fullname
  if (!formData.fullname.trim()) {
    errors.fullname = 'Enter your full name'
  } else if (formData.fullname.trim().length < 2) {
    errors.fullname = 'Name is too short'
  }

  // email
  if (!formData.email.trim()) {
    errors.email = 'Enter your email address'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Enter a valid email address'
  }

  // password
  if (!formData.password) {
    errors.password = 'Choose a password'
  } else if (formData.password.length < 8) {
    errors.password = `${formData.password.length}/8 characters minimum`
  } else if (!/[A-Z]/.test(formData.password) && !/[0-9]/.test(formData.password)) {
    errors.password = 'Add at least one number or uppercase letter'
  }

  return errors
}

// ─── Success Screen ───────────────────────────────────────────────────────────
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

// ─── Signup Client ────────────────────────────────────────────────────────────
export default function SignupClient() {
  const router   = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    email:    '',
    password: '',
    username: '',
    fullname: '',
  })
  const [fieldErrors,  setFieldErrors]  = useState({})
  const [touched,      setTouched]      = useState({})
  const [loading,      setLoading]      = useState(false)
  const [success,      setSuccess]      = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const signInWithOAuth = useOAuth(supabase)

  // ── Field change — validate on the fly once a field has been touched ────────
  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const next = { ...prev, [name]: value }
      // Only re-validate if user has already tried submitting or left the field
      if (touched[name]) {
        const errors = validateForm(next)
        setFieldErrors((prev) => ({ ...prev, [name]: errors[name] || null }))
      }
      return next
    })
  }, [touched])

  // ── On blur — mark field as touched and validate immediately ─────────────
  const handleBlur = useCallback((e) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    const errors = validateForm(formData)
    setFieldErrors((prev) => ({ ...prev, [name]: errors[name] || null }))
  }, [formData])

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Mark all fields as touched so errors show everywhere
    setTouched({ username: true, fullname: true, email: true, password: true })

    const errors = validateForm(formData)
    setFieldErrors(errors)

    const errorCount = Object.keys(errors).length
    if (errorCount > 0) {
      // Single toast summarizing how many fields need attention
      toast.warning(
        errorCount === 1
          ? 'Fix the field highlighted below'
          : `Fix the ${errorCount} fields highlighted below`,
        { description: 'All required fields must be valid before creating your account.' }
      )
      // Focus the first invalid field for accessibility
      const firstErrorField = ['username', 'fullname', 'email', 'password'].find((f) => errors[f])
      if (firstErrorField) document.getElementById(firstErrorField)?.focus()
      return
    }

    setLoading(true)

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email:    formData.email,
        password: formData.password,
        options: {
          data: {
            username:  formData.username.toLowerCase(),
            full_name: formData.fullname,
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
        },
      })

      if (signUpError) throw signUpError

      // Email confirmation required
      if (authData.user && !authData.session) {
        setSuccess(true)
        toast.success('Account created!', {
          description: `A confirmation link has been sent to ${formData.email}.`,
          duration: 6000,
        })
        return
      }

      // Direct session (email confirmation disabled)
      if (authData.session) {
        toast.success('Welcome!', {
          description: 'Your account is ready. Taking you to your dashboard…',
          duration: 2000,
        })
        router.push('/dashboard')
      }
    } catch (err) {
      const msg = err.message?.toLowerCase() || ''

      if (msg.includes('already registered') || msg.includes('user already exists') || msg.includes('email address is already')) {
        // Surface as a field error AND a toast — the user needs to see where to fix it
        setFieldErrors((prev) => ({ ...prev, email: 'An account with this email already exists' }))
        toast.error('Email already in use', {
          description: 'Try signing in instead, or reset your password if you forgot it.',
        })
      } else if (msg.includes('username') && msg.includes('taken')) {
        setFieldErrors((prev) => ({ ...prev, username: 'This username is already taken' }))
        toast.error('Username taken', {
          description: 'Please choose a different username.',
        })
      } else if (msg.includes('password') && (msg.includes('weak') || msg.includes('strength'))) {
        setFieldErrors((prev) => ({ ...prev, password: 'Password is too weak' }))
        toast.error('Password too weak', {
          description: 'Use a mix of uppercase letters, numbers, and symbols.',
        })
      } else if (msg.includes('rate limit') || msg.includes('too many')) {
        toast.error('Too many attempts', {
          description: 'Please wait a few minutes before trying again.',
        })
      } else if (msg.includes('network') || msg.includes('fetch')) {
        toast.error('Connection error', {
          description: 'Check your internet connection and try again.',
        })
      } else if (msg.includes('invalid email')) {
        setFieldErrors((prev) => ({ ...prev, email: 'This email address is not valid' }))
        toast.error('Invalid email', {
          description: 'Please enter a valid email address.',
        })
      } else {
        toast.error('Could not create account', {
          description: err.message || 'Something went wrong. Please try again.',
        })
      }
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
          {success ? (
            <SuccessScreen email={formData.email} />
          ) : (
            <>
              <form onSubmit={handleSubmit} className={styles.form} noValidate>

                {/* ── Username ── */}
                <div className={`${styles.formField} ${fieldErrors.username ? styles.formFieldError : ''}`}>
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
                    onBlur={handleBlur}
                    required
                    autoComplete="username"
                    pattern="^[a-zA-Z0-9_-]+$"
                    aria-invalid={!!fieldErrors.username}
                    aria-describedby={fieldErrors.username ? 'username-error' : 'username-hint'}
                    className={`${styles.input} ${fieldErrors.username ? styles.inputError : ''}`}
                  />
                  {fieldErrors.username
                    ? <FieldError message={fieldErrors.username} />
                    : (
                      <span id="username-hint" className={styles.hint} aria-live="polite">
                        Your profile URL:{' '}
                        <strong>{appHost}/u/{formData.username || 'username'}</strong>
                      </span>
                    )
                  }
                </div>

                {/* ── Full Name ── */}
                <div className={`${styles.formField} ${fieldErrors.fullname ? styles.formFieldError : ''}`}>
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
                    onBlur={handleBlur}
                    required
                    autoComplete="name"
                    aria-invalid={!!fieldErrors.fullname}
                    className={`${styles.input} ${fieldErrors.fullname ? styles.inputError : ''}`}
                  />
                  <FieldError message={fieldErrors.fullname} />
                </div>

                {/* ── Email ── */}
                <div className={`${styles.formField} ${fieldErrors.email ? styles.formFieldError : ''}`}>
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
                    onBlur={handleBlur}
                    required
                    autoComplete="email"
                    aria-invalid={!!fieldErrors.email}
                    className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
                  />
                  <FieldError message={fieldErrors.email} />
                </div>

                {/* ── Password ── */}
                <div className={`${styles.formField} ${fieldErrors.password ? styles.formFieldError : ''}`}>
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
                      onBlur={handleBlur}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      aria-invalid={!!fieldErrors.password}
                      className={`${styles.input} ${fieldErrors.password ? styles.inputError : ''}`}
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
                        : <IoMdEye    aria-hidden="true" />
                      }
                    </button>
                  </div>
                  <FieldError message={fieldErrors.password} />
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