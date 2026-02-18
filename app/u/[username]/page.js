import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getChatLikeStatuses } from '@/lib/services/like.service'
import ProfilePage from './ProfilePage'

export async function generateMetadata({ params }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) {
    return {
      title: 'User Not Found'
    }
  }

  return {
    title: `${profile.full_name || username} - AI Chat Links`,
    description: profile.bio || `Check out ${username}'s AI chat conversations and links`,
  }
}

export default async function ProfileView({ params }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  const { data: chatLinks } = await supabase
    .from('ai_chat_links')
    .select('*')
    .eq('user_id', profile.id)
    .eq('is_active', true)
    .order('position')

  const chats = chatLinks || []

  // Fetch all like statuses in a single bulk RPC call instead of N individual calls
  const chatIds = chats.map(c => c.id)
  const { data: likeStatuses } = await getChatLikeStatuses(chatIds)

  return (
    <ProfilePage
      profile={profile}
      chatLinks={chats}
      likeStatuses={likeStatuses}
    />
  )
}