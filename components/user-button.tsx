'use client'

import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { LogOut, User as UserIcon, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function UserButton() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Loader2 className="h-5 w-5 animate-spin" />
      </Button>
    )
  }

  if (!user) {
    return (
      <Link href="/login">
        <Button variant="default" size="sm">
          登录
        </Button>
      </Link>
    )
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/profile">
        <Button variant="ghost" size="icon" className="relative">
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="Avatar"
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
              <UserIcon className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
        </Button>
      </Link>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={handleSignOut}
        title="退出登录"
      >
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  )
}
