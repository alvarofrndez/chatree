import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserProfile } from '@/lib/services/profile.service'
import { getUserStats } from '@/lib/services/stats.service'
import { getUserChats } from '@/lib/services/chat.service'
import { getUserPrompts } from '@/lib/services/prompt.service'
import DashboardClient from './Dashboard'

export const metadata = {
  title: 'Dashboard',
  description: 'Manage your shared AI conversations, prompts and profile.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) redirect('/signin')

  const [profileResult, statsResult, chatsResult, promptsResult] = await Promise.all([
    getCurrentUserProfile(),
    getUserStats(),
    getUserChats(),
    getUserPrompts(),
  ])

  if (!profileResult.success) redirect('/signin')

  const profile = profileResult.data
  const stats = statsResult.success
    ? statsResult.data
    : { total_chats: 0, total_views: 0, total_likes: 0, total_prompts: 0 }
  const chats = chatsResult.success ? chatsResult.data : []
  const prompts = promptsResult.success ? promptsResult.data : []

  return (
    <DashboardClient
      initialProfile={profile}
      initialStats={stats}
      initialChats={chats}
      initialPrompts={prompts}
    />
  )
}