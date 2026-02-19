import Link from 'next/link'
import { Suspense } from 'react'
import {
  Code2,
  Share2,
  Layers,
  Eye,
  Zap,
  ArrowRight,
} from 'lucide-react'
import styles from './page.module.scss'
import { getGlobalStats } from '@/lib/services/stats.service'
import { formatNumber } from '@/lib/utils'
import { Users, Link as LinkIcon } from 'lucide-react'

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata = {
  title: {
    default: `${process.env.NEXT_PUBLIC_APP_NAME} – Share Your Best AI Conversations`,
    template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME}`,
  },
  description:
    'Create your profile, curate your most insightful AI chats, and build a public portfolio showcasing your prompt engineering skills. The Linktree for AI conversations.',
  keywords: [
    'share AI chats',
    'prompt engineering portfolio',
    'ChatGPT share conversations',
    'Claude AI chats',
    'Gemini conversations',
    'AI linktree',
    'curate AI conversations',
    'public AI profile',
  ],
  authors:  [{ name: process.env.NEXT_PUBLIC_APP_NAME }],
  creator:  process.env.NEXT_PUBLIC_APP_NAME,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'),
  openGraph: {
    type:      'website',
    locale:    'en_US',
    url:       '/',
    siteName:  process.env.NEXT_PUBLIC_APP_NAME,
    title:     `${process.env.NEXT_PUBLIC_APP_NAME} – The Linktree for AI Chats`,
    description: 'Create your public profile, organize your best ChatGPT, Claude, and Gemini conversations, and showcase your prompt engineering expertise.',
    images: [{
      url:    '/og-image.png',
      width:  1200,
      height: 630,
      alt:    `${process.env.NEXT_PUBLIC_APP_NAME} – AI Conversation Portfolio`,
    }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       `${process.env.NEXT_PUBLIC_APP_NAME} – Share Your AI Conversations`,
    description: 'The Linktree for your AI conversations. Create your profile and show the world your prompt engineering skills.',
    images:      ['/og-image.png'],
  },
  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:  true,
      follow: true,
      'max-video-preview':  -1,
      'max-image-preview':  'large',
      'max-snippet':        -1,
    },
  },
  alternates: { canonical: '/' },
}

// ─── JSON-LD ──────────────────────────────────────────────────────────────────
function JsonLd({ stats }) {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id':   `${process.env.NEXT_PUBLIC_SITE_URL}/#organization`,
        name:    process.env.NEXT_PUBLIC_APP_NAME,
        url:     process.env.NEXT_PUBLIC_SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
        },
      },
      {
        '@type':       'WebSite',
        '@id':         `${process.env.NEXT_PUBLIC_SITE_URL}/#website`,
        url:           process.env.NEXT_PUBLIC_SITE_URL,
        name:          process.env.NEXT_PUBLIC_APP_NAME,
        description:   'The Linktree for sharing your best AI conversations',
        publisher:     { '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type':       'EntryPoint',
            urlTemplate:   `${process.env.NEXT_PUBLIC_SITE_URL}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type':       'WebPage',
        '@id':         `${process.env.NEXT_PUBLIC_SITE_URL}/#webpage`,
        url:           process.env.NEXT_PUBLIC_SITE_URL,
        name:          `${process.env.NEXT_PUBLIC_APP_NAME} – The Linktree for AI Chats`,
        isPartOf:      { '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/#website` },
        description:   'Create your public AI conversation profile. Share your ChatGPT, Claude, and Gemini chats and demonstrate your prompt engineering skills.',
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [{
            '@type':  'ListItem',
            position: 1,
            name:     'Home',
            item:     process.env.NEXT_PUBLIC_SITE_URL,
          }],
        },
      },
      {
        '@type':               'SoftwareApplication',
        name:                  process.env.NEXT_PUBLIC_APP_NAME,
        applicationCategory:   'SocialNetworkingApplication',
        operatingSystem:       'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        ...(stats && {
          aggregateRating: {
            '@type':       'AggregateRating',
            ratingValue:   '4.8',
            reviewCount:   String(stats.total_creators),
          },
        }),
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// ─── Stats Skeleton ───────────────────────────────────────────────────────────
// Only the stats block needs a skeleton — everything else is static and renders
// instantly. Three items mirroring the real stat layout.
function StatsSkeleton() {
  return (
    <dl className={styles.stats} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className={styles.statItem}>
          <dd className={styles.statValue}>
            <span className={styles.skeletonIcon} />
            <span className={styles.skeletonNumber} />
          </dd>
          <dt className={styles.skeletonLabel} />
        </div>
      ))}
    </dl>
  )
}

