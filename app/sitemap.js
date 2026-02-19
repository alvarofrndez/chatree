import { createClient } from '@/lib/supabase/server'

// ─── Static routes config ─────────────────────────────────────────────────────
// priority: 0.0–1.0 (Google treats it as a hint, not a directive)
// changeFrequency: how often the page is likely to change
const STATIC_ROUTES = [
  {
    url: '/',
    changeFrequency: 'weekly',
    priority: 1.0,
  },
  {
    url: '/explore',
    changeFrequency: 'hourly', // new creators/chats appear constantly
    priority: 0.9,
  },
  {
    url: '/signup',
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    url: '/signin',
    changeFrequency: 'monthly',
    priority: 0.3,
  },
]

// ─── Sitemap generator ────────────────────────────────────────────────────────
// Next.js will call this function at build time (static) or on-demand (dynamic)
// and serve the result at /sitemap.xml automatically.
//
// For large sites (50k+ URLs), split into multiple sitemaps using generateSitemaps().
// See: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'

  // ── 1. Static routes ──────────────────────────────────────────────────────
  const staticRoutes = STATIC_ROUTES.map(({ url, changeFrequency, priority }) => ({
    url: `${baseUrl}${url}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }))

  // ── 2. Dynamic public profile pages (/u/[username]) ──────────────────────
  // Only index profiles that have at least one public chat — thin/empty profiles
  // add no value and can hurt crawl budget.
  let profileRoutes = []
  try {
    const supabase = await createClient()

    const { data: profiles } = await supabase
      .from('profiles')
      .select('username, updated_at')
      // Only include profiles with at least one active chat
      // Adjust this join/filter to match your actual schema
      .gt('total_chats', 0)
      // Limit to avoid overwhelming the sitemap on very large datasets.
      // If you have 50k+ profiles, use generateSitemaps() to split instead.
      .order('updated_at', { ascending: false })
      .limit(45000) // Stay under Google's 50k URL/sitemap limit

    profileRoutes = (profiles ?? []).map((profile) => ({
      url: `${baseUrl}/u/${profile.username}`,
      lastModified: profile.updated_at ? new Date(profile.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
  } catch (err) {
    // Never let a DB error break the build — just omit dynamic routes
    console.error('[sitemap] Failed to fetch profiles:', err)
  }

  // ── 3. Merge and return ───────────────────────────────────────────────────
  return [...staticRoutes, ...profileRoutes]
}

// ─── Revalidation ─────────────────────────────────────────────────────────────
// Regenerate the sitemap at most once per hour in production.
// Remove this if you want a fully static sitemap generated only at build time.
export const revalidate = 3600 // seconds