'use client'

import { useState } from 'react'
import { Calendar, Eye, Link2, MessageSquare } from 'lucide-react'
import ChatLinkCard from '@/components/ChatLinkCard'
import styles from './page.module.scss'
import { useAuth } from '@/contexts/auth'

const PLATFORMS = [
  { value: 'all',     label: 'All' },
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'claude',  label: 'Claude' },
  { value: 'gemini',  label: 'Gemini' },
]

function ProfileHeader({ profile, totalChats, totalViews, joinDate }) {
  const initials = (profile.full_name || profile.username).charAt(0).toUpperCase()
  const displayName = profile.full_name || profile.username

  return (
    <header className={styles.profileHeader}>
      <div className={styles.avatar}>
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={`${displayName} profile picture`}
            width={96}
            height={96}
            fetchPriority="high"
          />
        ) : (
          <span className={styles.avatarInitials} aria-hidden="true">
            {initials}
          </span>
        )}
      </div>

      <h1 className={styles.name}>{displayName}</h1>
      <p className={styles.username}>
        <span className="sr-only">Username: </span>@{profile.username}
      </p>

      {profile.bio && (
        <p className={styles.bio}>{profile.bio}</p>
      )}

      <dl className={styles.stats}>
        <div className={styles.stat}>
          <Link2 size={14} className={styles.statIcon} aria-hidden="true" />
          <dd className={styles.statValue}>{totalChats}</dd>
          <dt className={styles.statLabel}>{totalChats === 1 ? 'chat' : 'chats'}</dt>
        </div>

        <div className={styles.stat}>
          <Eye size={14} className={styles.statIcon} aria-hidden="true" />
          <dd className={styles.statValue}>{totalViews.toLocaleString()}</dd>
          <dt className={styles.statLabel}>{totalViews === 1 ? 'view' : 'views'}</dt>
        </div>

        {joinDate && (
          <div className={styles.stat}>
            <Calendar size={14} className={styles.statIcon} aria-hidden="true" />
            <dt className="sr-only">Member since</dt>
            <dd className={styles.statValue}>{joinDate}</dd>
          </div>
        )}
      </dl>
    </header>
  )
}

function PlatformFilters({ selected, count, onChange }) {
  return (
    <div className={styles.filtersBar}>
      <div
        className={styles.filterButtons}
        role="group"
        aria-label="Filter chats by AI platform"
      >
        {PLATFORMS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={`${styles.filterButton} ${selected === value ? styles.active : ''}`}
            onClick={() => onChange(value)}
            aria-pressed={selected === value}
          >
            {label}
          </button>
        ))}
      </div>

      <p
        className={styles.resultsCount}
        aria-live="polite"
        aria-atomic="true"
      >
        {count} {count === 1 ? 'chat' : 'chats'}
      </p>
    </div>
  )
}

function EmptyState({ platform }) {
  return (
    <div className={styles.emptyState} role="status">
      <div className={styles.emptyIcon} aria-hidden="true">
        <MessageSquare size={24} />
      </div>
      <h2 className={styles.emptyTitle}>No chats found</h2>
      <p className={styles.emptyText}>
        {platform === 'all'
          ? "This user hasn't shared any AI chat conversations yet."
          : `No ${platform} chats found.`}
      </p>
    </div>
  )
}

export default function ProfilePage({
  profile,
  chatLinks: initialChatLinks = [],
  likeStatuses = {},
}) {
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const { user } = useAuth()
  const currentUserId = user?.id

  const totalViews = initialChatLinks.reduce(
    (sum, chat) => sum + (chat.views_count || 0),
    0
  )
  const totalChats = initialChatLinks.length

  const joinDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : null

  const filteredChats =
    selectedPlatform === 'all'
      ? initialChatLinks
      : initialChatLinks.filter((chat) => chat.ai_platform === selectedPlatform)

  return (
    <div className={styles.main}>
      <div className={styles.backgroundGradient} aria-hidden="true" />

      <div className={styles.container}>
        <ProfileHeader
          profile={profile}
          totalChats={totalChats}
          totalViews={totalViews}
          joinDate={joinDate}
        />

        <PlatformFilters
          selected={selectedPlatform}
          count={filteredChats.length}
          onChange={(val) => setSelectedPlatform(val)}
        />

        {filteredChats.length > 0 ? (
          <section
            className={styles.chatsList}
            aria-label={`${profile.full_name || profile.username}'s AI conversations`}
          >
            {filteredChats.map((chat) => (
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
        ) : (
          <EmptyState platform={selectedPlatform} />
        )}
      </div>
    </div>
  )
}