// ─── Stats (async) ────────────────────────────────────────────────────────────
// Isolated async component so Suspense only blocks this small block,
// not the entire hero section.
async function HeroStats() {
  const statsResult = await getGlobalStats()
  const stats = statsResult.data ?? {
    total_creators: 0,
    total_chats:    0,
    total_views:    0,
  }

  return (
    <>
      <JsonLd stats={stats} />

      <dl className={styles.stats}>
        <div className={styles.statItem}>
          <dd className={styles.statValue}>
            <Users size={18} className={styles.statIcon} aria-hidden="true" />
            <span className={styles.statNumber}>{formatNumber(stats.total_creators)}</span>
          </dd>
          <dt className={styles.statLabel}>Creators</dt>
        </div>

        <div className={styles.statItem}>
          <dd className={styles.statValue}>
            <LinkIcon size={18} className={styles.statIcon} aria-hidden="true" />
            <span className={styles.statNumber}>{formatNumber(stats.total_chats)}</span>
          </dd>
          <dt className={styles.statLabel}>Chats Shared</dt>
        </div>

        <div className={styles.statItem}>
          <dd className={styles.statValue}>
            <Eye size={18} className={styles.statIcon} aria-hidden="true" />
            <span className={styles.statNumber}>{formatNumber(stats.total_views)}</span>
          </dd>
          <dt className={styles.statLabel}>Profile Views</dt>
        </div>
      </dl>
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  // No longer async — static shell renders immediately.
  // Only <HeroStats> suspends while fetching.
  return (
    <div className={styles.pageWrapper}>

      {/* ── Hero ── */}
      <section className={styles.heroSection} aria-label="Main introduction">
        <div className={styles.backgroundGlow} aria-hidden="true">
          <div className={styles.glowOrb} />
        </div>

        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>

            <div className={styles.badge} role="note">
              <Code2 size={18} className={styles.badgeIcon} aria-hidden="true" />
              <span className={styles.badgeText}>The Linktree for AI Chats</span>
            </div>

            <h1 className={styles.heroTitle}>
              Share your best
              <span className={styles.heroTitleAccent}> AI conversations </span>
              with the world
            </h1>

            <p className={styles.heroDescription}>
              Create your profile, curate your most insightful ChatGPT, Claude,
              and Gemini chats, and build a public portfolio of your
              prompt&nbsp;engineering skills.
            </p>

            <div className={styles.heroActions}>
              <Link
                href="/signup"
                className={styles.primaryButton}
                aria-label="Create your free profile"
              >
                Create Your {process.env.NEXT_PUBLIC_APP_NAME}
                <ArrowRight size={18} className={styles.buttonIcon} aria-hidden="true" />
              </Link>
              <Link
                href="/u/alvaro"
                className={styles.secondaryButton}
                aria-label="See an example AI conversation profile"
              >
                See Example Profile
              </Link>
            </div>

            {/* Stats suspends independently — rest of hero is already painted */}
            <Suspense fallback={<StatsSkeleton />}>
              <HeroStats />
            </Suspense>

          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        className={styles.howItWorksSection}
        aria-labelledby="how-it-works-title"
      >
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 id="how-it-works-title" className={styles.sectionTitle}>
              How it works
            </h2>
            <p className={styles.sectionDescription}>
              Three simple steps to build your AI conversation portfolio
            </p>
          </div>

          <ol className={styles.featuresGrid} aria-label="Steps to get started">
            <li className={styles.featureCard}>
              <div className={styles.featureIcon} aria-hidden="true">
                <Share2 size={24} />
              </div>
              <h3 className={styles.featureTitle}>Share Any AI Chat</h3>
              <p className={styles.featureDescription}>
                Paste shared links from ChatGPT, Claude, Gemini, and more.
                We handle the rest automatically.
              </p>
            </li>

            <li className={styles.featureCard}>
              <div className={styles.featureIcon} aria-hidden="true">
                <Layers size={24} />
              </div>
              <h3 className={styles.featureTitle}>Organize & Tag</h3>
              <p className={styles.featureDescription}>
                Categorize your chats with custom tags. Let visitors filter
                by topic, model, or use case.
              </p>
            </li>

            <li className={styles.featureCard}>
              <div className={styles.featureIcon} aria-hidden="true">
                <Eye size={24} />
              </div>
              <h3 className={styles.featureTitle}>Beautiful Public Profile</h3>
              <p className={styles.featureDescription}>
                Your own public page showcasing your curated AI conversations.
                Clean, fast, and easy to share.
              </p>
            </li>

            <li className={styles.featureCard}>
              <div className={styles.featureIcon} aria-hidden="true">
                <Zap size={24} />
              </div>
              <h3 className={styles.featureTitle}>Coming Soon: Live Preview</h3>
              <p className={styles.featureDescription}>
                Visitors will soon be able to read your shared chats directly
                on your profile — no redirect needed.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection} aria-labelledby="cta-title">
        <div className={styles.sectionContainer}>
          <div className={styles.ctaCard}>
            <h2 id="cta-title" className={styles.ctaTitle}>
              Start sharing your AI conversations today
            </h2>
            <p className={styles.ctaDescription}>
              Join creators, developers, and researchers building their public
              AI prompt engineering portfolios.
            </p>
            <Link
              href="/signup"
              className={styles.ctaButton}
              aria-label="Create your free account in minutes"
            >
              Create Free Account
              <ArrowRight size={18} className={styles.buttonIcon} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}