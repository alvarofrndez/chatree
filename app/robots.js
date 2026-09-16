// /app/robots.js
// Companion file to sitemap.js — tells crawlers what they can and cannot access.
// Next.js serves this at /robots.txt automatically.
// Docs: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots

export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chatree.chat'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/explore',
          '/u/',
          '/prompt/',
          '/about',
        ],
        disallow: [
          '/dashboard',
          '/dashboard/',
          '/signin',
          '/signup',
          '/forgot-password',
          '/reset-password',
          '/api/',
          '/_next/',
          '/admin/',
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