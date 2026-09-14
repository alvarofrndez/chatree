import Link from 'next/link'
import styles from './footer.module.scss'
import { PiTree } from 'react-icons/pi'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <span className={styles.brandName}>{process.env.NEXT_PUBLIC_APP_NAME}</span>
        </div>

        <div className={styles.links}>
          <Link href="/explore" className={styles.link}>
            Explore
          </Link>
          <span className={styles.tagline}>Built for the AI generation</span>
        </div>
      </div>
    </footer>
  )
}