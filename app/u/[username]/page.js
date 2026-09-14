import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getChatLikeStatuses } from '@/lib/services/like.service'
import { getPromptLikeStatuses } from '@/lib/services/prompt-like.service'
import ProfilePage from './ProfilePage'

export async function generateMetadata({ params }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, bio, avatar_url')
    .eq('username', username)
    .single()

  if (!profile) {
    return {
      title: 'User Not Found',
      robots: { index: false },
    }
  }

  const displayName = profile.full_name || username
  const description =
    profile.bio ||
    `Explore ${displayName}'s curated AI conversations and prompts — ChatGPT, Claude, Gemini and more.`

  return {
    title: `${displayName} (@${username}) – AI Chat & Prompt Portfolio`,
    description,
    keywords: [
      `${username} AI chats`,
      `${username} AI prompts`,
      `${displayName} prompt engineering`,
      'AI conversation portfolio',
      'ChatGPT conversations',
      'Claude AI chats',
    ],
    alternates: {
      canonical: `/u/${username}`,
    },
    openGraph: {
      type: 'profile',
      url: `/u/${username}`,
      title: `${displayName} – AI Chat & Prompt Portfolio`,
      description,
      username,
      ...(profile.avatar_url && {
        images: [
          {
            url: profile.avatar_url,
            width: 400,
            height: 400,
            alt: `${displayName} profile picture`,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary',
      title: `${displayName} (@${username}) – AI Chat & Prompt Portfolio`,
      description,
      ...(profile.avatar_url && { images: [profile.avatar_url] }),
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

function JsonLd({ profile, chats, prompts }) {
  const displayName = profile.full_name || profile.username
  const profileUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/u/${profile.username}`

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': `${profileUrl}#profilepage`,
        url: profileUrl,
        name: `${displayName}'s AI Chat & Prompt Portfolio`,
        description:
          profile.bio ||
          `${displayName}'s curated AI conversations and prompts on ${process.env.NEXT_PUBLIC_APP_NAME}`,
        dateCreated: profile.created_at,
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: process.env.NEXT_PUBLIC_SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'Explore', item: `${process.env.NEXT_PUBLIC_SITE_URL}/explore` },
            { '@type': 'ListItem', position: 3, name: displayName, item: profileUrl },
          ],
        },
        mainEntity: { '@id': `${profileUrl}#person` },
      },
      {
        '@type': 'Person',
        '@id': `${profileUrl}#person`,
        name: displayName,
        url: profileUrl,
        ...(profile.avatar_url && {
          image: {
            '@type': 'ImageObject',
            url: profile.avatar_url,
            caption: `${displayName} profile picture`,
          },
        }),
        ...(profile.bio && { description: profile.bio }),
        sameAs: [`${process.env.NEXT_PUBLIC_SITE_URL}/u/${profile.username}`],
      },
      ...(chats.length > 0
        ? [
            {
              '@type': 'ItemList',
              '@id': `${profileUrl}#chatlist`,
              name: `${displayName}'s AI Conversations`,
              numberOfItems: chats.length,
              itemListElement: chats.slice(0, 10).map((chat, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: chat.title || `AI Conversation ${i + 1}`,
                url: chat.url,
              })),
            },
          ]
        : []),
      ...(prompts.length > 0
        ? [
            {
              '@type': 'ItemList',
              '@id': `${profileUrl}#promptlist`,
              name: `${displayName}'s AI Prompts`,
              numberOfItems: prompts.length,
              itemListElement: prompts.slice(0, 10).map((prompt, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: prompt.title || `AI Prompt ${i + 1}`,
                url: `${process.env.NEXT_PUBLIC_SITE_URL}/prompt/${prompt.id}`,
              })),
            },
          ]
        : []),
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default async function ProfileView({ params }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (profileError || !profile) notFound()

  const [{ data: chatLinks }, { data: promptLinks }] = await Promise.all([
    supabase
      .from('ai_chat_links')
      .select('*')
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .order('position'),
    supabase
      .from('ai_prompts')
      .select('*')
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .order('position'),
  ])

  const chats = chatLinks || []
  const prompts = promptLinks || []

  const chatIds = chats.map((c) => c.id)
  const promptIds = prompts.map((p) => p.id)

  const [likeResult, promptLikeResult] = await Promise.all([
    getChatLikeStatuses(chatIds),
    getPromptLikeStatuses(promptIds),
  ])

  const likeStatuses = likeResult?.data ?? {}
  const promptLikeStatuses = promptLikeResult?.data ?? {}

  return (
    <>
      <JsonLd profile={profile} chats={chats} prompts={prompts} />
      <ProfilePage
        profile={profile}
        chatLinks={chats}
        promptLinks={prompts}
        likeStatuses={likeStatuses}
        promptLikeStatuses={promptLikeStatuses}
      />
    </>
  )
}