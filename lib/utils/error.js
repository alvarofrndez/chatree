/**
 * Error Handling Utilities
 * Centralized error handling for consistent error responses
 */

/**
 * Standard error response format
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403, 'AUTHORIZATION_ERROR')
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}

/**
 * Conflict error (e.g., duplicate username)
 */
export class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, 'CONFLICT')
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
  constructor(message = 'Too many requests, please try again later') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED')
  }
}

/**
 * Error handler middleware for API routes
 */
export function handleError(error) {
  // Log error for debugging
  console.error('Error:', {
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    stack: error.stack
  })

  // Return formatted error response
  return {
    error: true,
    message: error.message || 'An unexpected error occurred',
    code: error.code || 'INTERNAL_ERROR',
    statusCode: error.statusCode || 500
  }
}

/**
 * Async handler wrapper for API routes
 * Catches errors and passes them to error handler
 */
export function asyncHandler(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context)
    } catch (error) {
      const errorResponse = handleError(error)
      return Response.json(
        {
          success: false,
          error: errorResponse.message,
          code: errorResponse.code
        },
        { status: errorResponse.statusCode }
      )
    }
  }
}

/**
 * Validates required fields in request body
 */
export function validateRequiredFields(body, requiredFields) {
  const missing = []
  
  for (const field of requiredFields) {
    if (!body[field]) {
      missing.push(field)
    }
  }
  
  if (missing.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missing.join(', ')}`
    )
  }
}

/**
 * Sanitizes user input to prevent XSS
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim()
}

/**
 * Validates email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates username format
 */
export function isValidUsername(username) {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/
  return usernameRegex.test(username)
}