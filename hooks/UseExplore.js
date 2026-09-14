'use client'

import { useState, useCallback } from 'react'
import { getPublicChats, getPublicCreators } from '@/lib/services/explore.service'
import { getPublicPrompts } from '@/lib/services/explore.service'

/**
 * Custom hook for managing explore data (creators, chats or prompts)
 */
export function useExplore(type = 'creators') {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  /**
   * Fetch data with filters
   */
  const fetchData = useCallback(async (filters = {}) => {
    setLoading(true)
    setError(null)

    try {
      let result

      if (type === 'creators') {
        result = await getPublicCreators(filters)
      } else if (type === 'prompts') {
        result = await getPublicPrompts(filters)
      } else {
        result = await getPublicChats(filters)
      }

      if (result.success) {
        setData(result.data)
        setPagination(result.pagination)
      } else {
        setError(result.error)
        setData([])
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch data')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [type])

  /**
   * Refresh data with current filters
   */
  const refresh = useCallback((filters) => {
    return fetchData(filters)
  }, [fetchData])

  return {
    data,
    setData,
    loading,
    error,
    pagination,
    setPagination,
    fetchData,
    refresh
  }
} 