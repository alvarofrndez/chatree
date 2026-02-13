import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request, { params }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { error } = await supabase.rpc('increment_chat_views', {
      chat_id: id
    })
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
