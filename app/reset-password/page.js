'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.scss'
import { PiTree } from "react-icons/pi"
import { IoMdEye, IoMdEyeOff } from "react-icons/io"
import { FiCheck } from "react-icons/fi"

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Password strength validation
  const passwordRequirements = {
    minLength: formData.password.length >= 8,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasLowerCase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
  }

  const isPasswordStrong = Object.values(passwordRequirements).every(Boolean)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validations
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match')
    }

    if (!isPasswordStrong) {
      return setError('Password does not meet all requirements')
    }

    setLoading(true)

    try {
      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      })

      if (error) throw error

      setSuccess(true)
      
      // Redirect to login after delay
      setTimeout(() => {
        router.push('/login')
      }, 3000)

    } catch (err) {
      setError(err.message)
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
          <p className={styles.brandDescription}>Set your new password</p>
        </div>

        <div className={styles.card}>
          {error && (
            <div className={`${styles.alert} ${styles.error}`}>
              {error}
            </div>
          )}

          {success && (
            <div className={`${styles.alert} ${styles.success}`}>
              Password updated successfully! Redirecting to login...
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className={styles.form}>
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

                {/* Password strength indicator */}
                {formData.password && (
                  <div className={styles.passwordStrength}>
                    <div className={styles.strengthRequirements}>
                      <div className={`${styles.requirement} ${passwordRequirements.minLength ? styles.met : ''}`}>
                        <FiCheck className={styles.checkIcon} />
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`${styles.requirement} ${passwordRequirements.hasUpperCase ? styles.met : ''}`}>
                        <FiCheck className={styles.checkIcon} />
                        <span>One uppercase letter</span>
                      </div>
                      <div className={`${styles.requirement} ${passwordRequirements.hasLowerCase ? styles.met : ''}`}>
                        <FiCheck className={styles.checkIcon} />
                        <span>One lowercase letter</span>
                      </div>
                      <div className={`${styles.requirement} ${passwordRequirements.hasNumber ? styles.met : ''}`}>
                        <FiCheck className={styles.checkIcon} />
                        <span>One number</span>
                      </div>
                    </div>
                  </div>
                )}
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
                    className={`${styles.input} ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword 
                        ? styles.inputError 
                        : ''
                    } ${
                      formData.confirmPassword && formData.password === formData.confirmPassword
                        ? styles.inputSuccess
                        : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={styles.toggleButton}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <IoMdEyeOff /> : <IoMdEye />}
                  </button>
                </div>
                
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <span className={styles.fieldError}>Passwords do not match</span>
                )}
                
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <span className={styles.fieldSuccess}>Passwords match!</span>
                )}
              </div>

              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={loading || !isPasswordStrong || formData.password !== formData.confirmPassword}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
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