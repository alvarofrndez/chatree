import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
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
  
  return <ProfilePage profile={profile} chatLinks={chatLinks || []} />
}