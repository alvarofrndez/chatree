'use client'

import { useAuth } from '@/contexts/auth'
import styles from './AuthLoadingWrapper.module.scss'
import DotLoading from '@/components/DotLoading'

export default function AuthLoadingWrapper({ children }) {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <DotLoading text='Loading...' />
        </div>
      </div>
    )
  }

  return <>{children}</>
}