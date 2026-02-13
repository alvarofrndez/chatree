import { getPublicCreators, getPublicChats } from '@/lib/services/explore.service'
import ExploreClient from './Explore'

export const metadata = {
  title: 'Explore - AI Chat Links',
  description: 'Discover creators and AI conversations',
}

export default async function ExplorePage({ searchParams }) {
  // Get initial tab from URL
  const initialTab = (await searchParams).tab || 'creators'
  const page = parseInt((await searchParams).page || '1')
  const search = (await searchParams).search || ''
  const platform = (await searchParams).platform || 'all'
  const sort = (await searchParams).sort || 'recent'

  // Fetch initial data based on tab
  let initialCreators = []
  let initialChats = []
  let initialPagination = {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  }

  if (initialTab === 'creators') {
    const result = await getPublicCreators({
      page,
      limit: 20,
      search,
      sort
    })

    if (result.success) {
      initialCreators = result.data
      initialPagination = result.pagination
    }
  } else {
    const result = await getPublicChats({
      page,
      limit: 20,
      search,
      platform,
      sort
    })

    if (result.success) {
      initialChats = result.data
      initialPagination = result.pagination
    }
  }

  return (
    <ExploreClient
      initialCreators={initialCreators}
      initialChats={initialChats}
      initialPagination={initialPagination}
      initialTab={initialTab}
    />
  )
}