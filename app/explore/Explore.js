'use client'

import { useEffect, useCallback, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Eye,
  Heart,
  ArrowRight,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  MessageCircle,
  Loader2,
} from 'lucide-react'
import styles from './page.module.scss'
import { formatNumber } from '@/lib/utils'
import ChatLinkCard from '@/components/ChatLinkCard'
import ExploreFilters from '@/components/explore/ExploreFIlters'
import { useExplore } from '@/hooks/UseExplore'
import { getChatLikeStatuses } from '@/lib/services/like.service'
import { useAuth } from '@/contexts/auth'

const SORT_OPTIONS_CREATORS = [
  { value: 'recent', label: 'Recently Active' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'views', label: 'Most Viewed' },
  { value: 'chats', label: 'Most Chats' },
]

const SORT_OPTIONS_CHATS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'views', label: 'Most Viewed' },
]

function CreatorCard({ creator }) {
  const getInitials = (name, username) => {
    if (name) {
      const parts = name.trim().split(' ')
      return parts.length >= 2
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : name.substring(0, 2).toUpperCase()
    }
    return username.substring(0, 2).toUpperCase()
  }

  return (
    <Link
      href={`/u/${creator.username}`}
      className={styles.creatorCard}
      aria-label={`View ${creator.full_name || creator.username}'s AI conversation profile`}
    >
      <div className={styles.creatorAvatar}>
        {creator.avatar_url ? (
          <img
            src={creator.avatar_url}
            alt={`${creator.full_name || creator.username} profile picture`}
            width={48}
            height={48}
            loading="lazy"
          />
        ) : (
          <span className={styles.avatarInitials} aria-hidden="true">
            {getInitials(creator.full_name, creator.username)}
          </span>
        )}
      </div>

      <div className={styles.creatorInfo}>
        <div className={styles.creatorHeader}>
          <h2 className={styles.creatorName}>
            {creator.full_name || creator.username}
          </h2>
          <span className={styles.creatorUsername}>@{creator.username}</span>
        </div>

        {creator.bio && (
          <p className={styles.creatorBio}>{creator.bio}</p>
        )}

        <dl className={styles.creatorStats}>
          <div className={styles.stat}>
            <Eye size={14} aria-hidden="true" />
            <dd>{formatNumber(creator.stats.total_views)}</dd>
            <dt>views</dt>
          </div>
          <div className={styles.stat}>
            <Heart size={14} aria-hidden="true" />
            <dd>{formatNumber(creator.stats.total_likes)}</dd>
            <dt>likes</dt>
          </div>
          <div className={styles.stat}>
            <dd>{creator.stats.total_chats}</dd>
            <dt>{creator.stats.total_chats === 1 ? 'chat' : 'chats'}</dt>
          </div>
        </dl>
      </div>

      <ArrowRight className={styles.arrowIcon} size={18} aria-hidden="true" />
    </Link>
  )
}

