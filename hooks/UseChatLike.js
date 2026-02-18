'use client'

import { useState, useEffect, useCallback } from 'react'
import { toggleChatLike, checkChatLikeStatus } from '@/lib/services/like.service'

/**
 * Custom hook for managing chat likes with optimistic updates.
 *
 * @param {string} chatId
 * @param {number} initialLikesCount - Likes count from the server
 * @param {boolean|null} initialLikedState - Pre-fetched like status from the server.
 *   Pass `null` (default) to fall back to the individual checkChatLikeStatus call.
 *   Pass `true/false` to skip the extra network round-trip entirely.
 */
export function useChatLike(chatId, initialLikesCount = 0, initialLikedState = null) {
  const hasInitialState = initialLikedState !== null

  const [liked, setLiked] = useState(initialLikedState ?? false)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // If we already have the like state from the server, skip the individual check
  const [isCheckingStatus, setIsCheckingStatus] = useState(!hasInitialState)

  useEffect(() => {
    // Sync liked state if the initial value changes (e.g. parent re-renders with new data)
    if (hasInitialState) {
      setLiked(initialLikedState)
    }
  }, [initialLikedState, hasInitialState])

  useEffect(() => {
    // Only run the individual check when no initial state was provided
    if (hasInitialState || !chatId) return

    const checkStatus = async () => {
      setIsCheckingStatus(true)
      const result = await checkChatLikeStatus(chatId)

      if (result.success) {
        setLiked(result.liked)
      }

      setIsCheckingStatus(false)
    }

    checkStatus()
  }, [chatId, hasInitialState])

  /**
   * Toggle like status with optimistic updates
   */
  const toggleLike = useCallback(async () => {
    if (loading || isCheckingStatus) return { success: false, error: 'Loading...' }

    // Optimistic update — instant UI change
    const previousLiked = liked
    const previousLikesCount = likesCount

    setLiked(!liked)
    setLikesCount(prev => liked ? Math.max(0, prev - 1) : prev + 1)
    setLoading(true)
    setError(null)

    try {
      const result = await toggleChatLike(chatId)

      if (result.success) {
        // Sync with real server values
        setLiked(result.liked)
        setLikesCount(result.likesCount)
        return { success: true }
      } else {
        // Revert optimistic update on failure
        setLiked(previousLiked)
        setLikesCount(previousLikesCount)
        setError(result.error)
        return { success: false, error: result.error }
      }
    } catch (err) {
      // Revert optimistic update on error
      setLiked(previousLiked)
      setLikesCount(previousLikesCount)

      const errorMessage = err.message || 'Failed to toggle like'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [chatId, liked, likesCount, loading, isCheckingStatus])

  return {
    liked,
    likesCount,
    loading,
    isCheckingStatus,
    error,
    toggleLike
  }
}