'use client'

import { useState, useCallback } from 'react'
import { 
  getUserChats, 
  createChat, 
  updateChat, 
  deleteChat 
} from '@/lib/services/chat.service'

/**
 * Custom hook for managing chats in dashboard
 */
export function useChats(initialChats = []) {
  const [chats, setChats] = useState(initialChats)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Refresh chats from server
   */
  const refreshChats = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await getUserChats()

      if (result.success) {
        setChats(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Create a new chat
   */
  const addChat = useCallback(async (chatData) => {
    setLoading(true)
    setError(null)

    try {
      const result = await createChat(chatData)

      if (result.success) {
        setChats(prev => [...prev, result.data])
        return { success: true, data: result.data }
      } else {
        setError(result.error)
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to create chat'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Update an existing chat
   */
  const editChat = useCallback(async (chatId, updateData) => {
    setLoading(true)
    setError(null)

    try {
      const result = await updateChat(chatId, updateData)

      if (result.success) {
        setChats(prev => 
          prev.map(chat => 
            chat.id === chatId ? result.data : chat
          )
        )
        return { success: true, data: result.data }
      } else {
        setError(result.error)
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update chat'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Delete a chat
   */
  const removeChat = useCallback(async (chatId) => {
    setLoading(true)
    setError(null)

    try {
      const result = await deleteChat(chatId)

      if (result.success) {
        setChats(prev => prev.filter(chat => chat.id !== chatId))
        return { success: true }
      } else {
        setError(result.error)
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete chat'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    chats,
    loading,
    error,
    refreshChats,
    addChat,
    editChat,
    removeChat
  }
}