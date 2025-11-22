'use client'

import { useAuth } from '@/context/auth-context'
import { useProjects } from '@/context/project-context'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/features/project-card'
import { EditProfileDialog } from '@/components/features/profile/edit-profile-dialog'
import { Star, Sparkles, Award, MessageCircle, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const { projects, likedProjects, completedProjects } = useProjects()
  const [activeTab, setActiveTab] = useState<'my-projects' | 'liked' | 'completed'>('liked')

  // 如果未登录，重定向到登录页
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/login'
    }
  }, [user, authLoading])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  // 获取用户信息
  const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '未命名用户'
  const userAvatar = user.user_metadata?.avatar_url || null
  const userEmail = user.email || ''

  // 过滤用户相关的项目
  const myProjects = projects.filter(p => p.author === userName || p.author === '我 (Me)')
  const likedProjectsList = projects.filter(p => likedProjects.has(p.id))
  const completedProjectsList = projects.filter(p => completedProjects.has(p.id))

  // 计算评论数量
  const commentCount = projects.reduce((acc, project) => {
    if (!project.comments) return acc
    return acc + project.comments.filter(c => c.userId === user.id || c.author === userName).length
  }, 0)

  // 徽章系统
  const badges = [
    {
      id: 'explorer',
      name: '初级探索者',
      icon: <Star className="h-6 w-6 text-yellow-500" />,
      description: '完成 1 个项目',
      unlocked: completedProjects.size >= 1,
    },
    {
      id: 'scientist',
      name: '小小科学家',
      icon: <Sparkles className="h-6 w-6 text-blue-500" />,
      description: '完成 3 个项目',
      unlocked: completedProjects.size >= 3,
    },
    {
      id: 'master',
      name: 'STEAM 大师',
      icon: <Award className="h-6 w-6 text-purple-500" />,
      description: '完成 10 个项目',
      unlocked: completedProjects.size >= 10,
    },
    {
      id: 'creator',
      name: '创意达人',
      icon: '🎨',
      description: '发布 3 个项目',
      unlocked: myProjects.length >= 3,
    },
    {
      id: 'helpful',
      name: '热心助人',
      icon: <MessageCircle className="h-6 w-6 text-green-500" />,
      description: '发表 10 条评论',
      unlocked: commentCount >= 10,
    },
  ]

  const unlockedBadges = badges.filter(b => b.unlocked)

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* 用户信息卡片 */}
      <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-background rounded-2xl p-8 mb-8 border">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* 头像 */}
          <div className="relative">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="h-24 w-24 rounded-full border-4 border-background shadow-lg"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-4xl font-bold text-primary-foreground shadow-lg">
                {userName[0].toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-green-500 border-4 border-background" title="在线" />
          </div>

          {/* 用户信息 */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">{userName}</h1>
            <p className="text-muted-foreground mb-4">{userEmail}</p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">发布:</span>
                <span className="text-primary font-bold">{myProjects.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">收藏:</span>
                <span className="text-primary font-bold">{likedProjects.size}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">完成:</span>
                <span className="text-primary font-bold">{completedProjects.size}</span>
              </div>
            </div>
          </div>

          {/* 编辑按钮 */}
          <EditProfileDialog>
            <Button variant="outline">编辑资料</Button>
          </EditProfileDialog>
        </div>
      </div>

      {/* 徽章展示 */}
      <div className="bg-card rounded-lg border p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          我的成就徽章
          <span className="text-sm font-normal text-muted-foreground">
            ({unlockedBadges.length}/{badges.length})
          </span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-lg border text-center transition-all ${
                badge.unlocked
                  ? 'bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 scale-100'
                  : 'bg-muted/30 opacity-50 grayscale'
              }`}
            >
              <div className="text-3xl mb-2 flex justify-center">
                {typeof badge.icon === 'string' ? badge.icon : badge.icon}
              </div>
              <div className="font-medium text-sm mb-1">{badge.name}</div>
              <div className="text-xs text-muted-foreground">{badge.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 标签页切换 */}
      <div className="flex gap-2 mb-6 border-b">
        <Button
          variant={activeTab === 'my-projects' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('my-projects')}
          className="rounded-b-none"
        >
          我的发布 ({myProjects.length})
        </Button>
        <Button
          variant={activeTab === 'liked' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('liked')}
          className="rounded-b-none"
        >
          我的收藏 ({likedProjects.size})
        </Button>
        <Button
          variant={activeTab === 'completed' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('completed')}
          className="rounded-b-none"
        >
          我做过的 ({completedProjects.size})
        </Button>
      </div>

      {/* 项目列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'my-projects' && myProjects.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <p className="mb-4">你还没有发布任何项目</p>
            <Link href="/share">
              <Button>分享你的第一个项目</Button>
            </Link>
          </div>
        )}
        {activeTab === 'my-projects' &&
          myProjects.map((project) => <ProjectCard key={project.id} project={project} />)}

        {activeTab === 'liked' && likedProjectsList.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <p className="mb-4">你还没有收藏任何项目</p>
            <Link href="/explore">
              <Button>去发现有趣的项目</Button>
            </Link>
          </div>
        )}
        {activeTab === 'liked' &&
          likedProjectsList.map((project) => <ProjectCard key={project.id} project={project} />)}

        {activeTab === 'completed' && completedProjectsList.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <p className="mb-4">你还没有完成任何项目</p>
            <Link href="/explore">
              <Button>开始你的第一个项目</Button>
            </Link>
          </div>
        )}
        {activeTab === 'completed' &&
          completedProjectsList.map((project) => <ProjectCard key={project.id} project={project} />)}
      </div>
    </div>
  )
}
