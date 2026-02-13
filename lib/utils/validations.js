/**
 * Validation Utilities
 * Reusable validation functions for forms
 */

/**
 * Validates email format
 * @param {string} email 
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates username format
 * @param {string} username 
 * @returns {boolean}
 */
export function isValidUsername(username) {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/
  return usernameRegex.test(username)
}

/**
 * Validates password strength
 * @param {string} password 
 * @returns {boolean}
 */
export function isValidPassword(password) {
  // At least 8 characters
  if (password.length < 8) return false
  
  // Has uppercase letter
  if (!/[A-Z]/.test(password)) return false
  
  // Has lowercase letter
  if (!/[a-z]/.test(password)) return false
  
  // Has number
  if (!/[0-9]/.test(password)) return false
  
  return true
}

/**
 * Gets detailed password requirements status
 * @param {string} password 
 * @returns {Object}
 */
export function getPasswordRequirements(password) {
  return {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }
}

/**
 * Calculates password strength score (0-4)
 * @param {string} password 
 * @returns {number}
 */
export function getPasswordStrength(password) {
  const requirements = getPasswordRequirements(password)
  let score = 0
  
  if (requirements.minLength) score++
  if (requirements.hasUpperCase) score++
  if (requirements.hasLowerCase) score++
  if (requirements.hasNumber) score++
  
  return score
}

/**
 * Validates that two passwords match
 * @param {string} password 
 * @param {string} confirmPassword 
 * @returns {boolean}
 */
export function passwordsMatch(password, confirmPassword) {
  return password === confirmPassword && password.length > 0
}

/**
 * Sanitizes string input to prevent XSS
 * @param {string} input 
 * @returns {string}
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim()
}

/**
 * Validates URL format
 * @param {string} url 
 * @returns {boolean}
 */
export function isValidURL(url) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validates if string contains only alphanumeric characters
 * @param {string} str 
 * @returns {boolean}
 */
export function isAlphanumeric(str) {
  return /^[a-zA-Z0-9]+$/.test(str)
}

/**
 * Validates phone number format (basic)
 * @param {string} phone 
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}