import Link from 'next/link'
import styles from './page.module.scss'

export default function HomePage() {
  return (
    <div className={styles.pageWrapper}>
        <section className={styles.heroSection}>
          <div className={styles.backgroundGlow}>
            <div className={styles.glowOrb}></div>
          </div>

          <div className={styles.heroContainer}>
            <div className={styles.heroContent}>
              <div className={styles.badge}>
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
                  className={styles.badgeIcon}
                >
                  <path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"></path>
                  <path d="m10 8-3 3 3 3"></path>
                  <path d="m14 14 3-3-3-3"></path>
                </svg>
                <span className={styles.badgeText}>The Linktree for AI Chats</span>
              </div>

              <h1 className={styles.heroTitle}>
                Share your best
                <span className={styles.heroTitleAccent}> AI conversations </span>
                with the world
              </h1>

              <p className={styles.heroDescription}>
                Create your profile, curate your most insightful AI chats, and build a public portfolio of your prompt engineering skills.
              </p>

              <div className={styles.heroActions}>
                <Link href="/signup" className={styles.primaryButton}>
                  Create Your {process.env.NEXT_PUBLIC_APP_NAME}
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
                    className={styles.buttonIcon}
                  >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </Link>
                <Link href="/alexchen" className={styles.secondaryButton}>
                  See Example Profile
                </Link>
              </div>

              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>
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
                      className={styles.statIcon}
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                    </svg>
                    <span className={styles.statNumber}>2.4k</span>
                  </div>
                  <span className={styles.statLabel}>Creators</span>
                </div>

                <div className={styles.statItem}>
                  <div className={styles.statValue}>
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
                      className={styles.statIcon}
                    >
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                    <span className={styles.statNumber}>18k</span>
                  </div>
                  <span className={styles.statLabel}>Chats Shared</span>
                </div>

                <div className={styles.statItem}>
                  <div className={styles.statValue}>
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
                      className={styles.statIcon}
                    >
                      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span className={styles.statNumber}>1.2M</span>
                  </div>
                  <span className={styles.statLabel}>Profile Views</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className={styles.howItWorksSection}>
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>How it works</h2>
              <p className={styles.sectionDescription}>
                Three simple steps to build your AI conversation portfolio
              </p>
            </div>

            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
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
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line>
                    <line x1="15.41" x2="8.59" y1="6.51" y2="10.49"></line>
                  </svg>
                </div>
                <h3 className={styles.featureTitle}>Share Any AI Chat</h3>
                <p className={styles.featureDescription}>
                  Paste shared links from ChatGPT, Claude, Gemini, and more. We handle the rest.
                </p>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
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
                    <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"></path>
                    <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"></path>
                    <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"></path>
                  </svg>
                </div>
                <h3 className={styles.featureTitle}>Organize & Tag</h3>
                <p className={styles.featureDescription}>
                  Categorize your chats with custom tags. Let visitors filter by topic, model, or use case.
                </p>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
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
                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </div>
                <h3 className={styles.featureTitle}>Beautiful Profile</h3>
                <p className={styles.featureDescription}>
                  Your own public page showcasing your curated AI conversations. Clean, fast, and shareable.
                </p>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
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
                    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
                  </svg>
                </div>
                <h3 className={styles.featureTitle}>Coming Soon: Live Preview</h3>
                <p className={styles.featureDescription}>
                  In the future, visitors will be able to read your shared chats directly on your profile.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.sectionContainer}>
            <div className={styles.ctaCard}>
              <h2 className={styles.ctaTitle}>Start sharing your AI conversations</h2>
              <p className={styles.ctaDescription}>
                Join creators, developers, and researchers who are building their public AI portfolios.
              </p>
              <Link href="/signup" className={styles.ctaButton}>
                Create Free Account
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
                  className={styles.buttonIcon}
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Link>
            </div>
          </div>
        </section>
    </div>
  )
}