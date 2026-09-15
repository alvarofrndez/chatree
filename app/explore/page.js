import { getPublicCreators, getPublicChats, getPublicPrompts } from '@/lib/services/explore.service'
import { getChatLikeStatuses } from '@/lib/services/like.service'
import { getPromptLikeStatuses } from '@/lib/services/prompt-like.service'
import { generateBreadcrumbSchema } from '@/lib/utils'
import ExploreClient from './Explore'

export async function generateMetadata({ searchParams }) {
  const params = await searchParams
  const tab = params.tab || 'creators'
  const search = params.search || ''

  const tabLabel = tab === 'creators' ? 'Creators' : tab === 'prompts' ? 'Prompts' : 'AI Chats'
  const searchSuffix = search ? ` – "${search}"` : ''

  const descriptions = {
    creators: 'Browse prompt engineers and AI power users. Discover public profiles showcasing the best ChatGPT, Claude, and Gemini conversations.',
    chats: 'Explore curated AI conversations from creators around the world. Filter by model, topic, and popularity.',
    prompts: 'Discover and copy ready-to-use AI prompts shared by the community. Filter by model, category, and popularity.',
  }

  return {
    title: `Explore ${tabLabel}${searchSuffix}`,
    description: descriptions[tab] || descriptions.creators,
    keywords: [
      'explore AI conversations',
      'AI prompts library',
      'prompt engineers',
      'ChatGPT profiles',
      'Claude AI users',
      'AI chat portfolio',
      'discover AI creators',
    ],
    alternates: {
      canonical: '/explore',
    },
    openGraph: {
      title: `Explore ${tabLabel} | ${process.env.NEXT_PUBLIC_APP_NAME}`,
      description: descriptions[tab] || descriptions.creators,
      url: '/explore',
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

function JsonLd({ tab, total }) {
  const tabLabel = tab === 'creators' ? 'Creators' : tab === 'prompts' ? 'Prompts' : 'AI Chats'

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Explore ${tabLabel} – ${process.env.NEXT_PUBLIC_APP_NAME}`,
    description:
      'Browse and discover AI conversation creators, chats and prompts.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/explore`,
    isPartOf: {
      '@type': 'WebSite',
      name: process.env.NEXT_PUBLIC_APP_NAME,
      url: process.env.NEXT_PUBLIC_SITE_URL,
    },
    numberOfItems: total,
    breadcrumb: generateBreadcrumbSchema(process.env.NEXT_PUBLIC_SITE_URL, [
      { name: 'Explore', url: '/explore' }
    ]),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default async function ExplorePage({ searchParams }) {
  const params = await searchParams

  const initialTab = params.tab || 'creators'
  const page = parseInt(params.page || '1')
  const search = params.search || ''
  const platform = params.platform || 'all'
  const sort = params.sort || 'recent'

  let initialCreators = []
  let initialChats = []
  let initialPrompts = []
  let initialLikeStatuses = {}
  let initialPromptLikeStatuses = {}
  let initialPagination = {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  }

  if (initialTab === 'creators') {
    const result = await getPublicCreators({ page, limit: 20, search, sort })
    if (result.success) {
      initialCreators = result.data
      initialPagination = result.pagination
    }
  } else if (initialTab === 'prompts') {
    const result = await getPublicPrompts({ page, limit: 20, search, platform, sort })
    if (result.success) {
      initialPrompts = result.data
      initialPagination = result.pagination

      const promptIds = result.data.map((p) => p.id)
      if (promptIds.length > 0) {
        const likeResult = await getPromptLikeStatuses(promptIds)
        if (likeResult.success) {
          initialPromptLikeStatuses = likeResult.data
        }
      }
    }
  } else {
    const result = await getPublicChats({ page, limit: 20, search, platform, sort })
    if (result.success) {
      initialChats = result.data
      initialPagination = result.pagination

      const chatIds = result.data.map((c) => c.id)
      if (chatIds.length > 0) {
        const likeResult = await getChatLikeStatuses(chatIds)
        if (likeResult.success) {
          initialLikeStatuses = likeResult.data
        }
      }
    }
  }

  return (
    <>
      <JsonLd tab={initialTab} total={initialPagination.total} />
      <ExploreClient
        initialCreators={initialCreators}
        initialChats={initialChats}
        initialPrompts={initialPrompts}
        initialPagination={initialPagination}
        initialTab={initialTab}
        initialLikeStatuses={initialLikeStatuses}
        initialPromptLikeStatuses={initialPromptLikeStatuses}
      />
    </>
  )
}