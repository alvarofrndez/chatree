import { getPublicCreators, getPublicChats } from '@/lib/services/explore.service'
import { getChatLikeStatuses } from '@/lib/services/like.service'
import ExploreClient from './Explore'

export async function generateMetadata({ searchParams }) {
  const params = await searchParams
  const tab = params.tab || 'creators'
  const search = params.search || ''

  const tabLabel = tab === 'creators' ? 'Creators' : 'AI Chats'
  const searchSuffix = search ? ` – "${search}"` : ''

  return {
    title: `Explore ${tabLabel}${searchSuffix}`,
    description:
      tab === 'creators'
        ? 'Browse prompt engineers and AI power users. Discover public profiles showcasing the best ChatGPT, Claude, and Gemini conversations.'
        : 'Explore curated AI conversations from creators around the world. Filter by model, topic, and popularity.',
    keywords: [
      'explore AI conversations',
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
      description:
        'Discover creators and curated AI conversations. Browse public profiles and the best prompt engineering examples.',
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
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Explore ${tab === 'creators' ? 'Creators' : 'AI Chats'} – ${process.env.NEXT_PUBLIC_APP_NAME}`,
    description:
      'Browse and discover AI conversation creators and their curated chats.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/explore`,
    isPartOf: {
      '@type': 'WebSite',
      name: process.env.NEXT_PUBLIC_APP_NAME,
      url: process.env.NEXT_PUBLIC_SITE_URL,
    },
    numberOfItems: total,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: process.env.NEXT_PUBLIC_SITE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Explore',
          item: `${process.env.NEXT_PUBLIC_SITE_URL}/explore`,
        },
      ],
    },
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
  let initialLikeStatuses = {}
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
        initialPagination={initialPagination}
        initialTab={initialTab}
        initialLikeStatuses={initialLikeStatuses}
      />
    </>
  )
}