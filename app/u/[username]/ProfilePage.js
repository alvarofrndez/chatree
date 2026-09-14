'use client'

import { useMemo, useState } from 'react'
import { Calendar, Eye, Link2, MessageSquare, Sparkles } from 'lucide-react'
import ChatLinkCard from '@/components/ChatLinkCard'
import PromptCard from '@/components/PromptCard'
import styles from './page.module.scss'
import { useAuth } from '@/contexts/auth'
import { PLATFORMS } from '@/lib/utils/constants'

function ProfileHeader({ profile, totalChats, totalPrompts, totalViews, joinDate }) {
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
          <Sparkles size={14} className={styles.statIcon} aria-hidden="true" />
          <dd className={styles.statValue}>{totalPrompts}</dd>
          <dt className={styles.statLabel}>{totalPrompts === 1 ? 'prompt' : 'prompts'}</dt>
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

function ContentTypeTabs({ selected, onChange, totalChats, totalPrompts }) {
  return (
    <div className={styles.tabsContainer} role="group" aria-label="Switch between chats and prompts">
      <button
        type="button"
        className={`${styles.tab} ${selected === 'chats' ? styles.active : ''}`}
        onClick={() => onChange('chats')}
        aria-pressed={selected === 'chats'}
      >
        <Link2 size={14} aria-hidden="true" />
        Chats ({totalChats})
      </button>
      <button
        type="button"
        className={`${styles.tab} ${selected === 'prompts' ? styles.active : ''}`}
        onClick={() => onChange('prompts')}
        aria-pressed={selected === 'prompts'}
      >
        <Sparkles size={14} aria-hidden="true" />
        Prompts ({totalPrompts})
      </button>
    </div>
  )
}

function PlatformFilters({ selected, count, onChange, contentType, totalChats, totalPrompts, onContentTypeChange }) {
  return (
    <div className={styles.filtersBar}>
      <div
        className={styles.filterButtons}
        role="group"
        aria-label="Filter by AI platform"
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
        {count} {contentType === 'chats'
          ? (count === 1 ? 'chat' : 'chats')
          : (count === 1 ? 'prompt' : 'prompts')}
      </p>
    </div>
  )
}

function EmptyState({ platform, contentType }) {
  return (
    <div className={styles.emptyState} role="status">
      <div className={styles.emptyIcon} aria-hidden="true">
        {contentType === 'chats' ? <MessageSquare size={24} /> : <Sparkles size={24} />}
      </div>
      <h2 className={styles.emptyTitle}>
        {contentType === 'chats' ? 'No chats found' : 'No prompts found'}
      </h2>
      <p className={styles.emptyText}>
        {platform === 'all'
          ? contentType === 'chats'
            ? "This user hasn't shared any AI chat conversations yet."
            : "This user hasn't shared any prompts yet."
          : `No ${platform} ${contentType === 'chats' ? 'chats' : 'prompts'} found.`}
      </p>
    </div>
  )
}

export default function ProfilePage({
  profile,
  chatLinks: initialChatLinks = [],
  promptLinks: initialPromptLinks = [],
  likeStatuses = {},
  promptLikeStatuses = {},
}) {
  const [contentType, setContentType]           = useState('chats')
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const { user } = useAuth()
  const currentUserId = user?.id

  const totalChatViews = initialChatLinks.reduce((sum, chat) => sum + (chat.views_count || 0), 0)
  const totalPromptViews = initialPromptLinks.reduce((sum, prompt) => sum + (prompt.views_count || 0), 0)
  const totalViews = totalChatViews + totalPromptViews

  const totalChats = initialChatLinks.length
  const totalPrompts = initialPromptLinks.length

  const joinDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : null

  const filteredChats = useMemo(() => (
    selectedPlatform === 'all'
      ? initialChatLinks
      : initialChatLinks.filter((chat) => chat.ai_platform === selectedPlatform)
  ), [initialChatLinks, selectedPlatform])

  const filteredPrompts = useMemo(() => (
    selectedPlatform === 'all'
      ? initialPromptLinks
      : initialPromptLinks.filter((prompt) => prompt.ai_platform === selectedPlatform)
  ), [initialPromptLinks, selectedPlatform])

  const handleContentTypeChange = (val) => {
    setContentType(val)
    setSelectedPlatform('all')
  }

  const items = contentType === 'chats' ? filteredChats : filteredPrompts

  return (
    <div className={styles.main}>
      <div className={styles.backgroundGradient} aria-hidden="true" />

      <div className={styles.container}>
        <ProfileHeader
          profile={profile}
          totalChats={totalChats}
          totalPrompts={totalPrompts}
          totalViews={totalViews}
          joinDate={joinDate}
        />

        <ContentTypeTabs
          selected={contentType}
          onChange={handleContentTypeChange}
          totalChats={totalChats}
          totalPrompts={totalPrompts}
        />

        <PlatformFilters
          selected={selectedPlatform}
          count={items.length}
          onChange={(val) => setSelectedPlatform(val)}
          contentType={contentType}
        />

        {items.length > 0 ? (
          <section
            className={styles.chatsList}
            aria-label={`${profile.full_name || profile.username}'s ${contentType === 'chats' ? 'AI conversations' : 'AI prompts'}`}
          >
            {contentType === 'chats'
              ? filteredChats.map((chat) => (
                  <ChatLinkCard
                    key={chat.id}
                    chat={chat}
                    editable={false}
                    draggable={false}
                    initialLiked={likeStatuses[chat.id] ?? null}
                    isOwner={currentUserId != null && currentUserId === chat.user_id}
                    currentUserId={currentUserId}
                  />
                ))
              : filteredPrompts.map((prompt) => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    editable={false}
                    draggable={false}
                    initialLiked={promptLikeStatuses[prompt.id] ?? null}
                    isOwner={currentUserId != null && currentUserId === prompt.user_id}
                    currentUserId={currentUserId}
                  />
                ))
            }
          </section>
        ) : (
          <EmptyState platform={selectedPlatform} contentType={contentType} />
        )}
      </div>
    </div>
  )
}