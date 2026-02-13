'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const AuthContext = createContext({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  refreshUser: async () => {}
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getInitialUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (event === 'SIGNED_IN' || event === 'SIGNED_UP') {
          setUser(session?.user ?? null)
        }
        
        if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const refreshUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      setUser(null)
    }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (!error && data.user) {
      setUser(data.user)
    }
    
    return { data, error }
  }

  const signUp = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    
    if (!error && data.user) {
      setUser(data.user)
    }
    
    return { data, error }
  }

  const signOut = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    
    if (!error) {
      setUser(null)
    }

    setLoading(false)
    return { error }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}