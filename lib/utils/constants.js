import {
  SiGooglekeynote,
  SiAnthropic,
  SiPerplexity,
} from '@icons-pack/react-simple-icons'
import { GoCopilot } from "react-icons/go"
import { RiGeminiFill } from "react-icons/ri"
import { AiOutlineOpenAI } from "react-icons/ai"

/**
 * Application Constants
 * Centralized constants for the entire application
 */

// ============================================
// AUTH CONSTANTS
// ============================================

export const AUTH = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 30,
  SESSION_COOKIE_NAME: 'sb-access-token',
  OAUTH_PROVIDERS: ['google', 'github'],
}

// ============================================
// PROFILE CONSTANTS
// ============================================

export const PROFILE = {
  MAX_BIO_LENGTH: 500,
  MAX_DISPLAY_NAME_LENGTH: 50,
  MAX_WEBSITE_LENGTH: 200,
  MAX_LOCATION_LENGTH: 100,
  AVATAR_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  AVATAR_ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
}

// ============================================
// CONVERSATION CONSTANTS
// ============================================

export const CONVERSATION = {
  MIN_TITLE_LENGTH: 3,
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_TAGS: 10,
  MAX_TAG_LENGTH: 30,
  AI_PLATFORMS: [
    'chatgpt',
    'claude',
    'gemini',
    'copilot',
    'perplexity',
    'other'
  ],
}

// ============================================
// COMMENT CONSTANTS
// ============================================

export const COMMENT = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 1000,
}

// ============================================
// PAGINATION CONSTANTS
// ============================================

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1,
}

// ============================================
// RATE LIMITING
// ============================================

export const RATE_LIMITS = {
  SIGNUP: {
    MAX_REQUESTS: 5,
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
  },
  LOGIN: {
    MAX_REQUESTS: 10,
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  },
  API: {
    MAX_REQUESTS: 100,
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  },
}

// ============================================
// ROUTES
// ============================================

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  PROFILE: (username) => `/u/${username}`,
  CONVERSATION: (id) => `/c/${id}`,
  SETTINGS: '/settings',
  EXPLORE: '/explore',
}

// ============================================
// API ROUTES
// ============================================

export const API_ROUTES = {
  AUTH: {
    SIGNUP: '/api/auth/signup',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    CHECK_USERNAME: '/api/auth/check-username',
    CALLBACK: '/auth/callback',
  },
  PROFILE: {
    GET: (username) => `/api/profile/${username}`,
    UPDATE: '/api/profile',
    DELETE: '/api/profile',
    STATS: '/api/profile/stats',
  },
  CONVERSATION: {
    LIST: '/api/conversations',
    GET: (id) => `/api/conversations/${id}`,
    CREATE: '/api/conversations',
    UPDATE: (id) => `/api/conversations/${id}`,
    DELETE: (id) => `/api/conversations/${id}`,
    LIKE: (id) => `/api/conversations/${id}/like`,
    VIEW: (id) => `/api/conversations/${id}/view`,
  },
}

// ============================================
// ERROR CODES
// ============================================

export const ERROR_CODES = {
  // Auth errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_EXISTS: 'USER_EXISTS',
  USERNAME_TAKEN: 'USERNAME_TAKEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_FIELDS: 'MISSING_FIELDS',
  
  // Permission errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
}

// ============================================
// SUCCESS MESSAGES
// ============================================

export const SUCCESS_MESSAGES = {
  SIGNUP: 'Account created successfully',
  LOGIN: 'Logged in successfully',
  LOGOUT: 'Logged out successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  CONVERSATION_CREATED: 'Conversation created successfully',
  CONVERSATION_UPDATED: 'Conversation updated successfully',
  CONVERSATION_DELETED: 'Conversation deleted successfully',
  COMMENT_POSTED: 'Comment posted successfully',
}

// ============================================
// ERROR MESSAGES
// ============================================

export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  AUTH_REQUIRED: 'You must be logged in to perform this action.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'Password must be at least 8 characters long.',
  INVALID_USERNAME: 'Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens.',
  USERNAME_TAKEN: 'This username is already taken.',
  NOT_FOUND: 'The requested resource was not found.',
}

// ============================================
// REGEX PATTERNS
// ============================================

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,30}$/,
  URL: /^https?:\/\/.+/,
}

// ============================================
// AI PLATFORM
// ============================================

export const PLATFORMS = [
  { value: 'all',     label: 'All' },
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'claude',  label: 'Claude' },
  { value: 'gemini',  label: 'Gemini' },
  { value: 'copilot',  label: 'Copilot' },
  { value: 'perplexity',  label: 'Perplexity' }
]


export const PLATFORM_DATA = {
  chatgpt: { color: '#10a37f', rgb: '16, 163, 127', icon: AiOutlineOpenAI },
  claude: { color: '#d97757', rgb: '217, 119, 87', icon: SiAnthropic },
  gemini: { color: '#4285f4', rgb: '66, 133, 244', icon: RiGeminiFill },
  copilot: { color: '#7160e8', rgb: '113, 96, 232', icon: GoCopilot },
  perplexity: { color: '#2dd4bf', rgb: '45, 212, 191', icon: SiPerplexity },
  other: { color: '#6366f1', rgb: '99, 102, 241', icon: null },
}

// ============================================
// ENVIRONMENT
// ============================================

export const ENV = {
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
}