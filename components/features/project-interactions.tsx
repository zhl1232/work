"use client"

import { Button } from "@/components/ui/button"
import { Heart, Share2 } from "lucide-react"
import { ConfettiButton } from "@/components/ui/confetti-button"
import { useProjects } from "@/context/project-context"
import { useAuth } from "@/context/auth-context"
import { useLoginPrompt } from "@/context/login-prompt-context"

interface ProjectInteractionsProps {
    projectId: string | number
    likes: number
}

export function ProjectInteractions({ projectId, likes: initialLikes }: ProjectInteractionsProps) {
    const { toggleLike, isLiked, toggleProjectCompleted, isCompleted } = useProjects()
    const { user } = useAuth()
    const { promptLogin } = useLoginPrompt()

    const isProjectLiked = isLiked(projectId)
    const isProjectCompleted = isCompleted(projectId)

    const handleLike = () => {
        if (!user) {
            promptLogin(() => toggleLike(projectId), {
                title: '登录以点赞项目',
                description: '登录后即可点赞并收藏喜欢的项目'
            })
            return
        }
        toggleLike(projectId)
    }

    const handleComplete = () => {
        if (!user) {
            promptLogin(() => toggleProjectCompleted(projectId), {
                title: '登录以标记完成',
                description: '登录后可记录你完成的项目，获得成就徽章'
            })
            return
        }
        toggleProjectCompleted(projectId)
    }

    return (
        <div className="rounded-lg border p-4 space-y-4 sticky top-24">
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <Button
                        variant={isProjectLiked ? "default" : "outline"}
                        size="icon"
                        onClick={handleLike}
                        className={isProjectLiked ? "bg-red-500 hover:bg-red-600 text-white border-red-500" : ""}
                    >
                        <Heart className={`h-4 w-4 ${isProjectLiked ? "fill-current" : ""}`} />
                    </Button>
                    <Button variant="outline" size="icon">
                        <Share2 className="h-4 w-4" />
                    </Button>
                </div>
                <span className="font-bold text-lg">{initialLikes} 赞</span>
            </div>
            <ConfettiButton
                className="w-full"
                isCompleted={isProjectCompleted}
                onClick={handleComplete}
            >
                我做过这个！(Mark as Done)
            </ConfettiButton>
        </div>
    )
}