export default function ExploreClient({
  initialCreators,
  initialChats,
  initialPagination,
  initialTab,
  initialLikeStatuses = {},
}) {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const currentUserId = user?.id

  const [activeTab, setActiveTab] = useState(initialTab)
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState('all')
  const [sort, setSort] = useState('recent')
  const [currentPage, setCurrentPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [likeStatuses, setLikeStatuses] = useState(initialLikeStatuses)

  const creatorsExplore = useExplore('creators')
  const chatsExplore = useExplore('chats')
  const currentExplore = activeTab === 'creators' ? creatorsExplore : chatsExplore

  useEffect(() => {
    if (initialTab === 'creators' && creatorsExplore.data.length === 0) {
      creatorsExplore.setData(initialCreators)
      creatorsExplore.setPagination(initialPagination)
    } else if (initialTab === 'chats' && chatsExplore.data.length === 0) {
      chatsExplore.setData(initialChats)
      chatsExplore.setPagination(initialPagination)
    }
  }, [])

  useEffect(() => {
    setSearch(searchParams.get('search') || '')
    setPlatform(searchParams.get('platform') || 'all')
    setSort(searchParams.get('sort') || 'recent')
    setCurrentPage(parseInt(searchParams.get('page') || '1'))
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  const [isInitialRender, setIsInitialRender] = useState(true)

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false)
      return
    }

    const filters = {
      page: currentPage,
      limit: 20,
      search: debouncedSearch,
      sort,
      ...(activeTab === 'chats' && { platform }),
    }

    currentExplore.fetchData(filters).then(() => {
      if (activeTab === 'chats') fetchLikeStatusesForCurrentChats()
    })
  }, [debouncedSearch, platform, sort, currentPage, activeTab])

  const fetchLikeStatusesForCurrentChats = useCallback(async () => {
    const ids = chatsExplore.data.map((c) => c.id)
    if (!ids.length) return
    const result = await getChatLikeStatuses(ids)
    if (result.success) setLikeStatuses(result.data)
  }, [chatsExplore.data])

  useEffect(() => {
    if (isInitialRender) return
    const params = new URLSearchParams()
    if (activeTab !== 'creators') params.set('tab', activeTab)
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (platform !== 'all' && activeTab === 'chats') params.set('platform', platform)
    if (sort !== 'recent') params.set('sort', sort)
    if (currentPage > 1) params.set('page', currentPage.toString())
    const newUrl = params.toString() ? `/explore?${params.toString()}` : '/explore'
    window.history.replaceState({}, '', newUrl)
  }, [activeTab, debouncedSearch, platform, sort, currentPage, isInitialRender])

  const handleTabChange = useCallback((newTab) => {
    setActiveTab(newTab)
    setSearch('')
    setPlatform('all')
    setSort('recent')
    setCurrentPage(1)
  }, [])

  const handleSearchChange = useCallback((value) => {
    setSearch(value)
    setCurrentPage(1)
  }, [])

  const handlePlatformChange = useCallback((value) => {
    setPlatform(value)
    setCurrentPage(1)
  }, [])

  const handleSortChange = useCallback((value) => {
    setSort(value)
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const sortOptions =
    activeTab === 'creators' ? SORT_OPTIONS_CREATORS : SORT_OPTIONS_CHATS

  const totalLabel =
    activeTab === 'creators'
      ? currentExplore.pagination.total === 1 ? 'creator' : 'creators'
      : currentExplore.pagination.total === 1 ? 'chat' : 'chats'

  return (
    <main className={styles.main}>
      <div className={styles.container}>

        <header className={styles.header}>
          <h1 className={styles.title}>Explore</h1>
          <p className={styles.subtitle}>
            Discover creators and AI conversations
          </p>
        </header>

        <nav
          className={styles.tabsContainer}
          role="tablist"
          aria-label="Explore sections"
        >
          <button
            role="tab"
            aria-selected={activeTab === 'creators'}
            aria-controls="explore-panel"
            onClick={() => handleTabChange('creators')}
            className={`${styles.tab} ${activeTab === 'creators' ? styles.active : ''}`}
          >
            <Users size={16} aria-hidden="true" />
            Creators
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'chats'}
            aria-controls="explore-panel"
            onClick={() => handleTabChange('chats')}
            className={`${styles.tab} ${activeTab === 'chats' ? styles.active : ''}`}
          >
            <MessageCircle size={16} aria-hidden="true" />
            Chats
          </button>
        </nav>

        <ExploreFilters
          activeTab={activeTab}
          search={search}
          platform={platform}
          sort={sort}
          sortOptions={sortOptions}
          onSearchChange={handleSearchChange}
          onPlatformChange={handlePlatformChange}
          onSortChange={handleSortChange}
        />

        {!currentExplore.loading && (
          <p
            className={styles.resultsText}
            aria-live="polite"
            aria-atomic="true"
          >
            {currentExplore.pagination.total.toLocaleString()} {totalLabel} found
          </p>
        )}

        {currentExplore.loading && (
          <div className={styles.loading} role="status" aria-label={`Loading ${activeTab}...`}>
            <div className={styles.spinner}/>
            <p>Loading {activeTab}…</p>
          </div>
        )}

        {!currentExplore.loading && activeTab === 'creators' && currentExplore.data.length > 0 && (
          <section
            id="explore-panel"
            aria-label="Creators list"
            className={styles.creatorsList}
          >
            {currentExplore.data.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </section>
        )}

        {!currentExplore.loading && activeTab === 'chats' && currentExplore.data.length > 0 && (
          <section
            id="explore-panel"
            aria-label="AI chats list"
            className={styles.chatsList}
          >
            {currentExplore.data.map((chat) => (
              <ChatLinkCard
                key={chat.id}
                chat={chat}
                editable={false}
                draggable={false}
                initialLiked={likeStatuses[chat.id] ?? null}
                isOwner={currentUserId != null && currentUserId === chat.user_id}
              />
            ))}
          </section>
        )}

        {!currentExplore.loading && currentExplore.data.length === 0 && (
          <div className={styles.emptyState} role="status">
            <Search className={styles.emptyIcon} size={32} aria-hidden="true" />
            <h2 className={styles.emptyTitle}>No {activeTab} found</h2>
            <p className={styles.emptyText}>
              Try adjusting your search or filters
            </p>
          </div>
        )}

        {!currentExplore.loading &&
          currentExplore.data.length > 0 &&
          currentExplore.pagination.totalPages > 1 && (
          <nav
            className={styles.pagination}
            aria-label="Pagination"
          >
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!currentExplore.pagination.hasPrevPage}
              className={styles.paginationButton}
              aria-label="Go to previous page"
            >
              <ChevronLeft size={16} aria-hidden="true" />
              Previous
            </button>

            <span className={styles.paginationText} aria-current="page">
              Page {currentPage} of {currentExplore.pagination.totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!currentExplore.pagination.hasNextPage}
              className={styles.paginationButton}
              aria-label="Go to next page"
            >
              Next
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </nav>
        )}

      </div>
    </main>
  )
}