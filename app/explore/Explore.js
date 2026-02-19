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
} from 'lucide-react'
import styles from './page.module.scss'
import { formatNumber } from '@/lib/utils'
import ChatLinkCard from '@/components/ChatLinkCard'
import ExploreFilters from '@/components/explore/ExploreFIlters'
import { useExplore } from '@/hooks/UseExplore'
import { getChatLikeStatuses } from '@/lib/services/like.service'
import { useAuth } from '@/contexts/auth'

const SORT_OPTIONS_CREATORS = [
  { value: 'recent',  label: 'Recently Active' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'views',   label: 'Most Viewed' },
  { value: 'chats',   label: 'Most Chats' },
]

const SORT_OPTIONS_CHATS = [
  { value: 'recent',  label: 'Most Recent' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'views',   label: 'Most Viewed' },
]

// ─── Creator Card ─────────────────────────────────────────────────────────────
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

// ─── Creator Card Skeleton ────────────────────────────────────────────────────
// Mirrors CreatorCard layout exactly: avatar circle + name line + bio line +
// three stat pills. Width values approximate real content widths.
function CreatorCardSkeleton() {
  return (
    <div className={styles.creatorCard} aria-hidden="true">
      {/* Avatar */}
      <div className={`${styles.creatorAvatar} ${styles.skeletonCircle}`} />

      <div className={styles.creatorInfo}>
        <div className={styles.creatorHeader}>
          {/* Name + username */}
          <div className={styles.skeletonLine} style={{ width: '8rem',  height: '1rem'  }} />
          <div className={styles.skeletonLine} style={{ width: '5rem',  height: '0.75rem', marginTop: '0.25rem' }} />
        </div>

        {/* Bio */}
        <div className={styles.skeletonLine} style={{ width: '90%',   height: '0.75rem', marginTop: '0.5rem'  }} />
        <div className={styles.skeletonLine} style={{ width: '65%',   height: '0.75rem', marginTop: '0.25rem' }} />

        {/* Stats row */}
        <div className={styles.creatorStats} style={{ marginTop: '0.5rem' }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={styles.skeletonPill} style={{ animationDelay: `${i * 0.08}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Chat Card Skeleton ───────────────────────────────────────────────────────
// Mirrors ChatLinkCard layout: platform icon + title badge row + description
// lines + tags row + stats row.
function ChatCardSkeleton() {
  return (
    <div className={styles.skeletonChatCard} aria-hidden="true">
      {/* Platform icon */}
      <div className={styles.skeletonChatIcon} />

      <div className={styles.skeletonChatBody}>
        {/* Title + badge */}
        <div className={styles.skeletonChatHeader}>
          <div className={styles.skeletonLine} style={{ width: '55%', height: '1rem' }} />
          <div className={styles.skeletonPill} style={{ width: '4rem' }} />
        </div>

        {/* Description */}
        <div className={styles.skeletonLine} style={{ width: '95%', height: '0.75rem', marginTop: '0.6rem' }} />
        <div className={styles.skeletonLine} style={{ width: '75%', height: '0.75rem', marginTop: '0.3rem' }} />

        {/* Footer: tags + stats */}
        <div className={styles.skeletonChatFooter}>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {[0, 1, 2].map((i) => (
              <div key={i} className={styles.skeletonPill} style={{ width: '4rem', animationDelay: `${i * 0.07}s` }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div className={styles.skeletonPill} style={{ width: '3rem' }} />
            <div className={styles.skeletonPill} style={{ width: '3rem' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton list ────────────────────────────────────────────────────────────
// Renders N skeleton cards — same count as the query limit so layout
// doesn't shift when real content arrives.
const SKELETON_COUNT = 10

function CreatorsSkeletonList() {
  return (
    <section className={styles.creatorsList} aria-label="Loading creators" aria-busy="true">
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <CreatorCardSkeleton key={i} />
      ))}
    </section>
  )
}

function ChatsSkeletonList() {
  return (
    <section className={styles.chatsList} aria-label="Loading chats" aria-busy="true">
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <ChatCardSkeleton key={i} />
      ))}
    </section>
  )
}

// ─── Results count skeleton ───────────────────────────────────────────────────
function ResultsCountSkeleton() {
  return <div className={styles.skeletonLine} style={{ width: '8rem', height: '0.75rem', marginBottom: '0.25rem' }} aria-hidden="true" />
}

// ─── Explore Client ───────────────────────────────────────────────────────────
export default function ExploreClient({
  initialCreators,
  initialChats,
  initialPagination,
  initialTab,
  initialLikeStatuses = {},
}) {
  const searchParams  = useSearchParams()
  const { user }      = useAuth()
  const currentUserId = user?.id

  const [activeTab,   setActiveTab]   = useState(initialTab)
  const [search,      setSearch]      = useState('')
  const [platform,    setPlatform]    = useState('all')
  const [sort,        setSort]        = useState('recent')
  const [currentPage, setCurrentPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [likeStatuses,    setLikeStatuses]    = useState(initialLikeStatuses)

  const creatorsExplore = useExplore('creators')
  const chatsExplore    = useExplore('chats')
  const currentExplore  = activeTab === 'creators' ? creatorsExplore : chatsExplore

  // ── Seed initial server data ─────────────────────────────────────────────
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

  // ── Debounce search ──────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  const [isInitialRender, setIsInitialRender] = useState(true)

  // ── Fetch on filter/page change ──────────────────────────────────────────
  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false)
      return
    }

    const filters = {
      page:   currentPage,
      limit:  20,
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

  // ── Sync URL ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isInitialRender) return
    const params = new URLSearchParams()
    if (activeTab !== 'creators')                        params.set('tab',      activeTab)
    if (debouncedSearch)                                 params.set('search',   debouncedSearch)
    if (platform !== 'all' && activeTab === 'chats')     params.set('platform', platform)
    if (sort !== 'recent')                               params.set('sort',     sort)
    if (currentPage > 1)                                 params.set('page',     currentPage.toString())
    const newUrl = params.toString() ? `/explore?${params.toString()}` : '/explore'
    window.history.replaceState({}, '', newUrl)
  }, [activeTab, debouncedSearch, platform, sort, currentPage, isInitialRender])

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleTabChange = useCallback((newTab) => {
    setActiveTab(newTab)
    setSearch('')
    setPlatform('all')
    setSort('recent')
    setCurrentPage(1)
  }, [])

  const handleSearchChange  = useCallback((value) => { setSearch(value);   setCurrentPage(1) }, [])
  const handlePlatformChange = useCallback((value) => { setPlatform(value); setCurrentPage(1) }, [])
  const handleSortChange    = useCallback((value) => { setSort(value);     setCurrentPage(1) }, [])

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const sortOptions  = activeTab === 'creators' ? SORT_OPTIONS_CREATORS : SORT_OPTIONS_CHATS
  const totalLabel   = activeTab === 'creators'
    ? currentExplore.pagination.total === 1 ? 'creator' : 'creators'
    : currentExplore.pagination.total === 1 ? 'chat'    : 'chats'

  const isLoading    = currentExplore.loading
  const isEmpty      = !isLoading && currentExplore.data.length === 0
  const hasResults   = !isLoading && currentExplore.data.length > 0

  return (
    <main className={styles.main}>
      <div className={styles.container}>

        <header className={styles.header}>
          <h1 className={styles.title}>Explore</h1>
          <p className={styles.subtitle}>Discover creators and AI conversations</p>
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

        {/* Results count — skeleton while loading */}
        {isLoading
          ? <ResultsCountSkeleton />
          : (
            <p className={styles.resultsText} aria-live="polite" aria-atomic="true">
              {currentExplore.pagination.total.toLocaleString()} {totalLabel} found
            </p>
          )
        }

        {/* ── Loading: skeletons ─────────────────────────────────────────── */}
        {isLoading && activeTab === 'creators' && <CreatorsSkeletonList />}
        {isLoading && activeTab === 'chats'    && <ChatsSkeletonList />}

        {/* ── Results ───────────────────────────────────────────────────── */}
        {hasResults && activeTab === 'creators' && (
          <section id="explore-panel" aria-label="Creators list" className={styles.creatorsList}>
            {currentExplore.data.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </section>
        )}

        {hasResults && activeTab === 'chats' && (
          <section id="explore-panel" aria-label="AI chats list" className={styles.chatsList}>
            {currentExplore.data.map((chat) => (
              <ChatLinkCard
                key={chat.id}
                chat={chat}
                editable={false}
                draggable={false}
                initialLiked={likeStatuses[chat.id] ?? null}
                isOwner={currentUserId != null && currentUserId === chat.user_id}
                currentUserId={currentUserId ?? null}
              />
            ))}
          </section>
        )}

        {/* ── Empty state ───────────────────────────────────────────────── */}
        {isEmpty && (
          <div className={styles.emptyState} role="status">
            <Search className={styles.emptyIcon} size={32} aria-hidden="true" />
            <h2 className={styles.emptyTitle}>No {activeTab} found</h2>
            <p className={styles.emptyText}>Try adjusting your search or filters</p>
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────────────── */}
        {hasResults && currentExplore.pagination.totalPages > 1 && (
          <nav className={styles.pagination} aria-label="Pagination">
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