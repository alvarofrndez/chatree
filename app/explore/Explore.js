'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Eye,
  ArrowRight,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  MessageCircle,
  Sparkles,
} from 'lucide-react'
import styles from './page.module.scss'
import { formatNumber } from '@/lib/utils'
import ChatLinkCard from '@/components/ChatLinkCard'
import PromptCard from '@/components/PromptCard'
import ExploreFilters from '@/components/explore/ExploreFIlters'
import { useExplore } from '@/hooks/UseExplore'
import { useExploreFilters } from '@/hooks/UseExploreFilters'
import { getChatLikeStatuses } from '@/lib/services/like.service'
import { getPromptLikeStatuses } from '@/lib/services/prompt-like.service'
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

const SORT_OPTIONS_PROMPTS = [
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
            loading='lazy'
          />
        ) : (
          <span className={styles.avatarInitials} aria-hidden='true'>
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
            <Eye size={14} aria-hidden='true' />
            <dd>{formatNumber(creator.stats.total_views)}</dd>
            <dt>views</dt>
          </div>
          <div className={styles.stat}>
            <dd>{formatNumber(creator.stats.total_likes)}</dd>
            <dt>likes</dt>
          </div>
          <div className={styles.stat}>
            <dd>{creator.stats.total_chats}</dd>
            <dt>{creator.stats.total_chats === 1 ? 'chat' : 'chats'}</dt>
          </div>
        </dl>
      </div>

      <ArrowRight className={styles.arrowIcon} size={18} aria-hidden='true' />
    </Link>
  )
}

