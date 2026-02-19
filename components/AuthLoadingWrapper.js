'use client'

import { useAuth } from '@/contexts/auth'
import { PiTree } from 'react-icons/pi'
import styles from './AuthLoadingWrapper.module.scss'

export default function AuthLoadingWrapper({ children }) {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className={styles.overlay} aria-label="Loading" role="status" aria-live="polite">

        <div className={styles.orb1} aria-hidden="true" />
        <div className={styles.orb2} aria-hidden="true" />

        <div className={styles.content}>
          <div className={styles.logoMark} aria-hidden="true">
            <PiTree className={styles.logoIcon} />
          </div>

          <div className={styles.barTrack} aria-hidden="true">
            <div className={styles.barFill} />
          </div>

          <span className={styles.label}>Loading</span>
        </div>

      </div>
    )
  }

  return <>{children}</>
}