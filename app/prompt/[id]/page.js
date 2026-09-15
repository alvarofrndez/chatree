import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { checkPromptLikeStatus } from '@/lib/services/prompt-like.service'
import { generateBreadcrumbSchema } from '@/lib/utils'
import PromptDetail from './PromptDetail'

export async function generateMetadata({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: prompt } = await supabase
    .from('ai_prompts')
    .select('title, description, ai_platform')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (!prompt) {
    return {
      title: 'Prompt no encontrado',
      robots: { index: false },
    }
  }

  const description =
    prompt.description ||
    `Descubre este prompt de ${prompt.ai_platform || 'IA'} y cópialo directamente.`

  return {
    title: `${prompt.title} – Prompt de IA`,
    description,
    alternates: {
      canonical: `/prompt/${id}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

function JsonLd({ prompt, profile }) {
  const promptUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/prompt/${prompt.id}`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${promptUrl}#prompt`,
    url: promptUrl,
    name: prompt.title,
    description: prompt.description || undefined,
    dateCreated: prompt.created_at,
    author: profile
      ? {
          '@type': 'Person',
          name: profile.full_name || profile.username,
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/u/${profile.username}`,
        }
      : undefined,
    keywords: prompt.tags?.join(', ') || undefined,
    breadcrumb: generateBreadcrumbSchema(process.env.NEXT_PUBLIC_SITE_URL, [
      { name: 'Explore', url: '/explore' },
      { name: prompt.title, url: `/prompt/${prompt.id}` }
    ]),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default async function PromptPage({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: prompt, error } = await supabase
    .from('ai_prompts')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error || !prompt) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .eq('id', prompt.user_id)
    .single()

  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === prompt.user_id

  const likeResult = isOwner
    ? { liked: false }
    : await checkPromptLikeStatus(prompt.id)

  return (
    <>
      <JsonLd prompt={prompt} profile={profile} />
      <PromptDetail
        prompt={prompt}
        profile={profile}
        isOwner={isOwner}
        currentUserId={user?.id || null}
        initialLiked={likeResult.liked}
      />
    </>
  )
}