"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { createClient } from '@/lib/supabase/client'
import { ProjectReviewCard } from '@/components/admin/project-review-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Project {
  id: number
  title: string
  description: string
  category: string
  image_url: string
  status: string
  created_at: string
  profiles: {
    username: string
    display_name: string
    avatar_url: string
  }
}

export default function AdminPage() {
  const router = useRouter()
  const { canReview, loading } = useAuth()
  const [pendingProjects, setPendingProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!loading && !canReview) {
      router.push('/')
      return
    }

    fetchPendingProjects()
  }, [loading, canReview, router])

  const fetchPendingProjects = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:author_id (
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setPendingProjects(data as Project[])
    }
    setIsLoading(false)
  }

  if (loading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">加载中...</p>
      </div>
    )
  }

  if (!canReview) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">管理员控制台</h1>
        <p className="text-muted-foreground">管理和审核平台内容</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">待审核项目</TabsTrigger>
          <TabsTrigger value="tags">标签管理</TabsTrigger>
          <TabsTrigger value="users">用户管理</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingProjects.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">暂无待审核项目</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingProjects.map((project) => (
                <ProjectReviewCard
                  key={project.id}
                  project={project}
                  onReview={fetchPendingProjects}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tags" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>标签管理</CardTitle>
              <CardDescription>创建和管理项目标签</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">标签管理功能开发中...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>用户管理</CardTitle>
              <CardDescription>管理用户角色和权限</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">用户管理功能开发中...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
