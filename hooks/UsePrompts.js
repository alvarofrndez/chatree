'use client'

import { useState, useCallback } from 'react'
import { createPrompt, updatePrompt, deletePrompt } from '@/lib/services/prompt.service'

/**
 * Hook para gestionar la lista de prompts del usuario en el dashboard.
 * Mismo contrato que useChats: { chats, loading, addChat, editChat, removeChat }
 */
export function usePrompts(initialPrompts = []) {
  const [prompts, setPrompts] = useState(initialPrompts)
  const [loading, setLoading] = useState(false)

  const addPrompt = useCallback(async (promptData) => {
    setLoading(true)
    const result = await createPrompt(promptData)
    if (result.success) {
      setPrompts((prev) => [...prev, result.data])
    }
    setLoading(false)
    return result
  }, [])

  const editPrompt = useCallback(async (promptId, updateData) => {
    setLoading(true)
    const result = await updatePrompt(promptId, updateData)
    if (result.success) {
      setPrompts((prev) => prev.map((p) => (p.id === promptId ? result.data : p)))
    }
    setLoading(false)
    return result
  }, [])

  const removePrompt = useCallback(async (promptId) => {
    setLoading(true)
    const result = await deletePrompt(promptId)
    if (result.success) {
      setPrompts((prev) => prev.filter((p) => p.id !== promptId))
    }
    setLoading(false)
    return result
  }, [])

  return { prompts, loading, addPrompt, editPrompt, removePrompt }
}