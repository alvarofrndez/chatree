'use client'

import styles from './ChatLinkCard.module.scss'
import { Trash2, Pencil, Eye, Heart, ExternalLink, GripVertical, Cloud } from 'lucide-react'
import { PLATAFORM_DATA } from '@/lib/utils/constants'
import { formatNumber } from '@/lib/utils'
import { incrementChatViews } from '@/lib/services/chat.service'
import { useChatLike } from '@/hooks/UseChatLike.js'

export default function ChatLinkCard({
  chat,
  editable = false,
  draggable = false,
  initialLiked = null,
  isOwner = false,
  onEdit,
  onDelete,
}) {
  const data = PLATAFORM_DATA[chat.ai_platform] || PLATAFORM_DATA.other
  const Logo = data.icon

  const {
    liked,
    likesCount,
    loading: likeLoading,
    isCheckingStatus,
    toggleLike
  } = useChatLike(chat.id, chat.likes_count, initialLiked)

  const handleCardClick = async (e) => {
    // Avoid opening when clicking buttons or links
    if (e.target.closest('button') || e.target.closest('a[href]')) {
      return
    }

    incrementChatViews(chat.id)
    window.open(chat.url, '_blank', 'noopener,noreferrer')
  }

  const handleLikeClick = async (e) => {
    console.log(isOwner)
    e.stopPropagation()

    if (isOwner) return

    if (likeLoading || isCheckingStatus) return

    const result = await toggleLike()

    if (!result.success && result.error) {
      // toast.error(result.error)
    }
  }

  const likeButtonTitle = isOwner
    ? "You can't like your own chat"
    : liked
    ? 'Unlike'
    : 'Like this chat'

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
            <Logo
              className={styles.svgLogo}
              style={{ color: data.color }}
            />
          ) : (
            <span className={styles.fallbackIcon}><Cloud /></span>
          )}
        </div>

        <div className={styles.chatInfo}>
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderContent}>
              <h3 className={styles.chatTitle}>{chat.title}</h3>
              <span
                className={styles.platformBadge}
                style={{
                  backgroundColor: `rgba(${data.rgb}, 0.1)`,
                  color: data.color,
                  borderColor: `rgba(${data.rgb}, 0.3)`,
                }}
              >
                {chat.ai_platform}
              </span>
            </div>

            {editable && (
              <div className={styles.chatActions}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(chat)
                  }}
                  className={styles.deleteButton}
                >
                  <Trash2 />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(chat)
                  }}
                  className={styles.editButton}
                >
                  <Pencil />
                </button>

                <a
                  href={chat.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={styles.openButton}
                >
                  <ExternalLink />
                </a>
              </div>
            )}
          </div>

          <p className={`${styles.chatDescription} ${!chat.description ? styles.emptyDescription : ''}`}>
            {chat.description || 'No description available'}
          </p>

          <div className={styles.chatFooter}>
            <div className={styles.chatTags}>
              {!chat.tags || chat.tags.length === 0 ? (
                <span className={styles.emptyTags}>Without tags</span>
              ) : (
                chat.tags.slice(0, 3).map((tag, i) => (
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

            <div className={styles.chatStats}>
              <span className={styles.stat}>
                <Eye />
                {formatNumber(chat.views_count || 0)}
              </span>

              <button
                onClick={handleLikeClick}
                className={`
                  ${styles.stat}
                  ${styles.likeButton}
                  ${liked ? styles.liked : ''}
                  ${likeLoading ? styles.loading : ''}
                  ${isOwner ? styles.ownerDisabled : ''}
                `}
                disabled={likeLoading || isCheckingStatus || isOwner}
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