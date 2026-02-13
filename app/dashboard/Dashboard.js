'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Eye, 
  Link2, 
  Copy, 
  ExternalLink, 
  Plus, 
  Settings,
  ChartColumn
} from 'lucide-react'
import styles from './page.module.scss'
import { formatNumber, copyToClipboard } from '@/lib/utils'
import DotLoading from '@/components/DotLoading'
import { useAuth } from '@/contexts/auth'
import ChatLinkCard from '@/components/ChatLinkCard'
import ChatFormModal from '@/components/dashboard/ChatFormModal'
import DeleteChatModal from '@/components/dashboard/DeleteChatModal'
import { useChats } from '@/hooks/UseChats'
import { useChatForm } from '@/hooks/UseChatForm'

export default function DashboardPage({ initialProfile, initialStats, initialChats }) {
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    
    const [profile] = useState(initialProfile)
    const [stats] = useState(initialStats)
    const [activeTab, setActiveTab] = useState('chats')
    const [showChatModal, setShowChatModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [editingChat, setEditingChat] = useState(null)
    const [chatToDelete, setChatToDelete] = useState(null)
    const [copiedUrl, setCopiedUrl] = useState(false)

    const { 
        chats, 
        loading: chatsLoading, 
        addChat, 
        editChat, 
        removeChat 
    } = useChats(initialChats)

    const {
        formData,
        tagInput,
        setTagInput,
        updateField,
        addTag,
        removeTag,
        resetForm,
        loadData
    } = useChatForm()

    useEffect(() => {
        if (!authLoading && !user) {
        router.push('/signin')
        }
    }, [user, authLoading, router])

    const handleCopyUrl = async () => {
        if (!profile?.username) return
        
        const url = `${window.location.origin}/u/${profile.username}`
        const success = await copyToClipboard(url)
        
        if (success) {
        setCopiedUrl(true)
        setTimeout(() => setCopiedUrl(false), 2000)
        }
    }
    
    const handleSaveChat = async (e) => {
        e.preventDefault()

        let result

        if (editingChat) {
        result = await editChat(editingChat.id, formData)
        } else {
        result = await addChat(formData)
        }

        if (result.success) {
        setShowChatModal(false)
        resetForm()
        setEditingChat(null)
        } else {
        alert(result.error || 'Failed to save chat')
        }
    }
    
    const handleDeleteChat = async () => {
        if (!chatToDelete) return
        
        const result = await removeChat(chatToDelete.id)

        if (result.success) {
        setShowDeleteModal(false)
        setChatToDelete(null)
        } else {
        alert(result.error || 'Failed to delete chat')
        }
    }

    const openDeleteModal = (chat) => {
        setChatToDelete(chat)
        setShowDeleteModal(true)
    }

    const closeDeleteModal = () => {
        setShowDeleteModal(false)
        setChatToDelete(null)
    }
    
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

    if (!authLoading && !user) {
        return null
    }

    return (
        <main className={styles.main}>
        <div className={styles.container}>
            <header className={styles.header}>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>Manage your shared AI chats and profile</p>
            </header>
            
            <div className={styles.statsGrid}>
            <div className={styles.statCard}>
                <div className={styles.statHeader}>
                <Link2 className={styles.statIcon} />
                <span className={styles.statLabel}>Chats</span>
                </div>
                <p className={styles.statValue}>{stats.total_chats}</p>
            </div>
            
            <div className={styles.statCard}>
                <div className={styles.statHeader}>
                <Eye className={styles.statIcon} />
                <span className={styles.statLabel}>Views</span>
                </div>
                <p className={styles.statValue}>{formatNumber(stats.total_views)}</p>
            </div>
            
            <div className={styles.statCard}>
                <div className={styles.statHeader}>
                <ChartColumn className={styles.statIcon} />
                <span className={styles.statLabel}>Likes</span>
                </div>
                <p className={styles.statValue}>{formatNumber(stats.total_likes)}</p>
            </div>
            </div>
            
            <div className={styles.profileCard}>
            <div className={styles.profileUrl}>
                <Link2 className={styles.profileUrlIcon} />
                <span className={styles.profileUrlText}>
                {typeof window !== 'undefined' && window.location.host}/u/{profile?.username || '...'}
                </span>
            </div>
            
            <div className={styles.profileActions}>
                <button 
                onClick={handleCopyUrl}
                className={styles.profileButton}
                title="Copy profile URL"
                >
                <Copy />
                <span className={styles.buttonTextHidden}>
                    {copiedUrl ? 'Copied!' : 'Copy'}
                </span>
                </button>
                
                <Link 
                href={`/u/${profile?.username}`} 
                target="_blank"
                className={styles.profileButton}
                title="View profile"
                >
                <ExternalLink />
                <span className={styles.buttonTextHidden}>View</span>
                </Link>
            </div>
            </div>
            
            <div className={styles.tabsContainer}>
            <button
                className={`${styles.tab} ${activeTab === 'chats' ? styles.active : ''}`}
                onClick={() => setActiveTab('chats')}
            >
                My Chats ({stats.total_chats})
            </button>
            
            <button
                className={`${styles.tab} ${activeTab === 'settings' ? styles.active : ''}`}
                onClick={() => setActiveTab('settings')}
            >
                <Settings />
                Settings
            </button>
            </div>
            
            {activeTab === 'chats' && (
            <>
                <button 
                className={styles.addButton}
                onClick={handleOpenAddModal}
                >
                <Plus />
                Add AI Chat
                </button>
                
                {chats.length === 0 ? (
                <article className={styles.emptyState}>
                    <Link2 />
                    <div className={styles.emptyStateInfo}>
                    <h4>No chats yet</h4>
                    <p>Add your first AI conversation to get started</p>
                    </div>
                </article>
                ) : (
                <div className={styles.chatsList}>
                    {chats.map((chat) => (
                    <ChatLinkCard
                        key={chat.id}
                        chat={chat}
                        editable={true}
                        draggable={true}
                        onEdit={() => handleEditChat(chat)}
                        onDelete={() => openDeleteModal(chat)}
                    />
                    ))}
                </div>
                )}
            </>
            )}
            
            {activeTab === 'settings' && (
            <div className={styles.emptyState}>
                <p>Settings coming soon...</p>
            </div>
            )}
        </div>
        
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