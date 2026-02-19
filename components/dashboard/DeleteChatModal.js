'use client'

import ChatLinkCard from '@/components/ChatLinkCard'
import DotLoading from '@/components/DotLoading'
import styles from './DeleteChatModal.module.scss'
import { useAuth } from '@/contexts/auth'

export default function DeleteChatModal({
  chat,
  loading = false,
  onConfirm,
  onClose
}) {

  const { user } = useAuth()
  const current_user_id = user?.id

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Delete Chat</h2>
        </div>
        
        <div className={styles.modalBody}>
          <p className={styles.warningText}>
            Are you sure you want to delete this chat? This action cannot be undone.
          </p>
          
          <div className={styles.chatPreview}>
            <ChatLinkCard
              chat={chat}
              editable={false}
              draggable={false}
              isOwner={current_user_id != null && current_user_id === chat.user_id}
              currentUserId={current_user_id}
            />
          </div>
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
            type="button" 
            className={styles.actionDelete}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <DotLoading text="Deleting" />
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}