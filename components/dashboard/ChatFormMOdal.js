'use client'

import { Plus, X } from 'lucide-react'
import DotLoading from '@/components/DotLoading'
import styles from './ChatFormModal.module.scss'

export default function ChatFormModal({
  isEditing = false,
  formData,
  tagInput,
  loading = false,
  onSubmit,
  onClose,
  onFieldChange,
  onTagInputChange,
  onAddTag,
  onRemoveTag
}) {
  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>{isEditing ? 'Edit' : 'Add'} Chat Link</h2>
        
        <form onSubmit={onSubmit} className={styles.form}>
          <div className={styles.inputWrapper}>
            <label>Chat Title</label>
            <input
              type="text"
              placeholder="My conversation about..."
              value={formData.title}
              onChange={(e) => onFieldChange('title', e.target.value)}
              required
            />
          </div>
          
          <div className={styles.inputWrapper}>
            <label>Chat URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={formData.url}
              onChange={(e) => onFieldChange('url', e.target.value)}
              required
            />
          </div>
          
          <div className={styles.inputWrapper}>
            <label>AI Platform</label>
            <select
              value={formData.ai_platform}
              onChange={(e) => onFieldChange('ai_platform', e.target.value)}
              required
            >
              <option value="chatgpt">ChatGPT</option>
              <option value="claude">Claude</option>
              <option value="gemini">Gemini</option>
              <option value="copilot">Copilot</option>
              <option value="perplexity">Perplexity</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className={styles.inputWrapper}>
            <label>Description (optional)</label>
            <textarea
              placeholder="Brief description of this chat..."
              value={formData.description}
              onChange={(e) => onFieldChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className={styles.inputWrapper}>
            <label>Tags (optional)</label>

            <div className={styles.tagsInput}>
              <input
                type="text"
                placeholder="Add a tag and press Enter"
                value={tagInput}
                onChange={(e) => onTagInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    onAddTag()
                  }
                }}
              />
              <button
                type="button"
                onClick={onAddTag}
                className={styles.addTagButton}
              >
                <Plus size={16} />
              </button>
            </div>

            {formData.tags.length > 0 && (
              <div className={styles.tagsList}>
                {formData.tags.map((tag, i) => (
                  <span key={i} className={styles.tag}>
                    #{tag}
                    <button
                      type="button"
                      onClick={() => onRemoveTag(tag)}
                    >
                      <X size={12}/>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className={styles.modalActions}>
            <button 
              type="button" 
              className={styles.actionCancel}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.actionSubmit} 
              disabled={loading}
            >
              {loading ? (
                <DotLoading text={isEditing ? 'Updating' : 'Publishing'} />
              ) : (
                isEditing ? 'Update' : 'Publish'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}