import { Geist } from 'next/font/google'
import '@/styles/global.scss'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { AuthProvider } from '@/contexts/auth'
import AuthLoadingWrapper from '@/components/AuthLoadingWrapper'
import NextTopLoader from 'nextjs-toploader'
import { Toaster } from 'sonner'

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
})

export const metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_APP_NAME || 'Chatree',
    template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME || 'Chatree'}`,
  },
  description:
    'Create your public profile, curate your best ChatGPT, Claude, and Gemini conversations, and showcase your prompt engineering skills.',
  keywords: ['AI conversations', 'prompt engineering', 'ChatGPT', 'Claude', 'Gemini', 'AI prompts'],
  applicationName: process.env.NEXT_PUBLIC_APP_NAME || 'Chatree',
  authors: [{ name: process.env.NEXT_PUBLIC_APP_NAME || 'Chatree' }],
  creator: process.env.NEXT_PUBLIC_APP_NAME || 'Chatree',
  publisher: process.env.NEXT_PUBLIC_APP_NAME || 'Chatree',

  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://chatree.chat'
  ),

  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },

  manifest: '/manifest.json',

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: process.env.NEXT_PUBLIC_APP_NAME || 'Chatree',
    title: process.env.NEXT_PUBLIC_APP_NAME || 'Chatree',
    description:
      'The Linktree for AI conversations. Share your best ChatGPT, Claude, and Gemini chats.',
    images: [
      {
        url: '/og-image.svg', // 1200×630px in /public
        width: 1200,
        height: 630,
        alt: `${process.env.NEXT_PUBLIC_APP_NAME || 'Chatree'} – Share your AI conversations`,
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: '@chatree', // replace with your actual handle
    title: process.env.NEXT_PUBLIC_APP_NAME || 'Chatree',
    description:
      'The Linktree for AI conversations. Build your public prompt engineering portfolio.',
    images: ['/og-image.svg'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)',  color: '#0a0a0a' },
  ],

  category: 'technology',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#19E6D5',
}

// ─── Root Layout ──────────────────────────────────────────────────────────────
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={geist.variable}>
      <body className={geist.className}>
        <AuthProvider>
          <AuthLoadingWrapper>
            <NextTopLoader
              color="#19E6D5"
              initialPosition={0.08}
              crawlSpeed={200}
              height={3}
              crawl={true}
              showSpinner={false}
              easing="ease"
              speed={200}
              shadow="0 0 10px #19E6D5, 0 0 5px #19E6D5"
            />
            <Header />
            <main id="main-content">
              {children}
            </main>
            <Footer />
            <Toaster
              position="top-right"
              offset={24}
              toastOptions={{
                unstyled: true,
                classNames: {
                  toast:   'toast',
                  success: 'toast--success',
                  error:   'toast--error',
                  info:    'toast--info',
                },
              }}
            />
          </AuthLoadingWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}