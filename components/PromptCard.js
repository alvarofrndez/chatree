'use client'

import styles from './PromptCard.module.scss'

import { Trash2, Pencil, Eye, Heart, Copy, GripVertical, Sparkles } from 'lucide-react'

import { PLATFORM_DATA } from '@/lib/utils/constants'

import { formatNumber } from '@/lib/utils'

import { incrementPromptViews, incrementPromptCopies } from '@/lib/services/prompt.service'

import { usePromptLike } from '@/hooks/UsePromptLike'

import { toast } from 'sonner'

import { useRouter } from 'next/navigation'

export default function PromptCard({
  prompt,
  editable = false,
  draggable = false,
  initialLiked = null,
  isOwner = false,
  currentUserId = null,
  onEdit,
  onDelete,
}) {
  const data = PLATFORM_DATA[prompt.ai_platform] || PLATFORM_DATA.other
  const Logo = data.icon
  const router = useRouter()

  const {
    liked,
    likesCount,
    loading: likeLoading,
    isCheckingStatus,
    toggleLike
  } = usePromptLike(prompt.id, prompt.likes_count, initialLiked)

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('a[href]')) return
    incrementPromptViews(prompt.id)
    router.push(`/prompt/${prompt.id}`)
  }

  const handleCopyClick = async (e) => {
    e.stopPropagation()

    try {
      await navigator.clipboard.writeText(prompt.prompt_text)
      incrementPromptCopies(prompt.id)
      toast.success('Prompt copied to clipboard')
    } catch {
      toast.error('Could not copy the prompt')
    }
  }

  const handleLikeClick = async (e) => {
    e.stopPropagation()

    if (!isOwner && currentUserId === null) {
      toast.info('Sign in to like prompts', {
        description: 'Create a free account or sign in to save your favorite prompts.',
        action: {
          label: 'Sign in',
          onClick: () => window.location.href = '/signin',
        },
        duration: 5000,
      })
      return
    }

    if (isOwner) {
      toast.info('You cannot like your own prompt', {
        description: 'Share your profile so others can rate your prompts.',
        duration: 3000,
      })
      return
    }

    if (likeLoading || isCheckingStatus) return

    const result = await toggleLike()

    if (!result.success && result.error) {
      const msg = result.error?.toLowerCase() || ''

      if (msg.includes('not found')) {
        toast.error('Prompt not found', {
          description: 'This prompt may have been deleted.',
        })
      } else if (msg.includes('network') || msg.includes('fetch')) {
        toast.error('Connection error', {
          description: 'Check your internet connection and try again.',
        })
      } else {
        toast.error('Could not update the like', {
          description: result.error || 'Please try again.',
        })
      }
    }
  }

  const likeButtonTitle = currentUserId === null
    ? 'Sign in to like this prompt'
    : isOwner
    ? 'You cannot like your own prompt'
    : liked
    ? 'Unlike'
    : 'Like this prompt'

  return (
    <div
      className={`${styles.card} ${editable ? styles.editable : ''}`}
      style={{
        '--platform-color': data.color,
        '--platform-color-rgb': data.rgb,
      }}
      onClick={handleCardClick}
    >
      <div className={styles.content}>
        {draggable && (
          <div className={styles.dragHandle}>
            <GripVertical />
          </div>
        )}

        <div
          className={styles.platformIcon}
          style={{
            backgroundColor: `rgba(${data.rgb}, 0.1)`,
            borderColor: `rgba(${data.rgb}, 0.2)`,
          }}
        >
          {Logo ? (
            <Logo className={styles.svgLogo} style={{ color: data.color }} />
          ) : (
            <span className={styles.fallbackIcon}>
              <Sparkles />
            </span>
          )}
        </div>

        <div className={styles.promptInfo}>
          <div className={styles.promptHeader}>
            <div className={styles.promptHeaderContent}>
              <h3 className={styles.promptTitle}>{prompt.title}</h3>

              <div className={styles.badges}>
                {prompt.category && (
                  <span className={styles.categoryBadge}>{prompt.category}</span>
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

            {editable && (
              <div className={styles.promptActions}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(prompt)
                  }}
                  className={styles.deleteButton}
                >
                  <Trash2 />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(prompt)
                  }}
                  className={styles.editButton}
                >
                  <Pencil />
                </button>
              </div>
            )}
          </div>

          <p className={`${styles.promptDescription} ${!prompt.description ? styles.emptyDescription : ''}`}>
            {prompt.description || 'No description available'}
          </p>

          <pre className={styles.promptPreview}>{prompt.prompt_text}</pre>

          <div className={styles.promptFooter}>
            <div className={styles.promptTags}>
              {!prompt.tags || prompt.tags.length === 0 ? (
                <span className={styles.emptyTags}>No tags</span>
              ) : (
                prompt.tags.slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    className={styles.tag}
                    style={{
                      backgroundColor: `rgba(${data.rgb}, 0.08)`,
                      color: data.color,
                      borderColor: `rgba(${data.rgb}, 0.2)`,
                    }}
                  >
                    #{tag}
                  </span>
                ))
              )}
            </div>

            <div className={styles.promptStats}>
              <button
                onClick={handleCopyClick}
                className={`${styles.stat} ${styles.copyButton}`}
                aria-label="Copy prompt"
                title="Copy prompt"
              >
                <Copy />
                {formatNumber(prompt.copies_count || 0)}
              </button>

              <span className={styles.stat}>
                <Eye />
                {formatNumber(prompt.views_count || 0)}
              </span>

              <button
                onClick={handleLikeClick}
                className={`
                  ${styles.stat}
                  ${styles.likeButton}
                  ${liked ? styles.liked : ''}
                  ${likeLoading ? styles.loading : ''}
                  ${isOwner ? styles.ownerDisabled : ''}
                  ${currentUserId === null ? styles.guestDisabled : ''}
                `}
                disabled={likeLoading || isCheckingStatus}
                aria-label={likeButtonTitle}
                title={likeButtonTitle}
              >
                <Heart
                  className={`
                    ${liked ? styles.heartFilled : ''}
                    ${likeLoading ? styles.heartPulsing : ''}
                  `}
                />
                {formatNumber(likesCount || 0)}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={styles.glow}
        style={{
          background: `radial-gradient(circle at 50% 0%, rgba(${data.rgb}, 0.15) 0%, transparent 70%)`,
        }}
      />
    </div>
  )
}