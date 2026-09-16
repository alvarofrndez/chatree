'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertCircle, Mail, Loader2 } from 'lucide-react'
import { PiTree } from 'react-icons/pi'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.scss'
import DotLoading from '@/components/DotLoading'
import Image from 'next/image'

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
      <p>
        We sent a reset link to <strong>{email}</strong>.
      </p>
      <p>Check your inbox and spam folder.</p>
    </div>
  )
}

export default function ForgotPasswordClient() {
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      setSuccess(true)
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
          <p className={styles.brandDescription}>Reset your password</p>
        </div>

        <div className={styles.card}>
          <ErrorAlert message={error} />

          {success ? (
            <SuccessScreen email={email} />
          ) : (
            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              <p className={styles.instruction}>
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>

              <div className={styles.formField}>
                <label htmlFor="email" className={styles.label}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError('')
                  }}
                  required
                  autoComplete="email"
                  className={styles.input}
                />
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
                aria-busy={loading}
              >
                {loading
                  ? <DotLoading text='Sending' />
                  : 'Send Reset Link'
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