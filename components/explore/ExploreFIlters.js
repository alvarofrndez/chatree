'use client'

import { Search } from 'lucide-react'
import styles from './ExploreFilters.module.scss'

const PLATFORMS = [
  { value: 'all', label: 'All Platforms' },
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'claude', label: 'Claude' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'copilot', label: 'Copilot' },
  { value: 'perplexity', label: 'Perplexity' },
  { value: 'other', label: 'Other' }
]

export default function ExploreFilters({
  activeTab,
  search,
  platform,
  sort,
  sortOptions,
  onSearchChange,
  onPlatformChange,
  onSortChange
}) {
  return (
    <>
      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder={
              activeTab === 'creators' 
                ? 'Search creators by username or name...' 
                : 'Search chats by title, description, or tags...'
            }
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersContainer}>
        {/* Platform filter only for chats */}
        {activeTab === 'chats' && (
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Platform</label>
            <div className={styles.filterButtons}>
              {PLATFORMS.map(p => (
                <button
                  key={p.value}
                  onClick={() => onPlatformChange(p.value)}
                  className={`${styles.filterButton} ${platform === p.value ? styles.active : ''}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Sort by</label>
          <div className={styles.filterButtons}>
            {sortOptions.map(option => (
              <button
                key={option.value}
                onClick={() => onSortChange(option.value)}
                className={`${styles.filterButton} ${sort === option.value ? styles.active : ''}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}