import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getChatLikeStatuses } from '@/lib/services/like.service'
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
    `Explore ${displayName}'s curated AI conversations — ChatGPT, Claude, Gemini and more.`

  return {
    title: `${displayName} (@${username}) – AI Chat Portfolio`,
    description,
    keywords: [
      `${username} AI chats`,
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
      title: `${displayName} – AI Chat Portfolio`,
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
      title: `${displayName} (@${username}) – AI Chat Portfolio`,
      description,
      ...(profile.avatar_url && { images: [profile.avatar_url] }),
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

function JsonLd({ profile, chats }) {
  const displayName = profile.full_name || profile.username
  const profileUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/u/${profile.username}`

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': `${profileUrl}#profilepage`,
        url: profileUrl,
        name: `${displayName}'s AI Chat Portfolio`,
        description:
          profile.bio ||
          `${displayName}'s curated AI conversations on ${process.env.NEXT_PUBLIC_APP_NAME}`,
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

  const { data: chatLinks } = await supabase
    .from('ai_chat_links')
    .select('*')
    .eq('user_id', profile.id)
    .eq('is_active', true)
    .order('position')

  const chats = chatLinks || []

  const chatIds = chats.map((c) => c.id)
  const likeResult = await getChatLikeStatuses(chatIds)
  const likeStatuses = likeResult?.data ?? {}

  return (
    <>
      <JsonLd profile={profile} chats={chats} />
      <ProfilePage
        profile={profile}
        chatLinks={chats}
        likeStatuses={likeStatuses}
      />
    </>
  )
}