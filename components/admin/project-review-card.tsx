"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

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

interface ProjectReviewCardProps {
  project: Project
  onReview: () => void
}

export function ProjectReviewCard({ project, onReview }: ProjectReviewCardProps) {
  const [isReviewing, setIsReviewing] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleApprove = async () => {
    setIsReviewing(true)
    try {
      const response = await fetch(`/api/admin/projects/${project.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      })

      if (!response.ok) {
        throw new Error('审核失败')
      }

      toast({
        title: '项目已批准',
        description: `项目 "${project.title}" 已成功批准并公开`,
      })
      onReview()
    } catch (error) {
      toast({
        title: '操作失败',
        description: '审核项目时发生错误',
        variant: 'destructive',
      })
    } finally {
      setIsReviewing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: '请输入拒绝原因',
        variant: 'destructive',
      })
      return
    }

    setIsReviewing(true)
    try {
      const response = await fetch(`/api/admin/projects/${project.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'reject',
          rejection_reason: rejectionReason 
        }),
      })

      if (!response.ok) {
        throw new Error('拒绝失败')
      }

      toast({
        title: '项目已拒绝',
        description: `项目 "${project.title}" 已被拒绝`,
      })
      onReview()
      setShowRejectInput(false)
      setRejectionReason('')
    } catch (error) {
      toast({
        title: '操作失败',
        description: '拒绝项目时发生错误',
        variant: 'destructive',
      })
    } finally {
      setIsReviewing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{project.title}</CardTitle>
            <CardDescription>
              由 {project.profiles.display_name || project.profiles.username} 创建于{' '}
              {new Date(project.created_at).toLocaleDateString('zh-CN')}
            </CardDescription>
          </div>
          <Badge>{project.category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {project.image_url && (
          <img
            src={project.image_url}
            alt={project.title}
            className="w-full h-48 object-cover rounded-md"
          />
        )}
        <p className="text-sm text-muted-foreground">{project.description}</p>
        
        {!showRejectInput ? (
          <div className="flex gap-2">
            <Button
              onClick={handleApprove}
              disabled={isReviewing}
              className="flex-1"
            >
              批准
            </Button>
            <Button
              onClick={() => setShowRejectInput(true)}
              disabled={isReviewing}
              variant="destructive"
              className="flex-1"
            >
              拒绝
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Textarea
              placeholder="请输入拒绝原因..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleReject}
                disabled={isReviewing}
                variant="destructive"
                className="flex-1"
              >
                确认拒绝
              </Button>
              <Button
                onClick={() => {
                  setShowRejectInput(false)
                  setRejectionReason('')
                }}
                disabled={isReviewing}
                variant="outline"
                className="flex-1"
              >
                取消
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
