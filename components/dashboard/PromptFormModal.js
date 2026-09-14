'use client'

import { Plus, X, Loader2, Save } from 'lucide-react'
import styles from './PromptFormModal.module.scss'
import DotLoading from '../DotLoading'

const PLATFORM_OPTIONS = [
  { value: '',            label: 'Not specified' },
  { value: 'chatgpt',     label: 'ChatGPT' },
  { value: 'claude',      label: 'Claude' },
  { value: 'gemini',      label: 'Gemini' },
  { value: 'copilot',     label: 'Copilot' },
  { value: 'perplexity',  label: 'Perplexity' },
  { value: 'other',       label: 'Other' },
]

export default function PromptFormModal({
  isEditing,
  formData,
  tagInput,
  loading,
  onSubmit,
  onClose,
  onFieldChange,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
}) {
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onAddTag()
    }
  }

  return (
    <div
      className={styles.modal}
      role='dialog'
      aria-modal='true'
      aria-labelledby='prompt-modal-title'
      onClick={onClose}
    >
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 id='prompt-modal-title'>
          {isEditing ? 'Edit Prompt' : 'Add Prompt'}
        </h2>

        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.inputWrapper}>
            <label htmlFor='prompt-title'>Title</label>
            <input
              id='prompt-title'
              type='text'
              placeholder='e.g. Instagram copy generator'
              value={formData.title}
              onChange={(e) => onFieldChange('title', e.target.value)}
              maxLength={120}
              required
            />
          </div>

          <div className={styles.inputWrapper}>
            <label htmlFor='prompt-platform'>AI Platform (optional)</label>
            <select
              id='prompt-platform'
              value={formData.ai_platform}
              onChange={(e) => onFieldChange('ai_platform', e.target.value)}
            >
              {PLATFORM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.inputWrapper}>
            <label htmlFor='prompt-category'>Category (optional)</label>
            <input
              id='prompt-category'
              type='text'
              placeholder='e.g. Marketing, Code, Writing...'
              value={formData.category}
              onChange={(e) => onFieldChange('category', e.target.value)}
              maxLength={60}
            />
          </div>

          <div className={styles.inputWrapper}>
            <label htmlFor='prompt-description'>Description / how to use it</label>
            <textarea
              id='prompt-description'
              placeholder='Explain what this prompt does and how to get the best out of it...'
              value={formData.description}
              onChange={(e) => onFieldChange('description', e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

          <div className={styles.inputWrapper}>
            <label htmlFor='prompt-text'>Prompt text</label>
            <textarea
              id='prompt-text'
              placeholder='Paste the full prompt here...'
              value={formData.prompt_text}
              onChange={(e) => onFieldChange('prompt_text', e.target.value)}
              rows={8}
              required
            />
          </div>

          <div className={styles.inputWrapper}>
            <label htmlFor='prompt-tags'>Tags</label>
            <div className={styles.tagsInput}>
              <input
                id='prompt-tags'
                type='text'
                placeholder='Add a tag and press Enter'
                value={tagInput}
                onChange={(e) => onTagInputChange(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
              <button type='button' className={styles.addTagButton} onClick={onAddTag}>
                <Plus size={16} aria-hidden='true' />
              </button>
            </div>

            {formData.tags.length > 0 && (
              <div className={styles.tagsList}>
                {formData.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    #{tag}
                    <button type='button' onClick={() => onRemoveTag(tag)} aria-label={`Remove tag ${tag}`}>
                      <X size={12} aria-hidden='true' />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className={styles.modalActions}>
            <button type='button' className={styles.actionCancel} onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type='submit' className={styles.actionSubmit} disabled={loading}>
              {loading ? (
                <DotLoading text={isEditing ? 'Saving' : 'Publishing'} />
              ) : (
                isEditing ? 'Save' : 'Publish'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}