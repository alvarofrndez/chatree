'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.scss'
import { PiTree } from "react-icons/pi"

export default function ForgotPasswordPage() {
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
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.backgroundGlow}>
        <div className={styles.glowOrb}></div>
      </div>

      

      <div className={styles.wrapper}>
        <div className={styles.brand}>
          <Link href="/" className={styles.brandLink}>
            <PiTree className={styles.brandIcon} />
            <span className={styles.brandName}>{process.env.NEXT_PUBLIC_APP_NAME}</span>
          </Link>
          <p className={styles.brandDescription}>Reset your password</p>
        </div>

        {success && (
          <div className={`${styles.alert} ${styles.success}`}>
            Check your email for the password reset link!
          </div>
        )}

        {error && (
          <div className={`${styles.alert} ${styles.error}`}>
            {error}
          </div>
        )}

        <div className={styles.card}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <p className={styles.instruction}>
                Enter your email address and we'll send you a link to reset your password.
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
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={styles.input}
                />
              </div>

              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
        </div>

        <div className={styles.footer}>
          <p>
            Remember your password?{' '}
            <Link href="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}