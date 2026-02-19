'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Eye,
  Link2,
  Copy,
  Check,
  ExternalLink,
  Plus,
  Settings,
  ChartColumn,
} from 'lucide-react'
import styles from './page.module.scss'
import { formatNumber, copyToClipboard } from '@/lib/utils'
import { useAuth } from '@/contexts/auth'
import ChatLinkCard from '@/components/ChatLinkCard'
import ChatFormModal from '@/components/dashboard/ChatFormMOdal'
import DeleteChatModal from '@/components/dashboard/DeleteChatModal'
import SettingsTab from '@/components/dashboard/SettingsTab'
import { useChats } from '@/hooks/UseChats'
import { useChatForm } from '@/hooks/UseChatForm'
import { toast } from 'sonner'

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statHeader}>
        <Icon className={styles.statIcon} size={16} aria-hidden="true" />
        <dt className={styles.statLabel}>{label}</dt>
      </div>
      <dd className={styles.statValue}>{value}</dd>
    </div>
  )
}

function ProfileUrlBar({ username }) {
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [origin, setOrigin] = useState('')

  useEffect(() => { setOrigin(window.location.host) }, [])

  const handleCopyUrl = async () => {
    if (!username) return
    const url = `${window.location.origin}/u/${username}`
    const success = await copyToClipboard(url)
    if (success) {
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
      // Confirmación visual inline (el botón cambia a check) +
      // toast sutil para reforzar sin ser repetitivo
      toast.success('Link copied!', {
        description: `${url}`,
        duration: 2500,
      })
    } else {
      toast.error('Could not copy link', {
        description: 'Try selecting and copying the URL manually.',
      })
    }
  }

  return (
    <div className={styles.profileCard} aria-label="Your public profile URL">
      <div className={styles.profileUrl}>
        <Link2 className={styles.profileUrlIcon} size={14} aria-hidden="true" />
        <span className={styles.profileUrlText}>
          {origin}/u/{username || '…'}
        </span>
      </div>
      <div className={styles.profileActions}>
        <button
          onClick={handleCopyUrl}
          className={styles.profileButton}
          aria-label={copiedUrl ? 'URL copied!' : 'Copy profile URL'}
          title={copiedUrl ? 'Copied!' : 'Copy URL'}
        >
          {copiedUrl
            ? <Check size={16} aria-hidden="true" />
            : <Copy size={16} aria-hidden="true" />
          }
          <span className={styles.buttonTextHidden}>{copiedUrl ? 'Copied!' : 'Copy'}</span>
        </button>
        <Link
          href={`/u/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.profileButton}
          aria-label="View your public profile (opens in new tab)"
          title="View profile"
        >
          <ExternalLink size={16} aria-hidden="true" />
          <span className={styles.buttonTextHidden}>View</span>
        </Link>
      </div>
    </div>
  )
}

function EmptyChats({ onAdd }) {
  return (
    <div className={styles.emptyState} role="status">
      <Link2 size={24} aria-hidden="true" />
      <div className={styles.emptyStateInfo}>
        <h2 className={styles.emptyStateTitle}>No chats yet</h2>
        <p>Add your first AI conversation to get started</p>
      </div>
      <button className={styles.addButton} onClick={onAdd}>
        <Plus size={16} aria-hidden="true" />
        Add your first chat
      </button>
    </div>
  )
}

export default function DashboardClient({ initialProfile, initialStats, initialChats }) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const currentUserId = user?.id

  const [profile, setProfile] = useState(initialProfile)
  const [stats]   = useState(initialStats)
  const [activeTab, setActiveTab] = useState('chats')

  const [showChatModal,   setShowChatModal]   = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingChat,     setEditingChat]     = useState(null)
  const [chatToDelete,    setChatToDelete]    = useState(null)

  const { chats, loading: chatsLoading, addChat, editChat, removeChat } = useChats(initialChats)
  const { formData, tagInput, setTagInput, updateField, addTag, removeTag, resetForm, loadData } = useChatForm()

  useEffect(() => {
    if (!authLoading && !user) router.push('/signin')
  }, [user, authLoading, router])

  // ── Save chat (add or edit) ────────────────────────────────────────────────
  const handleSaveChat = async (e) => {
    e.preventDefault()

    // Warn if the URL doesn't look like a chat link
    if (formData.url && !formData.url.includes('claude.ai') && !formData.url.includes('chatgpt.com') && !formData.url.includes('chat.openai.com')) {
      toast.info('Heads up', {
        description: "This URL doesn't look like a known AI chat link. Make sure it's shareable.",
        duration: 4000,
      })
    }

    const isEditing = !!editingChat
    const result    = isEditing
      ? await editChat(editingChat.id, formData)
      : await addChat(formData)

    if (result.success) {
      setShowChatModal(false)
      resetForm()
      setEditingChat(null)

      toast.success(isEditing ? 'Chat updated' : 'Chat added', {
        description: isEditing
          ? 'Your changes have been saved.'
          : 'Your conversation is now live on your profile.',
      })
    } else {
      toast.error(isEditing ? 'Could not update chat' : 'Could not add chat', {
        description: result.error || 'Please try again.',
      })
    }
  }

  // ── Delete chat ───────────────────────────────────────────────────────────
  const handleDeleteChat = async () => {
    if (!chatToDelete) return

    const result = await removeChat(chatToDelete.id)

    if (result.success) {
      setShowDeleteModal(false)
      setChatToDelete(null)

      toast.success('Chat deleted', {
        description: `"${chatToDelete.title || 'Untitled chat'}" has been removed from your profile.`,
      })
    } else {
      toast.error('Could not delete chat', {
        description: result.error || 'Please try again.',
      })
    }
  }

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const openDeleteModal  = (chat) => { setChatToDelete(chat); setShowDeleteModal(true) }
  const closeDeleteModal = ()     => { setShowDeleteModal(false); setChatToDelete(null) }

  const handleEditChat = (chat) => {
    setEditingChat(chat)
    loadData(chat)
    setShowChatModal(true)
  }

  const handleOpenAddModal = () => {
    resetForm()
    setEditingChat(null)
    setShowChatModal(true)
  }

  const handleCloseModal = () => {
    setShowChatModal(false)
    resetForm()
    setEditingChat(null)
  }

  // ── Profile update ────────────────────────────────────────────────────────
  // Toast is fired from SettingsTab itself (it owns the save logic),
  // so here we only sync local state.
  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile)
  }

  if (!authLoading && !user) return null

  return (
    <main className={styles.main}>
      <div className={styles.container}>

        <header className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Manage your shared AI chats and profile</p>
        </header>

        <dl className={styles.statsGrid}>
          <StatCard icon={Link2}       label="Chats" value={stats.total_chats} />
          <StatCard icon={Eye}         label="Views" value={formatNumber(stats.total_views)} />
          <StatCard icon={ChartColumn} label="Likes" value={formatNumber(stats.total_likes)} />
        </dl>

        <ProfileUrlBar username={profile?.username} />

        <nav className={styles.tabsContainer} role="tablist" aria-label="Dashboard sections">
          <button
            role="tab"
            aria-selected={activeTab === 'chats'}
            aria-controls="dashboard-panel"
            className={`${styles.tab} ${activeTab === 'chats' ? styles.active : ''}`}
            onClick={() => setActiveTab('chats')}
          >
            My Chats ({stats.total_chats})
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'settings'}
            aria-controls="dashboard-panel"
            className={`${styles.tab} ${activeTab === 'settings' ? styles.active : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={14} aria-hidden="true" />
            Settings
          </button>
        </nav>

        {activeTab === 'chats' && (
          <section id="dashboard-panel" aria-label="My AI chats" className={styles.containerChats}>
            <button className={styles.addButton} onClick={handleOpenAddModal}>
              <Plus size={16} aria-hidden="true" />
              Add AI Chat
            </button>

            {chats.length === 0 ? (
              <EmptyChats onAdd={handleOpenAddModal} />
            ) : (
              <div className={styles.chatsList}>
                {chats.map((chat) => (
                  <ChatLinkCard
                    key={chat.id}
                    chat={chat}
                    editable
                    draggable
                    isOwner={currentUserId != null && currentUserId === chat.user_id}
                    onEdit={() => handleEditChat(chat)}
                    onDelete={() => openDeleteModal(chat)}
                    currentUserId={currentUserId}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'settings' && (
          <section id="dashboard-panel" aria-label="Profile settings">
            <SettingsTab
              profile={profile}
              onProfileUpdate={handleProfileUpdate}
            />
          </section>
        )}

      </div>

      {/* ── Modals ── */}
      {showChatModal && (
        <ChatFormModal
          isEditing={!!editingChat}
          formData={formData}
          tagInput={tagInput}
          loading={chatsLoading}
          onSubmit={handleSaveChat}
          onClose={handleCloseModal}
          onFieldChange={updateField}
          onTagInputChange={setTagInput}
          onAddTag={addTag}
          onRemoveTag={removeTag}
        />
      )}

      {showDeleteModal && chatToDelete && (
        <DeleteChatModal
          chat={chatToDelete}
          loading={chatsLoading}
          onConfirm={handleDeleteChat}
          onClose={closeDeleteModal}
        />
      )}
    </main>
  )
}