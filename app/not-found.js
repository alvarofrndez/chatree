'use client'

import Link from 'next/link'
import styles from './not-found.module.scss'

export default function NotFound() {
  return (
    <main className={styles.main}>
        <div className={styles.backgroundGradient} aria-hidden="true" />
        
        <section className={styles.container}>
            <h1 className={styles.errorCode}>404</h1>
            
            <h2 className={styles.title}>Page Not Found</h2>
            
            <p className={styles.description}>
                The page you are looking for might have been removed, 
                had its name changed, or is temporarily unavailable.
            </p>

            <Link href="/" className={styles.homeButton}>
                Back to Home
            </Link>
        </section>
    </main>
  )
}