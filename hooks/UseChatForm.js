'use client'

import { useState, useCallback } from 'react'

/**
 * Initial form state
 */
const INITIAL_FORM_STATE = {
  title: '',
  url: '',
  ai_platform: 'chatgpt',
  description: '',
  tags: []
}

/**
 * Custom hook for managing chat form state
 */
export function useChatForm(initialData = null) {
  const [formData, setFormData] = useState(
    initialData || INITIAL_FORM_STATE
  )
  const [tagInput, setTagInput] = useState('')

  /**
   * Update form field
   */
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  /**
   * Update multiple fields at once
   */
  const updateFields = useCallback((updates) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }))
  }, [])

  /**
   * Add a tag
   */
  const addTag = useCallback(() => {
    const tag = tagInput.trim().toLowerCase()

    if (!tag) return
    if (formData.tags.includes(tag)) return

    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, tag]
    }))

    setTagInput('')
  }, [tagInput, formData.tags])

  /**
   * Remove a tag
   */
  const removeTag = useCallback((tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }, [])

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_STATE)
    setTagInput('')
  }, [])

  /**
   * Load data into form (for editing)
   */
  const loadData = useCallback((data) => {
    setFormData({
      title: data.title || '',
      url: data.url || '',
      ai_platform: data.ai_platform || 'chatgpt',
      description: data.description || '',
      tags: data.tags || []
    })
    setTagInput('')
  }, [])

  return {
    formData,
    tagInput,
    setTagInput,
    updateField,
    updateFields,
    addTag,
    removeTag,
    resetForm,
    loadData
  }
}