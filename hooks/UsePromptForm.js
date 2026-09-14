'use client'

import { useState, useCallback } from 'react'

const INITIAL_FORM = {
  title: '',
  prompt_text: '',
  description: '',
  category: '',
  ai_platform: '',
  tags: [],
}

/**
 * Hook para gestionar el formulario de creación/edición de prompts.
 * Mismo contrato que useChatForm.
 */
export function usePromptForm() {
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [tagInput, setTagInput] = useState('')

  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const addTag = useCallback(() => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }))
    }
    setTagInput('')
  }, [tagInput, formData.tags])

  const removeTag = useCallback((tagToRemove) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tagToRemove) }))
  }, [])

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM)
    setTagInput('')
  }, [])

  const loadData = useCallback((prompt) => {
    setFormData({
      title: prompt.title || '',
      prompt_text: prompt.prompt_text || '',
      description: prompt.description || '',
      category: prompt.category || '',
      ai_platform: prompt.ai_platform || '',
      tags: prompt.tags || [],
    })
  }, [])

  return { formData, tagInput, setTagInput, updateField, addTag, removeTag, resetForm, loadData }
}