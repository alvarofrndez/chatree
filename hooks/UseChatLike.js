'use client'

import { useState, useEffect, useCallback } from 'react'
import { toggleChatLike, checkChatLikeStatus } from '@/lib/services/like.service'

/**
 * Custom hook for managing chat likes with optimistic updates
 */
export function useChatLike(chatId, initialLikesCount = 0) {
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isCheckingStatus, setIsCheckingStatus] = useState(true)

  // Check if user has already liked this chat
  useEffect(() => {
    const checkStatus = async () => {
      if (!chatId) return

      setIsCheckingStatus(true)
      const result = await checkChatLikeStatus(chatId)
      
      if (result.success) {
        setLiked(result.liked)
      }
      
      setIsCheckingStatus(false)
    }

    checkStatus()
  }, [chatId])

  /**
   * Toggle like status with optimistic updates
   */
  const toggleLike = useCallback(async () => {
    if (loading || isCheckingStatus) return { success: false, error: 'Loading...' }

    // Optimistic update - cambio instantáneo en UI
    const previousLiked = liked
    const previousLikesCount = likesCount

    // Actualizar UI inmediatamente
    setLiked(!liked)
    setLikesCount(prev => liked ? Math.max(0, prev - 1) : prev + 1)
    setLoading(true)
    setError(null)

    try {
      // Hacer la petición en segundo plano
      const result = await toggleChatLike(chatId)

      if (result.success) {
        // Actualizar con los datos reales del servidor
        setLiked(result.liked)
        setLikesCount(result.likesCount)
        return { success: true }
      } else {
        // Si falla, revertir el cambio optimista
        setLiked(previousLiked)
        setLikesCount(previousLikesCount)
        setError(result.error)
        return { success: false, error: result.error }
      }
    } catch (err) {
      // Si hay error, revertir el cambio optimista
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