import Link from 'next/link'
import { Info, Code, Share2, Sparkles, Eye, Users } from 'lucide-react'
import styles from './about.module.scss'

export const metadata = {
  title: {
    default: 'About Chatree – The Linktree for AI Conversations',
    template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME}`,
  },
  description:
    'Learn about Chatree: why we built it, what it does, and how it helps AI prompt engineers share and showcase their best chats and prompts.',
  keywords: [
    'about chatree',
    'AI conversation sharing',
    'prompt engineering portfolio',
    'AI linktree',
    'ChatGPT Claude Gemini sharing',
  ],
  authors: [{ name: process.env.NEXT_PUBLIC_APP_NAME }],
  creator: process.env.NEXT_PUBLIC_APP_NAME,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://chatree.chat'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/about',
    siteName: process.env.NEXT_PUBLIC_APP_NAME,
    title: 'About Chatree – The Linktree for AI Conversations',
    description: 'Discover the story behind Chatree, its mission, and how it empowers AI enthusiasts to share their knowledge.',
    images: [{
      url: '/favicon.png',
      width: 1200,
      height: 630,
      alt: 'About Chatree – AI Conversation & Prompt Portfolio',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Chatree – The Linktree for AI Conversations',
    description: 'Learn why Chatree exists, what problem it solves, and how it helps you build a public AI prompt engineering portfolio.',
    images: ['/favicon.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function AboutPage() {
  return (
    <div className={styles.aboutWrapper}>
      {/* Hero Section */}
      <section className={styles.heroSection} aria-label='About introduction'>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              About Chatree
            </h1>
            <p className={styles.heroDescription}>
              Chatree is the Linktree for AI conversations – a platform that lets you curate, share, and showcase your best
              ChatGPT, Claude, Gemini, and other AI chats and prompts in one beautiful public profile.
            </p>
            <Link href="/signup" className={styles.ctaButton}>
              Get Started
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* What is Chatree */}
      <section className={styles.section} aria-labelledby='what-is-title'>
        <div className={styles.sectionContainer}>
          <h2 id='what-is-title' className={styles.sectionTitle}>What is Chatree?</h2>
          <p className={styles.sectionDescription}>
            Chatree is a web application designed for AI enthusiasts, prompt engineers, and creators who want to share
            their AI-generated conversations and reusable prompts with the world. Think of it as a portfolio or linktree
            specifically for AI interactions.
          </p>
        </div>
      </section>

      {/* Core Features */}
      <section className={styles.section} aria-labelledby='features-title'>
        <div className={styles.sectionContainer}>
          <h2 id='features-title' className={styles.sectionTitle}>Core Features</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon} aria-hidden='true'>
                <Share2 size={28} />
              </div>
              <h3 className={styles.featureTitle}>Share AI Chats</h3>
              <p className={styles.featureDescription}>
                Paste a shareable link from ChatGPT, Claude, Gemini, or any other AI tool. We fetch the conversation and
                display it on your profile so visitors can read the full thread in context.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon} aria-hidden='true'>
                <Sparkles size={28} />
              </div>
              <h3 className={styles.featureTitle}>Publish Reusable Prompts</h3>
              <p className={styles.featureDescription}>
                Go beyond sharing chats — publish the prompt text itself. Visitors can see what the prompt is for,
                copy it with one click, and run it in their own AI tool.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon} aria-hidden='true'>
                <Eye size={28} />
              </div>
              <h3 className={styles.featureTitle}>Beautiful Public Profile</h3>
              <p className={styles.featureDescription}>
                Each user gets a clean, fast, and customizable public page (e.g., chatree.chat/u/username) that
                showcases your curated chats and prompts, making it easy to share your expertise.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon} aria-hidden='true'>
                <Users size={28} />
              </div>
              <h3 className={styles.featureTitle}>Community & Discovery</h3>
              <p className={styles.featureDescription}>
                Browse public profiles, discover inspiring chats and prompts, and see what others are creating.
                The Explore page highlights trending and notable content across the platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Built It */}
      <section className={styles.section} aria-labelledby='why-title'>
        <div className={styles.sectionContainer}>
          <h2 id='why-title' className={styles.sectionTitle}>Why We Built Chatree</h2>
          <p className={styles.sectionDescription}>
            As AI tools like ChatGPT, Claude, and Gemini become more powerful, sharing the valuable conversations and
            prompts we create remains fragmented. Screenshots lose context, raw links are hard to organize, and there’s
            no central place to build a reputation as a prompt engineer.
          </p>
          <p className={styles.sectionDescription}>
            We created Chatree to solve three core problems:
          </p>
          <ul className={styles.problemList}>
            <li>
              <strong>Scattered sharing:</strong> AI chats and prompts are shared across Discord, Twitter, blogs, and
              notes apps, making it hard to keep a cohesive portfolio.
            </li>
            <li>
              <strong>Loss of context:</strong> Screenshots or plain text lose the back‑and‑forth that makes a chat
              instructive. Chatree preserves the full conversation thread.
            </li>
            <li>
              <strong>No showcase for prompt engineers:</strong> Unlike developers with GitHub or designers with Dribbble,
              AI prompt crafters lacked a dedicated place to display their skill and attract opportunities.
            </li>
          </ul>
          <p className={styles.sectionDescription}>
            Chatree gives you a single, permanent link to add to your bio, resume, or website — a place where your
            best AI work lives forever.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.section} aria-labelledby='how-it-works-title'>
        <div className={styles.sectionContainer}>
          <h2 id='how-it-works-title' className={styles.sectionTitle}>How It Works</h2>
          <ol className={styles.stepsList}>
            <li>
              <strong>Create an account</strong> – Sign up with email or GitHub.
            </li>
            <li>
              <strong>Add a chat</strong> – Paste a shareable link from any supported AI platform.
            </li>
            <li>
              <strong>Add a prompt</strong> – Write or paste your prompt, give it a title and description.
            </li>
            <li>
              <strong>Publish your profile</strong> – Your public URL (chatree.chat/u/username) is ready to share.
            </li>
          </ol>
          <p className={styles.sectionDescription}>
            All content is hosted securely, loads quickly, and is optimized for search engines so your AI expertise
            gets discovered.
          </p>
        </div>
      </section>

      {/* Call to Action */}
      <section className={styles.ctaSection} aria-labelledby='cta-title'>
        <div className={styles.sectionContainer}>
          <div className={styles.ctaCard}>
            <h2 id='cta-title' className={styles.ctaTitle}>
              Start building your AI portfolio today
            </h2>
            <p className={styles.ctaDescription}>
              Join thousands of creators, developers, and researchers who are sharing their AI chats and prompts
              with the world.
            </p>
            <Link href="/signup" className={styles.ctaButton}>
              Create Free Account
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}