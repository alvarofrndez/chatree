import { useEffect } from 'react'
import styles from './Modal.module.scss'

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'medium'
}) {
  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])
  
  if (!isOpen) return null
  
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        className={`${styles.modal} ${styles[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className={styles.header}>
            <h2>{title}</h2>
            <button 
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        )}
        
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  )
}
