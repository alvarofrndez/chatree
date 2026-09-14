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
  Sparkles,
} from 'lucide-react'
import styles from './page.module.scss'
import { formatNumber, copyToClipboard } from '@/lib/utils'
import { useAuth } from '@/contexts/auth'
import ChatLinkCard from '@/components/ChatLinkCard'
import PromptCard from '@/components/PromptCard'
import ChatFormModal from '@/components/dashboard/ChatFormMOdal'
import DeleteChatModal from '@/components/dashboard/DeleteChatModal'
import PromptFormModal from '@/components/dashboard/PromptFormModal'
import DeletePromptModal from '@/components/dashboard/DeletePromptModal'
import SettingsTab from '@/components/dashboard/SettingsTab'
import { useChats } from '@/hooks/UseChats'
import { useChatForm } from '@/hooks/UseChatForm'
import { usePrompts } from '@/hooks/UsePrompts'
import { usePromptForm } from '@/hooks/UsePromptForm'
import { toast } from 'sonner'

// ─── Stat Card ────────────────────────────────────────────────────────────────
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

// ─── Profile URL Bar ──────────────────────────────────────────────────────────
function ProfileUrlBar({ username }) {
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [origin, setOrigin]       = useState('')

  useEffect(() => { setOrigin(window.location.host) }, [])

  const handleCopyUrl = async () => {
    if (!username) return
    const url     = `${window.location.origin}/u/${username}`
    const success = await copyToClipboard(url)
    if (success) {
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
      toast.success('Link copied!', { description: url, duration: 2500 })
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
            : <Copy  size={16} aria-hidden="true" />
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

// ─── Empty States ─────────────────────────────────────────────────────────────
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

function EmptyPrompts({ onAdd }) {
  return (
    <div className={styles.emptyState} role="status">
      <Sparkles size={24} aria-hidden="true" />
      <div className={styles.emptyStateInfo}>
        <h2 className={styles.emptyStateTitle}>No prompts yet</h2>
        <p>Publish your first prompt so others can use and copy it</p>
      </div>
      <button className={styles.addButton} onClick={onAdd}>
        <Plus size={16} aria-hidden="true" />
        Add your first prompt
      </button>
    </div>
  )
}

// ─── Card Skeletons ───────────────────────────────────────────────────────────
// Mirrors ChatLinkCard/PromptCard structure. Rendered while loading is true
// (during mutations).
function CardSkeleton() {
  return (
    <div className={styles.chatCardSkeleton} aria-hidden="true">
      <div className={styles.skeletonChatIcon} />

      <div className={styles.skeletonChatBody}>
        <div className={styles.skeletonChatHeader}>
          <div className={styles.skeletonLine} style={{ width: '50%', height: '1rem' }} />
          <div className={styles.skeletonPill} style={{ width: '4.5rem' }} />
        </div>

        <div className={styles.skeletonLine} style={{ width: '92%',  height: '0.75rem', marginTop: '0.6rem' }} />
        <div className={styles.skeletonLine} style={{ width: '68%',  height: '0.75rem', marginTop: '0.3rem' }} />

        <div className={styles.skeletonChatFooter}>
          <div className={styles.skeletonChatTags}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={styles.skeletonPill}
                style={{ width: '4rem', animationDelay: `${i * 0.07}s` }}
              />
            ))}
          </div>
          <div className={styles.skeletonChatStats}>
            <div className={styles.skeletonPill} style={{ width: '3rem' }} />
            <div className={styles.skeletonPill} style={{ width: '3rem' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function CardsSkeletonList({ count }) {
  const n = Math.min(Math.max(count, 3), 8)
  return (
    <div className={styles.chatsList} aria-label="Updating…" aria-busy="true">
      {Array.from({ length: n }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

// ─── Dashboard Client ─────────────────────────────────────────────────────────
export default function DashboardClient({ initialProfile, initialStats, initialChats, initialPrompts }) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const currentUserId = user?.id

  const [profile,   setProfile]   = useState(initialProfile)
  const [stats]                   = useState(initialStats)
  const [activeTab, setActiveTab] = useState('chats')

  const [showChatModal,   setShowChatModal]   = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingChat,     setEditingChat]     = useState(null)
  const [chatToDelete,    setChatToDelete]    = useState(null)

  const [showPromptModal,       setShowPromptModal]       = useState(false)
  const [showDeletePromptModal, setShowDeletePromptModal] = useState(false)
  const [editingPrompt,         setEditingPrompt]         = useState(null)
  const [promptToDelete,        setPromptToDelete]        = useState(null)

  const { chats, loading: chatsLoading, addChat, editChat, removeChat } = useChats(initialChats)
  const { formData, tagInput, setTagInput, updateField, addTag, removeTag, resetForm, loadData } = useChatForm()

  const { prompts, loading: promptsLoading, addPrompt, editPrompt, removePrompt } = usePrompts(initialPrompts)
  const {
    formData: promptFormData,
    tagInput: promptTagInput,
    setTagInput: setPromptTagInput,
    updateField: updatePromptField,
    addTag: addPromptTag,
    removeTag: removePromptTag,
    resetForm: resetPromptForm,
    loadData: loadPromptData,
  } = usePromptForm()

  // Contadores en vivo: `chats`/`prompts` son los arrays locales que
  // useChats/usePrompts actualizan al crear/editar/borrar. `stats` en cambio
  // es un snapshot del servidor tomado solo al cargar la página (nunca se
  // vuelve a pedir), así que NO debe usarse para pintar estos contadores.
  const totalChats   = chats.length
  const totalPrompts = prompts.length

  useEffect(() => {
    if (!authLoading && !user) router.push('/signin')
  }, [user, authLoading, router])

  // ── Save chat ─────────────────────────────────────────────────────────────
  const handleSaveChat = async (e) => {
    e.preventDefault()

    if (
      formData.url &&
      !formData.url.includes('claude.ai') &&
      !formData.url.includes('chatgpt.com') &&
      !formData.url.includes('chat.openai.com')
    ) {
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

  // ── Save prompt ───────────────────────────────────────────────────────────
  const handleSavePrompt = async (e) => {
    e.preventDefault()

    const isEditing = !!editingPrompt
    const result    = isEditing
      ? await editPrompt(editingPrompt.id, promptFormData)
      : await addPrompt(promptFormData)

    if (result.success) {
      setShowPromptModal(false)
      resetPromptForm()
      setEditingPrompt(null)
      toast.success(isEditing ? 'Prompt updated' : 'Prompt published', {
        description: isEditing
          ? 'Your changes have been saved.'
          : 'Your prompt is now live on your profile.',
      })
    } else {
      toast.error(isEditing ? 'Could not update prompt' : 'Could not add prompt', {
        description: result.error || 'Please try again.',
      })
    }
  }

  // ── Delete prompt ─────────────────────────────────────────────────────────
  const handleDeletePrompt = async () => {
    if (!promptToDelete) return
    const result = await removePrompt(promptToDelete.id)
    if (result.success) {
      setShowDeletePromptModal(false)
      setPromptToDelete(null)
      toast.success('Prompt deleted', {
        description: `"${promptToDelete.title || 'Untitled prompt'}" has been removed from your profile.`,
      })
    } else {
      toast.error('Could not delete prompt', {
        description: result.error || 'Please try again.',
      })
    }
  }

  // ── Modal helpers: chats ──────────────────────────────────────────────────
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

  // ── Modal helpers: prompts ────────────────────────────────────────────────
  const openDeletePromptModal  = (prompt) => { setPromptToDelete(prompt); setShowDeletePromptModal(true) }
  const closeDeletePromptModal = ()       => { setShowDeletePromptModal(false); setPromptToDelete(null) }

  const handleEditPrompt = (prompt) => {
    setEditingPrompt(prompt)
    loadPromptData(prompt)
    setShowPromptModal(true)
  }

  const handleOpenAddPromptModal = () => {
    resetPromptForm()
    setEditingPrompt(null)
    setShowPromptModal(true)
  }

  const handleClosePromptModal = () => {
    setShowPromptModal(false)
    resetPromptForm()
    setEditingPrompt(null)
  }

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile)
  }

  if (!authLoading && !user) return null

  return (
    <main className={styles.main}>
      <div className={styles.container}>

        <header className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Manage your shared AI chats, prompts and profile</p>
        </header>

        <dl className={styles.statsGrid}>
          <StatCard icon={Eye} label="Views" value={formatNumber(stats.total_views)} />
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
            Chats ({totalChats})
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'prompts'}
            aria-controls="dashboard-panel"
            className={`${styles.tab} ${activeTab === 'prompts' ? styles.active : ''}`}
            onClick={() => setActiveTab('prompts')}
          >
            Prompts ({totalPrompts})
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
          <section id="dashboard-panel" aria-label="My chats" className={styles.containerChats}>
            <button
              className={styles.addButton}
              onClick={handleOpenAddModal}
              disabled={chatsLoading}
            >
              <Plus size={16} aria-hidden="true" />
              Add Chat
            </button>

            {chatsLoading && <CardsSkeletonList count={chats.length} />}

            {!chatsLoading && chats.length === 0 && (
              <EmptyChats onAdd={handleOpenAddModal} />
            )}

            {!chatsLoading && chats.length > 0 && (
              <div className={styles.chatsList}>
                {chats.map((chat) => (
                  <ChatLinkCard
                    key={chat.id}
                    chat={chat}
                    editable
                    draggable
                    isOwner={currentUserId != null && currentUserId === chat.user_id}
                    currentUserId={currentUserId ?? null}
                    onEdit={() => handleEditChat(chat)}
                    onDelete={() => openDeleteModal(chat)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'prompts' && (
          <section id="dashboard-panel" aria-label="My prompts" className={styles.containerChats}>
            <button
              className={styles.addButton}
              onClick={handleOpenAddPromptModal}
              disabled={promptsLoading}
            >
              <Plus size={16} aria-hidden="true" />
              Add Prompt
            </button>

            {promptsLoading && <CardsSkeletonList count={prompts.length} />}

            {!promptsLoading && prompts.length === 0 && (
              <EmptyPrompts onAdd={handleOpenAddPromptModal} />
            )}

            {!promptsLoading && prompts.length > 0 && (
              <div className={styles.chatsList}>
                {prompts.map((prompt) => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    editable
                    isOwner={currentUserId != null && currentUserId === prompt.user_id}
                    currentUserId={currentUserId ?? null}
                    onEdit={() => handleEditPrompt(prompt)}
                    onDelete={() => openDeletePromptModal(prompt)}
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

      {/* ── Chat Modals ── */}
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

      {/* ── Prompt Modals ── */}
      {showPromptModal && (
        <PromptFormModal
          isEditing={!!editingPrompt}
          formData={promptFormData}
          tagInput={promptTagInput}
          loading={promptsLoading}
          onSubmit={handleSavePrompt}
          onClose={handleClosePromptModal}
          onFieldChange={updatePromptField}
          onTagInputChange={setPromptTagInput}
          onAddTag={addPromptTag}
          onRemoveTag={removePromptTag}
        />
      )}

      {showDeletePromptModal && promptToDelete && (
        <DeletePromptModal
          prompt={promptToDelete}
          loading={promptsLoading}
          onConfirm={handleDeletePrompt}
          onClose={closeDeletePromptModal}
        />
      )}
    </main>
  )
}