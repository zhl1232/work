'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

type UserRole = 'user' | 'moderator' | 'admin'

interface Profile {
  id: string
  role: UserRole
  username: string | null
  display_name: string | null
  avatar_url: string | null
  xp: number
  created_at: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  isModerator: boolean
  canReview: boolean
  canDeleteComments: boolean
  canManageTags: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('id, role, username, display_name, avatar_url, xp, created_at')
      .eq('id', userId)
      .single()

    return data as Profile | null
  }

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
    }
  }

  useEffect(() => {
    // 获取当前登录用户
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const profileData = await fetchProfile(user.id)
        setProfile(profileData)
      }
      setLoading(false)
    }

    getUser()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id)
          setProfile(profileData)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      // 调用 Supabase 退出登录
      await supabase.auth.signOut()

      // 清除所有 Supabase 相关的 localStorage 数据
      if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-')) {
            localStorage.removeItem(key)
          }
        })
      }

      // 清除状态
      setUser(null)
      setProfile(null)

      // 刷新页面以确保所有状态被清除
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
      // 即使出错也尝试清除本地状态
      setUser(null)
      setProfile(null)
      window.location.href = '/'
    }
  }

  const isAdmin = profile?.role === 'admin'
  const isModerator = profile?.role === 'moderator'
  const canReview = isAdmin || isModerator
  const canDeleteComments = isAdmin || isModerator
  const canManageTags = isAdmin || isModerator

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isAdmin,
      isModerator,
      canReview,
      canDeleteComments,
      canManageTags,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
