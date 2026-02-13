'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.scss'
import { IoMdEye, IoMdEyeOff } from "react-icons/io"
import { PiTree } from "react-icons/pi"
import {
  SiGoogle,
  SiGithub
} from '@icons-pack/react-simple-icons'

export default function SigninPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleGoogleSignin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`
        }
      })
      
      if (error) throw error
    } catch (error) {
      setError(error.message)
    }
  }

  const handleGithubSignin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`
        }
      })
      
      if (error) throw error
    } catch (error) {
      setError(error.message)
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
          <p className={styles.brandDescription}>Welcome back</p>
        </div>

        <div className={styles.card}>
          {error && (
            <div className={`${styles.alert} ${styles.error}`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
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
                  className={styles.input}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.toggleButton}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <IoMdEyeOff />
                  ) : (
                    <IoMdEye />
                  )}
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
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <div className={styles.oauthButtonsContainer}>
            <button
              type="button"
              onClick={handleGithubSignin}
              className={styles.oauthButton}
              disabled={loading}
            >
              <SiGithub />
              Continue with GitHub
            </button>
            <button
              type="button"
              onClick={handleGoogleSignin}
              className={styles.oauthButton}
              disabled={loading}
            >
              <SiGoogle />
              Continue with Google
            </button>
          </div>
        </div>

        <div className={styles.footer}>
          <p>
            Don't have an account?{' '}
            <Link href="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}