'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Check, CheckCircle2, Loader2 } from 'lucide-react'
import { IoMdEye, IoMdEyeOff } from 'react-icons/io'
import { PiTree } from 'react-icons/pi'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.scss'

const REQUIREMENTS = [
  { key: 'minLength',   label: 'At least 8 characters',  test: (p) => p.length >= 8 },
  { key: 'hasUpperCase', label: 'One uppercase letter',   test: (p) => /[A-Z]/.test(p) },
  { key: 'hasLowerCase', label: 'One lowercase letter',   test: (p) => /[a-z]/.test(p) },
  { key: 'hasNumber',    label: 'One number',             test: (p) => /[0-9]/.test(p) },
]

function getPasswordStrength(password) {
  return REQUIREMENTS.reduce((acc, req) => {
    acc[req.key] = req.test(password)
    return acc
  }, {})
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

function SuccessScreen() {
  return (
    <div role="status" aria-live="polite" className={`${styles.alert} ${styles.success}`}>
      <CheckCircle2 size={32} aria-hidden="true" />
      <p>Password updated successfully! Redirecting to sign in…</p>
    </div>
  )
}

function PasswordStrength({ password, requirements }) {
  if (!password) return null
  return (
    <div className={styles.passwordStrength} role="status" aria-label="Password requirements">
      <ul className={styles.strengthRequirements} aria-label="Password requirements checklist">
        {REQUIREMENTS.map((req) => {
          const met = requirements[req.key]
          return (
            <li
              key={req.key}
              className={`${styles.requirement} ${met ? styles.met : ''}`}
              aria-label={`${req.label}: ${met ? 'met' : 'not met'}`}
            >
              <Check size={12} className={styles.checkIcon} aria-hidden="true" />
              <span>{req.label}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function PasswordToggle({ show, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={styles.toggleButton}
      aria-label={show ? 'Hide password' : 'Show password'}
      aria-pressed={show}
    >
      {show
        ? <IoMdEyeOff aria-hidden="true" />
        : <IoMdEye aria-hidden="true" />
      }
    </button>
  )
}

export default function ResetPasswordClient() {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const requirements = getPasswordStrength(formData.password)
  const isPasswordStrong = Object.values(requirements).every(Boolean)
  const passwordsMatch =
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!isPasswordStrong) return setError('Password does not meet all requirements')
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match')

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: formData.password })
      if (error) throw error

      setSuccess(true)
      setTimeout(() => router.push('/signin'), 3000)
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
          <Link
            href="/"
            className={styles.brandLink}
            aria-label={`Go to ${process.env.NEXT_PUBLIC_APP_NAME} homepage`}
          >
            <PiTree className={styles.brandIcon} aria-hidden="true" />
            <span className={styles.brandName}>{process.env.NEXT_PUBLIC_APP_NAME}</span>
          </Link>
          <p className={styles.brandDescription}>Set your new password</p>
        </div>

        <div className={styles.card}>
          <ErrorAlert message={error} />

          {success ? (
            <SuccessScreen />
          ) : (
            <form onSubmit={handleSubmit} className={styles.form} noValidate>

              <div className={styles.formField}>
                <label htmlFor="password" className={styles.label}>
                  New Password
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
                    autoComplete="new-password"
                    aria-describedby="password-requirements"
                    className={styles.input}
                  />
                  <PasswordToggle
                    show={showPassword}
                    onToggle={() => setShowPassword((v) => !v)}
                  />
                </div>

                <div id="password-requirements">
                  <PasswordStrength
                    password={formData.password}
                    requirements={requirements}
                  />
                </div>
              </div>

              <div className={styles.formField}>
                <label htmlFor="confirmPassword" className={styles.label}>
                  Confirm New Password
                </label>
                <div className={styles.passwordWrapper}>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Repeat your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    aria-invalid={
                      formData.confirmPassword.length > 0 && !passwordsMatch
                        ? 'true'
                        : undefined
                    }
                    aria-describedby="confirm-password-status"
                    className={`${styles.input} ${
                      formData.confirmPassword && !passwordsMatch ? styles.inputError : ''
                    } ${
                      passwordsMatch ? styles.inputSuccess : ''
                    }`}
                  />
                  <PasswordToggle
                    show={showConfirmPassword}
                    onToggle={() => setShowConfirmPassword((v) => !v)}
                  />
                </div>

                <span
                  id="confirm-password-status"
                  aria-live="polite"
                  className={
                    formData.confirmPassword
                      ? passwordsMatch
                        ? styles.fieldSuccess
                        : styles.fieldError
                      : undefined
                  }
                >
                  {formData.confirmPassword && (
                    passwordsMatch ? 'Passwords match!' : 'Passwords do not match'
                  )}
                </span>
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading || !isPasswordStrong || !passwordsMatch}
                aria-busy={loading}
              >
                {loading
                  ? <><Loader2 size={16} className={styles.spinner} aria-hidden="true" /> Updating…</>
                  : 'Update Password'
                }
              </button>
            </form>
          )}
        </div>

        <footer className={styles.footer}>
          <p>
            Remember your password?{' '}
            <Link href="/signin">Sign in</Link>
          </p>
        </footer>

      </div>
    </div>
  )
}