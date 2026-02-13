'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth'
import styles from './header.module.scss'
import { PiTree } from 'react-icons/pi'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
    }
  }

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.brandLink}>
          <PiTree className={styles.brandIcon} />
          <span className={styles.brandName}>{process.env.NEXT_PUBLIC_APP_NAME}</span>
        </Link>

        <div className={styles.desktopMenu}>
          <Link href="/explore" className={styles.navLink}>
            Explore
          </Link>
          {!loading && (
            <>
              {user ? (
                <>
                  <Link href="/dashboard" className={styles.navLink}>
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className={styles.navLink}>
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/signin" className={styles.navLink}>
                    Sign In
                  </Link>
                  <Link href="/signup" className={styles.ctaButton}>
                    Get Started
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        <button 
          className={styles.mobileMenuButton}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Open menu"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M4 5h16"></path>
            <path d="M4 12h16"></path>
            <path d="M4 19h16"></path>
          </svg>
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <Link 
            href="/explore" 
            className={styles.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            Explore
          </Link>
          {!loading && (
            <>
              {user ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className={styles.mobileNavLink}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }} 
                    className={styles.mobileNavLink}
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/signin" 
                    className={styles.mobileNavLink}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/signup" 
                    className={styles.mobileCtaButton}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      )}
    </header>
  )
}