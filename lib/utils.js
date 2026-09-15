import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

/**
 * Base API configuration
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(message, statusCode, code) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code
  }
}

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi(endpoint, options = {}) {
  try {
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${API_BASE_URL}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.error || 'An error occurred',
        response.status,
        data.code
      )
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: error.message || 'Unknown error',
    }
  }
}

/**
 * GET request
 */
export async function apiGet(endpoint, params) {
  const queryString = params
    ? '?' + new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          acc[key] = String(value)
          return acc
        }, {})
      ).toString()
    : ''

  return fetchApi(`${endpoint}${queryString}`, {
    method: 'GET',
  })
}

/**
 * POST request
 */
export async function apiPost(endpoint, body) {
  return fetchApi(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * PUT request
 */
export async function apiPut(endpoint, body) {
  return fetchApi(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * PATCH request
 */
export async function apiPatch(endpoint, body) {
  return fetchApi(endpoint, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * DELETE request
 */
export async function apiDelete(endpoint) {
  return fetchApi(endpoint, {
    method: 'DELETE',
  })
}

/**
 * Format numbers for display
 */
export function formatNumber(num) {
  if(!num){
    return 0
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * Get client IP address
 */
export function getClientIp(request) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  return null
}

/**
 * Validate URL format
 */
export function isValidUrl(url) {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text, maxLength) {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Generate BreadcrumbList structured data for SEO
 * @param {string} baseUrl - The base URL of the site (e.g., 'https://example.com')
 * @param {Array} items - Array of breadcrumb items with { name, url } objects
 * @returns {Object} BreadcrumbList schema object
 */
export function generateBreadcrumbSchema(baseUrl, items) {
  // Ensure we always start with Home
  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: baseUrl,
    },
    // Add the provided items, starting from position 2
    ...items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 2,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    }))
  ]

  return {
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  }
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout = null

  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      document.execCommand('copy')
      textArea.remove()
      return true
    } catch {
      textArea.remove()
      return false
    }
  }
}