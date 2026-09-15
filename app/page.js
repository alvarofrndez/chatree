import Link from 'next/link'
import { Suspense } from 'react'
import {
  Code2,
  Share2,
  Layers,
  Eye,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Copy,
  Plus,
} from 'lucide-react'
import styles from './page.module.scss'
import { getGlobalStats } from '@/lib/services/stats.service'
import { formatNumber } from '@/lib/utils'
import { Users, Link as LinkIcon } from 'lucide-react'
import { generateBreadcrumbSchema } from '@/lib/utils'

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata = {
  title: {
    default: `${process.env.NEXT_PUBLIC_APP_NAME} – Share Your Best AI Chats & Prompts`,
    template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME}`,
  },
  description:
    'Create your profile, curate your most insightful AI chats, and publish reusable prompts other people can copy. The Linktree for AI conversations.',
  keywords: [
    'share AI chats',
    'share AI prompts',
    'prompt engineering portfolio',
    'ChatGPT share conversations',
    'Claude AI chats',
    'Gemini conversations',
    'AI linktree',
    'curate AI conversations',
    'public AI profile',
    'prompt library',
  ],
  authors:  [{ name: process.env.NEXT_PUBLIC_APP_NAME }],
  creator:  process.env.NEXT_PUBLIC_APP_NAME,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.chatree.chat'),
  openGraph: {
    type:      'website',
    locale:    'en_US',
    url:       '/',
    siteName:  process.env.NEXT_PUBLIC_APP_NAME,
    title:     `${process.env.NEXT_PUBLIC_APP_NAME} – The Linktree for AI Chats & Prompts`,
    description: 'Create your public profile, organize your best ChatGPT, Claude, and Gemini conversations, publish reusable prompts, and showcase your prompt engineering expertise.',
    images: [{
      url:    '/og-image.png',
      width:  1200,
      height: 630,
      alt:    `${process.env.NEXT_PUBLIC_APP_NAME} – AI Conversation & Prompt Portfolio`,
    }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       `${process.env.NEXT_PUBLIC_APP_NAME} – Share Your AI Chats & Prompts`,
    description: 'The Linktree for your AI conversations and prompts. Create your profile and show the world your prompt engineering skills.',
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
        description:   'The Linktree for sharing your best AI conversations and prompts',
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
        name:          `${process.env.NEXT_PUBLIC_APP_NAME} – The Linktree for AI Chats & Prompts`,
        isPartOf:      { '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/#website` },
        description:   'Create your public AI conversation profile. Share your ChatGPT, Claude, and Gemini chats, publish reusable prompts, and demonstrate your prompt engineering skills.',
        breadcrumb: generateBreadcrumbSchema(process.env.NEXT_PUBLIC_SITE_URL, []),
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
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Is it free to use?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Creating a profile and sharing chats or prompts is free.',
            },
          },
          {
            '@type': 'Question',
            name: 'What is the difference between a chat and a prompt?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'A chat links to a full AI conversation so visitors can read the thread. A prompt publishes just the reusable text so visitors can copy it and run it themselves.',
            },
          },
          {
            '@type': 'Question',
            name: 'Which AI platforms are supported?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: `ChatGPT, Claude, Gemini, Copilot, Perplexity, and any other tool under 'Other'.`,
            },
          },
        ],
      },
    ],
  }

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// ─── Stats Skeleton ───────────────────────────────────────────────────────────
function StatsSkeleton() {
  return (
    <dl className={styles.stats} aria-hidden='true'>
      {[0, 1, 2, 3].map((i) => (
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
async function HeroStats() {
  const statsResult = await getGlobalStats()
  const stats = statsResult.data ?? {
    total_creators: 0,
    total_chats:    0,
    total_prompts:  0,
    total_views:    0,
  }

  return (
    <>
      <JsonLd stats={stats} />

      <dl className={styles.stats}>
        <div className={styles.statItem}>
          <dd className={styles.statValue}>
            <Users size={18} className={styles.statIcon} aria-hidden='true' />
            <span className={styles.statNumber}>{formatNumber(stats.total_creators)}</span>
          </dd>
          <dt className={styles.statLabel}>Creators</dt>
        </div>

        <div className={styles.statItem}>
          <dd className={styles.statValue}>
            <LinkIcon size={18} className={styles.statIcon} aria-hidden='true' />
            <span className={styles.statNumber}>{formatNumber(stats.total_chats)}</span>
          </dd>
          <dt className={styles.statLabel}>Chats Shared</dt>
        </div>

        <div className={styles.statItem}>
          <dd className={styles.statValue}>
            <Sparkles size={18} className={styles.statIcon} aria-hidden='true' />
            <span className={styles.statNumber}>{formatNumber(stats.total_prompts)}</span>
          </dd>
          <dt className={styles.statLabel}>Prompts Shared</dt>
        </div>

        <div className={styles.statItem}>
          <dd className={styles.statValue}>
            <Eye size={18} className={styles.statIcon} aria-hidden='true' />
            <span className={styles.statNumber}>{formatNumber(stats.total_views)}</span>
          </dd>
          <dt className={styles.statLabel}>Profile Views</dt>
        </div>
      </dl>
    </>
  )
}

const SUPPORTED_PLATFORMS = [
  { name: 'ChatGPT',     color: '#10a37f', rgb: '16, 163, 127' },
  { name: 'Claude',      color: '#d97757', rgb: '217, 119, 87' },
  { name: 'Gemini',      color: '#4285f4', rgb: '66, 133, 244' },
  { name: 'Copilot',     color: '#7160e8', rgb: '113, 96, 232' },
  { name: 'Perplexity',  color: '#2dd4bf', rgb: '45, 212, 191' },
]

const FAQS = [
  {
    q: 'Is it free to use?',
    a: `Yes. Creating your profile and sharing chats or prompts is free, with no limit on how many you publish.`,
  },
  {
    q: 'What is the difference between a chat and a prompt?',
    a: `A chat links to a full AI conversation so visitors can read the whole thread in context. A prompt publishes just the reusable text — the instructions, not the conversation — so visitors can copy it and run it in their own AI tool.`,
  },
  {
    q: 'Do I need to know how to code?',
    a: `No. Paste a shared conversation link, or paste your prompt text, add a title and a short description, and it's live on your profile.`,
  },
  {
    q: 'Which AI platforms are supported?',
    a: `ChatGPT, Claude, Gemini, Copilot, Perplexity, and anything else under 'Other' — the platform tag is just for filtering, any link or prompt text works.`,
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className={styles.pageWrapper}>

      {/* ── Hero ── */}
      <section className={styles.heroSection} aria-label='Main introduction'>
        <div className={styles.backgroundGlow} aria-hidden='true'>
          <div className={styles.glowOrb} />
        </div>

        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>

            <div className={styles.badge} role='note'>
              <Code2 size={18} className={styles.badgeIcon} aria-hidden='true' />
              <span className={styles.badgeText}>The Linktree for AI Chats & Prompts</span>
            </div>

            <h1 className={styles.heroTitle}>
              Share your best
              <span className={styles.heroTitleAccent}> AI conversations </span>
              with the world
            </h1>

            <p className={styles.heroDescription}>
              Create your profile, curate your most insightful ChatGPT, Claude,
              and Gemini chats, publish reusable prompts, and build a public
              portfolio of your prompt&nbsp;engineering skills.
            </p>

            <div className={styles.heroActions}>
              <Link
                href='/signup'
                className={styles.primaryButton}
                aria-label='Create your free profile'
              >
                Create Your {process.env.NEXT_PUBLIC_APP_NAME}
                <ArrowRight size={18} className={styles.buttonIcon} aria-hidden='true' />
              </Link>
              <Link
                href='/u/alvaro'
                className={styles.secondaryButton}
                aria-label='See an example AI conversation profile'
              >
                See Example Profile
              </Link>
            </div>

            <Suspense fallback={<StatsSkeleton />}>
              <HeroStats />
            </Suspense>

          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        className={styles.howItWorksSection}
        aria-labelledby='how-it-works-title'
      >
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 id='how-it-works-title' className={styles.sectionTitle}>
              How it works
            </h2>
            <p className={styles.sectionDescription}>
              A few simple steps to build your AI chat and prompt portfolio
            </p>
          </div>

          <ol className={styles.featuresGrid} aria-label='Steps to get started'>
            <li className={styles.featureCard}>
              <div className={styles.featureIcon} aria-hidden='true'>
                <Share2 size={24} />
              </div>
              <h3 className={styles.featureTitle}>Share Any AI Chat</h3>
              <p className={styles.featureDescription}>
                Paste shared links from ChatGPT, Claude, Gemini, and more.
                We handle the rest automatically.
              </p>
            </li>

            <li className={`${styles.featureCard} ${styles.featureCardNew}`}>
              <span className={styles.newBadge}>New</span>
              <div className={styles.featureIcon} aria-hidden='true'>
                <Sparkles size={24} />
              </div>
              <h3 className={styles.featureTitle}>Publish Reusable Prompts</h3>
              <p className={styles.featureDescription}>
                Don't just link a chat — publish the prompt itself. Visitors
                can read what it's for and copy it in one click.
              </p>
            </li>

            <li className={styles.featureCard}>
              <div className={styles.featureIcon} aria-hidden='true'>
                <Layers size={24} />
              </div>
              <h3 className={styles.featureTitle}>Organize & Tag</h3>
              <p className={styles.featureDescription}>
                Categorize your chats and prompts with custom tags. Let
                visitors filter by topic, model, or use case.
              </p>
            </li>

            <li className={styles.featureCard}>
              <div className={styles.featureIcon} aria-hidden='true'>
                <Eye size={24} />
              </div>
              <h3 className={styles.featureTitle}>Beautiful Public Profile</h3>
              <p className={styles.featureDescription}>
                Your own public page showcasing your curated AI chats and
                prompts. Clean, fast, and easy to share.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* ── Chats vs Prompts comparison ── */}
      <section
        className={styles.comparisonSection}
        aria-labelledby='comparison-title'
      >
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 id='comparison-title' className={styles.sectionTitle}>
              Two ways to show your work
            </h2>
            <p className={styles.sectionDescription}>
              Link the conversation, or publish the prompt behind it — whichever fits what you want to share
            </p>
          </div>

          <div className={styles.comparisonGrid}>
            <div className={styles.comparisonCard}>
              <div className={styles.comparisonIcon} aria-hidden='true'>
                <MessageCircle size={22} />
              </div>
              <h3 className={styles.comparisonTitle}>Chats</h3>
              <p className={styles.comparisonDescription}>
                Link a shared conversation so visitors can read the full
                thread, in context, exactly as it happened.
              </p>
              <ul className={styles.comparisonList}>
                <li>Original platform badge and colors</li>
                <li>View and like counts on every chat</li>
                <li>Filter your profile by platform</li>
              </ul>
            </div>

            <div className={styles.comparisonCard}>
              <div className={styles.comparisonIcon} aria-hidden='true'>
                <Copy size={22} />
              </div>
              <h3 className={styles.comparisonTitle}>Prompts</h3>
              <p className={styles.comparisonDescription}>
                Publish the reusable text behind a great result — what it's
                for and how to use it — so visitors can run it themselves.
              </p>
              <ul className={styles.comparisonList}>
                <li>One-click copy to clipboard</li>
                <li>Views, likes and copy counts</li>
                <li>Optional category and platform tag</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Supported platforms ── */}
      <section
        className={styles.platformsSection}
        aria-labelledby='platforms-title'
      >
        <div className={styles.sectionContainer}>
          <h2 id='platforms-title' className={styles.platformsTitle}>
            Works with the AI tools you already use
          </h2>

          <div className={styles.platformsRow}>
            {SUPPORTED_PLATFORMS.map((platform) => (
              <span
                key={platform.name}
                className={styles.platformPill}
                style={{ '--platform-color': platform.color, '--platform-color-rgb': platform.rgb }}
              >
                {platform.name}
              </span>
            ))}
            <span className={`${styles.platformPill} ${styles.platformPillMuted}`}>
              <Plus size={12}/> 
              <span>more</span>
            </span>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className={styles.faqSection} aria-labelledby='faq-title'>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 id='faq-title' className={styles.sectionTitle}>
              Questions people ask
            </h2>
            <p className={styles.sectionDescription}>
              Everything you need to know before you start sharing
            </p>
          </div>

          <div className={styles.faqList}>
            {FAQS.map((item) => (
              <details key={item.q} className={styles.faqItem}>
                <summary className={styles.faqQuestion}>
                  {item.q}
                  <span className={styles.faqChevron} aria-hidden='true' />
                </summary>
                <p className={styles.faqAnswer}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection} aria-labelledby='cta-title'>
        <div className={styles.sectionContainer}>
          <div className={styles.ctaCard}>
            <h2 id='cta-title' className={styles.ctaTitle}>
              Start sharing your AI chats and prompts today
            </h2>
            <p className={styles.ctaDescription}>
              Join creators, developers, and researchers building their public
              AI prompt engineering portfolios.
            </p>
            <Link
              href='/signup'
              className={styles.ctaButton}
              aria-label='Create your free account in minutes'
            >
              Create Free Account
              <ArrowRight size={18} className={styles.buttonIcon} aria-hidden='true' />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}