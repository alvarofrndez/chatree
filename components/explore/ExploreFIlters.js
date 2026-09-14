'use client'

import { Search } from 'lucide-react'
import styles from './ExploreFilters.module.scss'
import { PLATFORMS } from '@/lib/utils/constants'

/**
 * Barra de filtros de Explore.
 * - Siempre muestra el buscador.
 * - Muestra el filtro de plataforma para 'chats' y 'prompts' (ambos tienen ai_platform).
 * - Siempre muestra el selector de orden.
 */
export default function ExploreFilters({
  activeTab,
  search,
  platform,
  sort,
  sortOptions,
  onSearchChange,
  onPlatformChange,
  onSortChange,
}) {
  const showPlatformFilter = activeTab === 'chats' || activeTab === 'prompts'

  const searchPlaceholder =
    activeTab === 'creators'
      ? 'Search creators by name or username...'
      : activeTab === 'prompts'
      ? 'Search prompts by title or description...'
      : 'Search chats by title or description...'

  return (
    <>
      <div className={styles.searchContainer}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={16} aria-hidden="true" />
          <input
            type="search"
            className={styles.searchInput}
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label={searchPlaceholder}
          />
        </div>
      </div>

      <div className={styles.filtersContainer}>
        {showPlatformFilter && (
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Platform</span>
            <div className={styles.filterButtons} role="group" aria-label="Filter by AI platform">
              {PLATFORMS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={`${styles.filterButton} ${platform === value ? styles.active : ''}`}
                  onClick={() => onPlatformChange(value)}
                  aria-pressed={platform === value}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Sort by</span>
          <div className={styles.filterButtons} role="group" aria-label="Sort results">
            {sortOptions.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`${styles.filterButton} ${sort === value ? styles.active : ''}`}
                onClick={() => onSortChange(value)}
                aria-pressed={sort === value}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}