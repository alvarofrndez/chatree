'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.scss'
import { IoMdEye, IoMdEyeOff } from "react-icons/io"
import { PiTree } from "react-icons/pi"
import { SiGoogle, SiGithub } from '@icons-pack/react-simple-icons'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    fullname: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
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
      const usernameRegex = /^[a-zA-Z0-9_-]+$/
      if (!usernameRegex.test(formData.username)) {
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
            full_name: formData.fullname
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`
        }
      })
      
      if (signUpError) throw signUpError
      
      if (authData.user && !authData.session) {
        setSuccess(true)
        return 
      }

      if (authData.session) {
        router.push('/dashboard')
      }

    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleGoogleSignup = async () => {
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

  const handleGithubSignup = async () => {
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
          <p className={styles.brandDescription}>Create your account</p>
        </div>

        <div className={styles.card}>
          {error && (
            <div className={`${styles.alert} ${styles.error}`}>
              {error}
            </div>
          )}
          
          {success ? (
            <div className={`${styles.alert} ${styles.success}`}>
              <h3 style={{ marginBottom: '0.5rem' }}>Verify your email 📧</h3>
              <p>We've sent a confirmation link to <strong>{formData.email}</strong>.</p>
              <p>Please check your inbox (and spam folder) to activate your account.</p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className={styles.form}>
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
                    className={styles.input}
                  />
                  <span className={styles.hint}>
                    This will be your profile URL: {process.env.NEXT_PUBLIC_APP_NAME?.toLowerCase()}.com/{formData.username || 'username'}
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
                      className={styles.input}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={styles.toggleButton}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <IoMdEyeOff /> : <IoMdEye />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              <div className={styles.divider}>
                <span>or</span>
              </div>

              <div className={styles.oauthButtonsContainer}>
                <button
                  type="button"
                  onClick={handleGithubSignup}
                  className={styles.oauthButton}
                >
                  <SiGithub /> Continue with GitHub
                </button>
                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  className={styles.oauthButton}
                >
                  <SiGoogle /> Continue with Google
                </button>
              </div>
            </>
          )}
        </div>

        <div className={styles.footer}>
          <p>
            Already have an account?{' '}
            <Link href="/signin">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}