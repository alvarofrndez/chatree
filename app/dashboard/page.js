import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserProfile } from '@/lib/services/profile.service'
import { getUserStats } from '@/lib/services/stats.service'
import { getUserChats } from '@/lib/services/chat.service'
import DashboardClient from './Dashboard'

export const metadata = {
  title: 'Dashboard - AI Chat Links',
  description: 'Manage your shared AI conversations',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/signin')
  }

  const [profileResult, statsResult, chatsResult] = await Promise.all([
    getCurrentUserProfile(),
    getUserStats(),
    getUserChats()
  ])

  if (!profileResult.success) {
    redirect('/signin')
  }

  const profile = profileResult.data
  const stats = statsResult.success ? statsResult.data : {
    total_chats: 0,
    total_views: 0,
    total_likes: 0
  }
  const chats = chatsResult.success ? chatsResult.data : []

  return (
    <DashboardClient
      initialProfile={profile}
      initialStats={stats}
      initialChats={chats}
    />
  )
}