// ─── Skeletons ────────────────────────────────────────────────────────────────
function CreatorCardSkeleton() {
  return (
    <div className={styles.creatorCard} aria-hidden='true'>
      <div className={`${styles.creatorAvatar} ${styles.skeletonCircle}`} />

      <div className={styles.creatorInfo}>
        <div className={styles.creatorHeader}>
          <div className={styles.skeletonLine} style={{ width: '8rem',  height: '1rem'  }} />
          <div className={styles.skeletonLine} style={{ width: '5rem',  height: '0.75rem', marginTop: '0.25rem' }} />
        </div>

        <div className={styles.skeletonLine} style={{ width: '90%',   height: '0.75rem', marginTop: '0.5rem'  }} />
        <div className={styles.skeletonLine} style={{ width: '65%',   height: '0.75rem', marginTop: '0.25rem' }} />

        <div className={styles.creatorStats} style={{ marginTop: '0.5rem' }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={styles.skeletonPill} style={{ animationDelay: `${i * 0.08}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className={styles.skeletonChatCard} aria-hidden='true'>
      <div className={styles.skeletonChatIcon} />

      <div className={styles.skeletonChatBody}>
        <div className={styles.skeletonChatHeader}>
          <div className={styles.skeletonLine} style={{ width: '55%', height: '1rem' }} />
          <div className={styles.skeletonPill} style={{ width: '4rem' }} />
        </div>

        <div className={styles.skeletonLine} style={{ width: '95%', height: '0.75rem', marginTop: '0.6rem' }} />
        <div className={styles.skeletonLine} style={{ width: '75%', height: '0.75rem', marginTop: '0.3rem' }} />

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

const SKELETON_COUNT = 10

function CreatorsSkeletonList() {
  return (
    <section className={styles.creatorsList} aria-label='Loading creators' aria-busy='true'>
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <CreatorCardSkeleton key={i} />
      ))}
    </section>
  )
}

function CardsSkeletonList({ label }) {
  return (
    <section className={styles.chatsList} aria-label={label} aria-busy='true'>
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </section>
  )
}

function ResultsCountSkeleton() {
  return <div className={styles.skeletonLine} style={{ width: '8rem', height: '0.75rem', marginBottom: '0.25rem' }} aria-hidden='true' />
}

// ─── Explore Client ───────────────────────────────────────────────────────────
export default function ExploreClient({
  initialCreators,
  initialChats,
  initialPrompts = [],
  initialPagination,
  initialTab,
  initialLikeStatuses = {},
  initialPromptLikeStatuses = {},
}) {
  const searchParams  = useSearchParams()
  const { user }      = useAuth()
  const currentUserId = user?.id

  const [activeTab, setActiveTab] = useState(initialTab)
  const [likeStatuses, setLikeStatuses] = useState(initialLikeStatuses)
  const [promptLikeStatuses, setPromptLikeStatuses] = useState(initialPromptLikeStatuses)

  const creatorsExplore = useExplore('creators')
  const chatsExplore = useExplore('chats')
  const promptsExplore = useExplore('prompts')

  const exploreHooks = {
    creators: creatorsExplore,
    chats: chatsExplore,
    prompts: promptsExplore,
  }
  const currentExplore = exploreHooks[activeTab] ?? creatorsExplore

  const skippedFirstCall = useRef(false)

  const handleFiltersChange = useCallback((filters) => {
    if (!skippedFirstCall.current) {
      skippedFirstCall.current = true
      return
    }

    const hook = exploreHooks[activeTab] ?? creatorsExplore
    hook.fetchData(filters)
  }, [activeTab])

  const {
    search,
    platform,
    sort,
    currentPage,
    updateSearch,
    updatePlatform,
    updateSort,
    updatePage,
    resetFilters,
    loadFromParams,
    toURLParams,
  } = useExploreFilters(activeTab, handleFiltersChange)

  const didInit = useRef(false)

  useEffect(() => {
    if (didInit.current) return
    didInit.current = true

    if (initialTab === 'creators') {
      creatorsExplore.setData(initialCreators)
      creatorsExplore.setPagination(initialPagination)
    } else if (initialTab === 'prompts') {
      promptsExplore.setData(initialPrompts)
      promptsExplore.setPagination(initialPagination)
    } else {
      chatsExplore.setData(initialChats)
      chatsExplore.setPagination(initialPagination)
    }

    loadFromParams(searchParams)
  }, [])

  useEffect(() => {
    if (activeTab !== 'chats' || chatsExplore.data.length === 0) return
    getChatLikeStatuses(chatsExplore.data.map((c) => c.id)).then((result) => {
      if (result.success) setLikeStatuses(result.data)
    })
  }, [activeTab, chatsExplore.data])

  useEffect(() => {
    if (activeTab !== 'prompts' || promptsExplore.data.length === 0) return
    getPromptLikeStatuses(promptsExplore.data.map((p) => p.id)).then((result) => {
      if (result.success) setPromptLikeStatuses(result.data)
    })
  }, [activeTab, promptsExplore.data])

  useEffect(() => {
    if (!didInit.current) return
    const params = toURLParams()
    const newUrl = params.toString() ? `/explore?${params.toString()}` : '/explore'
    window.history.replaceState({}, '', newUrl)
  }, [toURLParams])

  const handleTabChange = useCallback((newTab) => {
    setActiveTab(newTab)
    resetFilters()
  }, [resetFilters])

  const handlePageChange = useCallback((newPage) => {
    updatePage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [updatePage])

  const sortOptions =
    activeTab === 'creators' ? SORT_OPTIONS_CREATORS :
    activeTab === 'prompts'  ? SORT_OPTIONS_PROMPTS  :
    SORT_OPTIONS_CHATS

  const totalLabel =
    activeTab === 'creators'
      ? (currentExplore.pagination.total === 1 ? 'creator' : 'creators')
      : activeTab === 'prompts'
      ? (currentExplore.pagination.total === 1 ? 'prompt' : 'prompts')
      : (currentExplore.pagination.total === 1 ? 'chat' : 'chats')

  const isLoading = currentExplore.loading
  const isEmpty = !isLoading && currentExplore.data.length === 0
  const hasResults = !isLoading && currentExplore.data.length > 0

  return (
    <main className={styles.main}>
      <div className={styles.container}>

        <header className={styles.header}>
          <h1 className={styles.title}>Explore</h1>
          <p className={styles.subtitle}>Discover creators, AI conversations and prompts</p>
        </header>

        <nav
          className={styles.tabsContainer}
          role='tablist'
          aria-label='Explore sections'
        >
          <button
            role='tab'
            aria-selected={activeTab === 'creators'}
            aria-controls='explore-panel'
            onClick={() => handleTabChange('creators')}
            className={`${styles.tab} ${activeTab === 'creators' ? styles.active : ''}`}
          >
            <Users size={16} aria-hidden='true' />
            Creators
          </button>
          <button
            role='tab'
            aria-selected={activeTab === 'chats'}
            aria-controls='explore-panel'
            onClick={() => handleTabChange('chats')}
            className={`${styles.tab} ${activeTab === 'chats' ? styles.active : ''}`}
          >
            <MessageCircle size={16} aria-hidden='true' />
            Chats
          </button>
          <button
            role='tab'
            aria-selected={activeTab === 'prompts'}
            aria-controls='explore-panel'
            onClick={() => handleTabChange('prompts')}
            className={`${styles.tab} ${activeTab === 'prompts' ? styles.active : ''}`}
          >
            <Sparkles size={16} aria-hidden='true' />
            Prompts
          </button>
        </nav>

        <ExploreFilters
          activeTab={activeTab}
          search={search}
          platform={platform}
          sort={sort}
          sortOptions={sortOptions}
          onSearchChange={updateSearch}
          onPlatformChange={updatePlatform}
          onSortChange={updateSort}
        />

        {isLoading
          ? <ResultsCountSkeleton />
          : (
            <p className={styles.resultsText} aria-live='polite' aria-atomic='true'>
              {currentExplore.pagination.total.toLocaleString()} {totalLabel} found
            </p>
          )
        }

        {isLoading && activeTab === 'creators' && <CreatorsSkeletonList />}
        {isLoading && activeTab === 'chats'    && <CardsSkeletonList label='Loading chats' />}
        {isLoading && activeTab === 'prompts'  && <CardsSkeletonList label='Loading prompts' />}

        {hasResults && activeTab === 'creators' && (
          <section id='explore-panel' aria-label='Creators list' className={styles.creatorsList}>
            {currentExplore.data.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </section>
        )}

        {hasResults && activeTab === 'chats' && (
          <section id='explore-panel' aria-label='AI chats list' className={styles.chatsList}>
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

        {hasResults && activeTab === 'prompts' && (
          <section id='explore-panel' aria-label='AI prompts list' className={styles.chatsList}>
            {currentExplore.data.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                editable={false}
                draggable={false}
                initialLiked={promptLikeStatuses[prompt.id] ?? null}
                isOwner={currentUserId != null && currentUserId === prompt.user_id}
                currentUserId={currentUserId ?? null}
              />
            ))}
          </section>
        )}

        {isEmpty && (
          <div className={styles.emptyState} role='status'>
            <Search className={styles.emptyIcon} size={32} aria-hidden='true' />
            <h2 className={styles.emptyTitle}>No {activeTab} found</h2>
            <p className={styles.emptyText}>Try adjusting your search or filters</p>
          </div>
        )}

        {hasResults && currentExplore.pagination.totalPages > 1 && (
          <nav className={styles.pagination} aria-label='Pagination'>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!currentExplore.pagination.hasPrevPage}
              className={styles.paginationButton}
              aria-label='Go to previous page'
            >
              <ChevronLeft size={16} aria-hidden='true' />
              Previous
            </button>

            <span className={styles.paginationText} aria-current='page'>
              Page {currentPage} of {currentExplore.pagination.totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!currentExplore.pagination.hasNextPage}
              className={styles.paginationButton}
              aria-label='Go to next page'
            >
              Next
              <ChevronRight size={16} aria-hidden='true' />
            </button>
          </nav>
        )}

      </div>
    </main>
  )
}