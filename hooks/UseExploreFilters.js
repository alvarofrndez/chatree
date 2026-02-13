'use client'

import { useState, useCallback, useEffect } from 'react'

/**
 * Custom hook for managing explore filters
 */
export function useExploreFilters(activeTab, onFiltersChange) {
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState('all')
  const [sort, setSort] = useState('recent')
  const [currentPage, setCurrentPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  // Notify parent when filters change
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange({
        search: debouncedSearch,
        platform,
        sort,
        page: currentPage
      })
    }
  }, [debouncedSearch, platform, sort, currentPage, onFiltersChange])

  /**
   * Update search and reset to page 1
   */
  const updateSearch = useCallback((value) => {
    setSearch(value)
    setCurrentPage(1)
  }, [])

  /**
   * Update platform and reset to page 1
   */
  const updatePlatform = useCallback((value) => {
    setPlatform(value)
    setCurrentPage(1)
  }, [])

  /**
   * Update sort and reset to page 1
   */
  const updateSort = useCallback((value) => {
    setSort(value)
    setCurrentPage(1)
  }, [])

  /**
   * Update page
   */
  const updatePage = useCallback((value) => {
    setCurrentPage(value)
  }, [])

  /**
   * Reset all filters
   */
  const resetFilters = useCallback(() => {
    setSearch('')
    setPlatform('all')
    setSort('recent')
    setCurrentPage(1)
  }, [])

  /**
   * Load filters from URL params
   */
  const loadFromParams = useCallback((searchParams) => {
    setSearch(searchParams.get('search') || '')
    setPlatform(searchParams.get('platform') || 'all')
    setSort(searchParams.get('sort') || 'recent')
    setCurrentPage(parseInt(searchParams.get('page') || '1'))
  }, [])

  /**
   * Get URL params from current filters
   */
  const toURLParams = useCallback(() => {
    const params = new URLSearchParams()
    
    if (activeTab !== 'creators') params.set('tab', activeTab)
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (platform !== 'all') params.set('platform', platform)
    if (sort !== 'recent') params.set('sort', sort)
    if (currentPage > 1) params.set('page', currentPage.toString())

    return params
  }, [activeTab, debouncedSearch, platform, sort, currentPage])

  return {
    search,
    platform,
    sort,
    currentPage,
    debouncedSearch,
    updateSearch,
    updatePlatform,
    updateSort,
    updatePage,
    resetFilters,
    loadFromParams,
    toURLParams
  }
}