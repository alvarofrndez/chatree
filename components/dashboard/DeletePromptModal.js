'use client'

import PromptCard from '@/components/PromptCard'
import DotLoading from '@/components/DotLoading'
import styles from './DeletePromptModal.module.scss'

export default function DeletePromptModal({
  prompt,
  loading = false,
  onConfirm,
  onClose
}) {
  return (
    <div
      className={styles.modal}
      role='dialog'
      aria-modal='true'
      aria-labelledby='delete-prompt-title'
      onClick={onClose}
    >
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 id='delete-prompt-title'>Delete Prompt</h2>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.warningText}>
            Are you sure you want to delete this prompt? This action cannot
            be undone.
          </p>

          <div className={styles.promptPreview}>
            <PromptCard
              prompt={prompt}
              editable={false}
              draggable={false}
              currentUserId={null}
            />
          </div>
        </div>

        <div className={styles.modalActions}>
          <button
            type='button'
            className={styles.actionCancel}
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type='button'
            className={styles.actionDelete}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <DotLoading text='Deleting' />
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}