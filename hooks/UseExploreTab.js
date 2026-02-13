'use client'

import { useState } from 'react'

/**
 * Custom hook for managing explore tabs
 */
export function useExploreTab(initialTab = 'creators') {
  const [activeTab, setActiveTab] = useState(initialTab)

  return {
    activeTab,
    setActiveTab
  }
}