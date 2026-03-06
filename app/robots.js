// /app/robots.js
// Companion file to sitemap.js — tells crawlers what they can and cannot access.
// Next.js serves this at /robots.txt automatically.
// Docs: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots

export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.chatree.chat'

  return {
    rules: [
      {
        // Main rule for all crawlers
        userAgent: '*',
        allow: [
          '/',
          '/explore',
          '/u/',       // all public profile pages
        ],
        disallow: [
          '/dashboard',
          '/dashboard/',
          '/signin',
          '/signup',
          '/forgot-password',
          '/reset-password',
          '/api/',          // never expose API routes
          '/_next/',        // Next.js internals
          '/admin/',        // future-proof
        ],
      },
      {
        // Slow down aggressive crawlers (AhrefsBot, SemrushBot, etc.)
        // that can hammer your DB via dynamic routes
        userAgent: ['AhrefsBot', 'SemrushBot', 'DotBot'],
        crawlDelay: 10,
        allow: ['/'],
        disallow: ['/api/', '/dashboard/', '/u/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}