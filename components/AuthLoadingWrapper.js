// AuthLoadingWrapper.jsx
'use client'

import { useAuth } from '@/contexts/auth'
import styles from './AuthLoadingWrapper.module.scss'
import Image from 'next/image'

const PARTICLE_COUNT = 8

export default function AuthLoadingWrapper({ children }) {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className={styles.overlay} aria-label="Cargando" role="status" aria-live="polite">
        <div className={styles.noise} aria-hidden="true" />
        <div className={styles.backdrop} aria-hidden="true" />

        <div className={styles.mesh} aria-hidden="true">
          <div className={styles.blob1} />
          <div className={styles.blob2} />
          <div className={styles.blob3} />
        </div>

        <div className={styles.particles} aria-hidden="true">
          {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
            <span key={i} className={styles.particle} />
          ))}
        </div>

        <div className={styles.content}>
          <div className={styles.logoWrap}>
            <div className={styles.logoMark}>
              <Image
                className={styles.logoIcon}
                src="/favicon.svg"
                alt="Logo"
                width={22}
                height={22}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}