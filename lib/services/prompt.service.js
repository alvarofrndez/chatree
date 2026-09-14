'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Prompt Service
 * Handles all prompt-related database operations
 */

/**
 * Get all prompts for the current user
 */
export async function getUserPrompts() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized'
      }
    }

    const { data: prompts, error } = await supabase
      .from('ai_prompts')
      .select('*')
      .eq('user_id', user.id)
      .order('position', { ascending: true })

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      data: prompts || []
    }

  } catch (error) {
    console.error('Error fetching prompts:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
  }
}

/**
 * Get a specific prompt by ID
 */
export async function getPromptById(promptId) {
  try {
    const supabase = await createClient()

    const { data: prompt, error } = await supabase
      .from('ai_prompts')
      .select('*')
      .eq('id', promptId)
      .single()

    if (error || !prompt) {
      return {
        success: false,
        error: 'Prompt not found'
      }
    }

    return {
      success: true,
      data: prompt
    }

  } catch (error) {
    console.error('Error fetching prompt:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
  }
}

/**
 * Create a new prompt
 */
export async function createPrompt(promptData) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized'
      }
    }

    // Validation
    if (!promptData.title || promptData.title.trim().length === 0) {
      return {
        success: false,
        error: 'Title is required'
      }
    }

    if (!promptData.prompt_text || promptData.prompt_text.trim().length === 0) {
      return {
        success: false,
        error: 'Prompt text is required'
      }
    }

    // Get max position for user
    const { data: maxPositionData } = await supabase
      .from('ai_prompts')
      .select('position')
      .eq('user_id', user.id)
      .order('position', { ascending: false })
      .limit(1)
      .single()

    const nextPosition = (maxPositionData?.position || 0) + 1

    // Create prompt
    const { data: newPrompt, error } = await supabase
      .from('ai_prompts')
      .insert({
        user_id: user.id,
        title: promptData.title.trim(),
        prompt_text: promptData.prompt_text.trim(),
        description: promptData.description?.trim() || null,
        ai_platform: promptData.ai_platform || null,
        category: promptData.category?.trim() || null,
        tags: promptData.tags || [],
        position: nextPosition,
      })
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    revalidatePath('/dashboard')
    revalidatePath(`/u/${user.id}`)

    return {
      success: true,
      data: newPrompt
    }

  } catch (error) {
    console.error('Error creating prompt:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
  }
}

/**
 * Update an existing prompt
 */
export async function updatePrompt(promptId, updateData) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized'
      }
    }

    // Verify ownership
    const { data: existingPrompt, error: fetchError } = await supabase
      .from('ai_prompts')
      .select('user_id')
      .eq('id', promptId)
      .single()

    if (fetchError || !existingPrompt) {
      return {
        success: false,
        error: 'Prompt not found'
      }
    }

    if (existingPrompt.user_id !== user.id) {
      return {
        success: false,
        error: 'Forbidden'
      }
    }

    // Validation
    if (updateData.title !== undefined && updateData.title.trim().length === 0) {
      return {
        success: false,
        error: 'Title cannot be empty'
      }
    }

    if (updateData.prompt_text !== undefined && updateData.prompt_text.trim().length === 0) {
      return {
        success: false,
        error: 'Prompt text cannot be empty'
      }
    }

    // Prepare update data
    const dataToUpdate = {}
    if (updateData.title !== undefined) dataToUpdate.title = updateData.title.trim()
    if (updateData.prompt_text !== undefined) dataToUpdate.prompt_text = updateData.prompt_text.trim()
    if (updateData.description !== undefined) dataToUpdate.description = updateData.description?.trim() || null
    if (updateData.ai_platform !== undefined) dataToUpdate.ai_platform = updateData.ai_platform || null
    if (updateData.category !== undefined) dataToUpdate.category = updateData.category?.trim() || null
    if (updateData.tags !== undefined) dataToUpdate.tags = updateData.tags

    // Update prompt
    const { data: updatedPrompt, error: updateError } = await supabase
      .from('ai_prompts')
      .update(dataToUpdate)
      .eq('id', promptId)
      .select()
      .single()

    if (updateError) {
      return {
        success: false,
        error: updateError.message
      }
    }

    revalidatePath('/dashboard')
    revalidatePath(`/u/${user.id}`)

    return {
      success: true,
      data: updatedPrompt
    }

  } catch (error) {
    console.error('Error updating prompt:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
  }
}

/**
 * Delete a prompt
 */
export async function deletePrompt(promptId) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized'
      }
    }

    // Verify ownership
    const { data: existingPrompt, error: fetchError } = await supabase
      .from('ai_prompts')
      .select('user_id')
      .eq('id', promptId)
      .single()

    if (fetchError || !existingPrompt) {
      return {
        success: false,
        error: 'Prompt not found'
      }
    }

    if (existingPrompt.user_id !== user.id) {
      return {
        success: false,
        error: 'Forbidden'
      }
    }

    // Delete prompt
    const { error: deleteError } = await supabase
      .from('ai_prompts')
      .delete()
      .eq('id', promptId)

    if (deleteError) {
      return {
        success: false,
        error: deleteError.message
      }
    }

    revalidatePath('/dashboard')
    revalidatePath(`/u/${user.id}`)

    return {
      success: true
    }

  } catch (error) {
    console.error('Error deleting prompt:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
  }
}

/**
 * Increment view count for a prompt
 * Only increments if the visitor is NOT the owner
 */
export async function incrementPromptViews(promptId) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase.rpc('increment_prompt_views', {
      prompt_id: promptId,
      visitor_user_id: user?.id || null
    })

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    revalidatePath(`/prompt/[id]`, 'page')
    revalidatePath('/explore', 'page')

    return {
      success: true,
      incremented: data
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
  }
}

/**
 * Increment copy count for a prompt
 * Fired when a visitor copies the prompt text to clipboard
 */
export async function incrementPromptCopies(promptId) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('increment_prompt_copies', {
      prompt_id: promptId
    })

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      incremented: data
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
  }
}