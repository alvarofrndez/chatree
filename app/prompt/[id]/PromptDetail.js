'use client'

import { useEffect, useRef } from 'react'

import Link from 'next/link'

import styles from './PromptDetail.module.scss'

import { Copy, Heart, Eye, ArrowLeft, User } from 'lucide-react'

import { PLATFORM_DATA } from '@/lib/utils/constants'

import { formatNumber } from '@/lib/utils'

import { incrementPromptViews, incrementPromptCopies } from '@/lib/services/prompt.service'

import { usePromptLike } from '@/hooks/UsePromptLike'

import { toast } from 'sonner'

export default function PromptDetail({
  prompt,
  profile,
  isOwner,
  currentUserId,
  initialLiked,
}) {
  const data = PLATFORM_DATA[prompt.ai_platform] || PLATFORM_DATA.other
  const Logo = data.icon
  const hasCountedView = useRef(false)

  const {
    liked,
    likesCount,
    loading: likeLoading,
    isCheckingStatus,
    toggleLike
  } = usePromptLike(prompt.id, prompt.likes_count, initialLiked)

  useEffect(() => {
    if (!hasCountedView.current) {
      hasCountedView.current = true
      incrementPromptViews(prompt.id)
    }
  }, [prompt.id])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.prompt_text)
      incrementPromptCopies(prompt.id)
      toast.success('Prompt copied to clipboard')
    } catch {
      toast.error('Could not copy the prompt')
    }
  }

  const handleLikeClick = async () => {
    if (!isOwner && currentUserId === null) {
      toast.info('Sign in to like prompts', {
        action: {
          label: 'Sign in',
          onClick: () => window.location.href = '/signin',
        },
        duration: 5000,
      })
      return
    }

    if (isOwner) {
      toast.info('You cannot like your own prompt')
      return
    }

    if (likeLoading || isCheckingStatus) return

    const result = await toggleLike()

    if (!result.success && result.error) {
      toast.error('Could not update the like', {
        description: result.error,
      })
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <Link
          href={profile ? `/u/${profile.username}` : '/'}
          className={styles.backLink}
        >
          <ArrowLeft />
          Back
        </Link>

        <div className={styles.header}>
          <div
            className={styles.platformIcon}
            style={{
              backgroundColor: `rgba(${data.rgb}, 0.1)`,
              borderColor: `rgba(${data.rgb}, 0.2)`,
            }}
          >
            {Logo && <Logo style={{ color: data.color }} />}
          </div>

          <div className={styles.headerText}>
            <h1 className={styles.title}>{prompt.title}</h1>

            <div className={styles.badges}>
              {prompt.category && (
                <span className={styles.categoryBadge}>
                  {prompt.category}
                </span>
              )}

              {prompt.ai_platform && (
                <span
                  className={styles.platformBadge}
                  style={{
                    backgroundColor: `rgba(${data.rgb}, 0.1)`,
                    color: data.color,
                    borderColor: `rgba(${data.rgb}, 0.3)`,
                  }}
                >
                  {prompt.ai_platform}
                </span>
              )}
            </div>
          </div>
        </div>

        {profile && (
          <Link
            href={`/u/${profile.username}`}
            className={styles.author}
          >
            <span className={styles.authorAvatar}>
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                />
              ) : (
                <User />
              )}
            </span>

            <span>by @{profile.username}</span>
          </Link>
        )}

        {prompt.description && (
          <p className={styles.description}>{prompt.description}</p>
        )}

        <div className={styles.promptBox}>
          <div className={styles.promptBoxHeader}>
            <span>Prompt</span>

            <button
              className={styles.copyButton}
              onClick={handleCopy}
            >
              <Copy />
              Copy
            </button>
          </div>

          <pre className={styles.promptText}>
            {prompt.prompt_text}
          </pre>
        </div>

        {prompt.tags?.length > 0 && (
          <div className={styles.tags}>
            {prompt.tags.map((tag, i) => (
              <span key={i} className={styles.tag}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className={styles.stats}>
          <span className={styles.stat}>
            <Eye />
            {formatNumber(prompt.views_count || 0)} views
          </span>

          <span className={styles.stat}>
            <Copy />
            {formatNumber(prompt.copies_count || 0)} copies
          </span>

          <button
            onClick={handleLikeClick}
            className={`${styles.stat} ${styles.likeButton} ${liked ? styles.liked : ''}`}
            disabled={likeLoading || isCheckingStatus}
          >
            <Heart className={liked ? styles.heartFilled : ''} />
            {formatNumber(likesCount || 0)} likes
          </button>
        </div>
      </div>
    </main>
  )
}