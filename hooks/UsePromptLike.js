'use client'

import { useState, useEffect, useCallback } from 'react'
import { togglePromptLike, checkPromptLikeStatus } from '@/lib/services/prompt-like.service'

/**
 * Hook para gestionar el estado de like de un prompt.
 * Mismo contrato que useChatLike para reutilizar la UI existente.
 *
 * @param {string} promptId
 * @param {number} initialLikesCount
 * @param {boolean|null} initialLiked - si ya viene precargado (ej. desde bulk status), evita el fetch inicial
 */
export function usePromptLike(promptId, initialLikesCount = 0, initialLiked = null) {
  const [liked, setLiked] = useState(initialLiked ?? false)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [loading, setLoading] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(initialLiked === null)

  useEffect(() => {
    let active = true

    if (initialLiked !== null) {
      setIsCheckingStatus(false)
      return
    }

    async function fetchStatus() {
      const result = await checkPromptLikeStatus(promptId)
      if (active) {
        setLiked(result.liked)
        setIsCheckingStatus(false)
      }
    }

    fetchStatus()

    return () => { active = false }
  }, [promptId, initialLiked])

  const toggleLike = useCallback(async () => {
    setLoading(true)

    // Optimistic update
    const previousLiked = liked
    const previousCount = likesCount
    setLiked(!previousLiked)
    setLikesCount(previousLiked ? Math.max(0, previousCount - 1) : previousCount + 1)

    const result = await togglePromptLike(promptId)

    if (result.success) {
      setLiked(result.liked)
      setLikesCount(result.likesCount)
    } else {
      // Revert optimistic update on failure
      setLiked(previousLiked)
      setLikesCount(previousCount)
    }

    setLoading(false)
    return result
  }, [promptId, liked, likesCount])

  return {
    liked,
    likesCount,
    loading,
    isCheckingStatus,
    toggleLike,
  }
}