'use client'

import { useState } from 'react'
import ChatLinkCard from '@/components/ChatLinkCard'
import styles from './page.module.scss'
import { Calendar, Eye, Link2 } from 'lucide-react'

export default function ProfilePage({ profile, chatLinks: initialChatLinks }) {
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  
  // Calculate stats
  const totalViews = initialChatLinks?.reduce((sum, chat) => sum + (chat.views_count || 0), 0) || 0
  const totalChats = initialChatLinks?.length || 0
  
  // Get join date
  const joinDate = profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { 
    month: 'short', 
    year: 'numeric' 
  }) : null

  // Filter chats by platform
  const filteredChats = selectedPlatform === 'all' 
    ? initialChatLinks 
    : initialChatLinks?.filter(chat => chat.ai_platform === selectedPlatform)

  const displayedCount = filteredChats?.length || 0

  return (
    <div className={styles.main}>
      <div className={styles.backgroundGradient}></div>
      
      <div className={styles.container}>
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name || profile.username} />
            ) : (
              <span className={styles.avatarInitials}>
                {(profile.full_name || profile.username).charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          
          <h1 className={styles.name}>{profile.full_name || profile.username}</h1>
          
          <p className={styles.username}>@{profile.username}</p>
          
          {profile.bio && (
            <p className={styles.bio}>{profile.bio}</p>
          )}
          
          <div className={styles.stats}>
            <span className={styles.stat}>
              <Link2 className={styles.statIcon}/>
              {totalChats} {totalChats === 1 ? 'chat' : 'chats'}
            </span>
            
            <span className={styles.stat}>
              <Eye className={styles.statIcon}/>
              {totalViews.toLocaleString()} {totalViews === 1 ? 'view' : 'views'}
            </span>
            
            {joinDate && (
              <span className={styles.stat}>
                <Calendar className={styles.statIcon}/>
                {joinDate}
              </span>
            )}
          </div>
        </div>

        {/* Platform Filters */}
        <div className={styles.filtersBar}>
          <div className={styles.filterButtons}>
            <button 
              type="button"
              className={`${styles.filterButton} ${selectedPlatform === 'all' ? styles.active : ''}`}
              onClick={() => setSelectedPlatform('all')}
            >
              All
            </button>
            <button 
              type="button"
              className={`${styles.filterButton} ${selectedPlatform === 'chatgpt' ? styles.active : ''}`}
              onClick={() => setSelectedPlatform('chatgpt')}
            >
              ChatGPT
            </button>
            <button 
              type="button"
              className={`${styles.filterButton} ${selectedPlatform === 'claude' ? styles.active : ''}`}
              onClick={() => setSelectedPlatform('claude')}
            >
              Claude
            </button>
            <button 
              type="button"
              className={`${styles.filterButton} ${selectedPlatform === 'gemini' ? styles.active : ''}`}
              onClick={() => setSelectedPlatform('gemini')}
            >
              Gemini
            </button>
          </div>
          
          <span className={styles.resultsCount}>
            {displayedCount} {displayedCount === 1 ? 'chat' : 'chats'}
          </span>
        </div>

        {filteredChats && filteredChats.length > 0 ? (
          <div className={styles.chatsList}>
            {filteredChats.map(chat => (
              <ChatLinkCard key={chat.id} chat={chat} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>No chats found</h3>
            <p className={styles.emptyText}>
              {selectedPlatform === 'all' 
                ? "This user hasn't shared any AI chat conversations yet."
                : `No ${selectedPlatform} chats found.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}